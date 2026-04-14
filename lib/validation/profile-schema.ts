import { z } from 'zod'

// Individual field validators
const emailValidator = z.string().email('Invalid email format').min(1, 'Email is required')

const phoneValidator = z
  .string()
  .regex(/^[+]?[0-9\s\-()]{10,}$/, 'Invalid phone format')
  .or(z.literal(''))

const nameValidator = z
  .string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be at most 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Only letters, spaces, hyphens, and apostrophes allowed')

const addressValidator = z
  .string()
  .max(200, 'Address must be at most 200 characters')
  .or(z.literal(''))

const cityValidator = z
  .string()
  .max(50, 'City must be at most 50 characters')
  .or(z.literal(''))

const stateValidator = z
  .string()
  .max(50, 'State must be at most 50 characters')
  .or(z.literal(''))

const zipValidator = z
  .string()
  .regex(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid ZIP code format')
  .or(z.literal(''))

const dateOfBirthValidator = z
  .string()
  .refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const month = today.getMonth() - birthDate.getMonth()
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 18
  }, 'You must be at least 18 years old')
  .or(z.literal(''))

const governmentIdValidator = z
  .enum(['SSN', 'PASSPORT', 'DRIVERS_LICENSE', 'STATE_ID'], {
    errorMap: () => ({ message: 'Invalid government ID type' }),
  })
  .or(z.literal(''))

const accountTypeValidator = z
  .enum(['checking', 'savings', 'business', 'investment'], {
    errorMap: () => ({ message: 'Invalid account type' }),
  })
  .or(z.literal(''))

const currencyValidator = z
  .enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'], {
    errorMap: () => ({ message: 'Invalid currency' }),
  })
  .default('USD')

const languageValidator = z
  .enum(['en', 'es', 'fr', 'de', 'ja', 'zh'], {
    errorMap: () => ({ message: 'Invalid language' }),
  })
  .default('en')

// Full profile schema
export const profileSchema = z.object({
  full_name: nameValidator.optional(),
  email: emailValidator.optional(),
  phone: phoneValidator.optional(),
  address: addressValidator.optional(),
  city: cityValidator.optional(),
  state: stateValidator.optional(),
  zip_code: zipValidator.optional(),
  date_of_birth: dateOfBirthValidator.optional(),
  government_id_type: governmentIdValidator.optional(),
  account_type_preference: accountTypeValidator.optional(),
  currency_preference: currencyValidator.optional(),
  language_preference: languageValidator.optional(),
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  inapp_notifications: z.boolean().optional(),
  two_factor_enabled: z.boolean().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Schema for partial updates
export const profileUpdateSchema = profileSchema.partial()

// Schema for sensitive field updates (requires step-up auth)
export const sensitiveFieldSchema = z.object({
  email: emailValidator.optional(),
  phone: phoneValidator.optional(),
  full_name: nameValidator.optional(),
})

// Calculate profile completeness
export function calculateProfileCompleteness(profile: Partial<ProfileFormData>): {
  percentage: number
  filledFields: number
  totalFields: number
  missingFields: string[]
} {
  const fields: (keyof ProfileFormData)[] = [
    'full_name',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'zip_code',
    'date_of_birth',
    'government_id_type',
    'account_type_preference',
    'currency_preference',
    'language_preference',
  ]

  const filledFields = fields.filter((field) => {
    const value = profile[field]
    return value !== null && value !== undefined && value !== ''
  }).length

  const missingFields = fields.filter((field) => {
    const value = profile[field]
    return value === null || value === undefined || value === ''
  })

  const percentage = Math.round((filledFields / fields.length) * 100)

  return {
    percentage,
    filledFields,
    totalFields: fields.length,
    missingFields: missingFields as string[],
  }
}
