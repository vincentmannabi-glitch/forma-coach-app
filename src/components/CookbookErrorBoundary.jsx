import { Component } from 'react'

export default class CookbookErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Cookbook route failed to render', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="home-error-fallback">
          <p className="home-error-fallback-title">Cookbook is temporarily unavailable.</p>
          <p className="home-error-fallback-text">We could not load the recipe screen. Your account and program are still safe.</p>
          <button
            type="button"
            className="home-error-fallback-btn"
            onClick={() => window.location.assign('/home')}
          >
            Back to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
