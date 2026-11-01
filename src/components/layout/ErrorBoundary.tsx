import React, { Component, type ErrorInfo, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Top-level accessible error boundary catching uncaught rendering exceptions.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred while rendering the application.",
    };
  }

  public override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Error logged or captured by boundary
  }

  private handleReload = (): void => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto my-8 max-w-xl rounded-xl border border-red-300 bg-red-50 p-6 text-center shadow-xs"
        >
          <span aria-hidden="true" className="text-3xl text-red-700">⚠</span>
          <h2 tabIndex={-1} className="mt-2 text-lg font-bold text-red-900 outline-none">
            Something went wrong
          </h2>
          <p className="mt-1 text-sm text-red-800">
            {this.state.errorMessage}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-4 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100 focus-visible:outline-2"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
