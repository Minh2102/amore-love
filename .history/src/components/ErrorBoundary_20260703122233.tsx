/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!, this.handleRetry) || (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h2 className="font-serif text-lg font-bold text-red-900 mb-2">
                Có lỗi xảy ra
              </h2>
              <p className="text-red-700 text-sm mb-4">
                {this.state.error?.message || "Ứng dụng gặp sự cố. Vui lòng thử lại."}
              </p>
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
