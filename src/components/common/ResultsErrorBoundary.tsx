import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, History, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ResultsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ResultsErrorBoundary caught a React rendering exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV !== 'production';

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-white dark:bg-[#1A1D21] border-2 border-rose-200 dark:border-rose-900/60 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-[#B02A3A] dark:text-rose-300 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                Unable to display the scan result
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                Something went wrong while loading this document's analysis.
              </p>
            </div>

            {/* Development Error Details */}
            {isDev && this.state.error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-left font-mono text-[11px] text-rose-800 dark:text-rose-200 overflow-x-auto max-h-40">
                <p className="font-bold mb-1">Technical Stack Trace (Dev Mode):</p>
                <p>{this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-[10px] text-rose-600 dark:text-rose-300 whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-3 py-2.5 rounded-xl bg-[#B02A3A] hover:bg-[#852336] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <a
                href="/scanner"
                className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Scanner</span>
              </a>

              <a
                href="/history"
                className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </a>

              <a
                href="/dashboard"
                className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
