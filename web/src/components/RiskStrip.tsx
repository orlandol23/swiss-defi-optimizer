const warnings = ['PREVIEW ONLY', 'NO DEPLOYMENT VERIFIED', 'NOT AUDITED', 'DO NOT USE WITH REAL FUNDS'];

export function RiskStrip() {
  return (
    <aside className="risk-strip" aria-label="Risk status">
      <span className="risk-marker" aria-hidden="true">!</span>
      <div className="risk-items">
        {warnings.map((warning) => <span key={warning}>{warning}</span>)}
      </div>
    </aside>
  );
}