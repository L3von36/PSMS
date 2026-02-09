"use client"
import { createSchool } from "@/actions/school"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActionState } from "react"

export default function NewSchoolPage() {
    const router = useRouter()

    async function handleAction(prevState: any, formData: FormData) {
        const result = await createSchool(prevState, formData)
        if (result.success) {
            toast.success(result.message)
            router.push("/super-admin")
        }
        return result
    }

    const [state, action] = useActionState(handleAction, { success: false, message: "", errors: {} })

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Register New School</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">School Name</label>
                            <Input name="name" placeholder="e.g. Sunshine International Academy" required />
                            {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <Input name="address" placeholder="Addis Ababa, Ethiopia" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input name="phone" placeholder="+251..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Official Email</label>
                            <Input name="email" type="email" placeholder="info@school.com" />
                            {state.errors?.email && <p className="text-xs text-red-500">{state.errors.email}</p>}
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Registering..." : "Create School"}
        </Button>
    )
}
