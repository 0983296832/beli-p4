import { CalendarIcon } from 'lucide-react';
import { fromDate, getLocalTimeZone, toCalendarDate } from '@internationalized/date';
import {
  Button,
  DateRangePicker,
  Dialog,
  Group,
  Label,
  Popover,
  type DateValue,
  I18nProvider
} from 'react-aria-components';
import { cn } from '@lib/utils';
import { RangeCalendar } from '@components/ui/calendar-rac';
import { DateInput, dateInputStyle } from '@components/ui/datefield-rac';
import { ERROR_RED } from '@lib/ImageHelper';

interface UnixDateRangePickerProps {
  startTimestamp?: number;
  endTimestamp?: number;
  onChange?: (start: number | null, end: number | null) => void;
  label?: string;
  className?: string;
  lang?: 'vi' | 'en' | 'jp';
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function DateRangeInput({
  startTimestamp,
  endTimestamp,
  onChange,
  label = 'Date range picker',
  className,
  lang,
  required,
  error,
  placeholder,
  disabled
}: UnixDateRangePickerProps) {
  // Convert Unix timestamps to DateValue objects
  const getDateValue = (timestamp?: number): DateValue | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp * 1000);
    return toCalendarDate(fromDate(date, getLocalTimeZone()));
  };

  // Convert DateValue back to Unix timestamp
  const getUnixTimestamp = (dateValue: DateValue | null): number | null => {
    if (!dateValue) return null;
    const date = dateValue.toDate(getLocalTimeZone());
    return Math.floor(date.getTime() / 1000);
  };

  const initialValue = {
    start: getDateValue(startTimestamp),
    end: getDateValue(endTimestamp)
  };

  const handleRangeChange = (range: { start: DateValue | null; end: DateValue | null } | null) => {
    if (!onChange) return;

    if (!range) {
      onChange(null, null);
      return;
    }

    const startUnix = getUnixTimestamp(range.start);
    const endUnix = getUnixTimestamp(range.end);
    onChange(startUnix, endUnix);
  };

  return (
    <div className={className}>
      <I18nProvider locale={lang || localStorage.getItem('language') || 'vi'}>
        <DateRangePicker
          isDisabled={disabled}
          firstDayOfWeek='mon'
          className='*:not-first:mt-2 bg-white'
          // value={
          //   initialValue.start !== null && initialValue.end !== null
          //     ? { start: initialValue.start, end: initialValue.end }
          //     : null
          // }
          // onChange={handleRangeChange}
        >
          {label && (
            <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
              {label}
              {required && <span className='text-primary-error'>*</span>}
            </p>
          )}
          <div className='flex'>
            <Group className={cn(dateInputStyle, 'pe-9 bg-white')}>
              <I18nProvider locale={lang || localStorage.getItem('language') || 'vi'}>
                <DateInput slot='start' unstyled className='bg-white' />
              </I18nProvider>
              <span aria-hidden='true' className='text-muted-foreground/70 px-2'>
                -
              </span>
              <I18nProvider locale={lang || localStorage.getItem('language') || 'vi'}>
                <DateInput slot='end' unstyled className='bg-white' />
              </I18nProvider>
            </Group>
            <Button className='text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]'>
              <CalendarIcon size={16} />
            </Button>
          </div>
          <Popover
            className='bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-md border shadow-lg outline-hidden'
            offset={4}
          >
            <Dialog className='max-h-[inherit] overflow-auto p-2 bg-white'>
              <RangeCalendar />
            </Dialog>
          </Popover>
        </DateRangePicker>
      </I18nProvider>
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
}
