<?php

namespace App\Imports;

use App\Models\Area;
use App\Models\Lead;
use App\Models\LeadDesignation;
use App\Models\LeadSource;
use App\Models\LeadStage;
use App\Models\Profession;
use App\Models\Sector;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Contracts\Queue\ShouldQueue;

class LeadImport implements
    ToCollection,
    WithHeadingRow,
    WithChunkReading,
    SkipsEmptyRows,
    ShouldQueue
{
    public int $inserted = 0;

    public int $skipped = 0;

    protected array $failures = [];

    private ?int $defaultStageId = null;

    private ?int $defaultSourceId = null;

    private int $nextLeadNumber;

    /**
     * Preloaded relational data:
     * [
     *   'normalized name' => id,
     * ]
     */
    private array $areas = [];

    private array $sectors = [];

    private array $professions = [];

    private array $designations = [];

    private array $sources = [];

    private array $stages = [];

    private ?int $userId;

    public function __construct(?int $userId = null)
    {
        $this->userId = $userId;

        $this->areas = $this->buildNameMap(
            Area::query()
                ->where('is_active', true)
                ->pluck('id', 'name')
                ->toArray(),
        );

        $this->sectors = $this->buildNameMap(
            Sector::query()
                ->where('is_active', true)
                ->pluck('id', 'name')
                ->toArray(),
        );

        $this->professions = $this->buildNameMap(
            Profession::query()
                ->where('is_active', true)
                ->pluck('id', 'name')
                ->toArray(),
        );

        $this->designations = $this->buildNameMap(
            LeadDesignation::query()
                ->pluck('id', 'name')
                ->toArray(),
        );

        $this->sources = $this->buildNameMap(
            LeadSource::query()
                ->where('is_active', true)
                ->pluck('id', 'name')
                ->toArray(),
        );

        $this->stages = $this->buildNameMap(
            LeadStage::query()
                ->where('is_active', true)
                ->pluck('id', 'name')
                ->toArray(),
        );

        $this->defaultStageId = LeadStage::query()
            ->where('is_active', true)
            ->where('is_default', true)
            ->value('id')
            ?? LeadStage::query()
                ->where('is_active', true)
                ->orderBy('order')
                ->value('id');

        $this->defaultSourceId = LeadSource::query()
            ->where('is_active', true)
            ->where('is_default', true)
            ->value('id')
            ?? LeadSource::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->value('id');

        $this->nextLeadNumber = ((int) Lead::max('id')) + 1;
    }

    public function collection(Collection $rows): void
    {

        $now = now();

        foreach ($rows as $index => $row) {
            $excelRow = $index + 2;

            $phone = $this->nullableString($row['phone'] ?? null);
            $email = $this->nullableString($row['email'] ?? null);

            $dateValue = $row['date'] ?? null;

            // Convert Excel date serial numbers to proper date formats or set default
            $createdAt = $dateValue ? Carbon::instance(Date::excelToDateTimeObject($dateValue))->format('Y-m-d') : Carbon::now();
            $updatedAt = $dateValue ? Carbon::instance(Date::excelToDateTimeObject($dateValue))->format('Y-m-d') : Carbon::now();

            if ($phone === null) {
                info('skipped_null', [$row['phone'], $row['date']]);
                $this->skipped++;

                $this->failures[] = [
                    'row' => $excelRow,
                    'errors' => [
                        'Name and phone are required.',
                    ],
                ];

                continue;
            }

            $lead = Lead::query()
                ->where('phone', $phone)
                ->orWhere('email', $email)
                ->first();

            $data = [
                'lead_code' => $this->getLeadCode(
                    $row['lead_code'] ?? null,
                ),

                'name' => $this->nullableString($row['name'] ?? 'Default Name'),
                'company_name' => $this->nullableString(
                    $row['company_name'] ?? null,
                ),

                'phone' => $phone,
                'phone_secondary' => $this->nullableString(
                    $row['phone_secondary'] ?? null,
                ),
                'phone_foreign' => $this->nullableString(
                    $row['phone_foreign'] ?? null,
                ),
                'email' => $email,

                // If no match: null
                'area_id' => $this->resolveFromMap(
                    $row['area'] ?? null,
                    $this->areas,
                ),

                'sector_id' => $this->resolveFromMap(
                    $row['sector'] ?? null,
                    $this->sectors,
                ),

                'profession_id' => $this->resolveFromMap(
                    $row['profession'] ?? null,
                    $this->professions,
                ),

                'designation_id' => $this->resolveFromMap(
                    $row['designation'] ?? null,
                    $this->designations,
                ),

                // If no match: default source
                'source_id' => $this->resolveFromMap(
                    $row['source'] ?? null,
                    $this->sources,
                ) ?? $this->defaultSourceId,

                // If no match: default stage
                'stage_id' => $this->resolveFromMap(
                    $row['stage'] ?? null,
                    $this->stages,
                ) ?? $this->defaultStageId,

                'assigned_to' => null,

                'priority' => $this->enumValue(
                    $row['priority'] ?? null,
                    ['low', 'medium', 'high'],
                    'medium',
                ),

                'interest_level' => $this->enumValue(
                    $row['interest_level'] ?? null,
                    ['cold', 'warm', 'hot'],
                    'warm',
                ),

                'last_contacted_at' => null,
                'next_follow_up_at' => null,

                'remarks' => $this->nullableString(
                    $row['remarks'] ?? null,
                ),

                'is_converted' => false,
                'converted_at' => null,
                'customer_id' => null,

                'address' => $this->nullableString(
                    $row['address'] ?? null,
                ),

                'created_by' => $this->nullableString(
                    $row['created_by'] ?? $this->userId,
                ),

                'created_at' => $createdAt,

                'updated_at' => $updatedAt,


            ];

            if ($lead) {
                // skipped lead if already exits with phone number or email
                $this->skipped++;

                continue;
            }

            Lead::create($data);

            $this->inserted++;
        }
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function failures(): array
    {
        return $this->failures;
    }

    /**
     * Convert DB rows to:
     * ['normalized-name' => id]
     */
    private function buildNameMap(array $items): array
    {
        $map = [];

        foreach ($items as $name => $id) {
            $normalizedName = $this->normalize($name);

            if ($normalizedName !== '') {
                $map[$normalizedName] = (int) $id;
            }
        }

        return $map;
    }

    /**
     * Match order:
     * 1. Exact normalized name
     * 2. Safe fuzzy match for spelling/spacing differences
     *
     * Returns null when no confident match is found.
     */
    private function resolveFromMap(
        mixed $value,
        array $items,
    ): ?int {
        $search = $this->normalize($value);

        if ($search === '') {
            return null;
        }

        // Exact normalized match, e.g. "Real Estate" = " real   estate ".
        if (isset($items[$search])) {
            return $items[$search];
        }

        $bestScore = 0;
        $bestId = null;

        foreach ($items as $itemName => $id) {
            $score = $this->similarityScore(
                $search,
                $itemName,
            );

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestId = $id;
            }
        }

        /*
         * Only use fuzzy matching when confidence is high.
         * Prevents assigning a wrong Area/Sector/Profession accidentally.
         */
        return $bestScore >= 82
            ? $bestId
            : null;
    }

    private function similarityScore(
        string $first,
        string $second,
    ): float {
        if ($first === $second) {
            return 100;
        }

        if (
            str_contains($first, $second)
            || str_contains($second, $first)
        ) {
            return 90;
        }

        $maxLength = max(
            mb_strlen($first),
            mb_strlen($second),
        );

        if ($maxLength === 0) {
            return 0;
        }

        $distance = levenshtein(
            Str::ascii($first),
            Str::ascii($second),
        );

        return max(
            0,
            (1 - ($distance / $maxLength)) * 100,
        );
    }

    private function normalize(mixed $value): string
    {
        $value = preg_replace(
            '/\s+/u',
            ' ',
            trim((string) $value),
        );

        return Str::lower(
            Str::ascii($value ?? ''),
        );
    }

    private function getLeadCode(mixed $value): string
    {
        $leadCode = trim((string) $value);

        if ($leadCode !== '') {
            return $leadCode;
        }

        return 'L' . now()->format('y') . str_pad(
            (string) $this->nextLeadNumber++,
            6,
            '0',
            STR_PAD_LEFT,
        );
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }

    private function enumValue(
        mixed $value,
        array $allowedValues,
        ?string $default,
    ): ?string {
        $value = strtolower(trim((string) $value));

        return in_array($value, $allowedValues, true)
            ? $value
            : $default;
    }

    private function formatDateTime(mixed $value): ?string
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        try {
            if (is_numeric($value)) {
                return Carbon::instance(
                    Date::excelToDateTimeObject($value),
                )->format('Y-m-d H:i:s');
            }

            return Carbon::parse($value)
                ->format('Y-m-d H:i:s');
        } catch (\Throwable) {
            return null;
        }
    }
}
