export type Availability = 'available' | 'not-verified' | 'not-applicable';

export type PreviewField = {
  value: string | null;
  availability: Availability;
};

export type PreviewState = {
  standard: PreviewField;
  assetModel: PreviewField;
  deployment: PreviewField;
  environment: PreviewField;
  strategyBalance: PreviewField;
  harvest: PreviewField;
  shutdown: PreviewField;
  compliance: {
    name: string;
    status: string;
    description: string;
  };
};