/**
 * Simple Ethiopian Calendar Utility
 * This is a simplified version for display purposes.
 */

export function toEthiopianDate(date: Date) {
    // Basic conversion logic (approximate for demo)
    // Ethiopian year is usually Gregorian year - 8 (from Jan to Sept) or - 7 (from Sept to Dec)
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const day = date.getDate();

    let ethYear = year - 8;
    // New year is usually Sept 11 or 12
    if (month > 8 || (month === 8 && day >= 11)) {
        ethYear = year - 7;
    }

    const months = [
        "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yakatit",
        "Magabit", "Miyazya", "Ginbot", "Sene", "Hamle", "Nehasse", "Pagume"
    ];

    // This is a very rough approximation
    const ethMonth = months[month];

    return `${ethMonth} ${day}, ${ethYear} E.C.`;
}

export function formatFullDate(date: Date, locale: 'en' | 'am' = 'en', showEth: boolean = true) {
    const gcDate = date.toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (!showEth) return gcDate;

    return `${gcDate} (${toEthiopianDate(date)})`;
}
