import { Component } from 'react'

export default class HomeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Home screen error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="home-error-fallback">
          <p className="home-error-fallback-title">Something went wrong loading Home.</p>
          <p className="home-error-fallback-text">Pull down to refresh or open Settings from the menu.</p>
          <button
            type="button"
            className="home-error-fallback-btn"
            onClick={() => window.location.assign('/home')}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
