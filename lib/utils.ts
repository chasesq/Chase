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

// Debug logging utility - only logs in development mode
const isDev = process.env.NODE_ENV === 'development'

type LogLevel = 'log' | 'warn' | 'error' | 'info'

interface DebugOptions {
  level?: LogLevel
  data?: unknown
}

export function debug(message: string, options?: DebugOptions): void {
  if (!isDev) return
  
  const level = options?.level || 'log'
  const prefix = '[Chase]'
  const timestamp = new Date().toISOString().slice(11, 23)
  
  const formattedMessage = `${prefix} ${timestamp} ${message}`
  
  if (options?.data !== undefined) {
    console[level](formattedMessage, options.data)
  } else {
    console[level](formattedMessage)
  }
}

// Convenience methods for different log levels
export const logger = {
  log: (message: string, data?: unknown) => debug(message, { level: 'log', data }),
  info: (message: string, data?: unknown) => debug(message, { level: 'info', data }),
  warn: (message: string, data?: unknown) => debug(message, { level: 'warn', data }),
  error: (message: string, data?: unknown) => debug(message, { level: 'error', data }),
}
