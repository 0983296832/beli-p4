import { useState } from 'react';
import { Input } from '../ui/input';
import { cn } from '@lib/utils';
import { SEARCH } from '@lib/ImageHelper';

interface Props {
  label?: string;
  className?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchInput = (props: Props) => {
  const { label, className, value, onChange, error, placeholder, disabled, onKeyDown } = props;
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return (
    <div className={'w-full'}>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-1 ${error && 'text-primary-error'}`}>{label}</p>
      )}
      <div className='relative'>
        <Input
          className={cn(
            `pr-10 shadow-none ${error && 'border-primary-error text-primary-error focus-visible:ring-primary-error'}`,
            className
          )}
          value={value}
          type={'text'}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
          }}
        />
        <span className='absolute p-3 transform -translate-y-1/2 top-1/2 right-3 text-primary-neutral-500'>
          <img className='size-4' src={SEARCH} alt='Search' />
        </span>
      </div>
    </div>
  );
};

export default SearchInput;
