'use server'

import { signOut as authSignOut } from "@/lib/auth"

export async function handleSignOut() {
  await authSignOut({ redirectTo: "/login" })
}
