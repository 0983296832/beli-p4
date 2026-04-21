import { TypeUser, useRootStore } from '@store/index';
import SelectInput from '../fields/SelectInput';
import TooltipUi from '../tooltip';
import CheckboxInput from '../fields/CheckboxInput';
import { components, Props as SelectProps } from 'react-select';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cloneDeep, isEmpty, uniqBy } from 'lodash';
import { NO_AVATAR } from '@lib/ImageHelper';
import { useT } from '@hooks/useT';
import studentServices from '@services/student';

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
  classroomIds?: number[];
  role?: keyof typeof UserRole;
}

const StudentsGroupSelect = <IsMulti extends boolean = false>({
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
  role,
  classroomIds
}: Props<IsMulti>) => {
  const classroomList = useRootStore((state) => state?.classrooms).filter((cl) =>
    classroomIds ? classroomIds?.includes(cl?.id) : true
  );
  const userList = uniqBy(classroomList?.map((cl) => cl?.students)?.flat(Infinity), 'student_id')?.map((user: any) => ({
    id: user?.student_id,
    username: user?.student_code,
    avatar: user?.student_avatar,
    display_name: user?.student_name
  }));
  const [groupUser, setGroupUser] = useState<{ id: number; label: string; options: TypeUser[] }[]>([]);
  const refSelect = useRef<any>(null);
  const { t } = useT();

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
        ? userList?.filter((v) => value.includes(v?.id)) // Khi isMulti là true, lọc theo các id trong mảng
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

  const CustomValueContainer = ({ children, ...props }: any) => {
    const selectedValues = props.getValue();
    let tmpChildren = [...children];
    if (refSelect?.current && props.selectProps.menuIsOpen) {
      refSelect.current.focus();
    }
    tmpChildren[0] = (
      <div className='flex items-center'>
        <div className='flex items-center -space-x-1'>
          {selectedValues.slice(0, 5).map((user: TypeUser) => (
            <div key={user.id} className='relative flex items-center'>
              <TooltipUi description={`${user.username} - ${user.display_name}`}>
                <img
                  src={user.avatar}
                  alt={user.display_name}
                  className='w-7 min-w-7 h-7 rounded-full object-cover border'
                />
              </TooltipUi>
            </div>
          ))}
          {selectedValues.length > 5 && (
            <div className='flex items-center justify-center w-7 min-w-7 h-7 bg-gray-200 text-gray-800 rounded-full font-semibold text-xs'>
              +{selectedValues.length - 5}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <components.ValueContainer {...props} className='!p-[5.5px]'>
        {tmpChildren}
      </components.ValueContainer>
    );
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

  const CustomMultiValueRemove = () => null;

  const CustomOption = ({ innerProps, label, data }: any) => {
    return (
      <div {...innerProps} className='flex items-center p-2 gap-2 hover:bg-[#C4DBEF] cursor-pointer rounded-sm'>
        <div className='flex items-center gap-3'>
          {isMulti && (
            <div className='flex-1 flex items-center justify-end'>
              <CheckboxInput checked={!!(value as number[])?.includes(data?.id)} />
            </div>
          )}
          <img src={data?.avatar || NO_AVATAR} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
        </div>

        <div>
          <p className='text-[0.875rem]'>
            {' '}
            {data?.username} - {label}
          </p>
        </div>
      </div>
    );
  };

  const formatGroupLabel = (data: { label: string; options: any[] }) => {
    const selectedIds: number[] = Array.isArray(value) ? value : [];
    const isGroupChecked = data.options.every((opt) => Array.isArray(value) && value.includes(opt.id));
    // Toggle chọn / bỏ chọn toàn nhóm
    const toggleGroup = () => {
      if (!onChange || !Array.isArray(value)) return;

      const groupUserIds = data.options.map((opt) => opt.id);

      if (isGroupChecked) {
        // Bỏ chọn tất cả user trong group
        const newSelected = userList.filter((user) => !groupUserIds.includes(user.id) && selectedIds.includes(user.id));
        (onChange as (value: TypeUser[]) => void)(newSelected);
      } else {
        // Thêm user trong group (chỉ những người chưa có)
        const groupUsersToAdd = data.options.filter((u) => !selectedIds.includes(u.id));
        const currentUsers = userList.filter((u) => selectedIds.includes(u.id));
        const merged = [...currentUsers, ...groupUsersToAdd];
        (onChange as (value: TypeUser[]) => void)(merged);
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

  const MenuList = useCallback((props: any) => {
    const { selectProps } = props as { selectProps: SelectProps<TypeUser, true> };
    let cloneUser: TypeUser[] = cloneDeep(userList);

    const allSelected = cloneUser.every((opt) => (selectProps.value as TypeUser[])?.some((v) => v.id === opt.id));

    const handleSelectAll = () => {
      if (allSelected) {
        onChange?.([] as any);
      } else {
        onChange?.(cloneUser as any);
      }
    };

    return (
      <>
        {cloneUser?.length > 0 && (
          <div onClick={handleSelectAll}>
            <div className='flex items-center gap-3 p-2 pb-1'>
              <CheckboxInput checked={allSelected} />
              <p className='text-md font-semibold text-primary-neutral-900 cursor-pointer'>{t('select_all')}</p>
            </div>
          </div>
        )}

        <components.MenuList {...props} />
      </>
    );
  }, []);

  useEffect(() => {
    const cloneClassroom = cloneDeep(classroomList);
    const groupList =
      cloneClassroom?.map((classroom) => {
        return {
          id: classroom?.id,
          label: classroom?.classroom_name ?? '', // Ensure label is always a string
          options: (classroom?.students ?? []).map((user) => ({
            id: user?.student_id,
            username: user?.student_code,
            avatar: user?.student_avatar,
            display_name: user?.student_name
          }))
        };
      }) || [];
    setGroupUser(groupList);
  }, [classroomIds]);

  return (
    <SelectInput
      ref={refSelect}
      style={{
        placeholder: (base) => {
          return { ...base, paddingLeft: 8, color: '#C7C7C7' };
        },
        valueContainer: (state: any) => {
          return { ...state, ...(isEmpty(value) ? { padding: '6.5px 8px' } : { padding: '2px 5px' }) };
        }
      }}
      isMulti={isMulti}
      isClearable={isClearable}
      label={label}
      options={isMulti ? groupUser || [] : userList}
      value={selectedValue} // Gửi giá trị đã được xử lý vào `value`
      onChange={handleChange}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      keyLabel='display_name'
      keyValue='id'
      formatGroupLabel={formatGroupLabel}
      hideSelectedOptions={!isMulti}
      selectComponents={{
        Option: CustomOption,
        ...(isMulti
          ? { MultiValue: CustomMultiValue, MultiValueRemove: CustomMultiValueRemove, MenuList: MenuList }
          : {})
      }}
      formatOptionLabel={!isMulti && formatSelectedValues}
    />
  );
};

export default StudentsGroupSelect;
