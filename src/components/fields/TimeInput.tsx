// import { useState, useEffect } from 'react';
// import { Clock, X } from 'lucide-react';
// import { Button } from '@components/ui/button';
// import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
// import { cn } from '@lib/utils';
// import { ScrollArea } from '@components/ui/scroll-area';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
// import { ERROR_RED } from '@lib/ImageHelper';
// import { useT } from '@hooks/useT';
// import dayjs from 'dayjs';

// interface TimePickerProps {
//   label?: string;
//   className?: string;
//   value?: number;
//   onChange?: (timestamp: number | undefined, time_string?: string) => void;
//   error?: string;
//   placeholder?: string;
//   disabled?: boolean;
//   required?: boolean;
// }

// export default function TimeInput({
//   value,
//   onChange,
//   label,
//   error,
//   placeholder,
//   disabled,
//   required,
//   className
// }: TimePickerProps) {
//   const { t } = useT();
//   const [selectedHour, setSelectedHour] = useState<string>('00');
//   const [selectedMinute, setSelectedMinute] = useState<string>('00');
//   const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');
//   const [open, setOpen] = useState(false);

//   // Generate hours 1-12
//   const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

//   // Generate minutes 00-59
//   const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

//   // Convert unix timestamp to time components
//   const timestampToTime = (timestamp: number) => {
//     const date = new Date(timestamp * 1000);
//     let hours = date.getHours();
//     const minutes = date.getMinutes();
//     const period = hours >= 12 ? 'PM' : 'AM';

//     // Convert to 12-hour format
//     if (hours === 0) hours = 12;
//     else if (hours > 12) hours = hours - 12;

//     return {
//       hour: hours.toString().padStart(2, '0'),
//       minute: minutes.toString().padStart(2, '0'),
//       period
//     };
//   };

//   // Convert time components to unix timestamp
//   const timeToTimestamp = (hour: string, minute: string, period: string) => {
//     const now = new Date();
//     let hours24 = Number.parseInt(hour);

//     // Convert to 24-hour format
//     if (period === 'AM' && hours24 === 12) {
//       hours24 = 0;
//     } else if (period === 'PM' && hours24 !== 12) {
//       hours24 += 12;
//     }

//     const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours24, Number.parseInt(minute), 0, 0);
//     return Math.floor(date.getTime() / 1000);
//   };

//   // Initialize with timestamp if provided
//   useEffect(() => {
//     if (value) {
//       const time = timestampToTime(value);
//       setSelectedHour(time.hour);
//       setSelectedMinute(time.minute);
//       setSelectedPeriod(time.period);
//     }
//   }, [value]);

//   const formatTime = () => {
//     return `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
//   };

//   // const handleTimeConfirm = () => {
//   //   const timestamp = timeToTimestamp(selectedHour, selectedMinute, selectedPeriod);
//   //   onChange?.(timestamp);
//   //   setOpen(false);
//   // };

//   const handleChange = (hour: string, minute: string, period: string) => {
//     setSelectedHour(hour);
//     setSelectedMinute(minute);
//     setSelectedPeriod(period);
//     const timestamp = timeToTimestamp(hour, minute, period);
//     onChange?.(timestamp, dayjs.unix(timestamp).format('HH:mm'));
//   };

//   return (
//     <div className='w-full'>
//       {label && (
//         <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
//           {label}
//           {required && <span className='text-primary-error'>*</span>}
//         </p>
//       )}
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant='outline'
//             disabled={disabled}
//             className={cn(
//               `w-full justify-between text-left font-normal bg-white hover:bg-white disabled:bg-neutral-100 disabled:text-primary-neutral-500 disabled:cursor-not-allowed ${open ? 'border-primary-blue-500' : ''}`,
//               className + `${error && 'text-red-500 border-red-500'}`
//             )}
//           >
//             {formatTime()}

//             <Clock className='ml-2 h-4 w-4 opacity-50' />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className='w-full p-0' align='start'>
//           <div className='p-3'>
//             <Tabs defaultValue='hour'>
//               <TabsList className='grid grid-cols-3'>
//                 <TabsTrigger value='hour'>{t('hour')}</TabsTrigger>
//                 <TabsTrigger value='minute'>{t('minute')}</TabsTrigger>
//                 <TabsTrigger value='period'>AM/PM</TabsTrigger>
//               </TabsList>

//               <TabsContent value='hour' className='mt-2'>
//                 <ScrollArea className='h-max'>
//                   <div className='grid grid-cols-3 gap-2'>
//                     {hours.map((hour) => (
//                       <Button
//                         key={hour}
//                         variant={selectedHour === hour ? 'default' : 'outline'}
//                         className={cn('h-10', selectedHour === hour && 'bg-blue-600')}
//                         onClick={() => handleChange(hour, selectedMinute, selectedPeriod)}
//                       >
//                         {hour}
//                       </Button>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               </TabsContent>

//               <TabsContent value='minute' className='mt-2'>
//                 <ScrollArea className='h-60'>
//                   <div className='grid grid-cols-4 gap-2 '>
//                     {minutes.map((minute, index) => (
//                       <Button
//                         key={minute}
//                         variant={selectedMinute === minute ? 'default' : 'outline'}
//                         className={cn('h-10', selectedMinute === minute && 'bg-blue-600')}
//                         onClick={() => handleChange(selectedHour, minute, selectedPeriod)}
//                       >
//                         {minute}
//                       </Button>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               </TabsContent>

