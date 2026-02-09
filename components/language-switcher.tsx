"use client"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
    const { locale, setLocale } = useI18n()

    return (
        <div className="flex gap-2">
            <Button
                variant={locale === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('en')}
            >
                EN
            </Button>
            <Button
                variant={locale === 'am' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('am')}
            >
                አማ
            </Button>
        </div>
    )
}
