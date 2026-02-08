"use client"
import { updateSchool } from "@/actions/school"
import { useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { School } from "lucide-react"

export function SchoolSettingsForm({ school }: { school: any }) {
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await updateSchool(formData)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                    <School className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <CardTitle>Official Profile</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">School Name</label>
                            <Input name="name" defaultValue={school.name} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Official Email</label>
                            <Input name="email" type="email" defaultValue={school.email} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input name="phone" defaultValue={school.phone} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <Input name="address" defaultValue={school.address} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
