import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import i18n from '@i18n/index';

interface Props {
  label?: string;
  value: number;
  onChange: (value: { value: number; label: string }) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  isClearable?: boolean;
}

export const workingStatusOptions = [
  { value: 1, label: i18n.t('active') },
  { value: 2, label: i18n.t('inactive') },
  { value: 3, label: i18n.t('unknown') }
];

const StatusSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isClearable
}: Props) => {
  const { t } = useT();

  return (
    <SelectInput
      label={label}
      options={workingStatusOptions}
      value={workingStatusOptions.find((val) => val.value === value) ?? null}
      onChange={onChange}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      isClearable={isClearable}
    />
  );
};

export default StatusSelect;
