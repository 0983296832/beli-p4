import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import SearchInput from '@components/fields/SearchInput';
import Loading from '@components/loading';
import CalendarCustom from '@components/calendarUI/index';
import { ToggleGroup, ToggleGroupItem } from '@components/ui/toggle-group';
import { Button } from '@components/ui/button';
import {
  formatFullDate,
  getWeekRange,
  getMonthYear,
  getTimeRangeTimestamp,
  getCurrentTimestamp,
  convertTimestampToString
} from '@lib/TimeHelper';
import TableDay from './TableDay';
import TableWeek from './TableWeek';
import TableMonth from './TableMonth';
import ModalDetailSchedule from './ModalDetailSchedule';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TimeInput from '@components/fields/TimeInput';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import { FILTER_HORIZONTAL, SETTING_01, SETTING_ICON } from '@lib/ImageHelper';
import Icon from '@components/Icon';
import { Check } from 'lucide-react';
import { mergeObjects } from '@lib/JsHelper';
import scheduleServices from '@services/schedule';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import useQueryString from '@hooks/useQueryString';
import { useNavigate } from 'react-router-dom';

dayjs.extend(isoWeek);

const StudySchedule = () => {
  const { t } = useT();
  const [infoSearch, setInfoSearch] = useState<{
    search?: string;
    day: number;
    type?: 'month' | 'week' | 'day';
    subject_id: undefined | number;
    start_time: undefined | number;
    end_time: undefined | number;
    location_id: undefined | number;
    classroom_id: undefined | number;
  }>({
    search: '',
    day: getCurrentTimestamp(),
    type: 'month',
    subject_id: undefined,
    start_time: undefined,
    end_time: undefined,
    location_id: undefined,
    classroom_id: undefined
  });
  const [openFilter, setOpenFilter] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [priorityField, setPriorityField] = useState(localStorage.getItem('priority_field') || 'default');
  const fields = [
    {
      value: 'default',
      label: t('default')
    },
    {
      value: 'location',
      label: t('location')
    },
    {
      value: 'teachers',
      label: t('teachers')
    },
    {
      value: 'teaching_assistant',
      label: t('teaching_assistant')
    },
    {
      value: 'classroom',
      label: t('classroom')
    }
  ];

  const { date, classroom_id } = useQueryString();

  const getData = async (filters?: object) => {
    let params: any = {
      fields:
        'identity,teaching_program_id,r_classroom,students,count_total_lessons,day_of_week,classroom_id,type,classroom_schedule_id,cover_schedule_id,teaching_program_detail_number,teaching_program_detail,date,start_time,end_time,status,user_ability,created_at,updated_at',
      limit: 99999,
      filterings: {}
    };

    if (infoSearch?.subject_id) {
      params.filterings['subject_id:eq'] = infoSearch?.subject_id;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:eq'] = infoSearch?.classroom_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    if (infoSearch?.start_time) {
      params.filterings['start_time:eq'] = dayjs.unix(infoSearch?.start_time).format('HH:mm');
    }
    if (infoSearch?.end_time) {
      params.filterings['end_time:eq'] = dayjs.unix(infoSearch?.end_time).format('HH:mm');
    }

    if (infoSearch.day && infoSearch.type == 'day') {
      params.filterings['date:eq'] = infoSearch.day;
    } else if (infoSearch.day && infoSearch.type == 'week') {
      params.filterings['date:gte'] = dayjs(infoSearch.day * 1000)
        .startOf('isoWeek')
        .unix();
      params.filterings['date:lte'] = dayjs(infoSearch.day * 1000)
        .endOf('isoWeek')
        .unix();
    } else if (infoSearch.day && infoSearch.type == 'month') {
      params.filterings['date:gte'] = dayjs(infoSearch.day * 1000)
        .startOf('month')
        .unix();
      params.filterings['date:lte'] = dayjs(infoSearch.day * 1000)
        .endOf('month')
        .unix();
    }

    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await scheduleServices.getSchedules(params);
      setData(response?.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (Number(date) && Number(classroom_id)) {
      getData({
        filterings: {
          ['date:eq']: Number(date),
          ['classroom_id:eq']: Number(classroom_id)
        }
      });
      setInfoSearch({
        ...infoSearch,
        type: 'day',
        day: Number(date),
        classroom_id: Number(classroom_id)
      });
      navigate('/study-schedule', { replace: true });
    } else {
      getData();
    }
  }, [infoSearch.day, infoSearch.type, date, classroom_id]);

  return (
    <div className='bg-white rounded-2xl shadow-lg'>
      <Loading loading={loading} />
      <div className='p-4 flex items-center justify-between border-b mb-6'>
        <p className='text-lg font-medium'>{t('study_schedule')}</p>
        <div className='flex items-center gap-3'>
          <Popover open={openFilter} onOpenChange={setOpenFilter}>
            <PopoverAnchor asChild>
              <div className='flex items-center'>
                {/* <SearchInput
                  placeholder={t('search')}
                  className='w-[400px]'
                  value={infoSearch?.search}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      getData();
                    }
                  }}
                  onChange={(value) => {
                    setInfoSearch({ ...infoSearch, search: value });
                  }}
                /> */}

                <Button
                  className='border bg-primary-neutral-50 border-primary-neutral-200'
                  variant={'ghost'}
                  onClick={() => {
                    setOpenFilter(!openFilter);
                  }}
                >
                  <img src={FILTER_HORIZONTAL} alt='' />
                  {t('filter')}
                </Button>
              </div>
            </PopoverAnchor>

            <PopoverContent className='w-[730px]' align='end' onInteractOutside={(e) => e.preventDefault()}>
              <div className='grid grid-cols-2 gap-2'>
                <div className='col-span-2'>
                  <SubjectsSelect
                    label={t('subject')}
                    isClearable
                    placeholder={t('select_subject')}
                    value={infoSearch?.subject_id}
                    onChange={(val) => {
                      setInfoSearch({ ...infoSearch, subject_id: val?.id });
                    }}
                  />
                </div>

                <TimeInput
                  label={t('start_time')}
                  value={infoSearch?.start_time}
                  onChange={(value) => {
                    setInfoSearch({ ...infoSearch, start_time: value });
                  }}
                />
                <TimeInput
                  label={t('end_time')}
                  value={infoSearch?.end_time}
                  onChange={(value) => {
                    setInfoSearch({ ...infoSearch, end_time: value });
                  }}
                />
                <TeachingLocationSelect
                  label={t('location')}
                  isClearable
                  value={infoSearch?.location_id}
                  onChange={(value) => {
                    setInfoSearch({ ...infoSearch, location_id: value?.id });
                  }}
                />
                <ClassroomSelect
                  label={t('classroom')}
                  isClearable
                  value={infoSearch?.classroom_id}
                  onChange={(value) => {
                    setInfoSearch({ ...infoSearch, classroom_id: value?.id });
                  }}
                />
              </div>
              <div className='flex justify-end gap-3 mt-4'>
                <Button
                  className='border bg-primary-neutral-100 border-primary-neutral-300'
                  variant={'ghost'}
                  onClick={() => {
                    getData({
                      filterings: {
                        'classroom_id:eq': undefined,
                        'end_time:eq': undefined,
                        'location_id:eq': undefined,
                        'subject_id:eq': undefined,
                        'start_time:eq': undefined
                      },
                      offset: 0
                    });
                    setInfoSearch({
                      ...infoSearch,
                      classroom_id: undefined,
                      end_time: undefined,
                      location_id: undefined,
                      start_time: undefined,
                      subject_id: undefined
                    });
                    setOpenFilter(false);
                  }}
                >
                  {t('restore_default')}
                </Button>
                <Button
                  className='bg-primary-success hover:bg-primary-success/80'
                  onClick={() => {
                    getData({ offset: 0 });
                    setOpenFilter(false);
                  }}
                >
                  {t('apply')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {/* <Popover>
            <PopoverTrigger>
              <Button className='border bg-primary-neutral-50 border-primary-neutral-200 size-10' variant={'ghost'}>
                <Icon icon={SETTING_ICON} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='rounded-lg p-0 divide-y'>
              <div className=' p-2.5'>
                <p className='font-medium'>{t('display_priority_field')}</p>
              </div>
              {fields.map((field) => (
                <div
                  key={field?.value}
                  className={`${priorityField == field?.value && 'text-primary-blue-500 bg-primary-blue-50'} flex items-center justify-between  p-2.5 cursor-pointer hover:text-primary-blue-500 hover:bg-primary-blue-50`}
                  onClick={() => {
                    setPriorityField(field?.value);
                  }}
                >
                  <p className='font-medium'>{field?.label}</p>
                  {priorityField == field?.value && <Check className='w-4 h-4 text-primary-blue-500' />}
                </div>
              ))}
            </PopoverContent>
          </Popover> */}
        </div>
      </div>
      <div className='flex items-start h-[calc(100vh-207px)]'>
        <div className='w-max h-full border-r px-4'>
          <CalendarCustom
            value={infoSearch?.day}
            className='p-0'
            onChange={(value) => {
              setInfoSearch({ ...infoSearch, day: value || 0 });
            }}
          />
        </div>
        <div className='flex-1 px-4'>
          <div className='flex items-center justify-between mb-6'>
            <div className='inline-flex rounded-md'>
              <Button
                className='rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 p-3 bg-white'
                variant='outline'
                onClick={() => {
                  const date_type =
                    infoSearch?.type == 'month' ? 'this_month' : infoSearch?.type == 'week' ? 'this_week' : 'today';
                  setInfoSearch({ ...infoSearch, day: getTimeRangeTimestamp(date_type)?.start });
                }}
              >
                {t(infoSearch?.type == 'month' ? 'this_month' : infoSearch?.type == 'week' ? 'this_week' : 'today')}
              </Button>
              <Button
                className='rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 border-x-0 p-3 bg-white'
                variant='outline'
                onClick={() => {
                  const date_type =
                    infoSearch?.type == 'month' ? 'last_month' : infoSearch?.type == 'week' ? 'last_week' : 'yesterday';
                  setInfoSearch({ ...infoSearch, day: getTimeRangeTimestamp(date_type, infoSearch?.day)?.start });
                }}
              >
                {t('previous')}
              </Button>
              <Button
                className='rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 p-3 bg-white'
                variant='outline'
                onClick={() => {
                  const date_type =
                    infoSearch?.type == 'month' ? 'next_month' : infoSearch?.type == 'week' ? 'next_week' : 'tomorrow';
                  setInfoSearch({ ...infoSearch, day: getTimeRangeTimestamp(date_type, infoSearch?.day)?.start });
                }}
              >
                {t('next')}
              </Button>
            </div>
            <p className='text-base font-medium'>
              {infoSearch?.type === 'month'
                ? getMonthYear(infoSearch?.day)
                : infoSearch?.type === 'week'
                  ? getWeekRange(infoSearch?.day)
                  : formatFullDate(infoSearch?.day)}
            </p>
            <ToggleGroup
              variant='outline'
              className='inline-flex gap-0'
              type='single'
              value={infoSearch?.type}
              onValueChange={(value: 'month' | 'week' | 'day') => {
                setInfoSearch({ ...infoSearch, type: value });
              }}
            >
              <ToggleGroupItem value='month' className='rounded-r-none rounded-s-sm p-3 h-10 min-h-10'>
                {t('month')}
              </ToggleGroupItem>
              <ToggleGroupItem value='week' className='rounded-none border-x-0  p-3 h-10 min-h-10'>
                {t('week')}
              </ToggleGroupItem>
              <ToggleGroupItem value='day' className='rounded-l-none rounded-e-sm p-3 h-10 min-h-10'>
                {t('day')}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {infoSearch?.type === 'month' ? (
            <TableMonth data={data} day={infoSearch?.day} setShowDetail={setShowDetail} setSelectedId={setSelectedId} />
          ) : infoSearch?.type === 'week' ? (
            <TableWeek data={data} day={infoSearch?.day} setShowDetail={setShowDetail} setSelectedId={setSelectedId} />
          ) : (
            <div className='h-[calc(100vh-285px)] overflow-y-auto'>
              <TableDay
                data={data?.filter(
                  (item: any) => convertTimestampToString(item?.date) === convertTimestampToString(infoSearch?.day)
                )}
                setShowDetail={setShowDetail}
                setSelectedId={setSelectedId}
              />
            </div>
          )}
        </div>
      </div>
      <ModalDetailSchedule id={selectedId} show={showDetail} setShow={setShowDetail} />
    </div>
  );
};

export default StudySchedule;
