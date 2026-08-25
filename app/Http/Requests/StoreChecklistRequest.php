<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Domain\Checklist\Support\ChecklistBlueprint;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreChecklistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Aturan disusun langsung dari blueprint supaya tidak pernah berbeda dengan form.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'nama_petugas' => ['required', 'string', 'max:120'],
            'tanggal_pemeriksaan' => ['required', 'date', 'before_or_equal:today'],
            'week' => ['required', 'integer', Rule::in(ChecklistBlueprint::WEEKS)],
            'line' => ['required', 'integer', Rule::in(ChecklistBlueprint::LINES)],
            'answers' => ['required', 'array'],
        ];

        foreach (ChecklistBlueprint::items() as $item) {
            $field = 'answers.'.$item['key'];

            if ($item['type'] === 'option' && $item['optionSet'] !== null) {
                $rules[$field] = [
                    'required',
                    'string',
                    Rule::in(ChecklistBlueprint::valuesFor($item['optionSet'])),
                ];

                continue;
            }

            $rules[$field] = ['nullable', 'string', 'max:500'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $messages = [
            'nama_petugas.required' => 'Nama petugas belum diisi.',
            'nama_petugas.max' => 'Nama petugas maksimal 120 karakter.',
            'tanggal_pemeriksaan.required' => 'Tanggal pemeriksaan belum diisi.',
            'tanggal_pemeriksaan.date' => 'Tanggal pemeriksaan tidak valid.',
            'tanggal_pemeriksaan.before_or_equal' => 'Tanggal pemeriksaan tidak boleh melewati hari ini.',
            'week.required' => 'Minggu belum dipilih.',
            'week.in' => 'Minggu yang dipilih tidak tersedia.',
            'week.integer' => 'Minggu yang dipilih tidak tersedia.',
            'line.required' => 'Line belum dipilih.',
            'line.in' => 'Line yang dipilih tidak tersedia.',
            'line.integer' => 'Line yang dipilih tidak tersedia.',
            'answers.required' => 'Isian checklist belum lengkap.',
            'answers.array' => 'Format isian checklist tidak valid.',
        ];

        foreach (ChecklistBlueprint::items() as $item) {
            $field = 'answers.'.$item['key'];

            if ($item['type'] === 'option') {
                $messages[$field.'.required'] = 'Bagian ini belum diisi.';
                $messages[$field.'.string'] = 'Pilihan tidak valid.';
                $messages[$field.'.in'] = 'Pilihan tidak valid.';

                continue;
            }

            $messages[$field.'.string'] = 'Keterangan harus berupa teks.';
            $messages[$field.'.max'] = 'Keterangan maksimal 500 karakter.';
        }

        return $messages;
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        $attributes = [
            'nama_petugas' => 'nama petugas',
            'tanggal_pemeriksaan' => 'tanggal pemeriksaan',
            'week' => 'minggu',
            'line' => 'line',
            'answers' => 'isian checklist',
        ];

        foreach (ChecklistBlueprint::items() as $item) {
            $attributes['answers.'.$item['key']] = Str::limit($item['label'], 60);
        }

        return $attributes;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'week' => is_numeric($this->input('week')) ? (int) $this->input('week') : $this->input('week'),
            'line' => is_numeric($this->input('line')) ? (int) $this->input('line') : $this->input('line'),
        ]);
    }
}
