import type { PreviewField, PreviewState, TokenAmount } from '../types/ui-state';

const notVerified = <T,>(): PreviewField<T> => ({
  value: null,
  availability: 'not-verified',
  source: 'preview',
});

const unavailableAmount = (): PreviewField<TokenAmount> => ({
  ...notVerified<TokenAmount>(),
  availability: 'not-available',
  note: 'No verified deployment or live accounting source.',
});

const previewValue = <T,>(value: T): PreviewField<T> => ({
  value,
  availability: 'available',
  source: 'preview',
});

export const previewState: PreviewState = {
  standard: previewValue('ERC-4626'),
  assetModel: previewValue('USDC'),
  deployment: {
    value: 'No deployment verified',
    availability: 'not-verified',
    source: 'preview',
  },
  environment: previewValue('Preview'),
  totalAssets: unavailableAmount(),
  totalShares: unavailableAmount(),
  pricePerShare: unavailableAmount(),
  strategyBalance: {
    value: 'Not reconciled',
    availability: 'not-verified',
    source: 'preview',
  },
  harvest: {
    value: 'Timestamp-only placeholder',
    availability: 'available',
    source: 'preview',
    note: 'No timestamp exists in this preview fixture.',
  },
  shutdown: notVerified<boolean>(),
  compliance: {
    name: 'SwissCompliance',
    status: 'Mock standalone',
    description: 'Not enforced by Vault. Not KYC.',
    source: 'preview',
  },
};