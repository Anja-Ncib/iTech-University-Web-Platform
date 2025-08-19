<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherTranslation extends Model
{
    // If your table name is exactly 'teacher_translations', this is optional.
    // protected $table = 'teacher_translations';

    // Your table has no created_at / updated_at:
    public $timestamps = false;

    protected $fillable = [
        'teacher_id',
        'language_code',   // 'en' | 'fr' | 'ar'
        'first_name',
        'last_name',
        'address',
        'grad',
        'department',

    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
