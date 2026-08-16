import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Rendering Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500 mx-auto mb-6">
              <AlertTriangle size={28} />
            </div>
            
            <h2 className="text-2xl font-black text-black tracking-tight mb-2">Something went wrong</h2>
            <p className="text-stone-500 text-sm font-medium leading-relaxed mb-6">
              An unexpected display error occurred. You can reload the page or return to the dashboard to continue safely.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-xl bg-stone-100 border border-stone-200 text-left text-xs font-mono text-stone-600 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>

              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-stone-600 text-sm transition-all active:scale-95"
              >
                <Home size={16} />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
