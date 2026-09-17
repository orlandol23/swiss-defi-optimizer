export type DataSource = 'preview' | 'fixture' | 'rpc' | 'indexer';

export type Availability =
  | 'available'
  | 'not-available'
  | 'not-verified'
  | 'stale'
  | 'error';

export type TokenAmount = {
  raw: string;
  decimals: number;
  symbol: string;
};

export type Field<T> = {
  value: T | null;
  availability: Availability;
  source: DataSource;
  note?: string;
  updatedAt?: string;
  blockNumber?: string;
};

export type PreviewField<T = string> = Field<T>;

export type VaultUiState = {
  standard: Field<string>;
  assetModel: Field<string>;
  deployment: Field<string>;
  environment: Field<string>;
  totalAssets: Field<TokenAmount>;
  totalShares: Field<TokenAmount>;
  pricePerShare: Field<TokenAmount>;
  strategyBalance: Field<string>;
  harvest: Field<string>;
  shutdown: Field<boolean>;
  compliance: {
    name: string;
    status: string;
    description: string;
    source: DataSource;
  };
};

export type PreviewState = VaultUiState;