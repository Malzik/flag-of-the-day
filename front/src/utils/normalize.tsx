export default function normalizeString(str: string): string {
    return str
        .toLocaleLowerCase()
        .normalize("NFD") // Normalize to decomposed form (remove accents)
        .replace(/[\u0300-\u036f]/g, ""); // Remove combining diacritical marks
}

export function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
