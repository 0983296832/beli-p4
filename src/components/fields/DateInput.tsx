'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import { Calendar } from '@components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Input } from '../ui/input';
import { convertTimestampToString } from '@lib/TimeHelper';
import { useT } from '@hooks/useT';
import { ERROR_RED } from '@lib/ImageHelper';
import { enUS, vi, ja, Locale } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  vi: vi,
  en: enUS,
  jp: ja
};

interface Props {
  label?: string;
  className?: string;
  value: number | null | undefined; //unix timestamp
  onChange?: (value: number | null) => void; //unix timestamp
  error?: string;
  placeholder?: string;
  type?: 'input' | 'button';
  disabled?: boolean;
  required?: boolean;
  lang?: 'vi' | 'en' | 'jp';
}

dayjs.extend(customParseFormat);

const DateInput = (props: Props) => {
  const { className, onChange, value, label, error, placeholder, type = 'input', disabled, required } = props;
  const { t } = useT();

  const [inputValue, setInputValue] = React.useState(value ? convertTimestampToString(value) : '');
  const [initialValue, setInitialValue] = React.useState(value ? convertTimestampToString(value) : '');
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Chỉ giữ số và dấu "/"
    value = value.replace(/[^0-9/]/g, '');
    value = value.replace(/\/{2,}/g, '/'); // Loại bỏ các dấu "/" thừa liên tiếp

    const parts = value.split('/');
    const slashCount = (value.match(/\//g) || []).length;
    const digits = value.replace(/\D/g, '');

    // ❌ Không cho nhập quá 2 dấu "/"
    if (slashCount > 2) return;

    // ✅ Logic chính:
    if (parts.length === 1) {
      const part = parts[0];

      // Nếu nhập quá 2 số mà chưa có "/" => không cho nhập tiếp
      if (part.length > 2) return;
      if (Number(part) > 31) return;
    } else if (parts.length === 2) {
      const [day, month] = parts;

      // Nếu phần đầu chưa đúng 2 số => không cho nhập tiếp
      if (day.length !== 2) return;

      // Nếu tháng > 2 số thì chặn
      if (month.length > 2) return;
      if (Number(month) > 12) return;
    } else if (parts.length === 3) {
      const [day, month, year] = parts;

      // Nếu phần đầu không đủ 2 số => không cho nhập
      if (day.length !== 2 || month.length !== 2) return;

      // Năm chỉ cho tối đa 4 số
      if (year.length > 4) return;
    }

    // Tổng số ký tự số chỉ cho 8 (ddmmyyyy)
    if (digits.length > 8) return;

    setInputValue(value);
  };

  const handleBlur = () => {
    if (!inputValue) return onChange?.(null);
    const date = dayjs(inputValue, 'DD/MM/YYYY', true);

    if (date.isValid()) {
      onChange?.(date.unix());
    } else {
      setInputValue(initialValue);
    }
  };
  const normalizeDate = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!inputValue) return onChange?.(null);
    if (e.key === 'Enter') {
      const normalizedDate = normalizeDate(inputValue);
      const date = dayjs(normalizedDate, 'DD/MM/YYYY', true);
      if (date.isValid()) {
        onChange?.(date.unix());
      } else {
        setInputValue(initialValue);
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setInputValue(dayjs(date).format('DD/MM/YYYY'));
      onChange?.(dayjs(date).unix());
    } else {
      setInputValue('');
      onChange?.(null);
    }
    setPopoverOpen(false);

    // Focus lại vào input khi chọn ngày
    inputRef.current?.focus();
  };

  React.useEffect(() => {
    if (value) {
      setInputValue(convertTimestampToString(value));
      setInitialValue(convertTimestampToString(value));
    } else {
      setInputValue('');
      setInitialValue('');
    }
  }, [value]);

  return (
    <div className='w-full'>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          {type === 'button' ? (
            <Button
              disabled={disabled}
              variant={'ghost'}
              className={cn(
                'w-max justify-start text-left font-normal bg-accent',
                !inputValue && 'text-muted-foreground' + `${error && 'text-red-500 border-red-500'}`
              )}
            >
              <CalendarIcon />
              {inputValue ? inputValue : <span>{placeholder || 'DD/MM/YYYY'}</span>}
            </Button>
          ) : (
            <div className='relative'>
              <Input
                ref={inputRef}
                className={cn('pe-10 ', className + `${error && 'text-red-500 border-red-500'}`)}
                value={inputValue}
                disabled={disabled}
                placeholder={placeholder}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={() => {
                  setPopoverOpen(true);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 100);
                }}
              />
              <CalendarIcon size={16} className='absolute top-3 right-3' />
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            locale={localeMap[props.lang || 'vi']}
            selected={value ? dayjs.unix(value).toDate() : undefined}
            onSelect={handleCalendarSelect}
            initialFocus
            defaultMonth={value ? dayjs.unix(value).toDate() : undefined}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DateInput;
