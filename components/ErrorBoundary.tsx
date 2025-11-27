/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component, ErrorInfo, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center text-zinc-200 font-sans">
            <div className="bg-red-500/10 p-4 rounded-full mb-6 ring-1 ring-red-500/30">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Something went wrong</h1>
            <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">
                An unexpected error occurred in the application. We've logged the issue and notified our team.
            </p>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 text-left font-mono text-xs text-red-400 mb-8 max-w-lg w-full overflow-auto max-h-40 shadow-inner">
                {this.state.error?.toString()}
            </div>
            <button
                onClick={() => window.location.reload()}
                className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
            >
                Reload Application
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}