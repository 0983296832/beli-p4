import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import { Button } from '../ui/button';
import { useT } from '@hooks/useT';
import { WARNING } from '@lib/ImageHelper';
import { cn } from '@lib/utils';

interface Props {
  show: boolean;
  description?: string | React.ReactNode;
  onSuccess: () => void;
  onCancel: () => void;
  type: 'success' | 'error' | 'warning' | 'info' | 'default';
  className?: string;
}

const Confirm = (props: Props) => {
  const { show, onSuccess, onCancel, description, type = 'default', className } = props;
  const { t } = useT();
  return (
    <AlertDialog open={show}>
      <AlertDialogContent className={cn(`w-[280px] sm:w-[400px] rounded-xl p-6 bg-white`, className)}>
        <AlertDialogHeader>
          <AlertDialogDescription
            className={`${typeof description == 'string' && 'text-center'} text-primary-neutral-900 text-sm font-medium ${type === 'warning' && 'flex items-center justify-center flex-col gap-4'}`}
          >
            {type === 'warning' && <img src={WARNING} />}
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-4 flex justify-center items-center gap-9'>
          <Button onClick={onSuccess} variant={'outline'} className='w-20'>
            {t('yes')}
          </Button>
          <Button onClick={onCancel} variant={'outline'} className='w-20'>
            {t('no')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Confirm;
