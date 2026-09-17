import type { Field, TokenAmount } from '../types/ui-state';

function formatTokenAmount(amount: TokenAmount) {
  const { raw, decimals, symbol } = amount;
  if (decimals === 0) return `${raw} ${symbol}`;
  const padded = raw.padStart(decimals + 1, '0');
  const splitAt = padded.length - decimals;
  const whole = padded.slice(0, splitAt);
  const fraction = padded.slice(splitAt).replace(/0+$/, '');
  return `${whole}${fraction ? `.${fraction}` : ''} ${symbol}`;
}

function displayValue(value: string | boolean | TokenAmount | null) {
  if (value === null) return '—';
  if (typeof value === 'object') return formatTokenAmount(value);
  return String(value);
}

function availabilityLabel(availability: Field<unknown>['availability']) {
  if (availability === 'not-verified') return 'Not verified';
  if (availability === 'not-available') return 'Not available';
  return availability.charAt(0).toUpperCase() + availability.slice(1);
}

type RegisterTableProps = {
  fields: Array<{ label: string; field: Field<string | boolean | TokenAmount> }>;
};

export function RegisterTable({ fields }: RegisterTableProps) {
  return (
    <dl className="register-table" aria-label="Vault register">
      {fields.map(({ label, field }) => (
        <div className="register-row" key={label}>
          <dt className="register-label">{label}</dt>
          <dd className={`register-value is-${field.availability}`}>
            <span>{displayValue(field.value)}</span>
            <span className="field-provenance" aria-label={`${label} source and availability`}>
              Source: {field.source} / {availabilityLabel(field.availability)}
            </span>
            {field.note && <span className="field-note">{field.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}