import React from 'react';

import { cn } from '@lib/utils';
import { Textarea } from '../ui/textarea';
import { ERROR_RED } from '@lib/ImageHelper';

interface Props {
  label?: string;
  className?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}
const TextAreaInput = (props: Props) => {
  const { label, className, value, onChange, error, placeholder, disabled, required, rows } = props;
  return (
    <div className={'w-full'}>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}
      <Textarea
        className={cn(` ${error && '!border-primary-error'}`, className)}
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
      />
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TextAreaInput;
