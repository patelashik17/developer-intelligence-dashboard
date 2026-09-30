import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled application error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
          <section
            role="alert"
            className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              Application error
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-slate-700">
              The dashboard hit an unexpected problem. Reload the app to start
              again.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="mt-5 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Reload app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
