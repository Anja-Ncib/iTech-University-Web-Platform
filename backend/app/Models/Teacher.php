<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    protected $fillable = [
        'cin',
        'email',
        'phone_number',
        'birth_date',
        'cv',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function translations(): HasMany
    {
        return $this->hasMany(TeacherTranslation::class);
    }
    /**
     * Return the translation object for the requested language, with fallbacks.
     * Keeps your Blade calls like $teacher->translation('fr')->first_name working.
     *
     * @param  string|null $lang  'fr' | 'en' | 'ar' (default uses app locale, fallback 'fr')
     * @return \App\Models\TeacherTranslation
     */
    public function translation(?string $lang = null): TeacherTranslation
    {
        $lang = strtolower($lang ?? app()->getLocale() ?? 'fr');
        $valid = ['fr', 'en', 'ar'];
        if (!in_array($lang, $valid, true)) {
            $lang = 'fr';
        }

        // Ensure we have the collection of translations
        $collection = $this->relationLoaded('translations')
            ? $this->getRelation('translations')
            : $this->translations()->get();

        // Preferred then fallbacks
        $tr = $collection->firstWhere('language_code', $lang)
            ?: $collection->firstWhere('language_code', 'fr')
                ?: $collection->firstWhere('language_code', 'en')
                    ?: $collection->firstWhere('language_code', 'ar')
                        ?: null;

        if ($tr) {
            return $tr;
        }

        // Null-object to avoid Blade errors if absolutely none exist
        return new TeacherTranslation([
            'teacher_id'  => $this->id,
            'language_code' => $lang,
            'first_name'  => '',
            'last_name'   => '',
            'address'     => '',
            'grad'        => '',
            'department'  => '',
        ]);
    }

}
