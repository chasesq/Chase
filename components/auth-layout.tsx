'use client'

import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  image?: React.ReactNode
}

export function AuthLayout({ children, title, subtitle, image }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Branding and messaging */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">{title}</h1>
              <p className="text-xl text-gray-300">{subtitle}</p>
            </div>

            {/* Feature list */}
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Secure Banking</h3>
                  <p className="text-gray-400 text-sm">Your accounts are protected with enterprise-grade security</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">24/7 Access</h3>
                  <p className="text-gray-400 text-sm">Manage your finances anytime, anywhere on any device</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Instant Transfers</h3>
                  <p className="text-gray-400 text-sm">Send and receive money instantly to friends and family</p>
                </div>
              </div>
            </div>

            {/* Footer branding */}
            <div className="pt-8 border-t border-gray-700">
              <p className="text-gray-400 text-sm">© 2024 Chase Banking. All rights reserved.</p>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="flex flex-col justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              {children}
            </div>

            {/* Mobile footer */}
            <div className="lg:hidden mt-8 text-center text-gray-400 text-sm">
              <p>© 2024 Chase Banking. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
