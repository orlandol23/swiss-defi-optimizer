import type { PreviewField, TokenAmount } from '../types/ui-state';

export const unavailableState: PreviewField<TokenAmount> = {
  value: null,
  availability: 'not-available',
  source: 'fixture',
};

export const errorState: PreviewField<string> = {
  value: null,
  availability: 'error',
  source: 'fixture',
  note: 'Fixture for an unavailable source.',
};

export const staleState: PreviewField<string> = {
  value: 'Old preview value',
  availability: 'stale',
  source: 'fixture',
  note: 'Fixture for a value that requires refresh.',
};