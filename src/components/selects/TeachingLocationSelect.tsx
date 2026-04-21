import SelectInput from '@components/fields/SelectInput';
import { useT } from '@hooks/useT';
import { useEffect, useState } from 'react';
import teachingLocationServices from '@services/teachingLocation';
import CheckboxInput from '@components/fields/CheckboxInput';
import { components } from 'react-select';

interface LocationType {
  id: number;
  location_name: string;
  location_code: string;
}

type ValueType<IsMulti extends boolean> = IsMulti extends true ? number[] : number;
type OnChangeType<IsMulti extends boolean> = IsMulti extends true
  ? (value: LocationType[]) => void
  : (value: LocationType) => void;

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

const TeachingLocationsSelect = <IsMulti extends boolean = false>({
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
  const [options, setOptions] = useState<LocationType[]>([]);
  const [groupOptions, setGroupOptions] = useState<{ id: number; label: string; options: LocationType[] }[]>([]);

  const [loading, setLoading] = useState(false);

  const getLocations = async () => {
    setLoading(true);
    const params = {
      fields: ''
    };
    const res: any = await teachingLocationServices.getSharedTeachingLocations();
    if (isMulti) {
      setGroupOptions([
        {
          label: t('select_all'),
          id: 0,
          options: res?.data?.map((i: any) => ({
            ...i,
            label: `${i?.location_code} - ${i?.location_name}`
          }))
        }
      ]);
    }
    setOptions(res?.data?.map((i: any) => ({ ...i, label: `${i?.location_code} - ${i?.location_name}` })));
    setLoading(false);
  };

  useEffect(() => {
    getLocations();
  }, []);

  const selected = isMulti
    ? options.filter((opt) => Array.isArray(value) && value.includes(opt.id))
    : options.find((opt) => opt.id === value);

  const CustomMultiValue = (props: any) => {
    const location: LocationType = props.data;
    const index = props.index;
    const total = props.selectProps.value.length;

    // Chỉ render người đầu tiên
    if (index === 0) {
      return (
        <components.MultiValue {...props} className='bg-white flex items-center -space-x-1' clearValue={false}>
          {total < 2 ? (
            <p>
              {location?.location_code} - {location?.location_name}
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
        (onChange as (value: LocationType[]) => void)(newSelected);
      } else {
        // Thêm user trong group (chỉ những người chưa có)
        const groupUsersToAdd = data.options.filter((u) => !selectedIds.includes(u.id));
        const currentUsers = options.filter((u) => selectedIds.includes(u.id));
        const merged = [...currentUsers, ...groupUsersToAdd];
        (onChange as (value: LocationType[]) => void)(merged);
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
          <img src={data?.location_avatar} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
        </div>

        <div>
          <p className='text-[0.875rem]'> {label}</p>
        </div>
      </div>
    );
  };

  return (
    <SelectInput
      label={label}
      value={selected ?? null}
      onChange={(value) => onChange?.(value)}
      isMulti={isMulti}
      options={isMulti ? groupOptions : options}
      required={required}
      error={error}
      keyValue='id'
      keyLabel='label'
      disabled={disabled}
      placeholder={placeholder || t('choose_teaching_location')}
      className={className}
      isClearable={isClearable}
      hideSelectedOptions={!isMulti}
      selectComponents={{
        Option: CustomOption,

        ...(isMulti ? { MultiValue: CustomMultiValue, MultiValueRemove: CustomMultiValueRemove } : {})
      }}
      formatGroupLabel={isMulti && formatGroupLabel}
    />
  );
};

export default TeachingLocationsSelect;
