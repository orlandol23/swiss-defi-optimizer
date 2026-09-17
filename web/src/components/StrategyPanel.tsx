import type { PreviewState } from '../types/ui-state';
import { RegisterTable } from './RegisterTable';

export function StrategyPanel({ state }: { state: PreviewState }) {
  return (
    <section className="panel" aria-labelledby="strategy-title">
      <div className="section-heading"><span className="section-index">02</span><h2 id="strategy-title">Strategy</h2></div>
      <p className="section-intro">Strategy values remain unresolved until a source of truth is available.</p>
      <RegisterTable fields={[
        { label: 'Strategy balance', field: state.strategyBalance },
        { label: 'Harvest', field: state.harvest },
        { label: 'Emergency shutdown', field: state.shutdown },
      ]} />
    </section>
  );
}