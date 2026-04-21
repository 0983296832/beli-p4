import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { useT } from '@hooks/useT';
import { SQUARE_ARROW_LEFT } from '@lib/ImageHelper';
import { cn } from '@lib/utils';

interface Props {
  className?: string;
  hasMore?: boolean;
  limit: number;
  options?: number[];
  offset: number;
  onNext?: (value: number) => void;
  onPrevious?: (value: number) => void;
  onChangeLimit?: (value: number) => void;
}

const Pagination = (props: Props) => {
  const { limit, offset, options, onNext, onPrevious, onChangeLimit, hasMore, className } = props;
  const { t } = useT();
  return (
    <div className={cn(`w-full flex items-center justify-between `, className)}>
      <div className='flex items-start gap-3'>
        <Button
          variant={'link'}
          style={{ cursor: offset == 0 ? 'not-allowed' : 'pointer' }}
          disabled={offset == 0}
          className='size-9 p-0 disabled:!cursor-not-allowed'
          onClick={() => {
            onPrevious?.(offset - limit);
          }}
        >
          <img src={SQUARE_ARROW_LEFT} />
        </Button>
        <Button
          variant={'link'}
          className='size-9 p-0 disabled:cursor-not-allowed'
          disabled={!hasMore}
          onClick={() => {
            onNext?.(offset + limit);
          }}
        >
          <img src={SQUARE_ARROW_LEFT} className='rotate-180' />
        </Button>
      </div>
      {options && (
        <Select
          value={String(limit)}
          onValueChange={(value) => {
            onChangeLimit?.(Number(value));
          }}
        >
          <SelectTrigger className='w-[230px] border border-primary-orange outline-none ring-0 focus-visible:ring-0 text-primary-orange'>
            <SelectValue /* placeholder={t('please_choose')} */ className='text-primary-orange' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options?.map((option) => {
                return (
                  <SelectItem value={String(option)} key={option}>
                    {t('show_number_per_page', { number: option })}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default Pagination;
