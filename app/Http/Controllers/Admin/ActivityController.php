<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Domain\Activity\Models\ActivityLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $action = is_string($request->input('action')) ? trim($request->input('action')) : '';

        $query = ActivityLog::query()->latest('id');

        if ($action !== '') {
            $query->where('action', $action);
        }

        $activities = $query->paginate(15)->withQueryString();

        $activities->getCollection()->transform(
            static fn (ActivityLog $log): array => $log->toEntry()
        );

        return Inertia::render('admin/activity', [
            'activities' => $activities,
            'filters' => ['action' => $action],
            'actions' => ActivityLog::query()
                ->select('action')
                ->distinct()
                ->orderBy('action')
                ->pluck('action')
                ->all(),
        ]);
    }
}
