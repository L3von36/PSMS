export const translations = {
    en: {
        dashboard: "Dashboard",
        students: "Students",
        staff: "Staff",
        finance: "Finance",
        exams: "Exams",
        attendance: "Attendance",
        parents: "Parents",
        inventory: "Inventory",
        payroll: "Payroll",
        welcome: "Welcome",
        settings: "Settings",
        logout: "Logout",
        search: "Search...",
        total_students: "Total Students",
        total_revenue: "Total Revenue",
        recent_payments: "Recent Payments",
    },
    am: {
        dashboard: "ዳሽቦርድ",
        students: "ተማሪዎች",
        staff: "ሰራተኞች",
        finance: "ፋይናንስ",
        exams: "ፈተናዎች",
        attendance: "የአባላት ክትትል",
        parents: "ወላጆች",
        inventory: "የንብረት ቁጥጥር",
        payroll: "የደመወዝ ክፍያ",
        welcome: "እንኳን ደህና መጡ",
        settings: "ቅንብሮች",
        logout: "ውጣ",
        search: "ፈልግ...",
        total_students: "ጠቅላላ ተማሪዎች",
        total_revenue: "ጠቅላላ ገቢ",
        recent_payments: "የቅርብ ጊዜ ክፍያዎች",
    }
}

export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof translations['en']
