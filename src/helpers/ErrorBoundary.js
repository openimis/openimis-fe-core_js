import React from "react";
import InternalServerErrorPage from "../components/InternalServerErrorPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // update the state to show the failover UI at next render
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Just log for now, could be reported elsewhere
    console.error(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <InternalServerErrorPage logo={this.props.children.props.logo} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
