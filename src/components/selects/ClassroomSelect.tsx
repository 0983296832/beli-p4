import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { TypeClassroom, useRootStore } from '@store/index';
import { useEffect, useState } from 'react';
import classroomServices from '@services/classroom';
import CheckboxInput from '@components/fields/CheckboxInput';
import { components } from 'react-select';
import TooltipUi from '../tooltip';

type OnChangeType<T, Multi extends boolean | undefined> = Multi extends true
  ? (value: TypeClassroom[], classrooms: TypeClassroom[]) => void
  : (value: TypeClassroom) => void;

interface Props<Multi extends boolean | undefined = false> {
  label?: string;
  value?: Multi extends true ? number[] : number;
  onChange: OnChangeType<TypeClassroom, Multi>;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  isMulti?: Multi;
  isClearable?: boolean;
  locationId?: number;
  subjectId?: number;
  hasAllOption?: boolean;
  menuPlacement?: 'top' | 'bottom' | 'auto';
}

const ClassroomSelect = <Multi extends boolean | undefined = false>({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  placeholder,
  className,
  isMulti,
  isClearable,
  locationId,
  subjectId,
  hasAllOption,
  menuPlacement
}: Props<Multi>) => {
  const [options, setOptions] = useState<TypeClassroom[]>([]);
  const [groupOptions, setGroupOptions] = useState<{ id: number; label: string; options: TypeClassroom[] }[]>([]);
  const { t } = useT();

  const getClassrooms = async () => {
    const params = {
      field: 'classroom_code,classroom_name,students,schedules',
      filterings: {
        location_id: locationId,
        subject_id: subjectId
      },
      limit: 999999,
      offset: 0
    };
    const res: any = await classroomServices.getSharedClassrooms(params);
    if (isMulti) {
      setGroupOptions([
        {
          label: t('select_all'),
          id: 0,
          options: res?.data?.map((i: any) => ({
            ...i,
            label: `${i?.classroom_code} - ${i?.classroom_name} (${i?.students?.length} HS)`
          }))
        }
      ]);
    }
    setOptions(
      res?.data?.map((i: any) => ({
        ...i,
        label: `${i?.classroom_code} - ${i?.classroom_name} (${i?.students?.length} HS)`
      }))
    );
  };

  const selected = isMulti
    ? options.filter((opt) => Array.isArray(value) && value.includes(opt.id))
    : options.find((opt) => opt.id === value);

  const CustomMultiValue = (props: any) => {
    const classroom: TypeClassroom = props.data;
    const index = props.index;
    const total = props.selectProps.value.length;

    // Chỉ render người đầu tiên
    if (index === 0) {
      return (
        <components.MultiValue {...props} className='bg-white flex items-center -space-x-1' clearValue={false}>
          {total < 2 ? (
            <p>
              {classroom?.classroom_code} - {classroom?.classroom_name}
            </p>
          ) : (
            <p>{t('selected_num', { num: total })}</p>
          )}
        </components.MultiValue>
      );
    }

    // Các thằng còn lại không render gì
    return null;
  };

  const CustomMultiValueRemove = () => null;

  const formatGroupLabel = (data: { label: string; options: any[] }) => {
    const selectedIds: number[] = Array.isArray(value) ? value : [];
    const isGroupChecked = data.options.every((opt) => Array.isArray(value) && value.includes(opt.id));
    // Toggle chọn / bỏ chọn toàn nhóm
    const toggleGroup = () => {
      if (!onChange) return;

      const groupUserIds = data.options.map((opt) => opt.id);

      if (isGroupChecked) {
        // Bỏ chọn tất cả user trong group
        const newSelected = options.filter((user) => !groupUserIds.includes(user.id) && selectedIds.includes(user.id));
        (onChange as (value: TypeClassroom[]) => void)(newSelected);
      } else {
        // Thêm user trong group (chỉ những người chưa có)
        const groupUsersToAdd = data.options.filter((u) => !selectedIds.includes(u.id));
        const currentUsers = options.filter((u) => selectedIds.includes(u.id));
        const merged = [...currentUsers, ...groupUsersToAdd];
        (onChange as (value: TypeClassroom[]) => void)(merged);
      }
    };
    return (
      <div
        className='flex justify-between items-center font-semibold text-sm -ml-1 cursor-pointer'
        onClick={toggleGroup}
      >
        {isMulti && (
          <div className='flex items-center gap-3'>
            <CheckboxInput checked={isGroupChecked} />
            <p className='text-sm font-semibold text-primary-neutral-900'>{data.label}</p>
          </div>
        )}

        <span className='text-xs px-2 py-0.5 rounded bg-primary-blue-50 text-primary-blue-500'>
          {data.options.length}
        </span>
      </div>
    );
  };

  const CustomOption = ({ innerProps, label, data }: any) => {
    return (
      <div {...innerProps} className='flex items-center p-2 gap-2 hover:bg-[#C4DBEF] cursor-pointer rounded-sm'>
        <div className='flex items-center gap-3'>
          {isMulti && (
            <div className='flex-1 flex items-center justify-end'>
              <CheckboxInput checked={!!(value as number[])?.includes(data?.id)} />
            </div>
          )}
          <img src={data?.classroom_avatar} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
        </div>

        <div>
          <p className='text-[0.875rem]'> {label}</p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getClassrooms();
  }, [locationId, subjectId]);

  return (
    <SelectInput
      label={label}
      options={isMulti ? groupOptions : options}
      value={selected ?? null}
      onChange={(value) => {
        onChange(value, options);
      }}
      isClearable={isClearable}
      required={required}
      error={error}
      isMulti={isMulti}
      keyLabel='label'
      keyValue='id'
      disabled={disabled}
      placeholder={placeholder}
      hideSelectedOptions={!isMulti}
      menuPlacement={menuPlacement}
      className={className}
      selectComponents={{
        Option: CustomOption,
        ...(isMulti ? { MultiValue: CustomMultiValue, MultiValueRemove: CustomMultiValueRemove } : {})
      }}
      formatGroupLabel={isMulti && formatGroupLabel}
    />
  );
};

export default ClassroomSelect;
