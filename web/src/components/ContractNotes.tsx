export function ContractNotes() {
  return (
    <section className="panel notes-panel" aria-labelledby="contract-notes-title">
      <div className="section-heading"><span className="section-index">03</span><h2 id="contract-notes-title">Contract notes</h2></div>
      <ul className="note-list">
        <li><span className="note-key">Vault</span><span>ERC-4626 study over a USDC asset model.</span></li>
        <li><span className="note-key">Harvest</span><span>Timestamp-only placeholder; no yield action is represented.</span></li>
        <li><span className="note-key">Strategy</span><span>Allocated value is not reconciled with a live strategy balance.</span></li>
      </ul>
    </section>
  );
}