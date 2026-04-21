import React, { useState } from 'react';
import { useT } from '@hooks/useT';
import dayjs from 'dayjs';
import { hexToRgba, ScheduleCalendarColor } from '@lib/ColorHelper';
import { sortBy, uniq } from 'lodash';
import { cn } from '@lib/utils';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';

interface Props {
  data: any;
  day: number;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}

const TableWeek = (props: Props) => {
  const { data, day, setShowDetail, setSelectedId, className } = props;
  const { currentUser } = useRootStore();

  const { t } = useT();
  const uniqClassByColor = uniq(data.map((item: any) => item.classroom_id))?.map((item: any, index: number) => ({
    classroom: item,
    color: ScheduleCalendarColor[index]
  }));
  const startOfWeek = dayjs.unix(day).startOf('week').add(0, 'day');
  const weekdays = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')];
  const result = Array.from({ length: 7 }, (_, index) => {
    const date = startOfWeek.add(index, 'day');
    return {
      label: `${date.format('DD')} ${weekdays[date.day()]}`,
      day_of_week: date.format('DD/MM/YYYY'),
      is_today: date.isSame(dayjs(), 'day')
    };
  });
  return (
    <div className={cn(`h-[calc(100vh-285px)] overflow-y-auto`, className)}>
      <div className='grid grid-cols-7  rounded-sm'>
        {result?.map((day_schedule, index) => {
          const data_of_day = data?.filter(
            (item: { date: number }) => dayjs.unix(item?.date).format('DD/MM/YYYY') === day_schedule?.day_of_week
          );
          return (
            <div className='border border-[#E8E8E8] h-full' key={index}>
              <div className={`py-3 border-b ${day_schedule?.is_today && 'bg-primary-blue-50'}`}>
                <p className='text-center text-base font-medium'>{day_schedule.label}</p>
              </div>
              <div className='min-h-[calc(100vh-336px)]'>
                {sortBy(
                  data_of_day,
                  (event) => parseInt(event.start_time.split(':')[0]) * 60 + parseInt(event.start_time.split(':')[1])
                )?.map((schedule: any, idx: number) => {
                  const classroomColor = uniqClassByColor.find(
                    (classroom) => classroom?.classroom == schedule?.classroom_id
                  );
                  return (
                    <div
                      className={`border-l-[3px] mb-0.5 rounded-sm p-1.5 h-max ${currentUser?.user_job_title !== USER_ROLE.STUDENT ? 'min-h-44' : 'min-h-20'}  cursor-pointer`}
                      style={{
                        backgroundColor: hexToRgba(classroomColor?.color || '', 0.2),
                        borderColor: classroomColor?.color,
                        color: classroomColor?.color
                      }}
                      key={idx}
                      onClick={() => {
                        setShowDetail(true);
                        setSelectedId(schedule?.id);
                      }}
                    >
                      <p className='text-sm font-medium mb-1'>
                        {schedule?.start_time} - {schedule?.end_time}
                      </p>
                      <p className='text-sm font-semibold mb-1 line-clamp-2'>
                        {getSubjectInfo(schedule?.r_classroom?.subject_id)?.subject_name} -{' '}
                        {getClassroomInfo(schedule?.classroom_id)?.classroom_name}
                      </p>
                      <p className='text-sm font-medium mb-1 line-clamp-2'>
                        {getLocationInfo(schedule?.r_classroom?.location_id)?.location_name}
                      </p>
                      {currentUser?.user_job_title !== USER_ROLE?.STUDENT && (
                        <>
                          <p className='text-sm font-medium mb-1 line-clamp-2'>{schedule?.teaching_program?.title}</p>
                          <p className='text-sm font-medium mb-1'>
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
                          <p className='text-sm font-medium mb-1'>
                            {t('teachers')}: {getUserInfo(schedule?.r_classroom?.teacher_id)?.display_name}
                          </p>
                          <p className='text-sm font-medium mb-1'>
                            {t('teaching_assistant')}: {getUserInfo(schedule?.r_classroom?.ta_id)?.display_name}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableWeek;
