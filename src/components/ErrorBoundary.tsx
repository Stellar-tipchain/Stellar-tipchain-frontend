import { Component, ReactNode } from "react";

interface State { hasError: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-gray-400">Something went wrong. Please refresh.</p>;
    }
    return this.props.children;
  }
}
