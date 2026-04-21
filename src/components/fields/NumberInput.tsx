import { cn } from '@lib/utils';
import React from 'react';
import { NumericFormat } from 'react-number-format';
import { ERROR_RED } from '@lib/ImageHelper';

type NumberFieldProps = {
  value: number | undefined;
  onChange?: (value: number) => void;
  type?: 'percent' | 'currency' | 'number';
  prefix?: string; // Chỉ cần cho loại 'currency'
  decimalScale?: number; // Số chữ số thập phân
  thousandSeparator?: boolean; // Phân tách nghìn
  decimalSeparator?: string; // Dấu phân cách thập phân
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  allowNegative?: boolean;
};

const NumberInput: React.FC<NumberFieldProps> = ({
  value,
  onChange,
  type = 'number',
  prefix = '',
  decimalScale = 2,
  thousandSeparator = true,
  decimalSeparator = '.',
  className,
  label,
  required,
  error,
  suffix,
  placeholder,
  disabled,
  allowNegative
}) => {
  // Hàm xử lý giá trị thay đổi
  const handleValueChange = (values: { floatValue?: number }) => {
    if (values.floatValue !== undefined) {
      onChange?.(values.floatValue); // Trả về số thay vì chuỗi
    }
  };

  // Định dạng dựa trên type
  const formatProps: any = {
    value,
    onValueChange: handleValueChange,
    thousandSeparator,
    decimalSeparator,
    decimalScale,
    placeholder,
    disabled
  };

  const inputPrefix = prefix !== undefined ? prefix : type === 'currency' ? '' : '';
  const inputSuffix = suffix !== undefined ? suffix : type === 'percent' ? ' %' : '';
  const inputAllowNegative = typeof allowNegative === 'boolean' ? allowNegative : type !== 'percent'; // phần trăm không âm

  return (
    <div className='w-full'>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}

      <NumericFormat
        className={cn(
          `flex h-10 w-full rounded-lg border bg-white px-3 py-1 text-base font-medium transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-primary-neutral-300 focus-visible:outline-none focus-visible:border-1 focus-visible:border-primary-blue-500 disabled:cursor-not-allowed disabled:bg-primary-neutral-100 disabled:text-primary-neutral-500  disabled:border-primary-neutral-200 md:text-sm  `,
          className + `${error && '!border-primary-error text-primary-error focus-visible:ring-primary-error'}`
        )}
        {...formatProps}
        prefix={inputPrefix}
        suffix={inputSuffix}
        allowNegative={inputAllowNegative}
      />
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-primary-error text-sm'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default NumberInput;
