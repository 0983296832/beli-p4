import { TypeUser, useRootStore } from '@store/index';
import SelectInput from '../fields/SelectInput';
import TooltipUi from '../tooltip';
import CheckboxInput from '../fields/CheckboxInput';
import { components } from 'react-select';
import { NO_AVATAR } from '@lib/ImageHelper';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  TA = 'ta',
  STUDENT = 'student'
}

type ValueType<IsMulti extends boolean> = IsMulti extends true ? number[] : number;
type OnChangeType<IsMulti extends boolean> = IsMulti extends true
  ? (value: TypeUser[]) => void
  : (value: TypeUser) => void;

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
  filterOptions?: number[];
  role?: keyof typeof UserRole;
}

const UsersSelectCheckbox = <IsMulti extends boolean = false>({
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
  filterOptions,
  role
}: Props<IsMulti>) => {
  const userList = useRootStore((state) => state?.users)
    .filter((user) => !filterOptions?.includes(user?.id as number))
    .filter((user) => (role ? user?.user_job_title === UserRole[role] : true));

  const handleChange = (selectedValue: any) => {
    if (isMulti) {
      // Nếu isMulti là true, selectedValue là mảng các đối tượng, gọi onChange với mảng TypeUser[]
      onChange?.(selectedValue);
    } else {
      // Nếu isMulti là false, selectedValue là đối tượng đơn, gọi onChange với 1 TypeUser
      onChange?.(selectedValue);
    }
  };

  // Xử lý giá trị `value` cho SelectInput
  const selectedValue =
    !isMulti && typeof value === 'number'
      ? userList?.find((v) => v?.id === value) // Khi isMulti là false, tìm giá trị đơn
      : Array.isArray(value)
        ? userList?.filter((v) => value.includes(v?.id as number)) // Khi isMulti là true, lọc theo các id trong mảng
        : [];

  const formatSelectedValues = (data: TypeUser) => {
    if (data) {
      return (
        <div className='flex items-center gap-2 rounded-lg'>
          <img src={data?.avatar || NO_AVATAR} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
          {data?.username} - {data?.display_name}
        </div>
      );
    }
    return null;
  };

  const CustomMultiValue = (props: any) => {
    const user: TypeUser = props.data;
    const index = props.index;
    const total = props.selectProps.value.length;

    // Chỉ render người đầu tiên
    if (index === 0) {
      return (
        <components.MultiValue {...props} className='bg-white flex items-center -space-x-1' clearValue={false}>
          {props.selectProps.value.slice(0, 5)?.map((user: TypeUser) => (
            <TooltipUi description={`${user.username} - ${user.display_name}`}>
              <img
                src={user.avatar || NO_AVATAR}
                alt={user.display_name}
                className='w-7 h-7 min-w-7 min-h-7 rounded-full object-cover border'
              />
            </TooltipUi>
          ))}
        </components.MultiValue>
      );
    }

    // Nếu là người thứ hai và còn nhiều hơn 1 người: render +X
    if (index === 1 && total > 5) {
      return (
        <components.MultiValue {...props} className='bg-white'>
          <div className='w-7 h-7 bg-gray-200 rounded-full flex justify-center items-center text-xs font-semibold text-gray-800'>
            +{total - 5}
          </div>
        </components.MultiValue>
      );
    }

    // Các thằng còn lại không render gì
    return null;
  };

  const CustomOption = ({ innerProps, label, data }: any) => {
    return (
      <div {...innerProps} className='flex items-center p-2 gap-2 hover:bg-[#C4DBEF] cursor-pointer rounded-sm'>
        <img src={data?.avatar || NO_AVATAR} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
        <div>
          <p className='text-[0.875rem]'> {label}</p>
        </div>
        {isMulti && (
          <div className='flex-1 flex items-center justify-end'>
            <CheckboxInput checked={!!(value as number[])?.includes(data?.id)} />
          </div>
        )}
      </div>
    );
  };

  return (
    <SelectInput
      isMulti={isMulti}
      isClearable={isClearable}
      label={label}
      options={userList || []}
      value={selectedValue} // Gửi giá trị đã được xử lý vào `value`
      onChange={handleChange}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      keyLabel='display_name'
      keyValue='id'
      hideSelectedOptions={!isMulti}
      selectComponents={{
        Option: CustomOption,
        ...(isMulti ? { MultiValue: CustomMultiValue } : {})
      }}
      formatOptionLabel={!isMulti && formatSelectedValues}
    />
  );
};

export default UsersSelectCheckbox;
