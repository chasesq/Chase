import { z } from 'zod'

// Password validation schema with strength requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')

// Personal Info Step
export const PersonalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits'),
})

// Address & Identity Step
export const AddressIdentitySchema = z.object({
  street: z.string().min(5, 'Please enter a valid street address'),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(2, 'Please enter a valid state'),
  zipCode: z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/, 'Please enter a valid ZIP code'),
  dateOfBirth: z
    .string()
    .refine((date) => {
      const birth = new Date(date)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const month = today.getMonth() - birth.getMonth()
      if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age >= 18
    }, 'You must be at least 18 years old'),
  governmentIdType: z.enum(['drivers_license', 'passport', 'state_id', 'other']),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
  privacyAccepted: z.boolean().refine((val) => val === true, 'You must accept the privacy policy'),
})

// Account Preferences Step
export const PreferencesSchema = z.object({
  accountType: z.enum(['checking', 'savings', 'both'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD'], {
    errorMap: () => ({ message: 'Please select a currency' }),
  }),
  language: z.enum(['en', 'es', 'fr', 'de'], {
    errorMap: () => ({ message: 'Please select a language' }),
  }),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  inAppNotifications: z.boolean().default(true),
})

// Security Setup Step
export const SecuritySchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    twoFactorEnabled: z.boolean().default(false),
    securityQuestion: z.string().min(5, 'Security question must be at least 5 characters').optional().or(z.literal('')),
    securityAnswer: z.string().min(2, 'Security answer must be at least 2 characters').optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.securityQuestion && !data.securityAnswer) return false
      if (!data.securityQuestion && data.securityAnswer) return false
      return true
    },
    {
      message: 'Both security question and answer are required if one is provided',
      path: ['securityAnswer'],
    },
  )

// Complete Multi-Step Sign-Up Schema
export const MultiStepSignUpSchema = z.object({
  // Personal Info
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits'),

  // Address & Identity
  street: z.string().min(5, 'Please enter a valid street address'),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(2, 'Please enter a valid state'),
  zipCode: z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/, 'Please enter a valid ZIP code'),
  dateOfBirth: z.string(),
  governmentIdType: z.enum(['drivers_license', 'passport', 'state_id', 'other']),
  termsAccepted: z.boolean(),
  privacyAccepted: z.boolean(),

  // Preferences
  accountType: z.enum(['checking', 'savings', 'both']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']),
  language: z.enum(['en', 'es', 'fr', 'de']),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  inAppNotifications: z.boolean().default(true),

  // Security
  password: passwordSchema,
  confirmPassword: z.string(),
  twoFactorEnabled: z.boolean().default(false),
  securityQuestion: z.string().optional(),
  securityAnswer: z.string().optional(),
})

export type PersonalInfoFormData = z.infer<typeof PersonalInfoSchema>
export type AddressIdentityFormData = z.infer<typeof AddressIdentitySchema>
export type PreferencesFormData = z.infer<typeof PreferencesSchema>
export type SecurityFormData = z.infer<typeof SecuritySchema>
export type MultiStepSignUpFormData = z.infer<typeof MultiStepSignUpSchema>
