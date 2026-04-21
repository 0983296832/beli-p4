import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { useEffect, useState } from 'react';
import teachingProgramServices from '@services/teachingProgram';
import curriculumServices from '@services/curriculum';

interface LearningProgramType {
  id: number;
  teaching_program_name: string;
  lesson_count: number;
  subject_id: number;
}

type ValueType<IsMulti extends boolean> = IsMulti extends true ? number[] : number;
type OnChangeType<IsMulti extends boolean> = IsMulti extends true
  ? (value: LearningProgramType[]) => void
  : (value: LearningProgramType) => void;

interface Props<IsMulti extends boolean = false> {
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

const LearningProgramsSelect = <IsMulti extends boolean = false>({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isMulti = false as IsMulti,
  isClearable
}: Props<IsMulti>) => {
  const { t } = useT();
  const [data, setData] = useState<LearningProgramType[]>([]);
  const [loading, setLoading] = useState(false);

  const getLearningPrograms = async () => {
    setLoading(true);
    const res: any = await curriculumServices.getSharedCurriculums();
    setData(res?.data?.map((i: any) => ({ ...i, label: `${i?.learning_program_code} - ${i?.learning_program_name}` })));
    setLoading(false);
  };

  useEffect(() => {
    getLearningPrograms();
  }, []);

  return (
    <SelectInput
      label={label}
      value={
        !isMulti && typeof value === 'number'
          ? data.find((v) => v.id === value)
          : Array.isArray(value)
            ? data.filter((v) => value.includes(v.id))
            : undefined
      }
      onChange={(value) => onChange?.(value)}
      options={data}
      required={required}
      error={error}
      keyValue='id'
      keyLabel='label'
      disabled={disabled}
      placeholder={placeholder || t('please_select')}
      className={className}
      isClearable={isClearable}
    />
  );
};

export default LearningProgramsSelect;
