import { EMPTY_DATA } from '@lib/ImageHelper';
import { useT } from '@hooks/useT';
import { cn } from '@lib/utils';

interface Props {
  className?: string;
  note?: string;
}

const EmptyTable = ({ className, note }: Props) => {
  const { t } = useT();
  return (
    <div className={cn('flex items-center justify-center my-8 flex-col', className)}>
      <img src={EMPTY_DATA} />
      <p className='text-base mt-2'>{note ? note : t('no_data')}</p>
    </div>
  );
};

export default EmptyTable;
