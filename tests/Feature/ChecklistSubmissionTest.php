<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use App\Domain\Notification\Notifications\SubmissionSaved;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Tests\Feature\Concerns\InteractsWithInertia;
use Tests\TestCase;

class ChecklistSubmissionTest extends TestCase
{
    use InteractsWithInertia, RefreshDatabase;

    public function test_form_page_ships_the_blueprint_and_defaults(): void
    {
        $user = User::factory()->create(['name' => 'Siti Aminah']);

        $this->actingAs($user)->inertiaGet('/checklist/create')
            ->assertOk()
            ->assertJsonPath('component', 'checklist/create')
            ->assertJsonPath('props.defaults.nama_petugas', 'Siti Aminah')
            ->assertJsonPath('props.defaults.tanggal_pemeriksaan', Carbon::now()->toDateString())
            ->assertJsonPath('props.blueprint.weeks', ChecklistBlueprint::WEEKS)
            ->assertJsonPath('props.blueprint.lines', ChecklistBlueprint::LINES)
            ->assertJsonPath('props.blueprint.months.1', 'Januari');
    }

    public function test_valid_checklist_is_stored_logged_and_notified(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $petugas = User::factory()->create(['name' => 'Andi Pratama']);

        $payload = $this->validPayload();

        $this->actingAs($petugas)
            ->post('/checklist', $payload)
            ->assertRedirect('/checklist/berhasil')
            ->assertSessionHas('success');

        $submission = ChecklistSubmission::query()->firstOrFail();

        $this->assertSame($petugas->id, $submission->user_id);
        $this->assertSame('Andi Pratama', $submission->nama_petugas);
        $this->assertSame(2, $submission->week);
        $this->assertSame(3, $submission->line);
        $this->assertSame((int) Carbon::now()->year, $submission->period_year);
        $this->assertSame((int) Carbon::now()->month, $submission->period_month);
        $this->assertCount(count(ChecklistBlueprint::items()), $submission->answers);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $petugas->id,
            'action' => 'checklist.created',
            'subject_type' => ChecklistSubmission::class,
            'subject_id' => $submission->id,
        ]);

        Notification::assertSentTo($admin, SubmissionSaved::class);
        Notification::assertNotSentTo($petugas, SubmissionSaved::class);
    }

    public function test_severity_counts_follow_the_blueprint(): void
    {
        $petugas = User::factory()->create();

        $this->actingAs($petugas)->post('/checklist', $this->validPayload());

        $submission = ChecklistSubmission::query()->firstOrFail();
        $counts = $submission->severityCounts();

        $this->assertSame(count(ChecklistBlueprint::optionKeys()), array_sum($counts));
        $this->assertArrayHasKey('ok', $counts);
        $this->assertArrayHasKey('warn', $counts);
        $this->assertArrayHasKey('bad', $counts);
    }

    public function test_missing_answers_produce_validation_errors_for_every_option_key(): void
    {
        $petugas = User::factory()->create();

        $response = $this->actingAs($petugas)->post('/checklist', [
            'nama_petugas' => '',
            'tanggal_pemeriksaan' => '',
            'week' => 9,
            'line' => 4,
            'answers' => [],
        ]);

        $expected = array_map(
            static fn (string $key): string => 'answers.'.$key,
            ChecklistBlueprint::optionKeys(),
        );

        $response->assertSessionHasErrors(array_merge(
            ['nama_petugas', 'tanggal_pemeriksaan', 'week', 'line'],
            $expected,
        ));

        $this->assertDatabaseCount('checklist_submissions', 0);
    }

    public function test_answer_outside_the_option_set_is_rejected(): void
    {
        $petugas = User::factory()->create();

        $payload = $this->validPayload();
        $payload['answers']['apd'] = 'Mungkin';

        $this->actingAs($petugas)
            ->post('/checklist', $payload)
            ->assertSessionHasErrors('answers.apd');

        $this->assertDatabaseCount('checklist_submissions', 0);
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        $answers = [];

        foreach (ChecklistBlueprint::items() as $item) {
            if ($item['type'] === 'option' && $item['optionSet'] !== null) {
                $answers[$item['key']] = ChecklistBlueprint::valuesFor($item['optionSet'])[0];

                continue;
            }

            $answers[$item['key']] = 'Tidak ada catatan khusus.';
        }

        return [
            'nama_petugas' => 'Andi Pratama',
            'tanggal_pemeriksaan' => Carbon::now()->toDateString(),
            'week' => 2,
            'line' => 3,
            'answers' => $answers,
        ];
    }
}