//               <TabsContent value='period' className='mt-2'>
//                 <div className='grid grid-cols-2 gap-4'>
//                   <Button
//                     variant={selectedPeriod === 'AM' ? 'default' : 'outline'}
//                     className={cn('h-10', selectedPeriod === 'AM' && 'bg-blue-600')}
//                     onClick={() => {
//                       handleChange(selectedHour, selectedMinute, 'AM');
//                       setOpen(false);
//                     }}
//                   >
//                     AM
//                   </Button>
//                   <Button
//                     variant={selectedPeriod === 'PM' ? 'default' : 'outline'}
//                     className={cn('h-10', selectedPeriod === 'PM' && 'bg-blue-600')}
//                     onClick={() => {
//                       handleChange(selectedHour, selectedMinute, 'PM');
//                       setOpen(false);
//                     }}
//                   >
//                     PM
//                   </Button>
//                 </div>
//               </TabsContent>
//             </Tabs>
//             <div className='flex items-center justify-center gap-6 mt-2'>
//               <Button
//                 className=''
//                 variant={'destructive'}
//                 onClick={() => {
//                   setSelectedHour('00');
//                   setSelectedMinute('00');
//                   setSelectedPeriod('AM');
//                   onChange?.(undefined);
//                   setOpen(false);
//                 }}
//               >
//                 {t('unselect')}
//               </Button>
//               <Button
//                 className='px-8'
//                 onClick={() => {
//                   setOpen(false);
//                 }}
//               >
//                 Ok
//               </Button>
//             </div>
//           </div>
//         </PopoverContent>
//       </Popover>
//       {error && (
//         <div className='flex items-center gap-2 mt-2'>
//           <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';
import { useT } from '@hooks/useT';
import { ERROR_RED } from '@lib/ImageHelper';
import dayjs from 'dayjs';

interface TimePickerProps {
  label?: string;
  className?: string;
  value?: number;
  onChange?: (timestamp: number | undefined, time_string?: string, format_24h?: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function TimePicker({
  value,
  onChange,
  className,
  disabled,
  placeholder,
  required,
  error,
  label
}: TimePickerProps) {
  const { t } = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  // Convert Unix timestamp to time string
  const timestampToTimeString = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Convert time string to Unix timestamp (using today's date)
  const timeStringToTimestamp = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');

    let hour24 = Number.parseInt(hours);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const today = new Date();
    today.setHours(hour24, Number.parseInt(minutes), 0, 0);

    return Math.floor(today.getTime() / 1000);
  };

  // Update selectedTime when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedTime(timestampToTimeString(value));
    } else {
      setSelectedTime('');
    }
  }, [value]);

  // Parse time string to get hours, minutes, and period
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hours: '', minutes: '', period: 'AM' };

    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');

    return {
      hours: hours || '',
      minutes: minutes || '',
      period: period || 'AM'
    };
  };

  const { hours, minutes, period } = parseTime(selectedTime);

  // Generate hour options (1-12 for 12-hour format)
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Generate minute options
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleTimeChange = (newHours: string, newMinutes: string, newPeriod: string) => {
    const timeString = `${newHours}:${newMinutes || '00'} ${newPeriod || 'AM'}`;
    setSelectedTime(timeString);

    // Convert to Unix timestamp and call onChange
    const timestamp = timeStringToTimestamp(timeString);
    const format_24h = dayjs.unix(timestamp).format('hh:mm');
    onChange?.(timestamp, timeString, format_24h);
  };

  const handleClear = () => {
    setSelectedTime('');
    // Return current timestamp when cleared, or you can modify this behavior
    onChange?.(undefined, '', '');
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return placeholder || t('select_time');
    return timeStr;
  };

  return (
    <div className='w-full'>
      {label && (
        <p className={`text-primary-neutral-900 font-normal text-sm mb-2`}>
          {label}
          {required && <span className='text-primary-error'>*</span>}
        </p>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            disabled={disabled}
            className={cn(
              `w-full justify-between text-left font-normal bg-white hover:bg-white disabled:bg-neutral-100 disabled:text-primary-neutral-500 disabled:cursor-not-allowed ${value ? '' : 'text-primary-neutral-300 hover:text-primary-neutral-300'}  ${isOpen ? 'border-primary-blue-500' : ''}`,
              className + `${error && 'text-red-500 border-red-500'}`
            )}
          >
            {formatDisplayTime(selectedTime)}

            <Clock className='ml-2 h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-4' align='start'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                {/* Hours */}
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>{t('hour')}</Label>
                  <Select
                    value={hours}
                    onValueChange={(value) => {
                      handleTimeChange(value, minutes, period);
                    }}
                  >
                    <SelectTrigger className='w-[70px]'>
                      <SelectValue placeholder='HH' />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='pt-6'>:</div>

                {/* Minutes */}
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>{t('minute')}</Label>
                  <Select value={minutes} onValueChange={(value) => handleTimeChange(hours, value, period)}>
                    <SelectTrigger className='w-[70px]'>
                      <SelectValue placeholder='MM' />
                    </SelectTrigger>
                    <SelectContent>
                      {minuteOptions.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AM/PM */}
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>AM/PM</Label>
                  <Select value={period} onValueChange={(value) => handleTimeChange(hours, minutes, value)}>
                    <SelectTrigger className='w-[70px]'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='AM'>AM</SelectItem>
                      <SelectItem value='PM'>PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-2 pt-2'>
              <Button variant='outline' size='sm' onClick={handleClear}>
                {t('clear')}
              </Button>
              <Button size='sm' onClick={() => setIsOpen(false)}>
                {t('done')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <div className='flex items-center gap-2 mt-2'>
          <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{error}</p>
        </div>
      )}
    </div>
  );
}
