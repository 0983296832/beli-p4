import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';

interface OptionsType {
  value: number;
  label: string;
}

type ValueType<IsMulti extends boolean> = IsMulti extends true ? number[] : number;
type OnChangeType<IsMulti extends boolean> = IsMulti extends true
  ? (value: OptionsType[]) => void
  : (value: OptionsType) => void;
interface WeekdaySelectProps<IsMulti extends boolean = false> {
  label?: string;
  isMulti?: IsMulti;
  value?: ValueType<IsMulti>;
  onChange?: OnChangeType<IsMulti>;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  isClearable?: boolean;
}

const WeekdaySelect = <IsMulti extends boolean = false>({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isClearable,
  isMulti = false as IsMulti
}: WeekdaySelectProps<IsMulti>) => {
  const { t } = useT();
  const weekdays = [
    { value: 2, label: t('monday') },
    { value: 3, label: t('tuesday') },
    { value: 4, label: t('wednesday') },
    { value: 5, label: t('thursday') },
    { value: 6, label: t('friday') },
    { value: 7, label: t('saturday') },
    { value: 8, label: t('sunday') }
  ];

  return (
    <SelectInput
      label={label}
      options={weekdays}
      value={
        !isMulti && typeof value === 'number'
          ? weekdays.find((v) => v?.value === value)
          : Array.isArray(value)
            ? weekdays.filter((v) => value.includes(v?.value))
            : undefined
      }
      onChange={(value) => onChange?.(value)}
      required={required}
      error={error}
      disabled={disabled}
      isClearable={isClearable}
      placeholder={placeholder}
      className={className}
      isMulti={isMulti}
    />
  );
};

export default WeekdaySelect;
