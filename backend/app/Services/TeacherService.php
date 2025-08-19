<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\TeacherTranslation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

class TeacherService
{
    public function getLocalizedData(Teacher $teacher, string $languageCode): array
    {
        // Eager load translations if not already loaded
        if (!$teacher->relationLoaded('translations')) {
            $teacher->load('translations');
        }

        $translation = $teacher->translations->firstWhere('language_code', $languageCode);
        $french=$teacher->translations->firstWhere('language_code', 'fr');
        $english=$teacher->translations->firstWhere('language_code', 'en');
        $arabic = $teacher->translations->firstWhere('language_code', 'ar');

        return [
            'first_name' => $translation->first_name ?? null,
            'last_name' => $translation->last_name ?? null,
            'address' => $english->address ?? null,
            'address_fr'=> $french->address ?? null,
            'grad' => $english->grad ?? null,
            'grad_fr'=> $french->grad ?? null,
            'department' => $english->department ?? null,
            'department_fr'=> $french->department ?? null,
            'first_name_ar' => $arabic->first_name ?? null,
            'last_name_ar' => $arabic->last_name ?? null,
            'address_ar' => $arabic->address ?? null,
            'grad_ar' => $arabic->grad ?? null,
            'department_ar' => $arabic->department ?? null,
        ];
    }

    /**
     * Get all teachers with localized data
     *
     * @param string $languageCode
     * @return array
     */
    public function getAllLocalized(string $languageCode): array
    {
        $teachers = Teacher::with('translations')
            ->where('is_deleted', false)
            ->get();

        return $teachers->map(function (Teacher $teacher) use ($languageCode) {
            return array_merge(
                $teacher->toArray(),
                $this->getLocalizedData($teacher, $languageCode)
            );
        })->toArray();
    }


    /**
     * @throws Exception
     */
    public function create(array $data, ?UploadedFile $cvFile): Teacher
    {
        return DB::transaction(function () use ($data, $cvFile) {

            // store cv if present
            $path = null;
            if ($cvFile instanceof UploadedFile) {
                $path = $cvFile->store('cv', ['disk' => 'public']);
            }

            /** @var Teacher $teacher */
            $teacher = Teacher::create([
                'cin'          => $data['cin'],
                'email'        => $data['email'],
                'phone_number' => $data['phone_number'],
                'birth_date'   => $data['birth_date'],
                'cv'           => $path, // may be null if no file
            ]);

            // decode translations payload safely
            $translations = $data['translations'] ?? [];
            if (!is_array($translations)) {
                $decoded = json_decode($translations, true);
                $translations = is_array($decoded) ? $decoded : [];
            }

            // expected keys: fr, en, ar
            foreach (['fr', 'en', 'ar'] as $lang) {
                if (empty($translations[$lang]) || !is_array($translations[$lang])) {
                    continue;
                }
                $t = $translations[$lang];

                TeacherTranslation::create([
                    'teacher_id'    => $teacher->id,
                    'language_code' => $lang,
                    'first_name'    => $t['first_name'] ?? null,
                    'last_name'     => $t['last_name']  ?? null,
                    'address'       => $t['address']    ?? null,
                    'grad'          => $t['grad']       ?? null,
                    'department'    => $t['department'] ?? null,
                ]);
            }

            return $teacher->load('translations');
        });
    }

    public function update(Teacher $teacher, array $data, ?UploadedFile $cvFile = null): Teacher
    {
        return DB::transaction(function () use ($teacher, $data, $cvFile) {
            // update file only if provided
            if ($cvFile instanceof UploadedFile) {
                $path = $cvFile->store('cv', ['disk' => 'public']);
                $teacher->cv = $path;
            }

            // scalar fields (keep old if absent)
            $teacher->cin          = $data['cin']          ?? $teacher->cin;
            $teacher->email        = $data['email']        ?? $teacher->email;
            $teacher->phone_number = $data['phone_number'] ?? $teacher->phone_number;
            $teacher->birth_date   = $data['birth_date']   ?? $teacher->birth_date;
            $teacher->save();

            // translations (optional / partial)
            if (!empty($data['translations'])) {
                $translations = is_array($data['translations'])
                    ? $data['translations']
                    : json_decode($data['translations'], true);

                foreach (['fr','en','ar'] as $lang) {
                    if (empty($translations[$lang])) {
                        continue;
                    }
                    $t = $translations[$lang];

                    TeacherTranslation::updateOrCreate(
                        ['teacher_id' => $teacher->id, 'language_code' => $lang],
                        [
                            'first_name' => $t['first_name'] ?? null,
                            'last_name'  => $t['last_name']  ?? null,
                            'address'    => $t['address']    ?? null,
                            'grad'       => $t['grad']       ?? null,
                            'department' => $t['department'] ?? null,
                        ]
                    );
                }
            }

            return $teacher->load('translations');
        });
    }


    public function softDelete(Teacher $teacher): void
    {
        $teacher->update(['is_deleted' => true]);
    }
}
