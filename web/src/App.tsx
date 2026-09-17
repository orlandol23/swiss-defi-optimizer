import { AccountingPanel } from './components/AccountingPanel';
import { ComplianceNotice } from './components/ComplianceNotice';
import { ContractNotes } from './components/ContractNotes';
import { Masthead } from './components/Masthead';
import { MethodNotes } from './components/MethodNotes';
import { RiskStrip } from './components/RiskStrip';
import { StrategyPanel } from './components/StrategyPanel';
import { previewState } from './data/preview-state';
import './styles/tokens.css';
import './styles/globals.css';

export function App() {
  return (
    <div className="app-shell">
      <Masthead />
      <RiskStrip />
      <main>
        <div className="register-lede">
          <p className="eyebrow">Register / 00</p>
          <h2>Vault State Register</h2>
          <p>Read-only presentation of the current contract study and its known limits.</p>
        </div>
        <div className="panel-grid">
          <AccountingPanel state={previewState} />
          <StrategyPanel state={previewState} />
          <ContractNotes />
        </div>
        <ComplianceNotice state={previewState} />
        <MethodNotes />
      </main>
      <footer className="footer"><span>SWISS DEFI OPTIMIZER</span><span className="mono">STATIC PREVIEW / NO LIVE STATE</span></footer>
    </div>
  );
}