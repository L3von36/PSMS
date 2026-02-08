import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function calculateEthiopianLetter(score: number): string {
  if (score >= 85) return "A"
  if (score >= 75) return "B+"
  if (score >= 65) return "B"
  if (score >= 55) return "C+"
  if (score >= 45) return "C"
  if (score >= 35) return "D"
  return "F"
}
