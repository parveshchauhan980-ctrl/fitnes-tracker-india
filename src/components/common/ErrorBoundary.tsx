import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in FitTrack 30:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black font-['Outfit'] tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
            FitTrack 30 encountered an unexpected issue while loading this page. You can reload or return to the home screen.
          </p>

          {this.state.error?.message && (
            <div className="mb-6 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 max-w-md w-full text-left font-mono text-xs text-rose-300 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
