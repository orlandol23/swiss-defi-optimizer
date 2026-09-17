import type { PreviewState } from '../types/ui-state';

export function ComplianceNotice({ state }: { state: PreviewState }) {
  return (
    <section className="compliance-notice" aria-labelledby="compliance-title">
      <div className="section-heading"><span className="section-index">04</span><h2 id="compliance-title">{state.compliance.name}</h2></div>
      <p className="compliance-status">{state.compliance.status}</p>
      <p>{state.compliance.description}</p>
      <p className="field-provenance" aria-label="SwissCompliance source">Source: {state.compliance.source}</p>
    </section>
  );
}