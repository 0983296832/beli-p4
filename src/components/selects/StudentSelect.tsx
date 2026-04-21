import SelectInput from '@components/fields/SelectInput';

interface StudentSelectProps {
  label?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const StudentSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className
}: StudentSelectProps) => {
  const options = [
    { value: 'HS001', label: 'Nguyễn Văn A' },
    { value: 'HS002', label: 'Trần Thị B' },
    { value: 'HS003', label: 'Lê Văn C' },
    { value: 'HS004', label: 'Phạm Thị D' },
    { value: 'HS005', label: 'Đặng Văn E' }
  ];

  return (
    <SelectInput
      label={label || 'Học sinh'}
      options={options}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder || 'Chọn học sinh'}
      className={className}
    />
  );
};

export default StudentSelect;
