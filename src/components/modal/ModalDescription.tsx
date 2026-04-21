import { useT } from '@hooks/useT';
import { useEffect, useState } from 'react';
import INFORMATION_DIAMOND from '@assets/images/information-diamond.svg';
import CLOSE_CIRCLE_WHITE from '@assets/images/close-circle-white.svg';
import TextAreaInput from '@components/fields/TextAreaInput';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import { Button } from '../ui/button';
const ModalDescription = (props: any) => {
  const { defaultDescription, onUpdateDescription } = props;
  const { t } = useT();
  const [show, setShow] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    show && setDescription(defaultDescription);
  }, [show]);

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogTrigger className='btn btn-danger cursor-pointer' asChild>
        <img src={INFORMATION_DIAMOND} alt='' />
      </AlertDialogTrigger>
      <AlertDialogContent className='rounded-lg border-none gap-0 p-0 max-w-[700px] overflow-hidden bg-transparent'>
        <AlertDialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
          <div>{t('description')}</div>
          <AlertDialogCancel className='h-auto gap-0 p-0 mt-0 bg-transparent border-0 shadow-none hover:bg-transparent'>
            <img src={CLOSE_CIRCLE_WHITE} alt='' />
          </AlertDialogCancel>
        </AlertDialogHeader>
        <div className='flex flex-col items-center px-8 py-6 space-y-6 bg-white'>
          <TextAreaInput
            placeholder={t('enter_description')}
            rows={10}
            value={description}
            onChange={(val) => setDescription(val)}
          />
          <div>
            <Button
              variant='default'
              className='px-8'
              onClick={() => {
                onUpdateDescription(description);
                setShow(false);
              }}
            >
              {t('update')}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModalDescription;
