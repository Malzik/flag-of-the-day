export default function normalizeString(str: string): string {
    return str
        .toLocaleLowerCase()
        .normalize("NFD") // Normalize to decomposed form (remove accents)
        .replace(/[\u0300-\u036f]/g, ""); // Remove combining diacritical marks
}
