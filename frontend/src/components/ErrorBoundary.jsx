import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-purple-500">
            <span className="text-2xl font-black text-gray-950">TV</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-gray-400">
              This can happen if your wallet extension is missing or blocked.
            </p>
          </div>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="rounded-full bg-white px-8 py-3 font-semibold text-gray-900 hover:bg-gray-100"
          >
            Reload app
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
