import type { PreviewField, PreviewState } from '../types/ui-state';

const notVerified = (): PreviewField => ({
  value: null,
  availability: 'not-verified',
});

export const previewState: PreviewState = {
  standard: { value: 'ERC-4626', availability: 'available' },
  assetModel: { value: 'USDC', availability: 'available' },
  deployment: { value: 'No deployment verified', availability: 'not-verified' },
  environment: { value: 'Preview', availability: 'available' },
  strategyBalance: { value: 'Not reconciled', availability: 'not-verified' },
  harvest: { value: 'Timestamp-only placeholder', availability: 'available' },
  shutdown: notVerified(),
  compliance: {
    name: 'SwissCompliance',
    status: 'Mock standalone',
    description: 'Not enforced by Vault. Not KYC.',
  },
};