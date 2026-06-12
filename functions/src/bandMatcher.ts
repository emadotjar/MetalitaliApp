export interface BandDoc {
  slug: string;
  name: string;
}

/**
 * Find bands whose name appears (case-insensitively, on a word boundary)
 * in a post title. Names shorter than 3 characters are skipped to avoid
 * matching on common short words/abbreviations.
 */
export function matchBands(title: string, bands: BandDoc[]): BandDoc[] {
  const lowerTitle = title.toLowerCase();

  return bands.filter((band) => {
    const name = band.name.trim();
    if (name.length < 3) return false;

    const pattern = new RegExp(`\\b${escapeRegExp(name.toLowerCase())}\\b`);
    return pattern.test(lowerTitle);
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
