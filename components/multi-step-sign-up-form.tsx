'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle2, Shield, MapPin, Calendar, CreditCard } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormStep = 'basic' | 'contact' | 'preferences'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  repeatPassword: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  dateOfBirth: string
  accountType: string
  currency: string
  language: string
}

export function MultiStepSignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    accountType: 'personal',
    currency: 'USD',
    language: 'en',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Password validation
  const hasMinLength = formData.password.length >= 8
  const hasUppercase = /[A-Z]/.test(formData.password)
  const hasNumber = /[0-9]/.test(formData.password)
  const passwordsMatch = formData.password === formData.repeatPassword && formData.repeatPassword.length > 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateStep = (): boolean => {
    setError(null)

    switch (currentStep) {
      case 'basic':
        if (!formData.firstName.trim()) {
          setError('First name is required')
          return false
        }
        if (!formData.lastName.trim()) {
          setError('Last name is required')
          return false
        }
        if (!formData.email.trim()) {
          setError('Email is required')
          return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Invalid email format')
          return false
        }
        if (!formData.password) {
          setError('Password is required')
          return false
        }
        if (!hasMinLength || !hasUppercase || !hasNumber) {
          setError('Password does not meet requirements')
          return false
        }
        if (!passwordsMatch) {
          setError('Passwords do not match')
          return false
        }
        return true

      case 'contact':
        if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
          setError('Invalid phone number format')
          return false
        }
        return true

      case 'preferences':
        return true

      default:
        return false
    }
  }

  const goToNextStep = () => {
    if (!validateStep()) return

    switch (currentStep) {
      case 'basic':
        setCurrentStep('contact')
        break
      case 'contact':
        setCurrentStep('preferences')
        break
      default:
        break
    }
  }

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'contact':
        setCurrentStep('basic')
        break
      case 'preferences':
        setCurrentStep('contact')
        break
      default:
        break
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validateStep()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          dateOfBirth: formData.dateOfBirth,
          accountType: formData.accountType,
          currency: formData.currency,
          language: formData.language,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed')
      }

      // Store user profile data and set logged-in flag
      if (data.user) {
        const userProfile = {
          ...data.user,
          email: formData.email,
        }
        localStorage.setItem('user_profile', JSON.stringify(userProfile))
        localStorage.setItem('chase_logged_in', 'true')
        localStorage.setItem('userEmail', formData.email)
        localStorage.setItem('userId', data.user.id)
        localStorage.setItem('userName', data.user.full_name || `${formData.firstName} ${formData.lastName}`.trim())
        localStorage.setItem('chase_just_signed_up', 'true')
        if (data.verificationTokenSent) {
          localStorage.setItem('email_verification_sent', 'true')
        }
      }

      // Redirect to home dashboard
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col w-full', className)} {...props}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">Chase</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-white/60 text-sm">Complete the steps below to get started with secure banking</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
              currentStep === 'basic' || ['contact', 'preferences'].includes(currentStep)
                ? 'bg-blue-500 text-white'
                : 'bg-emerald-500 text-white'
            )}>
              {['basic', 'contact', 'preferences'].includes(currentStep) ? '1' : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium text-white">Basic Info</span>
          </div>
          <div className={cn(
            'flex-1 h-1 mx-3',
            ['contact', 'preferences'].includes(currentStep) ? 'bg-blue-500' : 'bg-slate-600'
          )} />
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
              currentStep === 'contact' || currentStep === 'preferences'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-600 text-slate-400'
            )}>
              {currentStep === 'preferences' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className={cn(
              'text-sm font-medium',
              ['contact', 'preferences'].includes(currentStep) ? 'text-white' : 'text-slate-500'
            )}>
              Contact Info
            </span>
          </div>
          <div className={cn(
            'flex-1 h-1 mx-3',
            currentStep === 'preferences' ? 'bg-blue-500' : 'bg-slate-600'
          )} />
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
              currentStep === 'preferences'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-600 text-slate-400'
            )}>
              3
            </div>
            <span className={cn(
              'text-sm font-medium',
              currentStep === 'preferences' ? 'text-white' : 'text-slate-500'
            )}>
              Preferences
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        {/* Step 1: Basic Info */}
        {currentStep === 'basic' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Jane"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {formData.password.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs font-medium text-white/60 mb-2">Password requirements:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-3.5 w-3.5', hasMinLength ? 'text-emerald-400' : 'text-white/30')} />
                      <span className={cn('text-xs', hasMinLength ? 'text-emerald-400' : 'text-white/40')}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-3.5 w-3.5', hasUppercase ? 'text-emerald-400' : 'text-white/30')} />
                      <span className={cn('text-xs', hasUppercase ? 'text-emerald-400' : 'text-white/40')}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-3.5 w-3.5', hasNumber ? 'text-emerald-400' : 'text-white/30')} />
                      <span className={cn('text-xs', hasNumber ? 'text-emerald-400' : 'text-white/40')}>One number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeatPassword" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="repeatPassword"
                  name="repeatPassword"
                  type={showRepeatPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  required
                  value={formData.repeatPassword}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20",
                    formData.repeatPassword.length > 0 && (passwordsMatch ? "border-emerald-500/50" : "border-red-500/50")
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.repeatPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>
          </>
        )}

        {/* Step 2: Contact Info */}
        {currentStep === 'contact' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Phone Number <span className="text-white/40">(optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Street Address <span className="text-white/40">(optional)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="street"
                  name="street"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  City <span className="text-white/40">(optional)</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  State <span className="text-white/40">(optional)</span>
                </Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="NY"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Zip Code <span className="text-white/40">(optional)</span>
              </Label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                placeholder="10001"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Date of Birth <span className="text-white/40">(optional)</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 'preferences' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="accountType" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Account Type
              </Label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="h-12 w-full px-4 bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20 rounded-md"
              >
                <option value="personal" className="bg-slate-900">Personal</option>
                <option value="business" className="bg-slate-900">Business</option>
                <option value="student" className="bg-slate-900">Student</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Preferred Currency
              </Label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="h-12 w-full px-4 bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20 rounded-md"
              >
                <option value="USD" className="bg-slate-900">USD - US Dollar</option>
                <option value="EUR" className="bg-slate-900">EUR - Euro</option>
                <option value="GBP" className="bg-slate-900">GBP - British Pound</option>
                <option value="CAD" className="bg-slate-900">CAD - Canadian Dollar</option>
                <option value="AUD" className="bg-slate-900">AUD - Australian Dollar</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Language Preference
              </Label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="h-12 w-full px-4 bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20 rounded-md"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="es" className="bg-slate-900">Español</option>
                <option value="fr" className="bg-slate-900">Français</option>
                <option value="de" className="bg-slate-900">Deutsch</option>
              </select>
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-sm text-emerald-300">
                ✓ All information will be securely stored and encrypted. Your account is fully FDIC insured.
              </p>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {currentStep !== 'basic' && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              Previous
            </Button>
          )}
          {currentStep !== 'preferences' ? (
            <Button
              type="button"
              onClick={goToNextStep}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          )}
        </div>

        {/* Terms Notice */}
        <p className="text-xs text-white/40 text-center">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>

        {/* Login Link */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
