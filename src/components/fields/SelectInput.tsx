import React from 'react';
import { cn } from '@lib/utils';
import Select, { ClassNamesConfig, components, FilterOptionOption, MenuPlacement, StylesConfig } from 'react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useT } from '@hooks/useT';
import { ERROR_RED } from '@lib/ImageHelper';
import { SelectComponents } from 'react-select/dist/declarations/src/components';

interface Props {
  label?: string;
  options: Array<any> | undefined;
  value: any;
  error?: string;
  onChange?: (value: any) => void;
  placeholder?: string;
  className?: string;
  isMulti?: boolean;
  disabled?: boolean;
  isClearable?: boolean;
  onFocus?: () => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
  required?: boolean;
  tooltip?: string;
  style?: StylesConfig<any, boolean, any> | undefined;
  classNames?: ClassNamesConfig<any, boolean, any> | undefined;
  getOptionLabel?: any;
  getOptionValue?: any;
  formatGroupLabel?: any;
  selectComponents?: Partial<SelectComponents<any, boolean, any>> | undefined;
  formatOptionLabel?: any;
  hideSelectedOptions?: boolean;
  keyValue?: string;
  keyLabel?: string;
  menuPlacement?: MenuPlacement | undefined;
  ref?: any;
  filterOption?: ((option: FilterOptionOption<any>, inputValue: string) => boolean) | null | undefined;
}

export const customStyles = (baseStyles: StylesConfig<any, boolean, any> | undefined | any, error?: string) => {
  return {
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'white',
      padding: '0px 4px',
      zIndex: 9,
      ...(baseStyles?.menu ? baseStyles.menu(provided) : {}) // Merge với style từ props
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#C4DBEF' : state.isSelected ? '#C4DBEF' : 'white',
      color: 'black',
      borderRadius: '2px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      marginBottom: '2px',
      ':active': {
        backgroundColor: '#C4DBEF'
      },
      ...(baseStyles?.option ? baseStyles.option(provided, state) : {})
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      padding: '0px',
      color: error ? '#ef4444' : provided?.color,
      borderColor: error ? '#ef4444' : state.isFocused ? '#1268b5' : '#EAEAEA',
      backgroundColor: state.isDisabled ? '#f6f6f6' : 'white',
      outline: 'none',
      boxShadow: state.isFocused ? 'none' : provided.boxShadow,
      borderRadius: '8px',
      '&:hover': {
        borderColor: state.isFocused ? (error ? '#ef4444' : '#1268b5') : error ? '#ef4444' : '#EAEAEA',
        boxShadow: state.isFocused ? 'none' : provided.boxShadow
      },
      ...(baseStyles?.control ? baseStyles.control(provided, state) : {})
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      color: error ? '#ef4444' : provided?.color,
      fontSize: '0.875rem',
      padding: '5.5px 0px 5.5px 16px',
      ...(baseStyles?.valueContainer ? baseStyles.valueContainer(provided) : {})
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      padding: '7.5px 20px 7.5px 0px',
      color: '#9ca3af',
      '&:hover': { color: '#9ca3af' },
      ...(baseStyles?.dropdownIndicator ? baseStyles.dropdownIndicator(provided) : {})
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#C7C7C7',
      fontSize: '14px',
      ...(baseStyles?.placeholder ? baseStyles.placeholder(provided) : {})
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      paddingRight: '0px',
      cursor: 'pointer',
      ...(baseStyles?.clearIndicator ? baseStyles.clearIndicator(provided) : {})
    })
  };
};

const SelectInput = (props: Props) => {
  const {
    label,
    options,
    value,
    error,
    onChange,
    placeholder,
    className,
    isMulti,
    disabled = false,
    isClearable = false,
    onFocus,
    required,
    classNames,
    style,
    getOptionLabel,
    getOptionValue,
    selectComponents,
    formatOptionLabel,
    hideSelectedOptions,
    keyValue,
    keyLabel,
    menuPlacement = 'auto',
    formatGroupLabel,
    filterOption,
    ref,
    onBlur,
    ...restProps
  } = props;
  const { t } = useT();

  const CustomDropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className='w-4 h-4' />
      </components.DropdownIndicator>
    );
  };

  const CustomSingleOption = (select_props: any) => {
    const { data, isSelected } = select_props;

    return (
      <components.Option {...select_props}>
        <div className={`flex justify-between w-full`}>
          <span>{data[keyLabel || 'label']}</span>
          {isSelected && isMulti && <Check className='w-4 h-4' />}
        </div>
      </components.Option>
    );
  };

  return (
    <div className={'w-full'}>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}

      <Select
        ref={ref}
        classNamePrefix='select-input'
        classNames={classNames}
        placeholder={placeholder || t('select_option')}
        closeMenuOnSelect={isMulti ? false : true}
        options={options}
        isClearable={isClearable}
        isMulti={isMulti}
        isDisabled={disabled}
        menuPlacement={menuPlacement}
        styles={customStyles(style, error)}
        onChange={onChange}
        getOptionValue={(opt: any) => (keyValue ? opt?.[keyValue] : opt?.value)}
        getOptionLabel={(opt: any) => (keyLabel ? opt?.[keyLabel] : opt?.label)}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
          IndicatorSeparator: () => null,
          Option: CustomSingleOption,
          ...selectComponents
        }}
        filterOption={filterOption}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        formatOptionLabel={formatOptionLabel}
        formatGroupLabel={formatGroupLabel}
        hideSelectedOptions={hideSelectedOptions}
        {...restProps}
      />
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SelectInput;
