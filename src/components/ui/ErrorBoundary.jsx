import React from 'react';
import { COLORS } from '../../constants/tokens';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 430, margin: "0 auto", padding: 24, background: COLORS.paper, borderRadius: 20, border: "1px solid " + COLORS.line, fontFamily: "Inter, sans-serif" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.rust, margin: "0 0 8px" }}>Algo deu errado nesta tela</p>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 14px" }}>Os dados não foram perdidos. Tente fechar e reabrir o app.</p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, color: COLORS.muted, background: COLORS.card, padding: 10, borderRadius: 8 }}>
            {String(this.state.error && this.state.error.message)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
