'use client'

import React from 'react'
import { sanitizeError } from '@/lib/errorUtils'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    const safeError = sanitizeError(error)
    return { hasError: true, error: safeError }
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    const safeError = sanitizeError(error)
    console.error('Error caught by boundary:', safeError)
    console.error('Component stack:', errorInfo.componentStack)
    
    if (this.props.onError) {
      this.props.onError(safeError)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          <h2 className="mb-2 font-semibold">Something went wrong</h2>
          <p className="text-sm">{this.state.error?.message || 'An unexpected error occurred'}</p>
        </div>
      )
    }

    return this.props.children
  }
}
