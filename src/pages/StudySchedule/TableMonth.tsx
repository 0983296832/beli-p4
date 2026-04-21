import React, { useState } from 'react';
import { useT } from '@hooks/useT';
import { sortBy, uniq } from 'lodash';
import { hexToRgba, ScheduleCalendarColor } from '@lib/ColorHelper';
import dayjs from 'dayjs';
import {
  convertDateToUnixTimestamp,
  formatFullDate,
  getDayMonthYearOfTimestamp,
  getWeekdayNumber
} from '@lib/TimeHelper';
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog';
import EmptyTable from '@components/empty/EmptyTable';
import { getClassroomInfo, getSubjectInfo } from '@lib/GetInfoHelper';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';

interface Props {
  data: any;
  day: number;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
}

const TableMonth = (props: Props) => {
  const { data, day, setShowDetail, setSelectedId } = props;
  const { t } = useT();
  const [showMore, setShowMore] = useState(false);
  const [currentSchedules, setCurrentSchedules] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const uniqClassByColor = uniq(data.map((item: any) => item.classroom_id))?.map((item: any, index: number) => ({
    classroom: item,
    color: ScheduleCalendarColor[index]
  }));
  const startOfWeek = dayjs.unix(day).startOf('week').add(0, 'day');
  const weekdays = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')];
  const weekdaysEng = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const result = Array.from({ length: 7 }, (_, index) => {
    const date = startOfWeek.add(index, 'day');
    return {
      label: `${weekdays[date.day()]}`,
      day_of_week: date.format('DD/MM/YYYY'),
      eng_label: `${weekdaysEng[date.day()]}`
    };
  });

  const weekdayMap: Record<number, string> = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    0: 'sunday'
  };

  function getWeekdayObjects(
    month: number,
    year: number,
    weekday: string
  ): { day: string; number_of_day: number; is_day_of_month: boolean; is_today: boolean }[] {
    const result: { day: string; number_of_day: number; is_day_of_month: boolean; is_today: boolean }[] = [];

    const firstDayOfMonth = dayjs(`${year}-${month}-01`);
    const daysInMonth = firstDayOfMonth.daysInMonth();

    // Tính offset đầu tuần
    const dayOfWeek = firstDayOfMonth.day() === 0 ? 7 : firstDayOfMonth.day();
    const daysBefore = dayOfWeek - 1;

    const totalDisplayedDays = daysInMonth + daysBefore;
    const numberOfGridDays = totalDisplayedDays <= 35 ? 35 : 42;

    const start = firstDayOfMonth.subtract(daysBefore, 'day');

    for (let i = 0; i < numberOfGridDays; i++) {
      const current = start.add(i, 'day');
      const key = weekdayMap[current.day()];
      if (key === weekday) {
        result.push({
          day: current.format('DD/MM/YYYY'),
          number_of_day: current.date(),
          is_day_of_month: current.month() + 1 === month,
          is_today: current.isSame(dayjs(), 'day')
        });
      }
    }

    return result;
  }
  return (
    <div className='h-[calc(100vh-285px)] overflow-y-auto'>
      <div className='grid grid-cols-7  rounded-sm'>
        {result?.map((day_schedule, index) => {
          const data_of_day = data?.filter(
            (item: { date: number }) => dayjs.unix(item?.date).format('DD/MM/YYYY') === day_schedule?.day_of_week
          );

          return (
            <div className='border border-[#E8E8E8] h-full' key={index}>
              <div className='py-3 border-b'>
                <p className='text-center text-base font-medium'>{day_schedule.label}</p>
              </div>
              <div className='min-h-[calc(100vh-336px)]'>
                {getWeekdayObjects(
                  getDayMonthYearOfTimestamp(day)?.month,
                  getDayMonthYearOfTimestamp(day)?.year,
                  day_schedule.eng_label
                )?.map((day_of_month, idx: number) => {
                  const scheduleByDay = data.filter(
                    (schedule: { date: number }) => dayjs.unix(schedule.date).format('DD/MM/YYYY') == day_of_month?.day
                  );
                  return (
                    <div
                      className={`rounded-sm min-h-[293px] h-full cursor-pointer relative border-t pt-10 pb-3 px-3 ${!day_of_month?.is_day_of_month && 'bg-primary-neutral-100'}`}
                      key={idx}
                    >
                      {day_of_month?.is_today ? (
                        <div className='size-6 rounded-full bg-primary-blue-500 absolute top-3 left-3 flex items-center justify-center text-white'>
                          <p className=' font-medium'>{day_of_month?.number_of_day}</p>
                        </div>
                      ) : (
                        <p className='absolute top-3 left-3 font-medium'>{day_of_month?.number_of_day}</p>
                      )}

                      {sortBy(
                        scheduleByDay,
                        (event) =>
                          parseInt(event.start_time.split(':')[0]) * 60 + parseInt(event.start_time.split(':')[1])
                      )
                        ?.slice(0, 3)
                        ?.map((schedule: any, idx: number) => {
                          const classroomColor = uniqClassByColor.find(
                            (classroom) => classroom?.classroom == schedule?.classroom_id
                          );
                          return (
                            <div
                              key={idx}
                              className='p-1 rounded-sm cursor-pointer mb-1 border-l-[3px]'
                              style={{
                                backgroundColor: hexToRgba(classroomColor?.color || '', 0.2),
                                color: classroomColor?.color,
                                borderColor: classroomColor?.color
                              }}
                              onClick={() => {
                                setShowDetail(true);
                                setSelectedId(schedule?.id);
                              }}
                            >
                              <p className='text-sm font-medium'>
                                {schedule?.start_time} - {schedule?.end_time}
                              </p>
                              <p className='text-sm font-medium line-clamp-1'>
                                {getClassroomInfo(schedule?.classroom_id)?.classroom_name} -{' '}
                                {getSubjectInfo(schedule?.r_classroom?.subject_id)?.subject_name}
                              </p>
                              <p className='text-sm font-medium'>
                                {t('period')}:{' '}
                                <a
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(schedule?.teaching_program_detail?.drive_link, '_blank');
                                  }}
                                  className='underline'
                                >
                                  {schedule?.teaching_program_detail?.manual_code ||
                                    schedule?.teaching_program_detail?.teaching_program_detail_code}
                                </a>
                              </p>
                            </div>
                          );
                        })}
                      {scheduleByDay?.length > 3 && (
                        <Popover>
                          <PopoverTrigger>
                            <p
                              className='text-xs text-primary-blue-500 underline cursor-pointer'
                              onClick={() => {
                                setSelectedDay(day_of_month.day);
                                setCurrentSchedules(
                                  sortBy(
                                    scheduleByDay,
                                    (event) =>
                                      parseInt(event.start_time.split(':')[0]) * 60 +
                                      parseInt(event.start_time.split(':')[1])
                                  )
                                );
                              }}
                            >
                              {t('view_more_classes', { num: scheduleByDay?.length - 3 })}
                            </p>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-[200px] px-2 py-2.5 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto'
                            align='center'
                          >
                            <p className='mb-3 text-sm font-medium'>
                              {t(
                                weekdayMap[
                                  getWeekdayNumber(
                                    Math.floor(new Date(selectedDay?.split('/').reverse().join('-')).getTime() / 1000)
                                  )
                                ] as any
                              )}
                              , {`${selectedDay?.split('/')?.[0]}/${selectedDay?.split('/')?.[1]}`}
                            </p>
                            {currentSchedules?.map((schedule: any, idx: number) => {
                              const classroomColor = uniqClassByColor.find(
                                (classroom) => classroom?.classroom == schedule?.classroom_id
                              );
                              return (
                                <div
                                  key={idx}
                                  className='p-1 rounded-sm cursor-pointer mb-1 border-l-[3px]'
                                  style={{
                                    backgroundColor: hexToRgba(classroomColor?.color || '', 0.2),
                                    color: classroomColor?.color,
                                    borderColor: classroomColor?.color
                                  }}
                                  onClick={() => {
                                    setShowDetail(true);
                                    setSelectedId(schedule?.id);
                                  }}
                                >
                                  <p className='text-sm font-medium'>
                                    {schedule?.start_time} - {schedule?.end_time}
                                  </p>
                                  <p className='text-sm font-medium'>
                                    {getSubjectInfo(schedule?.r_classroom?.subject_id)?.subject_name} -{' '}
                                    {getClassroomInfo(schedule?.classroom_id)?.classroom_name}
                                  </p>
                                  <p className='text-sm font-medium'>
                                    {t('period')}:{' '}
                                    <a
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(schedule?.teaching_program_detail?.drive_link, '_blank');
                                      }}
                                      className='underline'
                                    >
                                      {schedule?.teaching_program_detail?.manual_code ||
                                        schedule?.teaching_program_detail?.teaching_program_detail_code}
                                    </a>
                                  </p>
                                </div>
                              );
                            })}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <Dialog open={showMore} onOpenChange={setShowMore}>
        <DialogContent className='rounded-lg border-none gap-0 p-0 max-w-[1200px] overflow-hidden bg-white'>
          <DialogHeader className='flex flex-row justify-between p-4 space-y-0 border-b bg-white'>
            <div>{t('study_schedule_list')}</div>
          </DialogHeader>
          <div className='p-6 bg-white max-h-[calc(100vh-250px)] min-h-[calc(100vh-250px)] overflow-y-auto'>
            <table className='table-rounded !border-neutral-100'>
              <thead>
                <tr className='bg-primary-blue-50'>
                  <th className='w-32'>{t('time')}</th>
                  <th className='w-24'>{t('classroom')}</th>
                  <th>{t('subject')}</th>
                  <th className='w-64'>{t('location')}</th>
                  <th>{t('content')}</th>
                  <th className='w-24'>{t('period_order')}</th>
                  <th>{t('teachers')}</th>
                  <th>{t('teaching_assistant')}</th>
                  <th>{t('student_list')}</th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {currentSchedules?.length > 0 ? (
                  currentSchedules.map((schedule: any, index: number) => (
                    <tr key={index}>
                      <td
                        className='text-center cursor-pointer hover:text-primary-blue-500'
                        onClick={() => {
                          setShowDetail(true);
                          setSelectedId(schedule?.id);
                        }}
                      >
                        {schedule?.start_time} - {schedule?.end_time}
                      </td>
                      <td className='text-center'>{schedule?.classroom}</td>
                      <td className='text-center'>{schedule?.subject}</td>
                      <td className='text-center'>{schedule?.location}</td>
                      <td className='text-center'>{schedule?.teaching_program?.title}</td>
                      <td className='text-center'>
                        {schedule?.teaching_program_detail_number}/{schedule?.count_total_lessons}
                      </td>
                      <td className='text-center'>{schedule?.teacher?.display_name}</td>
                      <td className='text-center'>{schedule?.ta?.display_name}</td>
                      <td className='text-center'>{schedule?.students?.length}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12}>
                      <EmptyTable />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableMonth;
