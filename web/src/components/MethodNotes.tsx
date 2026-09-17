export function MethodNotes() {
  return (
    <section className="method-notes" aria-labelledby="method-title">
      <div className="section-heading"><span className="section-index">05</span><h2 id="method-title">Method notes</h2></div>
      <p>This screen is a static preview built from an explicit local fixture. It performs no fetch, wallet connection, RPC request, transaction, or chain read.</p>
      <p>Missing values are intentionally shown as <span className="mono">—</span> or marked not verified. A future data source must establish availability before a value is displayed.</p>
    </section>
  );
}