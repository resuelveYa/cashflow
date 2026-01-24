
import React, { Component, ErrorInfo, ReactNode } from "react";

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
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100 dark:border-red-900/30">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Algo salió mal</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                La aplicación encontró un error inesperado al renderizar esta página.
              </p>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg w-full mb-6">
                <p className="text-xs font-mono text-red-700 dark:text-red-400 text-left overflow-auto max-h-32">
                  {this.state.error?.toString()}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                Recargar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
