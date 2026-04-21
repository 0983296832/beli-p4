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
}

const TeacherSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className
}: Props) => {
  const { t } = useT();
  const options = [
    { value: 'HS001', label: 'Nguyễn Văn A' },
    { value: 'HS002', label: 'Trần Thị B' },
    { value: 'HS003', label: 'Lê Văn C' },
    { value: 'HS004', label: 'Phạm Thị D' },
    { value: 'HS005', label: 'Đặng Văn E' }
  ];

  return (
    <SelectInput
      label={label || t('teachers')}
      options={options}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder || t("select_teacher")}
      className={className}
    />
  );
};

export default TeacherSelect;
