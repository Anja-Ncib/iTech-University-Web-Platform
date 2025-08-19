<?php

namespace App\Swagger;

use OpenApi\Annotations as OA;

/**
 * All reusable component schemas
 */

/**
 * @OA\Schema(
 *   schema="TeacherTranslation",
 *   type="object",
 *   @OA\Property(property="language_code", type="string", enum={"fr","en","ar"}),
 *   @OA\Property(property="first_name", type="string", nullable=true),
 *   @OA\Property(property="last_name",  type="string", nullable=true),
 *   @OA\Property(property="address",    type="string", nullable=true),
 *   @OA\Property(property="grad",       type="string", nullable=true),
 *   @OA\Property(property="department", type="string", nullable=true)
 * )
 *
 * @OA\Schema(
 *   schema="Teacher",
 *    type="object",
 *   required={"id","cin","email"},
 *    @OA\Property(property="id", type="integer", example=1),
 *    @OA\Property(property="cin", type="string", example="11223344"),
 *    @OA\Property(property="email", type="string", format="email", example="sara.mhamdi@example.com"),
 *    @OA\Property(property="phone_number", type="string", nullable=true, example="12345678"),
 *    @OA\Property(property="birth_date", type="string", format="date", nullable=true, example="1993-08-15"),
 *    @OA\Property(property="cv", type="string", nullable=true, example="teachers/cv/abc123.pdf"),
 *   @OA\Property(
 *    property="translations",
 *      type="array",
 *      @OA\Items(ref="#/components/schemas/TeacherTranslation")
 *    )
 *  )

 * @OA\Schema(
 *   schema="TeacherTranslationInput",
 *   type="object",
 *   @OA\Property(property="first_name", type="string", nullable=true),
 *   @OA\Property(property="last_name",  type="string", nullable=true),
 *   @OA\Property(property="address",    type="string", nullable=true),
 *   @OA\Property(property="grad",       type="string", nullable=true),
 *   @OA\Property(property="department", type="string", nullable=true)
 * )
 *
 * @OA\Schema(
 *   schema="TeacherCreateBody",
 *   type="object",
 *   required={"cin","email"},
 *   @OA\Property(property="cin", type="string"),
 *   @OA\Property(property="email", type="string", format="email"),
 *   @OA\Property(property="phone_number", type="string", nullable=true),
 *   @OA\Property(property="birth_date", type="string", format="date", nullable=true),
 *   @OA\Property(property="cv", type="string", format="binary", nullable=true),
 *   @OA\Property(
 *     property="translations",
 *     type="object",
 *     @OA\Property(property="fr", ref="#/components/schemas/TeacherTranslationInput"),
 *     @OA\Property(property="en", ref="#/components/schemas/TeacherTranslationInput"),
 *     @OA\Property(property="ar", ref="#/components/schemas/TeacherTranslationInput")
 *   )
 * )
 *
 * @OA\Schema(
 *   schema="TeacherUpdateBody",
 *   type="object",
 *   @OA\Property(property="cin", type="string"),
 *   @OA\Property(property="email", type="string", format="email"),
 *   @OA\Property(property="phone_number", type="string", nullable=true),
 *   @OA\Property(property="birth_date", type="string", format="date", nullable=true),
 *   @OA\Property(property="cv", type="string", format="binary", nullable=true),
 *   @OA\Property(
 *     property="translations",
 *     type="object",
 *     @OA\Property(property="fr", ref="#/components/schemas/TeacherTranslationInput"),
 *     @OA\Property(property="en", ref="#/components/schemas/TeacherTranslationInput"),
 *     @OA\Property(property="ar", ref="#/components/schemas/TeacherTranslationInput")
 *   )
 * )
 *
 * @OA\Schema(
 *   schema="ApiError",
 *   type="object",
 *   @OA\Property(property="message", type="string"),
 *   @OA\Property(
 *     property="errors",
 *     type="object",
 *     additionalProperties=@OA\Schema(type="array", @OA\Items(type="string"))
 *   )
 * )
 */
class Schemas {}
