import { getSchoolDetails } from "@/actions/school"
import { SchoolSettingsForm } from "./settings-form"

export default async function SettingsPage() {
    const school = await getSchoolDetails()

    if (!school) return <div>Unauthorized</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">School Settings</h1>
            <p className="text-muted-foreground">Update your school profile and general information.</p>
            <SchoolSettingsForm school={school} />
        </div>
    )
}
