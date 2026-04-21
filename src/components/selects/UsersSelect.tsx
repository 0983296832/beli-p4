import { TypeUser, useRootStore } from '@store/index';
import SelectInput from '@components/fields/SelectInput';
import TooltipUi from '../tooltip';
import CheckboxInput from '../fields/CheckboxInput';
import { components, Props as SelectProps } from 'react-select';
import { useCallback, useRef } from 'react';
import { cloneDeep, isEmpty } from 'lodash';
import { NO_AVATAR } from '@lib/ImageHelper';
import { useT } from '@hooks/useT';

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
  menuPlacement?: 'auto' | 'top' | 'bottom';
}

const UsersSelect = <IsMulti extends boolean = false>({
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
  menuPlacement = 'auto'
}: Props<IsMulti>) => {
  const userList = useRootStore((state) => state?.users)
    .filter((user: any) => !filterOptions?.includes(user?.id))
    .filter((user) => (role ? user?.user_job_title === UserRole[role] : true));
  const refSelect = useRef<any>(null);
  const { t } = useT();

  const handleChange = (selectedValue: any) => {
    onChange?.(selectedValue);
  };
  const selectedValue =
    !isMulti && typeof value === 'number'
      ? userList.find((v) => v.id === value)
      : Array.isArray(value)
        ? userList.filter((v: any) => value.includes(v.id))
        : undefined;

  const formatSelectedValues = (data: TypeUser) => {
    if (!data) return null;
    return (
      <div className='flex items-center gap-2 rounded-lg'>
        <img src={data.avatar || NO_AVATAR} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
        {data.username} - {data.display_name}
      </div>
    );
  };

  // const CustomValueContainer = ({ children, ...props }: any) => {
  //   const selectedValues = props.getValue();
  //   const tmpChildren = [...children];
  //   if (refSelect?.current) {
  //     refSelect.current.focus();
  //   }

  //   if (selectedValues.length > 0) {
  //     tmpChildren[0] = (
  //       <div className='flex items-center'>
  //         <div className='flex items-center -space-x-1'>
  //           {selectedValues.slice(0, 5).map((user: TypeUser) => (
  //             <div key={user.id} className='relative flex items-center'>
  //               <TooltipUi description={user.display_name}>
  //                 <img
  //                   src={user.avatar}
  //                   alt={user.display_name}
  //                   className='w-7 min-w-7 h-7 rounded-full object-cover border'
  //                 />
  //               </TooltipUi>
  //             </div>
  //           ))}
  //         </div>
  //         {selectedValues.length > 5 && (
  //           <div className='flex items-center justify-center w-7 min-w-7 h-7 bg-gray-200 text-gray-800 rounded-full font-semibold text-xs ml-1'>
  //             +{selectedValues.length - 5}
  //           </div>
  //         )}
  //       </div>
  //     );
  //   }

  //   return (
  //     <components.ValueContainer {...props} className='!p-[5.5px]'>
  //       {tmpChildren}
  //     </components.ValueContainer>
  //   );
  // };

  const CustomMultiValue = (props: any) => {
    const user: TypeUser = props.data;
    const index = props.index;
    const total = props.selectProps.value.length;

    // Chỉ render người đầu tiên
    if (index === 0) {
      return (
        <components.MultiValue
          {...props}
          className='bg-white flex items-center -space-x-1'
          clearValue={false}
          key={index}
        >
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

  const CustomOption = ({ innerProps, label, data }: any) => (
    <div {...innerProps} className='flex items-center p-1 gap-2 hover:bg-[#C4DBEF] cursor-pointer rounded-sm'>
      {isMulti && (
        <div className='pl-1'>
          <CheckboxInput checked={!!(value as number[])?.includes(data.id)} />
        </div>
      )}
      <img src={data.avatar || NO_AVATAR} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
      <div>
        <p className='text-[0.875rem]'>
          {data?.username} - {label}
        </p>
      </div>
    </div>
  );

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

  const customFilter = useCallback((option: any, inputValue: string) => {

    const { username, phone, email, display_name } = option.data;

    // Kiểm tra nếu có bất kỳ trường nào trùng với inputValue
    return (
      username?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
      phone?.includes(inputValue) ||
      email?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
      display_name?.toLowerCase()?.includes(inputValue.toLowerCase())
    );
  }, []);

  return (
    <SelectInput
      isMulti={isMulti}
      isClearable={isClearable}
      label={label}
      style={
        isMulti
          ? {
              valueContainer: (state: any) => {
                return { ...state, ...(isEmpty(value) ? { padding: '6.5px 5px' } : { padding: '2px 5px' }) };
              }
            }
          : {
              valueContainer: (provided: any) => ({
                ...provided,
                padding: value ? '4px 0px 4px 16px' : '5.5px 0px 5.5px 16px'
              })
            }
      }
      ref={refSelect}
      options={userList}
      value={selectedValue}
      onChange={handleChange}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      keyLabel='display_name'
      keyValue='id'
      hideSelectedOptions={!isMulti}
      menuPlacement={menuPlacement}
      // filterOption={customFilter}
      selectComponents={{
        Option: CustomOption,
        ...(isMulti
          ? { MultiValue: CustomMultiValue, MultiValueRemove: CustomMultiValueRemove, MenuList: MenuList }
          : {})
      }}
      formatOptionLabel={!isMulti ? formatSelectedValues : undefined}
    />
  );
};

export default UsersSelect;
