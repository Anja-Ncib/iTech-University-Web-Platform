<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'cin'           => ['sometimes','string','max:50'],
            'email'         => ['sometimes','email','max:255'],
            'phone_number'  => ['sometimes','string','max:50'],
            'birth_date'    => ['sometimes','date'],

            // CV file optional on update
            'cv'            => ['nullable','file','mimes:pdf,doc,docx','max:5120'],

            // translations[fr|en|ar][...]
            'translations'                      => ['nullable','array'],
            'translations.fr'                   => ['nullable','array'],
            'translations.fr.first_name'        => ['nullable','string','max:255'],
            'translations.fr.last_name'         => ['nullable','string','max:255'],
            'translations.fr.address'           => ['nullable','string','max:255'],
            'translations.fr.grad'              => ['nullable','string','max:255'],
            'translations.fr.department'        => ['nullable','string','max:255'],

            'translations.en'                   => ['nullable','array'],
            'translations.en.first_name'        => ['nullable','string','max:255'],
            'translations.en.last_name'         => ['nullable','string','max:255'],
            'translations.en.address'           => ['nullable','string','max:255'],
            'translations.en.grad'              => ['nullable','string','max:255'],
            'translations.en.department'        => ['nullable','string','max:255'],

            'translations.ar'                   => ['nullable','array'],
            'translations.ar.first_name'        => ['nullable','string','max:255'],
            'translations.ar.last_name'         => ['nullable','string','max:255'],
            'translations.ar.address'           => ['nullable','string','max:255'],
            'translations.ar.grad'              => ['nullable','string','max:255'],
            'translations.ar.department'        => ['nullable','string','max:255'],
        ];
    }


}

