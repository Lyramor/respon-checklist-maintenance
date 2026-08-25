<?php

declare(strict_types=1);

namespace App\Domain\Activity\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $actor_name
 * @property string $action
 * @property string $description
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property string|null $ip_address
 */
class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'actor_name',
        'action',
        'description',
        'subject_type',
        'subject_id',
        'ip_address',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Bentuk data untuk front end (ActivityEntry).
     *
     * @return array<string, mixed>
     */
    public function toEntry(): array
    {
        return [
            'id' => $this->id,
            'actor_name' => $this->actor_name,
            'action' => $this->action,
            'description' => $this->description,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
