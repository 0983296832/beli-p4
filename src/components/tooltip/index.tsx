import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface Props {
  children: React.ReactNode;
  description: string;
}

const TooltipUi = (props: Props) => {
  const { children, description } = props;
  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent className='px-4 py-2'>
          <p className='text-sm font-medium'>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipUi;
