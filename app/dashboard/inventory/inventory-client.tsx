"use client"
import { useState, useTransition } from "react"
import { addInventoryItem } from "@/actions/inventory"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Plus, History } from "lucide-react"
import { toast } from "sonner"

export function InventoryClient({ initialItems }: { initialItems: any[] }) {
    const [isPending, startTransition] = useTransition()

    const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await addInventoryItem(formData)
            if (result.success) {
                toast.success(result.message)
                ;(e.target as HTMLFormElement).reset()
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Add New Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Item Name</label>
                                <Input name="name" placeholder="e.g. Grade 10 Math Book" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select name="category" className="w-full rounded-md border p-2 bg-background shadow-sm">
                                    <option value="Book">Book</option>
                                    <option value="Uniform">Uniform</option>
                                    <option value="Stationery">Stationery</option>
                                    <option value="Equipment">Equipment</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Initial Quantity</label>
                                <Input name="quantity" type="number" min="0" defaultValue="0" required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isPending}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Stock Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {initialItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${item.quantity < 5 ? 'text-red-500' : 'text-foreground'}`}>
                                                {item.quantity}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase">In Stock</p>
                                        </div>
                                        <Button variant="outline" size="sm">Update</Button>
                                    </div>
                                </div>
                            ))}
                            {initialItems.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground">No inventory items tracked yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
