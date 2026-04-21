import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { CHECK_BLACK } from '@lib/ImageHelper';

interface ScoreSelectProps {
  label?: string;
  value: number;
  onChange: (value: { value: number; label: string; icon: string }) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  isClearable?: boolean;
}

const ScoreSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isClearable
}: ScoreSelectProps) => {
  const { t } = useT();
  const options = [
    { value: 1, label: `1 ${t('score').toLocaleLowerCase()}` },
    { value: 2, label: `2 ${t('score').toLocaleLowerCase()}` },
    { value: 3, label: `3 ${t('score').toLocaleLowerCase()}` },
    { value: 4, label: `4 ${t('score').toLocaleLowerCase()}` },
    { value: 5, label: `5 ${t('score').toLocaleLowerCase()}` },
    { value: 6, label: `6 ${t('score').toLocaleLowerCase()}` },
    { value: 7, label: `7 ${t('score').toLocaleLowerCase()}` },
    { value: 8, label: `8 ${t('score').toLocaleLowerCase()}` },
    { value: 9, label: `9 ${t('score').toLocaleLowerCase()}` },
    { value: 10, label: `10 ${t('score').toLocaleLowerCase()}` }
  ];

  const CustomOption = ({ innerProps, label, data }: any) => {
    return (
      <div {...innerProps} className='flex items-center p-2 gap-2 hover:bg-[#C4DBEF] cursor-pointer rounded-sm'>
        <img src={CHECK_BLACK} className='w-5 h-5 rounded-sm object-cover' />
        <div>
          <p className='text-[0.875rem]'>{label}</p>
        </div>
      </div>
    );
  };

  const formatSelectedValues = (data: any) => {
    if (data) {
      return (
        <div className='flex items-center gap-2'>
          <img src={CHECK_BLACK} className='rounded-sm object-cover w-5 h-5' alt={data.label} />
          <span>{data.label}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <SelectInput
      label={label}
      options={options}
      value={options.find((opt) => opt.value === value)}
      onChange={onChange}
      required={required}
      error={error}
      disabled={disabled}
      isClearable={isClearable}
      placeholder={placeholder}
      className={className}
      formatOptionLabel={formatSelectedValues}
      selectComponents={{
        Option: CustomOption
      }}
    />
  );
};

export default ScoreSelect;
