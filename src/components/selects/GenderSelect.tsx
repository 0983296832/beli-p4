import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';

interface GenderSelectProps {
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

const GenderSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isClearable
}: GenderSelectProps) => {
  const { t } = useT();

  const options = [
    { value: 0, label: t('female') },
    { value: 1, label: t('male') },
    { value: 2, label: t('other') }
  ];

  return (
    <SelectInput
      label={label || t('gender')}
      options={options}
      value={options.find((val) => value === val?.value)}
      onChange={onChange}
      required={required}
      isClearable={isClearable}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default GenderSelect;
