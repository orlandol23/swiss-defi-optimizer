import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

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
});