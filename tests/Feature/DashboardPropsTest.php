<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Feature\Concerns\InteractsWithInertia;
use Tests\TestCase;

/**
 * Mengunci bentuk props dashboard.
 *
 * Halaman React membaca kunci ini secara langsung, jadi kalau salah satunya
 * berubah nama tanpa halamannya ikut diubah, halaman akan gagal render tanpa
 * pesan yang jelas. Test ini menangkapnya lebih awal.
 */
class DashboardPropsTest extends TestCase
{
    use InteractsWithInertia;
    use RefreshDatabase;

    /** Sama persis dengan interface RespondenStats di components/dashboard/responden-view.tsx */
    private const MINE_KEYS = ['total', 'this_month', 'last', 'recent'];

    /** Sama persis dengan interface AdminStats di components/dashboard/admin-view.tsx */
    private const ADMIN_KEYS = [
        'submissions_total', 'submissions_month', 'users_total',
        'coverage_filled', 'coverage_total', 'period', 'recent',
    ];

    /** Sama persis dengan interface AdminStats di components/admin/stat-tiles.tsx */
    private const ADMIN_PAGE_STAT_KEYS = [
        'submissions_total', 'submissions_month', 'users_total', 'responden_total',
    ];

    /** Sama persis dengan interface CoverageSlot di components/admin/coverage-grid.tsx */
    private const COVERAGE_SLOT_KEYS = ['week', 'line', 'filled', 'author'];

    public function test_dashboard_responden_mengirim_kunci_yang_dibaca_halaman(): void
    {
        $user = $this->responden();

        $props = $this->propsOf('/dashboard', $user);

        $this->assertSame('dashboard', $props['component']);
        $this->assertSame(User::ROLE_RESPONDEN, $props['props']['role']);
        $this->assertSame(self::MINE_KEYS, array_keys($props['props']['mine']));
        $this->assertNull($props['props']['admin'], 'Responden tidak boleh menerima data admin.');
    }

    public function test_dashboard_admin_mengirim_blok_admin_yang_lengkap(): void
    {
        $admin = $this->admin();

        $props = $this->propsOf('/dashboard', $admin)['props'];

        $this->assertSame(User::ROLE_ADMIN, $props['role']);
        $this->assertSame(self::MINE_KEYS, array_keys($props['mine']));
        $this->assertIsArray($props['admin']);
        $this->assertSame(self::ADMIN_KEYS, array_keys($props['admin']));
        $this->assertSame(['year', 'month', 'label'], array_keys($props['admin']['period']));
        $this->assertSame(
            count(ChecklistBlueprint::WEEKS) * count(ChecklistBlueprint::LINES),
            $props['admin']['coverage_total'],
        );
    }

    public function test_halaman_admin_dashboard_mengirim_grid_cakupan_20_slot(): void
    {
        $admin = $this->admin();

        $props = $this->propsOf('/admin', $admin)['props'];

        $this->assertSame(self::ADMIN_PAGE_STAT_KEYS, array_keys($props['stats']));
        $this->assertSame(['year', 'month', 'label'], array_keys($props['period']));
        $this->assertIsArray($props['recent']);

        $this->assertCount(20, $props['coverage']);
        $this->assertSame(self::COVERAGE_SLOT_KEYS, array_keys($props['coverage'][0]));

        $pairs = array_map(
            static fn (array $slot): string => $slot['week'].'-'.$slot['line'],
            $props['coverage'],
        );
        $this->assertSame($pairs, array_unique($pairs), 'Tiap kombinasi week dan line hanya boleh muncul sekali.');
    }

    public function test_slot_cakupan_menandai_pengisi_terbaru(): void
    {
        $admin = $this->admin();
        $now = Carbon::now();

        ChecklistSubmission::query()->create([
            'user_id' => $admin->getKey(),
            'nama_petugas' => 'Petugas Lapangan',
            'tanggal_pemeriksaan' => $now->toDateString(),
            'week' => 2,
            'line' => 3,
            'period_year' => (int) $now->year,
            'period_month' => (int) $now->month,
            'answers' => [],
        ]);

        $coverage = $this->propsOf('/admin', $admin)['props']['coverage'];

        $slot = collect($coverage)->firstWhere(fn (array $s): bool => $s['week'] === 2 && $s['line'] === 3);
        $this->assertTrue($slot['filled']);
        $this->assertSame($admin->name, $slot['author']);

        $kosong = collect($coverage)->firstWhere(fn (array $s): bool => $s['week'] === 5 && $s['line'] === 5);
        $this->assertFalse($kosong['filled']);
        $this->assertNull($kosong['author']);
    }

    /**
     * @return array<string, mixed>
     */
    private function propsOf(string $uri, User $as): array
    {
        $response = $this->actingAs($as)->inertiaGet($uri);
        $response->assertOk();

        return $response->json();
    }

    private function admin(): User
    {
        return User::query()->create([
            'name' => 'Administrator Uji',
            'username' => 'admin_uji',
            'email' => 'admin.uji@example.test',
            'password' => 'password',
            'role' => User::ROLE_ADMIN,
        ]);
    }

    private function responden(): User
    {
        return User::query()->create([
            'name' => 'Responden Uji',
            'username' => 'responden_uji',
            'email' => 'responden.uji@example.test',
            'password' => 'password',
            'role' => User::ROLE_RESPONDEN,
        ]);
    }
}
