<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Services\TeacherService;
use App\Traits\ApiResponseTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Mpdf\Mpdf;
use Mpdf\MpdfException;

/** @noinspection PhpUnused */

/**
 * @OA\Tag(
 *   name="Teachers",
 *   description="Endpoints for managing teachers"
 * )
 */

class TeacherController extends Controller
{
    use ApiResponseTrait;

    protected $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService=$teacherService;
    }

    /**
     * List teachers.
     *
     * @OA\Get(
     *   path="/api/teachers",
     *   operationId="teachers.index",
     *   tags={"Teachers"},
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="code", type="integer", example=200),
     *       @OA\Property(property="message", type="string", example="OK"),
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/Teacher")
     *       ),
     *       @OA\Property(property="errors", type="object", nullable=true)
     *     )
     *   )
     * )
     */

    public function index(Request $request): JsonResponse
    {
        $languageCode = $request->get('lang', 'fr'); // default to French
        $teachers = $this->teacherService->getAllLocalized($languageCode);

        return response()->json($teachers);
    }

    /**
     * Get a teacher by ID.
     *
     * @OA\Get(
     *   path="/api/teachers/{id}",
     *   operationId="teachers.show",
     *   tags={"Teachers"},
     *   @OA\Parameter(
     *     name="id", in="path", required=true, description="Teacher ID",
     *     @OA\Schema(type="integer")
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="code", type="integer", example=200),
     *       @OA\Property(property="message", type="string", example="OK"),
     *       @OA\Property(property="data", ref="#/components/schemas/Teacher"),
     *       @OA\Property(property="errors", type="object", nullable=true)
     *     )
     *   ),
     *   @OA\Response(response=404, description="Not found")
     * )
     */

    public function show(Request $request, $id): JsonResponse
    {
        $languageCode = $request->get('lang', 'fr');
        $teacher = Teacher::with('translations')->findOrFail($id);

        $localizedData = $this->teacherService->getLocalizedData($teacher, $languageCode);

        return response()->json(array_merge(
            $teacher->toArray(),
            $localizedData
        ));
    }

    /**
     * @throws Exception
    /**
     * Create a teacher.
     *
     * @OA\Post(
     *   path="/api/teachers",
     *   operationId="teachers.store",
     *   tags={"Teachers"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\MediaType(
     *       mediaType="multipart/form-data",
     *       @OA\Schema(
     *         type="object",
     *         required={"cin","email"},
     *         @OA\Property(property="cin", type="string", example="11223344"),
     *         @OA\Property(property="email", type="string", format="email", example="sara.mhamdi@example.com"),
     *         @OA\Property(property="phone_number", type="string", example="12345678"),
     *         @OA\Property(property="birth_date", type="string", format="date", example="1993-08-15"),
     *         @OA\Property(property="cv", type="string", format="binary", description="PDF/DOC"),
     *         @OA\Property(
     *           property="translations[fr][first_name]", type="string", example="Sara"
     *         ),
     *         @OA\Property(property="translations[fr][last_name]", type="string", example="Mhamdi"),
     *         @OA\Property(property="translations[fr][address]", type="string", example="Tunis"),
     *         @OA\Property(property="translations[fr][grad]", type="string", example="Professeur"),
     *         @OA\Property(property="translations[fr][department]", type="string", example="IA"),
     *         @OA\Property(property="translations[en][first_name]", type="string", example="Sara"),
     *         @OA\Property(property="translations[en][last_name]", type="string", example="Mhamdi"),
     *         @OA\Property(property="translations[en][address]", type="string", example="Tunis"),
     *         @OA\Property(property="translations[en][grad]", type="string", example="Professor"),
     *         @OA\Property(property="translations[en][department]", type="string", example="AI"),
     *         @OA\Property(property="translations[ar][first_name]", type="string", example="سارة"),
     *         @OA\Property(property="translations[ar][last_name]", type="string", example="محمدي"),
     *         @OA\Property(property="translations[ar][address]", type="string", example="تونس"),
     *         @OA\Property(property="translations[ar][grad]", type="string", example="أستاذ"),
     *         @OA\Property(property="translations[ar][department]", type="string", example="ذكاء اصطناعي")
     *       )
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Created",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="code", type="integer", example=200),
     *       @OA\Property(property="message", type="string", example="Created successfully"),
     *       @OA\Property(property="data", ref="#/components/schemas/Teacher"),
     *       @OA\Property(property="errors", type="object", nullable=true)
     *     )
     *   ),
     *   @OA\Response(
     *     response=422,
     *     description="Validation error",
     *     @OA\JsonContent(ref="#/components/schemas/ApiError")
     *   )
     * )
     */

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $teacher = $this->teacherService->create(
            [
                'cin'          => $validated['cin'],
                'email'        => $validated['email'],
                'phone_number' => $validated['phone_number'],
                'birth_date'   => $validated['birth_date'],
                'translations' => $validated['translations'],
            ],
            $request->file('cv') // may be null
        );

        // Map translations by 'language_code' (NOT 'codeLang')
        $translationsByLang = $teacher->translations
            ->groupBy('language_code')
            ->map(fn($rows) => optional($rows->first())->only([
                'first_name','last_name','address','grad','department'
            ]));

        return response()->json([
            'code'    => 200,
            'message' => __('messages.created_successfully') ?? 'Created successfully',
            'data'    => [
                'id'           => $teacher->id,
                'cin'          => $teacher->cin,
                'email'        => $teacher->email,
                'phone_number' => $teacher->phone_number,
                'birth_date'   => $teacher->birth_date?->toDateString(),
                'cv'           => $teacher->cv ? asset('storage/'.$teacher->cv) : null,
                'translations' => $translationsByLang,
            ],
            'errors'  => null,
        ], 200);
    }


    /**
     * Build translations array from flat field format
     */

    /**
     * Update a teacher.
     *
     * @OA\Put(
     *   path="/api/teachers/{id}",
     *   operationId="teachers.update",
     *   tags={"Teachers"},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     required=false,
     *     @OA\MediaType(
     *       mediaType="multipart/form-data",
     *       @OA\Schema(
     *         type="object",
     *         @OA\Property(property="cin", type="string"),
     *         @OA\Property(property="email", type="string", format="email"),
     *         @OA\Property(property="phone_number", type="string"),
     *         @OA\Property(property="birth_date", type="string", format="date"),
     *         @OA\Property(property="cv", type="string", format="binary"),
     *         @OA\Property(property="translations[fr][first_name]", type="string"),
     *         @OA\Property(property="translations[fr][last_name]", type="string"),
     *         @OA\Property(property="translations[fr][address]", type="string"),
     *         @OA\Property(property="translations[fr][grad]", type="string"),
     *         @OA\Property(property="translations[fr][department]", type="string"),
     *         @OA\Property(property="translations[en][first_name]", type="string"),
     *         @OA\Property(property="translations[en][last_name]", type="string"),
     *         @OA\Property(property="translations[en][address]", type="string"),
     *         @OA\Property(property="translations[en][grad]", type="string"),
     *         @OA\Property(property="translations[en][department]", type="string"),
     *         @OA\Property(property="translations[ar][first_name]", type="string"),
     *         @OA\Property(property="translations[ar][last_name]", type="string"),
     *         @OA\Property(property="translations[ar][address]", type="string"),
     *         @OA\Property(property="translations[ar][grad]", type="string"),
     *         @OA\Property(property="translations[ar][department]", type="string")
     *       )
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Updated",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="code", type="integer", example=200),
     *       @OA\Property(property="message", type="string", example="Updated successfully"),
     *       @OA\Property(property="data", ref="#/components/schemas/Teacher"),
     *       @OA\Property(property="errors", type="object", nullable=true)
     *     )
     *   ),
     *   @OA\Response(response=404, description="Not found"),
     *   @OA\Response(response=422, description="Validation error", @OA\JsonContent(ref="#/components/schemas/ApiError"))
     * )
     */


    public function update(UpdateTeacherRequest $request, Teacher $teacher): JsonResponse
    {
        $validated = $request->validated();

        $updated = $this->teacherService->update(
            $teacher,
            [
                'cin'          => $validated['cin']          ?? null,
                'email'        => $validated['email']        ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
                'birth_date'   => $validated['birth_date']   ?? null,
                'translations' => $validated['translations'] ?? [],
            ],
            $request->file('cv') // may be null
        );

        return response()->json([
            'code'    => 200,
            'message' => __('messages.updated_successfully') ?? 'Updated successfully',
            'data'    => [
                'id'           => $updated->id,
                'cin'          => $updated->cin,
                'email'        => $updated->email,
                'phone_number' => $updated->phone_number,
                'birth_date'   => $updated->birth_date?->toDateString(),
                'cv'           => $updated->cv ? asset('storage/'.$updated->cv) : null,
                'translations' => $updated->translations
                    ->groupBy('language_code')
                    ->map(fn($rows) => optional($rows->first())->only([
                        'first_name','last_name','address','grad','department'
                    ])),
            ],
            'errors'  => null,
        ], 200);
    }

    /**
     * Delete (soft delete) a teacher.
     *
     * @OA\Delete(
     *   path="/api/teachers/{id}",
     *   operationId="teachers.destroy",
     *   tags={"Teachers"},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(
     *     response=200,
     *     description="Deleted",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="code", type="integer", example=200),
     *       @OA\Property(property="message", type="string", example="Deleted successfully"),
     *       @OA\Property(property="data", type="null", nullable=true),
     *       @OA\Property(property="errors", type="object", nullable=true)
     *     )
     *   ),
     *   @OA\Response(response=404, description="Not found")
     * )
     */


    public function destroy(Teacher $teacher): JsonResponse
    {
        if ($teacher->is_deleted) {
            return $this->error(__('messages.teacher_not_found'), 400);
        }

        $this->teacherService->softDelete($teacher);
        return $this->success(null, __('messages.teacher_deleted'));
    }

    /**
     * @throws MpdfException
     **/
    /**
     * Generate teacher PDF (localized).
     *
     * @OA\Get(
     *   path="/api/teachers/{id}/pdf/{lang}",
     *   operationId="teachers.pdf",
     *   tags={"Teachers"},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Parameter(name="lang", in="path", required=true, @OA\Schema(type="string", enum={"fr","en"})),
     *   @OA\Response(
     *     response=200,
     *     description="PDF stream",
     *     @OA\MediaType(
     *       mediaType="application/pdf",
     *       @OA\Schema(type="string", format="binary")
     *     )
     *   ),
     *   @OA\Response(response=404, description="Not found")
     * )
     */


    public function generatePdf(int $id, string $lang = 'fr')
    {
        try {
            // Load teacher with only the needed languages
            $teacher = Teacher::with('translations')->findOrFail($id);

            if (!empty($teacher->is_deleted)) {
                abort(404, __('messages.teacher_not_found'));
            }

            // Ensure mPDF temp dir is writable (Windows/Laragon fix)
            $tempDir = storage_path('app/mpdf');
            if (!File::isDirectory($tempDir)) {
                File::makeDirectory($tempDir, 0775, true);
            }

            // Render Blade view (make sure resources/views/pdf/teacher.blade.php exists)
            $html = view('pdf.teacher', [
                'teacher' => $teacher,
                'lang'    => in_array($lang, ['en', 'fr']) ? $lang : 'fr',
            ])->render();

            // Build the PDF
            $mpdf = new Mpdf([
                'mode'         => 'utf-8',
                'format'       => 'A4',
                'default_font' => 'dejavusans',
                'orientation'  => 'P',
                'tempDir'      => $tempDir,
            ]);

            $mpdf->WriteHTML($html);
            $pdfString = $mpdf->Output('', 'S');

            // Return as download (or switch to 'inline' if you want preview)
            return response($pdfString, 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="teacher-'.$teacher->id.'-'.$lang.'.pdf"');

        } catch (\Throwable $e) {
            Log::error('PDF generation failed', [
                'teacher_id' => $id,
                'lang'       => $lang,
                'error'      => $e->getMessage(),
            ]);

            // JSON so Angular shows your generic error toast
            return response()->json(['message' => 'PDF generation failed'], 500);
        }
    }


    /**
     * Download teacher CV file.
     *
     * @OA\Get(
     *   path="/api/teachers/{id}/cv",
     *   operationId="teachers.downloadCv",
     *   tags={"Teachers"},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(
     *     response=200,
     *     description="File stream",
     *     @OA\MediaType(
     *       mediaType="application/octet-stream",
     *       @OA\Schema(type="string", format="binary")
     *     )
     *   ),
     *   @OA\Response(response=404, description="File or teacher not found")
     * )
     */

    public function downloadCv(Teacher $teacher) : \Symfony\Component\HttpFoundation\BinaryFileResponse | JsonResponse
    {
        if (!$teacher->cv) {
            return response()->json(['error' => 'CV path not set in database'], 404);
        }

        $filePath = storage_path('app/public/' . $teacher->cv);

        if (!file_exists($filePath)) {
            return response()->json([
                'error' => 'File not found in storage',
                'expected_path' => $filePath,
                'storage_link_exists' => \Illuminate\Support\Facades\Storage::exists('public/' . $teacher->cv),
            ], 404);
        }

        return response()->download($filePath);
    }
}
