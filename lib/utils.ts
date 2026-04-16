import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random account number (10 digits)
export function generateAccountNumber(): string {
  return Math.random().toString().slice(2, 12).padStart(10, '0')
}

// Get last 4 digits of account number for display
export function getAccountLast4(accountNumber: string): string {
  return accountNumber.slice(-4)
}

// Format account number for display (showing only last 4 digits)
export function formatAccountNumberDisplay(accountNumber: string): string {
  return `•••• •••• •••• ${getAccountLast4(accountNumber)}`
}
