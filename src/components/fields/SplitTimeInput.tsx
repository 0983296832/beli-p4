'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { cn } from '@lib/utils';
import { ERROR_RED } from '@lib/ImageHelper';
import { useT } from '@hooks/useT';

interface TimeSelectProps {
  value?: number;
  onChange?: (timestamp: number) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  /**Ngày mặc định để lấy giờ (ko có thì auto lấy ngày hiện tại) */
  defaultDate?: number;
}

export default function SplitTimeInput({
  value,
  onChange,
  className,
  disabled,
  label,
  required,
  error,
  defaultDate
}: TimeSelectProps) {
  const { t } = useT();
  const [selectedHour, setSelectedHour] = useState<string>('01');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');

  // Convert timestamp to time components
  useEffect(() => {
    if (value) {
      const date = new Date(value * 1000);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;

      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(minutes.toString().padStart(2, '0'));
      setSelectedPeriod(period);
    }
  }, [value]);

  // Convert time components to timestamp
  const updateTimestamp = (hour: string, minute: string, period: string) => {
    let baseDate: Date;

    // Nếu có defaultDate thì tạo Date từ đó, ngược lại dùng ngày hiện tại
    if (defaultDate) {
      baseDate = new Date(defaultDate * 1000); // Convert từ Unix timestamp (s) -> Date (ms)
    } else {
      baseDate = new Date();
    }

    let hour24 = Number.parseInt(hour);

    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const newDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hour24,
      Number.parseInt(minute)
    );

    const newTimestamp = Math.floor(newDate.getTime() / 1000);

    if (onChange) {
      onChange(newTimestamp);
    }
  };

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
    updateTimestamp(hour, selectedMinute, selectedPeriod);
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
    updateTimestamp(selectedHour, minute, selectedPeriod);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    updateTimestamp(selectedHour, selectedMinute, period);
  };

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return hour.toString().padStart(2, '0');
  });

  // Generate minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => {
    return i.toString().padStart(2, '0');
  });

  return (
    <div className={cn(`w-full`, className)}>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}
      <div className={cn(`flex gap-2 items-center w-full`, className)}>
        <Select value={selectedHour} onValueChange={handleHourChange} disabled={disabled}>
          <SelectTrigger className='w-20'>
            <SelectValue placeholder={t('hour')} />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        :
        <Select value={selectedMinute} onValueChange={handleMinuteChange} disabled={disabled}>
          <SelectTrigger className='w-20'>
            <SelectValue placeholder={t('minute')} />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={disabled}>
          <SelectTrigger className='w-20'>
            <SelectValue placeholder='AM/PM' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='AM'>AM</SelectItem>
            <SelectItem value='PM'>PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-primary-error text-sm'>{error}</p>
        </div>
      )}
    </div>
  );
}
