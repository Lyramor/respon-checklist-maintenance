<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Checklist\Services\ChecklistService;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use App\Http\Requests\StoreChecklistRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ChecklistController extends Controller
{
    public function create(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('checklist/create', [
            'blueprint' => self::blueprintPayload(),
            'defaults' => [
                'nama_petugas' => $user->name,
                'tanggal_pemeriksaan' => Carbon::now()->toDateString(),
            ],
        ]);
    }

    public function store(StoreChecklistRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $submission = ChecklistService::store($request->validated(), $user);

        // Rekapnya dititipkan lewat sesi supaya halaman sukses bisa menyebutkan
        // isian mana yang barusan tersimpan, bukan sekadar pesan umum.
        return redirect()->route('checklist.success')
            ->with('success', 'Checklist berhasil disimpan.')
            ->with('checklist_summary', [
                'nama_petugas' => $submission->nama_petugas,
                'tanggal_pemeriksaan' => $submission->tanggal_pemeriksaan?->toDateString(),
                'week' => (int) $submission->week,
                'line' => (int) $submission->line,
            ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('checklist/success', [
            'summary' => $request->session()->get('checklist_summary'),
        ]);
    }

    /**
     * Bentuk blueprint yang dipakai form dan halaman detail admin.
     *
     * @return array<string, mixed>
     */
    public static function blueprintPayload(): array
    {
        return [
            'sections' => ChecklistBlueprint::sections(),
            'optionSets' => ChecklistBlueprint::optionSets(),
            'weeks' => ChecklistBlueprint::WEEKS,
            'lines' => ChecklistBlueprint::LINES,
            'months' => ChecklistBlueprint::MONTHS,
        ];
    }
}
