<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Teacher;

class UpdateTeachersArabicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Teacher::find(1)?->update([
            'first_name_ar' => 'محمد',
            'last_name_ar' => 'بن أحمد',
            'address_ar' => 'تونس العاصمة',
            'grad_ar' => 'أستاذ مساعد',
            'department_ar' => 'الجيولوجيا',
        ]);
        Teacher::find(2)?->update([
            'first_name_ar' => 'سارة',
            'last_name_ar' => 'المنصوري',
            'address_ar' => 'صفاقس',
            'grad_ar' => 'أستاذة',
            'department_ar' => 'الفيزياء',
        ]);
        Teacher::find(3)?->update([
            'first_name_ar' => 'خالد',
            'last_name_ar' => 'العلي',
            'address_ar' => 'سوسة',
            'grad_ar' => 'محاضر',
            'department_ar' => 'الكيمياء',
        ]);

        Teacher::find(4)?->update([
            'first_name_ar' => 'ليلى',
            'last_name_ar' => 'الحمامي',
            'address_ar' => 'القيروان',
            'grad_ar' => 'أستاذة محاضرة',
            'department_ar' => 'الرياضيات',
        ]);

        Teacher::find(5)?->update([
            'first_name_ar' => 'ياسين',
            'last_name_ar' => 'الفرحات',
            'address_ar' => 'بنزرت',
            'grad_ar' => 'باحث',
            'department_ar' => 'علوم الحاسوب',
        ]);

        Teacher::find(6)?->update([
            'first_name_ar' => 'هند',
            'last_name_ar' => 'الشابي',
            'address_ar' => 'جربة',
            'grad_ar' => 'أستاذة مساعدة',
            'department_ar' => 'الأحياء',
        ]);
    }
}
