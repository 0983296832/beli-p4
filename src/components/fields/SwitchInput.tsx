import React from 'react';
import { Switch } from '../ui/switch'; // Đường dẫn đến component Switch bạn đã tạo
import { ERROR_RED } from '@lib/ImageHelper';
import { cn } from '@lib/utils';

interface Props {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

const SwitchInput = (props: Props) => {
  const { label, checked, onCheckedChange, className, error, disabled, id } = props;

  return (
    <div className={cn('w-full', className)}>
      <div className='flex items-center gap-4'>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
        {label && (
          <label htmlFor={id} className='block text-sm font-normal text-primary-neutral-900'>
            {label}
          </label>
        )}
      </div>
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} alt='error icon' />
          <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SwitchInput;
