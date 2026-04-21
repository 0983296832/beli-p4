import React, { forwardRef, useState } from 'react';
import { Input } from '../ui/input';
import { cn } from '@lib/utils';
import { ERROR_RED, EYE, EYE_SLASH } from '@lib/ImageHelper';

interface Props {
  label?: string;
  className?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  onKeyDown?: (value: any) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: boolean;
  type?: string;
}

const TextInput = forwardRef((props: Props, ref: any) => {
  const { label, className, value, onChange, error, placeholder, disabled, required, type, autoComplete, onKeyDown } =
    props;
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return (
    <div className={'w-full'}>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}
      <div className='relative'>
        <Input
          className={cn(
            ` ${error && 'border-primary-error text-primary-error focus-visible:ring-primary-error bg-red-100'}`,
            className
          )}
          ref={ref}
          value={value}
          type={showPassword ? 'text' : type}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
          onKeyDown={onKeyDown}
        />
        {type === 'password' && (
          <button
            type='button'
            className='absolute transform -translate-y-1/2 top-1/2 right-3 text-primary-neutral-500'
            onClick={togglePasswordVisibility}
          >
            <img className='size-4' src={showPassword ? EYE_SLASH : EYE} alt='' />
          </button>
        )}
      </div>
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
});

export default TextInput;
