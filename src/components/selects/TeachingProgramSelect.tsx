import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { useEffect, useState } from 'react';
import teachingProgramServices from '@services/teachingProgram';

interface TeachingProgramType {
  id: number;
  teaching_program_name: string;
  lesson_count: number;
}

type ValueType<IsMulti extends boolean> = IsMulti extends true ? number[] : number;
type OnChangeType<IsMulti extends boolean> = IsMulti extends true
  ? (value: TeachingProgramType[]) => void
  : (value: TeachingProgramType) => void;

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

const TeachingProgramsSelect = <IsMulti extends boolean = false>({
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
  const [data, setData] = useState<TeachingProgramType[]>([]);
  const [loading, setLoading] = useState(false);

  const getTeachingPrograms = async () => {
    setLoading(true);
    const res: any = await teachingProgramServices.getTeachingPrograms();
    setData(res?.data?.map((i: any) => ({ ...i, label: `${i?.program_code} - ${i?.program_name}` })));
    setLoading(false);
  };

  useEffect(() => {
    getTeachingPrograms();
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

export default TeachingProgramsSelect;
