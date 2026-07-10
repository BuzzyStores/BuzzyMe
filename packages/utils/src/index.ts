export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function shortCode(prefix = "bz"): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${random}`;
}

export function deterministicShortCode(value: string, prefix = "bz"): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return `${prefix}-${hash.toString(36).slice(0, 8)}`;
}

export function percentage(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}
