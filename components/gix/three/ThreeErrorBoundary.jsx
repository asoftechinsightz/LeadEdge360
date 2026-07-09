'use client'

import { Component } from 'react'
import { AuroraFallback } from './fallbacks'

export default class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.warn('[3D scene]', error?.message || error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <AuroraFallback className={this.props.className} label="Interactive preview unavailable" />
        )
      )
    }
    return this.props.children
  }
}
