<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @method static \Illuminate\Database\Eloquent\Builder|static findOrFail(mixed $id)
 * @method static where(string $string, string $department)
 * @method static whereYear(string $string, string $year)
 * @method static create(array $data)
 * @property int $id
 * @property string $cin
 * @property string|null $email
 * @property string|null $phone_number
 * @property string|null $cv
 * @property string|null $birth_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $is_deleted
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TeacherTranslation> $translations
 * @property-read int|null $translations_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereBirthDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereCin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereCv($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereIsDeleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher wherePhoneNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereUpdatedAt($value)
 */
	class Teacher extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $teacher_id
 * @property string $language_code
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string|null $address
 * @property string|null $grad
 * @property string|null $department
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Teacher $teacher
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereDepartment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereGrad($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereLanguageCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereTeacherId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeacherTranslation whereUpdatedAt($value)
 */
	class TeacherTranslation extends \Eloquent {}
}

