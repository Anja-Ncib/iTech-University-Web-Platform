<?php
use App\Http\Controllers\TeacherController;

//Route::group(['middleware' => 'set.local'], function() {
Route::get('/teachers', [TeacherController::class, 'index']);
Route::post('/teachers', [TeacherController::class, 'store']);
Route::get('/teachers/{teacher}', [TeacherController::class, 'show']);
Route::put('/teachers/{teacher}', [TeacherController::class, 'update']);
Route::delete('/teachers/{teacher}', [TeacherController::class, 'destroy']);

Route::get('/teachers/{id}/pdf/{lang?}', [TeacherController::class, 'generatePdf'])
    ->where('lang', 'en|fr|ar')
    ->name('teacher.pdf');

Route::get('/teachers/{teacher}/download-cv', [TeacherController::class, 'downloadCv'])
    ->name('teachers.download-cv');

Route::get('/teachers/search', [TeacherController::class, 'search']);

Route::get('/test-api', function () {
    return response()->json(['message' => 'API function']);
});
Route::get('mpdf-test', function () {
    try {
        $tempDir = storage_path('app/mpdf');
        if (!File::isDirectory($tempDir)) {
            File::makeDirectory($tempDir, 0775, true);
        }

        $mpdf = new \Mpdf\Mpdf([
            'mode'         => 'utf-8',
            'format'       => 'A4',
            'default_font' => 'dejavusans',
            'tempDir'      => $tempDir,
        ]);

        $mpdf->WriteHTML('<h1 style="font-family: DejaVu Sans">mPDF OK ✅</h1>');
        $pdf = $mpdf->Output('', 'S');

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="mpdf-test.pdf"');
    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'mPDF test failed',
            'error'   => $e->getMessage(),
        ], 500);
    }
});
