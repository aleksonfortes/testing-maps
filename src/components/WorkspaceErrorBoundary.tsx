"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WorkspaceErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isLiveblocksError = this.state.error?.message?.includes("Liveblocks") || this.state.error?.message?.includes("room");

      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px] text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isLiveblocksError 
              ? "We couldn't connect to the collaborative workspace. Please check your network or API keys." 
              : "An unexpected error occurred in the canvas."}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
            {isLiveblocksError && (
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-6 py-2 rounded-full border border-border font-semibold hover:bg-secondary transition-colors"
                title="Continue in offline mode"
              >
                Continue Anyway
              </button>
            )}
          </div>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-8 p-4 bg-secondary rounded-xl text-left text-xs overflow-auto max-w-full">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
