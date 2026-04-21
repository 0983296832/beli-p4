import { TypeUser, useRootStore } from '@store/index';
import SelectInput, { customStyles } from '@components/fields/SelectInput';
import TooltipUi from '../tooltip';
import CheckboxInput from '../fields/CheckboxInput';
import { components, StylesConfig } from 'react-select';
import { useCallback, useMemo, useRef } from 'react';
import { isEmpty } from 'lodash';
import { ERROR_RED, NO_AVATAR } from '@lib/ImageHelper';
import 'react-virtualized/styles.css';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import List from 'react-virtualized/dist/commonjs/List';
import Select from 'react-select';
import { ChevronDown } from 'lucide-react';

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
  style?: StylesConfig<any, boolean, any> | undefined;
}

const UsersSelectVirtualized = <IsMulti extends boolean = false>({
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
  menuPlacement = 'auto',
  style
}: Props<IsMulti>) => {
  const userList = useRootStore((state) => state?.users)
    .filter((user: any) => !filterOptions?.includes(user?.id))
    .filter((user) => (role ? user?.user_job_title === UserRole[role] : true));
  const refSelect = useRef<any>(null);

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
      <img src={data.avatar || NO_AVATAR} className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover' />
      <div>
        <p className='text-[0.875rem]'>
          {data?.username} - {label}
        </p>
      </div>
      {isMulti && (
        <div className='flex-1 flex items-center justify-end'>
          <CheckboxInput checked={!!(value as number[])?.includes(data.id)} />
        </div>
      )}
    </div>
  );

  const CustomDropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className='w-4 h-4' />
      </components.DropdownIndicator>
    );
  };

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

  const MenuList = useCallback((props: any) => {
    const rows = props.children;
    const rowRenderer = ({ key, index, isScrolling, isVisible, style, ...rest }: any) => {
      return (
        <div key={key} style={style}>
          {rows[index]}
        </div>
      );
    };

    return (
      <List
        style={{ width: '100%', maxWidth: 'unset' }}
        className='space-y-1'
        width={9999}
        height={300}
        rowHeight={40}
        rowCount={rows.length || 0}
        rowRenderer={rowRenderer}
      />
    );
  }, []);

  return (
    <div className={'w-full'}>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}
      <Select
        isMulti={isMulti}
        styles={customStyles(
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
              },
          error
        )}
        ref={refSelect}
        value={selectedValue}
        onChange={handleChange}
        hideSelectedOptions={!isMulti}
        components={{
          MenuList: MenuList,
          Option: CustomOption,
          IndicatorSeparator: () => null,
          DropdownIndicator: CustomDropdownIndicator,
          ...(isMulti ? { MultiValue: CustomMultiValue, MultiValueRemove: CustomMultiValueRemove } : {})
        }}
        options={userList}
        getOptionValue={(opt: any) => opt?.id}
        getOptionLabel={(opt: any) => opt?.display_name}
        formatOptionLabel={!isMulti ? formatSelectedValues : undefined}
        closeMenuOnSelect={!isMulti}
        placeholder={placeholder}
        filterOption={customFilter}
        isDisabled={disabled}
        isClearable={isClearable}
        menuShouldScrollIntoView={false}
      />
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default UsersSelectVirtualized;
