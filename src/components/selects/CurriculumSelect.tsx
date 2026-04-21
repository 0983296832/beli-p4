import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { useEffect, useState } from 'react';
import curriculumServices from '@services/curriculum';

interface CurriculumSelectProps {
  label?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const CurriculumSelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className
}: CurriculumSelectProps) => {
  const { t } = useT();
  const [data, setData] = useState<{ id: number; learning_program_name: string; learning_program_code: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const getSubjects = async () => {
    setLoading(true);
    const res: any = await curriculumServices.getCurriculums();
    setData(res?.data?.map((i: any) => ({ ...i, label: `${i?.learning_program_code} - ${i?.learning_program_name}` })));
    setLoading(false);
  };

  useEffect(() => {
    getSubjects();
  }, []);

  return (
    <SelectInput
      label={label}
      options={data}
      value={data.find((v) => v?.id == value)}
      onChange={onChange}
      keyValue='id'
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      onFocus={() => {
        getSubjects();
      }}
    />
  );
};

export default CurriculumSelect;
