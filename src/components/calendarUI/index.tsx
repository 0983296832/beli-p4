import React, { useEffect, useState } from 'react';
import { enUS, vi, ja, Locale } from 'date-fns/locale';
import { Calendar } from '../ui/calendar';
import dayjs from 'dayjs';
import { cn } from '@lib/utils';
import { DayProps, StyledElement } from 'react-day-picker';
import { getCurrentTimestamp } from '@lib/TimeHelper';

const localeMap: Record<string, Locale> = {
  vi: vi,
  en: enUS,
  jp: ja
};

interface Props {
  lang?: string;
  value?: number;
  onChange?: (value: number | null) => void;
  className?: string;
  classNames?: Partial<StyledElement<string>> | undefined;
  mode?: 'default' | 'single' | 'multiple' | 'range' | undefined;
  disabled?: boolean;
}

const CalendarCustom = (props: Props) => {
  const { lang, value, onChange, className, classNames, mode = 'single', disabled } = props;
  const [month, setMonth] = useState<Date>(value ? dayjs.unix(value).toDate() : new Date());

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(dayjs(date).unix());
    } else {
      onChange?.(null);
    }
  };

  useEffect(() => {
    if (value) {
      const date = dayjs.unix(value).toDate();
      setMonth(date);
    }
  }, [value]);

  return (
    <Calendar
      disabled={disabled}
      className={cn('w-full', className)}
      classNames={{
        caption_start: 'w-full',
        head_cell: 'text-primary-neutral-500 rounded-md w-8 font-normal text-[10.8px] flex-1 uppercase font-semibold',
        day_selected:
          'bg-primary-blue-100 text-primary-neutral-900 hover:bg-primary-blue-100 hover:text-primary-neutral-900 focus:bg-primary-blue-100 focus:text-primary-neutral-900 ',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-white [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md flex-1',
          mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        ...classNames
      }}
      mode='single'
      locale={localeMap[lang || localStorage.getItem('language') || 'vi']}
      selected={value ? dayjs.unix(value).toDate() : undefined}
      onSelect={handleCalendarSelect}
      initialFocus
      month={month}
      onMonthChange={(newMonth) => setMonth(newMonth)}
      defaultMonth={value ? dayjs.unix(value).toDate() : undefined}
    />
  );
};

export default CalendarCustom;
