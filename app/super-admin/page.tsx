import { getSchools } from "@/actions/school"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, School as SchoolIcon, Users, GraduationCap } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
    const schools = await getSchools()

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold">Super Admin Panel</h1>
                    <p className="text-muted-foreground">Manage schools and platform-wide settings</p>
                </div>
                <Button asChild>
                    <Link href="/super-admin/new-school">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New School
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                        <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{schools.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Students (Across all)</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {schools.reduce((acc, s) => acc + s._count.students, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {schools.reduce((acc, s) => acc + s._count.users, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6">
                <h2 className="text-2xl font-semibold">Registered Schools</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {schools.map((school) => (
                        <Card key={school.id}>
                            <CardHeader>
                                <CardTitle>{school.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{school.address || "No address"}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Students:</span>
                                        <span className="font-semibold">{school._count.students}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Users:</span>
                                        <span className="font-semibold">{school._count.users}</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full mt-4" asChild>
                                    <Link href={`/super-admin/schools/${school.id}`}>Manage School</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {schools.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                            <SchoolIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No schools registered yet</h3>
                            <p className="text-muted-foreground">Get started by adding your first school.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
