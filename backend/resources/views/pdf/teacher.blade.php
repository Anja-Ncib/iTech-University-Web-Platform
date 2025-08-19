<!DOCTYPE html>
<html lang="{{ $lang ?? 'fr' }}">
<head>
    <meta charset="UTF-8">
    <style>
        /* MPDF-Compatible Styles */
        @page {
            margin-top: 80px;    /* Reduced from 120px */
            margin-bottom: 60px;
            margin-left: 40px;
            margin-right: 40px;
        }

        /* Simplified Color Scheme */
        .primary-dark { color: #083E86; }
        .primary-medium { color: #265694; }
        .accent { color: #00A099; }
        .text-dark { color: #1e293b; }
        .text-medium { color: #475569; }
        .bg-light { background-color: #f8fafc; }
        .bg-section { background-color: #f1f5f9; }
        .border-light { border-color: #e2e8f0; }

        /* Header - Simplified for MPDF */
        .header {
            position: fixed;
            top: -40px;          /* Reduced from -100px */
            left: 0;
            right: 0;
            height: 30px;        /* Reduced from 100px */
            background-color: #083E86;
            color: white;
            text-align: center;
            padding-top: 10px;
            border-bottom: 2px solid #00A099;
        }

        .header-title {
            font-size: 16px;     /* Reduced from 20px */
            font-weight: bold;

        }

        /* Footer - Simplified */
        .footer {
            position: fixed;
            bottom: -100px;
            left: 0;
            right: 0;
            height: 100px;
            background-color: #f1f5f9;
            border-top: 3px solid #00A099;
            text-align: center;
            font-size: 10px;
            padding-top: 15px;
            color: #475569;
            line-height: 1.4;
        }

        /* Body Styles */
        body {
            font-family: 'dejavusans', sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }

        /* Document Title */
        .document-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #083E86;
            margin: 20px 0 30px 0;
            padding-bottom: 15px;
            border-bottom: 3px solid #00A099;
        }

        /* Section Styles - Simplified */
        .section {
            margin-bottom: 20px;
        }

        .section-header {
            background-color: #083E86;
            color: white;
            padding: 8px 15px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 0;
            border-radius: 4px 4px 0 0;
        }

        .section-content {
            border: 1px solid #e2e8f0;
            border-top: none;
            padding: 0;
        }

        /* Table Styles - MPDF Optimized */
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table tr {
            border-bottom: 1px solid #e2e8f0;
        }

        .info-table tr:last-child {
            border-bottom: none;
        }

        .info-table td {
            padding: 10px 15px;
            vertical-align: top;
        }

        .info-table td:first-child {
            font-weight: bold;
            color: #475569;
            width: 35%;
            background-color: #f1f5f9;
            border-right: 1px solid #e2e8f0;
        }

        /* RTL Support */
        .rtl {
            direction: rtl;
            text-align: right;
            font-family: 'dejavusans', sans-serif;
        }

        /* Utility Classes */
        .highlight-value {
            color: #083E86;
            font-weight: bold;
        }

        .accent-text {
            color: #00A099;
            font-weight: bold;
        }

        /* Watermark - MPDF Compatible */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(8, 62, 134, 0.08);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>
<body>

<!-- Watermark -->

<!-- Header -->
<div class="header">
    <div class="header-title">
        {{ $lang === 'en' ? 'University of Sfax - iTECH University' : 'Université de Sfax - iTECH University' }}
    </div>
</div>

<!-- Document Title -->
<div class="document-title">
    {{ $lang === 'en' ? 'Teacher Profile Report' : 'Rapport de Profil Enseignant' }}
</div>

<!-- Personal Information Section -->
<div class="section">
    <div class="section-header">
        {{ $lang === 'en' ? 'Personal Information' : 'Informations Personnelles' }}
    </div>
    <div class="section-content">
        <table class="info-table">
            <tr>
                <td><strong>CIN:</strong></td>
                <td class="highlight-value">{{ $teacher->cin }}</td>
            </tr>
            <tr>
                <td><strong>{{ $lang === 'en' ? 'First Name' : 'Prénom' }}:</strong></td>
                <td>{{ $teacher->translation($lang)->first_name }}</td>
            </tr>
            <tr class="rtl">
                <td><strong>{{ $lang === 'en' ? 'First Name (Arabic)' : 'Prénom (Arabe)' }}:</strong></td>
                <td>{{ $teacher->translation('ar')->first_name ?? '--' }}</td>
            </tr>
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Last Name' : 'Nom' }}:</strong></td>
                <td>{{ $teacher->translation($lang)->last_name }}</td>
            </tr>
            <tr class="rtl">
                <td><strong>{{ $lang === 'en' ? 'Last Name (Arabic)' : 'Nom (Arabe)' }}:</strong></td>
                <td>{{ $teacher->translation('ar')->last_name ?? '--' }}</td>
            </tr>
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Date of Birth' : 'Date de Naissance' }}:</strong></td>
                <td class="accent-text">{{ \Carbon\Carbon::parse($teacher->birth_date)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Address' : 'Adresse' }}:</strong></td>
                <td>{{ $teacher->translation($lang)->address }}</td>
            </tr>
            <tr class="rtl">
                <td><strong>{{ $lang === 'en' ? 'Address (Arabic)' : 'Adresse (Arabe)' }}:</strong></td>
                <td>{{ $teacher->translation('ar')->address ?? '--' }}</td>
            </tr>
        </table>
    </div>
</div>

<!-- Contact Information Section -->
<div class="section">
    <div class="section-header">
        {{ $lang === 'en' ? 'Contact Information' : 'Coordonnées' }}
    </div>
    <div class="section-content">
        <table class="info-table">
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Email Address' : 'Adresse Email' }}:</strong></td>
                <td class="accent-text">{{ $teacher->email }}</td>
            </tr>
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Phone Number' : 'Numéro de Téléphone' }}:</strong></td>
                <td class="highlight-value">{{ $teacher->phone_number }}</td>
            </tr>
        </table>
    </div>
</div>

<!-- Professional Information Section -->
<div class="section">
    <div class="section-header">
        {{ $lang === 'en' ? 'Professional Information' : 'Informations Professionnelles' }}
    </div>
    <div class="section-content">
        <table class="info-table">
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Department' : 'Département' }}:</strong></td>
                <td class="highlight-value">{{ $teacher->translation($lang)->department }}</td>
            </tr>
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Academic Grade' : 'Grade Académique' }}:</strong></td>
                <td class="accent-text">{{ $teacher->translation($lang)->grad }}</td>
            </tr>
            <tr>
                <td><strong>{{ $lang === 'en' ? 'Employment Year' : 'Année d\'Embauche' }}:</strong></td>
                <td class="highlight-value">{{ \Carbon\Carbon::parse($teacher->created_at)->format('Y') }}</td>
            </tr>
        </table>
    </div>
</div>

<!-- Footer -->
<div class="footer">
    <div>
        <strong>{{ $lang === 'en' ? 'Address' : 'Adresse' }}:</strong> Ceinture Bourguiba de Gremda Vers Kaied
        | <strong>{{ $lang === 'en' ? 'Tel' : 'Tél' }}:</strong> +216 28 640 000
        | <strong>{{ $lang === 'en' ? 'Fax' : 'Fax' }}:</strong> +216 36 301 556
    </div>
    <div>
        <strong>Email:</strong> contact@itech-university.tn
        | <strong>{{ $lang === 'en' ? 'Website' : 'Site Web' }}:</strong> www.itech-university.tn
    </div>
    <div style="margin-top: 8px;">
        {{ $lang === 'en' ? 'Generated on' : 'Généré le' }} {{ date('d/m/Y H:i') }}
        | {{ $lang === 'en' ? 'Confidential Document' : 'Document Confidentiel' }}
    </div>
</div>

</body>
</html>
