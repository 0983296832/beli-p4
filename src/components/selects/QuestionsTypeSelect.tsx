import { MULTIPLE_CHOICE, FILL_IN_THE_BLANK, MATCHING, ORDERING, REVERSE_WORD } from '@pages/Exercise/constant';
import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { FILL_THE_BLANK, MULTI_CHOICE, MATCHING as MATCHING_ICON, SORT, REORDER_ICON } from '@lib/ImageHelper';
import i18n from '@i18n/index';

interface QuestionsTypeSelectProps {
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

export const QuestionsTypeOptions = [
  { value: MULTIPLE_CHOICE, label: i18n.t('multiple_choice'), icon: MULTI_CHOICE, type: 'multiple_choice_answers' },
  { value: FILL_IN_THE_BLANK, label: i18n.t('fill_in_the_blank'), icon: FILL_THE_BLANK, type: 'fill_in_the_blank' },
  { value: MATCHING, label: i18n.t('matching'), icon: MATCHING_ICON, type: 'matching' },
  { value: ORDERING, label: i18n.t('drag_drop'), icon: SORT, type: 'sort' },
  { value: REVERSE_WORD, label: i18n.t('reorder'), icon: SORT, type: 'reverse_word' }
];

const QuestionsTypeSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isClearable
}: QuestionsTypeSelectProps) => {
  const { t } = useT();

  const CustomOption = ({ innerProps, label, data }: any) => {
    return (
      <div {...innerProps} className='flex items-center p-2 gap-2 hover:bg-[#C4DBEF] cursor-pointer rounded-sm'>
        <img src={data?.icon} className='w-5 h-5 rounded-sm object-cover' />
        <div>
          <p className='text-[0.875rem]'>
            {data?.value}. {label}
          </p>
        </div>
      </div>
    );
  };

  const formatSelectedValues = (data: any) => {
    if (data) {
      return (
        <div className='flex items-center gap-2'>
          <img src={data.icon} className='rounded-sm object-cover w-5 h-5' alt={data.label} />
          <span>
            {data.value}. {data.label}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <SelectInput
      label={label}
      options={QuestionsTypeOptions}
      value={QuestionsTypeOptions.find((opt) => opt.value === value)}
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

export default QuestionsTypeSelect;
