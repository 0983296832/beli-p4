import React from 'react';
import { Checkbox } from '../ui/checkbox';
import { uniqueId } from 'lodash';
import { cn } from '@lib/utils';

interface Props {
  label?: string;
  labelClassName?: string;
  className?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
}

const CheckboxInput = (props: Props) => {
  const { label, checked, className, labelClassName, onCheckedChange, id } = props;
  const uniqId = uniqueId();

  return (
    <div className={`flex items-center ${label ? 'gap-1' : ''}`} id={id}>
      <Checkbox id={'checkbox' + uniqId} className={className} checked={checked} onCheckedChange={onCheckedChange} />
      <label
        htmlFor={'checkbox' + uniqId}
        className={cn(
          ` text-sm font-medium leading-none text-primary-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70`,
          labelClassName
        )}
      >
        {label}
      </label>
    </div>
  );
};

export default CheckboxInput;
