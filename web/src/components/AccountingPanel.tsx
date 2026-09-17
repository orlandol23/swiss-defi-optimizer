import type { PreviewState } from '../types/ui-state';
import { RegisterTable } from './RegisterTable';

export function AccountingPanel({ state }: { state: PreviewState }) {
  return (
    <section className="panel" aria-labelledby="accounting-title">
      <div className="section-heading"><span className="section-index">01</span><h2 id="accounting-title">Accounting model</h2></div>
      <p className="section-intro">The register describes the accounting surface without implying a live balance.</p>
      <RegisterTable fields={[
        { label: 'Standard', field: state.standard },
        { label: 'Asset model', field: state.assetModel },
        { label: 'Deployment', field: state.deployment },
        { label: 'Environment', field: state.environment },
        { label: 'Total assets', field: state.totalAssets },
        { label: 'Total shares', field: state.totalShares },
        { label: 'Price per share', field: state.pricePerShare },
      ]} />
    </section>
  );
}