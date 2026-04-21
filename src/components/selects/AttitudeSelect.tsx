import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';

interface Props {
  label?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  menuPlacement?: 'bottom' | 'top' | 'auto';
}

const AttitudeSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  menuPlacement
}: Props) => {
  const { t } = useT();

  const attitudes = [
    { value: 1, label: t('attitude_excellent') },
    { value: 2, label: t('attitude_good') },
    { value: 3, label: t('attitude_average') },
    { value: 4, label: t('attitude_poor') },
    { value: 5, label: t('poor_behavior') }
  ];

  return (
    <SelectInput
      label={label}
      options={attitudes}
      value={attitudes.find((a) => a?.value == value)}
      onChange={onChange}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      menuPlacement={menuPlacement}
    />
  );
};

export default AttitudeSelect;
