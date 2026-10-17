<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @php $companyName = \App\Models\CompanySetting::getSettings()->company_name ?? 'Koceevent'; @endphp
    <title>Official Match Scoresheet - {{ $companyName }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
        }
        .header p {
            margin: 0;
            color: #64748b;
            font-size: 11px;
        }
        .meta-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
        }
        .meta-grid {
            width: 100%;
        }
        .meta-grid td {
            padding: 4px 0;
            font-size: 11px;
        }
        .meta-label {
            color: #64748b;
            font-weight: 600;
            width: 25%;
        }
        .meta-value {
            color: #0f172a;
            font-weight: bold;
        }
        table.score-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        table.score-table th, table.score-table td {
            border: 1px solid #cbd5e1;
            padding: 10px;
            text-align: center;
        }
        table.score-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table.score-table td.team-cell {
            text-align: left;
            font-weight: bold;
            font-size: 13px;
            width: 40%;
        }
        .score-box {
            font-size: 16px;
            font-weight: 800;
        }
        .signatures {
            width: 100%;
            margin-top: 40px;
        }
        .signatures td {
            width: 25%;
            text-align: center;
            vertical-align: bottom;
            padding: 0 10px;
        }
        .signature-line {
            border-bottom: 1px solid #475569;
            margin-bottom: 6px;
            height: 60px;
        }
        .signature-title {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
        }
        .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Official Match Scoresheet</h1>
        <p>{{ $tournament->name }} &bull; Venue: {{ $tournament->venue_name ?? 'Arena' }}</p>
    </div>

    <div class="meta-box">
        <table class="meta-grid">
            <tr>
                <td class="meta-label">Kategori Turnamen:</td>
                <td class="meta-value">{{ $category->name }}</td>
                <td class="meta-label">Nomor Pertandingan:</td>
                <td class="meta-value">#{{ $match->match_number }} ({{ $match->round_name }})</td>
            </tr>
            <tr>
                <td class="meta-label">Lapangan:</td>
                <td class="meta-value">{{ $match->court->name ?? 'Belum Ditentukan' }}</td>
                <td class="meta-label">Status Pertandingan:</td>
                <td class="meta-value">{{ strtoupper($match->status) }}</td>
            </tr>
            <tr>
                <td class="meta-label">Tanggal Pelaksanaan:</td>
                <td class="meta-value">{{ now()->format('d M Y') }}</td>
                <td class="meta-label">Waktu Kick-off:</td>
                <td class="meta-value">{{ $match->started_at ? $match->started_at->format('H:i') : '-' }} WIB</td>
            </tr>
        </table>
    </div>

    <!-- Official Score Table -->
    <table class="score-table">
        <thead>
            <tr>
                <th>Pasangan Tim / Pemain</th>
                <th style="width: 15%;">Set 1</th>
                <th style="width: 15%;">Set 2</th>
                <th style="width: 15%;">Set 3</th>
                <th style="width: 15%;">Hasil Akhir</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="team-cell">
                    {{ $match->team1->name ?? 'TBD' }}
                    <div style="font-size: 10px; font-weight: normal; color: #64748b; margin-top: 4px;">
                        @if($match->team1 && $match->team1->players->isNotEmpty())
                            Pemain: {{ $match->team1->players->pluck('name')->implode(' & ') }}
                        @endif
                    </div>
                </td>
                <td class="score-box">{{ $match->team1_set1_score ?? '-' }}</td>
                <td class="score-box">{{ $match->team1_set2_score ?? '-' }}</td>
                <td class="score-box">{{ $match->team1_set3_score ?? '-' }}</td>
                <td class="score-box" style="background-color: #f1f5f9;">
                    {{ $match->winner_team_id === $match->team1_id && $match->winner_team_id ? 'MENANG' : '-' }}
                </td>
            </tr>
            <tr>
                <td class="team-cell">
                    {{ $match->team2->name ?? 'TBD' }}
                    <div style="font-size: 10px; font-weight: normal; color: #64748b; margin-top: 4px;">
                        @if($match->team2 && $match->team2->players->isNotEmpty())
                            Pemain: {{ $match->team2->players->pluck('name')->implode(' & ') }}
                        @endif
                    </div>
                </td>
                <td class="score-box">{{ $match->team2_set1_score ?? '-' }}</td>
                <td class="score-box">{{ $match->team2_set2_score ?? '-' }}</td>
                <td class="score-box">{{ $match->team2_set3_score ?? '-' }}</td>
                <td class="score-box" style="background-color: #f1f5f9;">
                    {{ $match->winner_team_id === $match->team2_id && $match->winner_team_id ? 'MENANG' : '-' }}
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Signatures -->
    <table class="signatures">
        <tr>
            <td>
                <div class="signature-line"></div>
                <div class="signature-title">Kapten Tim 1</div>
            </td>
            <td>
                <div class="signature-line"></div>
                <div class="signature-title">Kapten Tim 2</div>
            </td>
            <td>
                <div class="signature-line"></div>
                <div class="signature-title">Wasit Lapangan</div>
            </td>
            <td>
                <div class="signature-line"></div>
                <div class="signature-title">Tournament Desk</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Dicetak secara otomatis oleh Sistem Manajemen Turnamen {{ $companyName }} &bull; Dokumen Resmi Non-Falsifiable
    </div>
</body>
</html>
