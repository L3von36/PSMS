import { getInventory } from "@/actions/inventory"
import { InventoryClient } from "./inventory-client"

export default async function InventoryPage() {
    const items = await getInventory()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Track school uniforms, books, and other supplies.</p>
            <InventoryClient initialItems={items} />
        </div>
    )
}
