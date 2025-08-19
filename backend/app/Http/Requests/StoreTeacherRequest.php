<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gate/abilities if needed
    }

    public function rules(): array
    {
        return [
            'cin'          => ['required','digits:8'],
            'email'        => ['required','email','max:255'],
            'phone_number' => ['required','digits:8'],
            'birth_date'   => ['required','date','after_or_equal:1945-01-01','before_or_equal:2002-12-31'],

            'cv'           => ['required','file','mimes:pdf,doc,docx','max:5120'],

            'translations' => ['required','json'],
        ];
    }

    public function messages(): array
    {
        return [
            'cv.mimes' => 'The CV must be a file of type: pdf, doc, docx.',
            'cv.max'   => 'The CV may not be greater than 5MB.',
        ];
    }
}
