import type { PreviewField } from '../types/ui-state';

function display(field: PreviewField) {
  return field.value ?? '—';
}

type RegisterTableProps = {
  fields: Array<{ label: string; field: PreviewField }>;
};

export function RegisterTable({ fields }: RegisterTableProps) {
  return (
    <div className="register-table" role="table" aria-label="Vault register">
      {fields.map(({ label, field }) => (
        <div className="register-row" role="row" key={label}>
          <div className="register-label" role="rowheader">{label}</div>
          <div className={`register-value ${field.availability === 'not-verified' ? 'is-unverified' : ''}`} role="cell">
            {display(field)}
          </div>
        </div>
      ))}
    </div>
  );
}