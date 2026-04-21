import React from 'react';
import { cn } from '@lib/utils';

interface Props {
  text: string;
  className?: string;
}

const StatusTag = ({ text, className }: Props) => {
  return (
    <div className={cn('px-2 py-1 text-primary-success bg-[#e4ffe9] rounded-15 w-fit text-xs', className)}>{text}</div>
  );
};

export default StatusTag;
