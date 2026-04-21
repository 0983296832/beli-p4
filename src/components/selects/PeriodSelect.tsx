import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { useEffect, useState } from 'react';
import teachingLocationServices from '@services/teachingLocation';
import teachingProgramServices from '@services/teachingProgram';
import scheduleServices from '@services/schedule';

interface PeriodType {
  id: number;
  lesson_name: string;
  teaching_program_detail: {
    teaching_program_detail_code: string;
    lesson_number: number;
    lesson_content: string;
    drive_link: string;
    id: number;
    tiktok_link: string;
    youtube_link: string;
    valid: number;
  };
}

type ValueType<IsMulti extends boolean> = IsMulti extends true ? number[] : number;
type OnChangeType<IsMulti extends boolean> = IsMulti extends true
  ? (value: PeriodType[]) => void
  : (value: PeriodType) => void;

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
  classroomId?: number;
  date?: number;
  menuPlacement?: 'top' | 'bottom' | 'auto';
  onFirstLoadValue?: boolean;
}

const PeriodSelect = <IsMulti extends boolean = false>({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isMulti = false as IsMulti,
  isClearable,
  classroomId,
  date,
  menuPlacement,
  onFirstLoadValue
}: Props<IsMulti>) => {
  const { t } = useT();
  const [data, setData] = useState<PeriodType[]>([]);
  const [loading, setLoading] = useState(false);

  const getPeriods = async () => {
    setLoading(true);

    const res: any = await scheduleServices.getSchedules({
      fields:
        'identity,teaching_program_id,r_classroom,students,count_total_lessons,classroom_id,type,classroom_schedule_id,cover_schedule_id,teaching_program_detail_number,teaching_program_detail,date,status',
      filterings: {
        classroom_id: classroomId,
        date: date
      },
      limit: 9999999,
      offset: 0
    });
    if (onFirstLoadValue) {
      res?.data?.[0] && onChange?.(res?.data?.[0]);
    }
    setData(
      res?.data?.map((i: any) => ({
        ...i,
        label: `${i?.teaching_program_detail?.manual_code || i?.teaching_program_detail?.teaching_program_detail_code} - ${i?.teaching_program_detail?.lesson_name}`
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    getPeriods();
  }, [classroomId, date]);

  return (
    <SelectInput
      label={label}
      value={
        !isMulti && typeof value === 'number'
          ? (data.find((v) => v.id === value) ?? null)
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
      placeholder={placeholder}
      className={className}
      isClearable={isClearable}
      menuPlacement={menuPlacement}
    />
  );
};

export default PeriodSelect;
