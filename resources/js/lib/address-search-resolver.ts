const GENERIC_AREA_SUFFIXES = [
    'dohs',
    'r/a',
    'residential area',
    'residential',
    'housing',
];

function normalizeAddressPart(value: string): string {
    return value.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}

function addUniqueCandidate(candidates: string[], value: string) {
    const cleanValue = normalizeAddressPart(value);

    if (!cleanValue) {
        return;
    }

    const alreadyExists = candidates.some(
        (candidate) =>
            candidate.toLocaleLowerCase() === cleanValue.toLocaleLowerCase(),
    );

    if (!alreadyExists) {
        candidates.push(cleanValue);
    }
}

export function getAddressSearchResolver(
    addresses: string[] | null | undefined,
): string[] {
    const candidates: string[] = [];

    for (const address of addresses || []) {
        const parts = address
            .split(/[,;|\n]+/)
            .map(normalizeAddressPart)
            .filter(Boolean);

        for (const part of parts) {
            // Always keep the original part first.
            // Example: "Sector-11 Uttara"
            addUniqueCandidate(candidates, part);

            // Dhaka-1230 -> Dhaka
            const withoutPostCode = part
                .replace(/(?:\s*[-–]?\s*)\d{4}\b/g, '')
                .trim();

            if (withoutPostCode !== part) {
                addUniqueCandidate(candidates, withoutPostCode);
            }

            // Sector-11 Uttara -> Sector 11 Uttara
            // Does NOT change H-417 or R-7 because they have no text after number.
            const sectorMatch = part.match(/^(.+?)-(\d+)\s+(.+)$/i);

            if (sectorMatch) {
                const [, prefix, number, areaName] = sectorMatch;

                addUniqueCandidate(
                    candidates,
                    `${prefix} ${number} ${areaName}`,
                );

                // Sector-11 Uttara -> Uttara
                addUniqueCandidate(candidates, areaName);
            }

            // Baridhara DOHS -> Baridhara
            const lowerPart = withoutPostCode.toLowerCase();

            for (const suffix of GENERIC_AREA_SUFFIXES) {
                if (
                    lowerPart.endsWith(` ${suffix}`) &&
                    withoutPostCode.length > suffix.length
                ) {
                    addUniqueCandidate(
                        candidates,
                        withoutPostCode.slice(0, -(suffix.length + 1)),
                    );
                }
            }
        }
    }

    return candidates;
}
