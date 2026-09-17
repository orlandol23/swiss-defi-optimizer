import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { errorState, staleState, unavailableState } from './data/test-states';
import { RegisterTable } from './components/RegisterTable';

describe('Vault State Register preview', () => {
  it('renders the risk strip and explicit preview warnings', () => {
    render(<App />);
    expect(screen.getByRole('complementary', { name: 'Risk status' })).toBeInTheDocument();
    expect(screen.getByText('PREVIEW ONLY')).toBeInTheDocument();
    expect(screen.getByText('NO DEPLOYMENT VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('NOT AUDITED')).toBeInTheDocument();
  });

  it('keeps SwissCompliance separate from the vault register', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'SwissCompliance' })).toBeInTheDocument();
    expect(screen.getByText('Mock standalone')).toBeInTheDocument();
    expect(screen.getByText('Not enforced by Vault. Not KYC.')).toBeInTheDocument();
  });

  it('does not invent live numbers for empty fixture values', () => {
    render(<App />);
    expect(screen.getByText('Not reconciled')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.queryByText(/\b(0|100|1000)\b/)).not.toBeInTheDocument();
  });

  it('renders an empty field as an em dash and identifies preview provenance', () => {
    render(<RegisterTable fields={[{ label: 'Missing value', field: unavailableState }]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Source: fixture / Not available')).toBeInTheDocument();
  });

  it('renders not-verified and preview source explicitly', () => {
    render(<App />);
    expect(screen.getAllByText('Source: preview / Not verified').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Source: preview/).length).toBeGreaterThan(0);
  });

  it('keeps preview values visibly distinct from live data', () => {
    render(<App />);
    expect(screen.getByText('STATIC PREVIEW / NO LIVE STATE')).toBeInTheDocument();
    expect(screen.getAllByText(/Source: preview/).length).toBeGreaterThan(0);
  });

  it('formats TokenAmount from raw text without unsafe number conversion', () => {
    render(<RegisterTable fields={[{
      label: 'Precise amount',
      field: {
        value: { raw: '123456789012345678901234', decimals: 6, symbol: 'USDC' },
        availability: 'available',
        source: 'fixture',
      },
    }]} />);
    expect(screen.getByText('123456789012345678.901234 USDC')).toBeInTheDocument();
  });

  it('keeps SwissCompliance separate from typed vault fields', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'SwissCompliance' })).toBeInTheDocument();
    expect(screen.getByLabelText('SwissCompliance source')).toHaveTextContent('Source: preview');
  });

  it('does not present error or stale fixtures as confirmed success', () => {
    render(<RegisterTable fields={[
      { label: 'Error field', field: errorState },
      { label: 'Stale field', field: staleState },
    ]} />);
    expect(screen.getByText('Source: fixture / Error')).toBeInTheDocument();
    expect(screen.getByText('Source: fixture / Stale')).toBeInTheDocument();
    expect(screen.getByText('Old preview value')).toBeInTheDocument();
    expect(screen.queryByText('Source: fixture / available')).not.toBeInTheDocument();
  });
});