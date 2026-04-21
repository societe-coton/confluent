// Vectors: "Biosensio"→"biosensio", "Éco-Logis"→"eco-logis", "  Test  Projet  "→"test-projet",
// "Très-Très Spécial"→"tres-tres-special", "!!!"→"" (caller guards), "42 Labs"→"42-labs",
// "AB/CD"→"ab-cd", "Naïve"→"naive".
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
