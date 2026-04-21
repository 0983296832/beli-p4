import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import {
  AVATAR,
  EDIT_02,
  GRID_VIEW_BLACK,
  GRID_VIEW_WHITE,
  LAYOUT_TABLE_01_BLACK,
  LAYOUT_TABLE_01_WHITE,
  LIST_ICON
} from '@lib/ImageHelper';
import { Link, useNavigate, useParams } from 'react-router-dom';
import classroomServices from '@services/classroom';
import Loading from '@components/loading';
import { Button } from '@components/ui/button';
import DateInput from '@components/fields/DateInput';
import TableWeek from '../StudySchedule/TableWeek';
import {
  convertStringToUnixTimeStamp,
  convertTimestampToString,
  convertTo12HourFormat,
  formatUnixToHHMM,
  getCurrentTimestamp,
  getDayOfWeek
} from '@lib/TimeHelper';
import Icon from '@components/Icon/index';
import EmptyTable from '@components/empty/EmptyTable';
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog';
import TextInput from '@components/fields/TextInput';
import { TypeErrors } from '@/src/interface';
import TimeInput from '@components/fields/TimeInput';
import { AlertDialog, AlertDialogContent, AlertDialogHeader } from '@components/ui/alert-dialog';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import { mergeObjects } from '@lib/JsHelper';
import scheduleServices from '@services/schedule';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { Toast } from '@components/toast';
import { useRootStore } from '@store/index';
import dayjs from 'dayjs';
import { USER_ROLE } from '@constants/index';
import { cloneDeep } from 'lodash';

interface Props {}

const ModalSetting = ({ schedule, show, setShow, onUpdate, errors, setErrors }: any) => {
  const { t } = useT();
  const [formData, setFormData] = useState<any>({});
  const [tempData, setTempData] = useState<any>({});

  useEffect(() => {
    if (show) {
      setFormData({
        date: schedule?.date,
        start_time: convertStringToUnixTimeStamp(schedule?.start_time),
        end_time: convertStringToUnixTimeStamp(schedule?.end_time)
      });
    }
    setTempData(cloneDeep(schedule));
  }, [show]);

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent className='rounded-lg border-none gap-0 p-0 max-w-[1200px] overflow-hidden bg-white'>
        <AlertDialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
          <div>{t('detail_schedule')}</div>
        </AlertDialogHeader>
        <div className='p-6 space-y-4 bg-white max-h-[calc(100vh-250px)] overflow-y-auto'>
          <div className='flex items-center gap-6 mb-4'>
            <div className='w-1/2'>
              <TextInput label={t('_period_order')} value={schedule?.teaching_program_detail_number} disabled />
            </div>
            <div className='w-1/2'>
              <DateInput
                label={t('lesson_apply_date')}
                value={formData?.date}
                error={errors?.date}
                onChange={(value) => {
                  setFormData({ ...formData, date: value });
                  setTempData({ ...tempData, date: value });
                  setErrors({ ...errors, date: '' });
                }}
              />
            </div>
          </div>
          <div className='flex items-center gap-6 mb-6'>
            <div className='w-1/2'>
              <TimeInput
                label={t('start_time')}
                value={formData?.start_time}
                error={errors?.start_time}
                onChange={(value) => {
                  setFormData({ ...formData, start_time: value });
                  setTempData({ ...tempData, start_time: formatUnixToHHMM(value as number) });
                  setErrors({ ...errors, start_time: '' });
                }}
              />
            </div>
            <div className='w-1/2'>
              <TimeInput
                label={t('end_time')}
                value={formData?.end_time}
                error={errors?.end_time}
                onChange={(value) => {
                  setFormData({ ...formData, end_time: value });
                  setTempData({ ...tempData, end_time: formatUnixToHHMM(value as number) });
                  setErrors({ ...errors, end_time: '' });
                }}
              />
            </div>
          </div>
          <p className='text-lg font-semibold'>{t('preview')}</p>
          <table className='mt-5 table-rounded '>
            <thead>
              <tr className='bg-primary-blue-50'>
                <th scope='col'>{t('lesson_info')}</th>
                <th scope='col'>{t('lesson_apply_date')}</th>
                <th scope='col'>
                  {t('start_time')}
                  <br />
                  {t('end_time')}
                </th>
                <th scope='col'>{t('day_of_week')}</th>
                <th scope='col'>{t('type')}</th>
                <th scope='col'>{t('status')}</th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              <tr>
                <td className='text-left'>
                  <p>{tempData?.teaching_program_detail?.teaching_program_detail_code}</p>

                  <p>{tempData?.teaching_program_detail?.lesson_name}</p>
                </td>
                <td>{convertTimestampToString(tempData?.date)}</td>
                <td>
                  {convertTo12HourFormat(tempData?.start_time)} - {convertTo12HourFormat(tempData?.end_time)}
                </td>
                <td>{getDayOfWeek(tempData?.day_of_week)}</td>
                <td>
                  <div className='flex items-center justify-center'>
                    {tempData?.type == 1 ? (
                      <div className='bg-[#E4FFE9] py-1 px-2 rounded-full w-max'>
                        <p className='text-primary-success'>{t('by_fixed_schedule')}</p>
                      </div>
                    ) : (
                      <div className='bg-[#FEEDEC] py-1 px-2 rounded-full w-max'>
                        <p className='text-primary-error'>{t('by_cover_schedule')}</p>
                      </div>
                    )}
                  </div>
                </td>
                <td className='space-y-1 text-center whitespace-nowrap'>
                  {tempData?.status == 0 ? (
                    <>
                      <p>{t('expected')}</p>
                    </>
                  ) : (
                    <>
                      <p>{t('attendance_approved')}</p>
                      <p>({t('cannot_change')})</p>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='flex items-center justify-end p-3 gap-6'>
          <Button
            variant='default'
            className='px-8 bg-[#FEEDEC] text-primary-error hover:bg-[#FEEDEC]'
            onClick={() => {
              setShow(false);
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            variant='default'
            className='px-8'
            onClick={() => {
              onUpdate({
                date: formData?.date,
                start_time: dayjs.unix(formData?.start_time).format('HH:mm'),
                end_time: dayjs.unix(formData?.end_time).format('HH:mm')
              });
            }}
          >
            {t('save')}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ClassroomSetting = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'table_view' | 'list_view'>('list_view');
  const [detail, setDetail] = useState<any>({ schedules: [] });
  const [loading, setLoading] = useState(false);
  const [infoSearch, setInfoSearch] = useState({ day: getCurrentTimestamp() });
  const [showDetail, setShowDetail] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [schedules, setSchedules] = useState<any>([]);
  const [scheduleDetail, setScheduleDetail] = useState<any>({});
  const { currentUser } = useRootStore();
  const [errors, setErrors] = useState<TypeErrors>({});

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'classroom_name,classroom_code,classroom_avatar,location_id,subject_id,lessons,start_date,end_date,schedules,students,updated_at,teaching_program'
    };
    try {
      const { data }: any = await classroomServices.getClassroom(Number(id), params);
      setDetail(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getDataSchedule = async (filters?: object) => {
    let params = {
      fields:
        'identity,teaching_program_id,r_classroom,students,count_total_lessons,day_of_week,classroom_id,type,classroom_schedule_id,cover_schedule_id,teaching_program_detail_number,teaching_program_detail,date,start_time,end_time,status,user_ability,created_at,updated_at,date',
      limit: 1000,
      search: '',
      filterings: {
        classroom_id: Number(id)
      },
      sort: 'teaching_program_detail_number',
      direction: 'asc'
    };

    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await scheduleServices.getSchedules(params);
      setSchedules(response?.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSchedule = async (body: any) => {
    setLoading(true);
    try {
      const res: any = await scheduleServices.putSchedule(scheduleDetail?.id, body);
      Toast('success', res?.message);
      setLoading(false);
      getDetail();
      getDataSchedule();
      setShowEdit(false);
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number(id)) {
      getDetail();
      getDataSchedule();
    }
  }, [id]);

  return (
    <div>
      <Loading loading={loading} />
      <div className='rounded-lg border bg-white shadow-lg'>
        <div className='px-4 py-6 border-b'>
          <p className='text-lg font-semibold'>{t('set_schedule')}</p>
        </div>
        <div className='p-4'>
          <div className='border rounded-lg'>
            <div className='p-4 border-b'>
              <p className='text-lg font-semibold'>{t('class_info')}</p>
            </div>
            <div className='p-4 '>
              <div className='grid grid-cols-[300px_30px_1fr] mb-4'>
                <div className='text-primary-neutral-600 text-base'>{t('location')}</div>
                <div className='text-primary-neutral-600 text-base'>:</div>
                <div className='flex items-center gap-2 text-sm'>
                  <p>{getLocationInfo(detail?.location_id)?.location_name}</p>
                  <p>{getLocationInfo(detail?.location_id)?.location_code}</p>
                </div>
              </div>
              <div className='grid grid-cols-[300px_30px_1fr] mb-4'>
                <div className='text-primary-neutral-600 text-base'>{t('classroom')}</div>
                <div className='text-primary-neutral-600 text-base'>:</div>
                <div className='text-sm'>
                  {detail?.classroom_name} - {detail?.classroom_code}
                </div>
              </div>
              <div className='grid grid-cols-[300px_30px_1fr] mb-4'>
                <div className='text-primary-neutral-600 text-base'>{t('subject')}</div>
                <div className='text-primary-neutral-600 text-base'>:</div>
                <div className='flex items-center gap-2 text-sm'>
                  <p>{getSubjectInfo(detail?.subject_id)?.subject_name}</p>
                  <p>{getSubjectInfo(detail?.subject_id)?.subject_code}</p>
                </div>
              </div>
              <div className='grid grid-cols-[300px_30px_1fr] mb-4'>
                <div className='text-primary-neutral-600 text-base'>{t('current_program_code')}</div>
                <div className='text-primary-neutral-600 text-base'>:</div>
                <div className='text-sm'>{detail?.teaching_program?.program_code}</div>
              </div>
              <div className='grid grid-cols-[300px_30px_1fr]'>
                <div className='text-primary-neutral-600 text-base'>{t('current_program_name')}</div>
                <div className='text-primary-neutral-600 text-base'>:</div>
                <div className='text-sm'>
                  {detail?.teaching_program?.program_name} - {detail?.teaching_program?.lesson_count} {t('period')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='px-4 mb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex gap-3'>
              <Button
                className={`${activeTab === 'table_view' ? '' : 'bg-primary-neutral-50 border-primary-neutral-200'}`}
                variant={activeTab === 'table_view' ? 'default' : 'outline'}
                onClick={() => setActiveTab('table_view')}
              >
                <img src={activeTab === 'table_view' ? LAYOUT_TABLE_01_WHITE : LAYOUT_TABLE_01_BLACK} alt='' />
                {t('table_view')}
              </Button>
              <Button
                className={`${activeTab === 'list_view' ? '' : 'bg-primary-neutral-50 border-primary-neutral-200'}`}
                variant={activeTab === 'list_view' ? 'default' : 'outline'}
                onClick={() => setActiveTab('list_view')}
              >
                <Icon
                  icon={LIST_ICON}
                  className={`${activeTab === 'list_view' ? 'text-white' : 'text-primary-neutral-900'}`}
                />
                List view
              </Button>
            </div>
            <div>
              <DateInput
                type='button'
                value={infoSearch?.day}
                onChange={(value) => {
                  setInfoSearch({ ...infoSearch, day: value ?? 0 });
                }}
              />
            </div>
          </div>
        </div>
        <div className='p-4 pt-0'>
          {activeTab == 'table_view' ? (
            <div>
              <TableWeek
                className='h-[calc(100vh-500px)]'
                data={schedules}
                day={infoSearch?.day}
                setShowDetail={setShowDetail}
                setSelectedId={setSelectedId}
              />
            </div>
          ) : (
            <div className='h-[calc(100vh-500px)] overflow-auto'>
              {schedules?.length > 0 ? (
                schedules?.map((schedule: any, index: number) => {
                  return (
                    <div className='flex h-max border '>
                      <div className='flex items-center justify-center w-[400px] border-r'>
                        {getDayOfWeek(schedule?.day_of_week)}, {convertTimestampToString(schedule?.date)}
                      </div>
                      <div className='flex-1 p-4 bg-[#AC398D]/15 text-[#AC398D]'>
                        <p className='text-sm font-medium mb-1'>
                          {convertTo12HourFormat(schedule?.start_time)} - {convertTo12HourFormat(schedule?.end_time)}
                        </p>
                        <p className='text-sm font-semibold mb-1 line-clamp-2'>
                          {getSubjectInfo(detail?.subject_id)?.subject_name}- {detail?.classroom_name}
                        </p>
                        <p className='text-sm font-medium mb-1 line-clamp-2'>
                          {getLocationInfo(detail?.location_id)?.location_name}
                        </p>
                        <p className='text-sm font-medium mb-1 line-clamp-2'>{schedule?.teaching_program?.title}</p>
                        <p className='text-sm font-medium mb-1'>
                          {t('period')}:{' '}
                          <a
                            href={schedule?.teaching_program_detail?.drive_link}
                            target='_blank'
                            className=' underline'
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
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyTable />
              )}
            </div>
          )}
        </div>
      </div>
      <div className='rounded-lg border bg-white mt-6 shadow-lg'>
        <div className='px-4 py-6 border-b mb-6'>
          <p className='text-lg font-semibold'>{t('lesson_schedule_list')}</p>
        </div>
        <div className='mt-5 p-4'>
          <table className='  table-rounded '>
            <thead>
              <tr className='bg-primary-blue-50'>
                <th scope='col'>{t('lesson_info')}</th>
                <th scope='col'>{t('lesson_apply_date')}</th>
                <th scope='col'>
                  {t('start_time')}
                  <br />
                  {t('end_time')}
                </th>
                <th scope='col'>{t('day_of_week')}</th>
                <th scope='col'>{t('type')}</th>
                <th scope='col'>{t('status')}</th>
                <th scope='col' className='whitespace-nowrap w-[1%]'>
                  {t('action')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {schedules.map((schedule: any, index: number) => (
                <tr key={index}>
                  <td className='text-left'>
                    <p>{schedule?.teaching_program_detail?.teaching_program_detail_code}</p>

                    <p>{schedule?.teaching_program_detail?.lesson_name}</p>
                  </td>
                  <td>{convertTimestampToString(schedule?.date)}</td>
                  <td>
                    {convertTo12HourFormat(schedule?.start_time)} - {convertTo12HourFormat(schedule?.end_time)}
                  </td>
                  <td>{getDayOfWeek(schedule?.day_of_week)}</td>
                  <td>
                    <div className='flex items-center justify-center'>
                      {schedule?.type == 1 ? (
                        <div className='bg-[#E4FFE9] py-1 px-2 rounded-full w-max'>
                          <p className='text-primary-success'>{t('by_fixed_schedule')}</p>
                        </div>
                      ) : (
                        <div className='bg-[#FEEDEC] py-1 px-2 rounded-full w-max'>
                          <p className='text-primary-error'>{t('by_cover_schedule')}</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className='space-y-1 text-center whitespace-nowrap'>
                    {schedule?.status == 0 ? (
                      <>
                        <p>{t('expected')}</p>
                      </>
                    ) : (
                      <>
                        <p>{t('attendance_approved')}</p>
                        <p>({t('cannot_change')})</p>
                      </>
                    )}
                  </td>

                  <td className='whitespace-nowrap w-[1%]'>
                    {schedule?.status == 0 && (
                      <div className='flex items-center justify-center'>
                        <img
                          src={EDIT_02}
                          className='cursor-pointer'
                          alt=''
                          onClick={() => {
                            setShowEdit(true);
                            setScheduleDetail(schedule);
                          }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent
          className='rounded-lg border-none gap-0 p-0 max-w-[1200px] overflow-hidden bg-white'
          showCloseButton={false}
        >
          <DialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
            <div>{t('detail_schedule')}</div>
          </DialogHeader>
          <div className='p-6 space-y-4 bg-white max-h-[calc(100vh-250px)] overflow-y-auto'>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('event_name')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {
                  getSubjectInfo(schedules.find((schedule: any) => schedule?.id == selectedId)?.r_classroom?.subject_id)
                    ?.subject_name
                }
              </div>
            </div>
            {currentUser?.user_job_title !== USER_ROLE.STUDENT && (
              <>
                <div className='grid grid-cols-[320px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('period_order')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {' '}
                    {schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail_number}/
                    {schedules.find((schedule: any) => schedule?.id == selectedId)?.count_total_lessons}
                  </div>
                </div>
              </>
            )}

            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('start_time')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {schedules.find((schedule: any) => schedule?.id == selectedId)?.start_time}{' '}
                {convertTimestampToString(schedules.find((schedule: any) => schedule?.id == selectedId)?.date)}
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('end_time')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {schedules.find((schedule: any) => schedule?.id == selectedId)?.end_time}{' '}
                {convertTimestampToString(schedules.find((schedule: any) => schedule?.id == selectedId)?.date)}
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('location')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {
                  getLocationInfo(
                    schedules.find((schedule: any) => schedule?.id == selectedId)?.r_classroom?.location_id
                  )?.location_name
                }
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('classroom')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {
                  getClassroomInfo(schedules.find((schedule: any) => schedule?.id == selectedId)?.classroom_id)
                    ?.classroom_name
                }
              </div>
            </div>
            {currentUser?.user_job_title !== USER_ROLE.STUDENT && (
              <>
                <div className='grid grid-cols-[320px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('teachers')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {
                      getUserInfo(
                        schedules.find((schedule: any) => schedule?.id == selectedId)?.r_classroom?.teacher_id
                      )?.display_name
                    }{' '}
                    -{' '}
                    {
                      getUserInfo(
                        schedules.find((schedule: any) => schedule?.id == selectedId)?.r_classroom?.teacher_id
                      )?.username
                    }
                  </div>
                </div>
                <div className='grid grid-cols-[320px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('teaching_assistant')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {
                      getUserInfo(schedules.find((schedule: any) => schedule?.id == selectedId)?.r_classroom?.ta_id)
                        ?.display_name
                    }{' '}
                    -{' '}
                    {
                      getUserInfo(schedules.find((schedule: any) => schedule?.id == selectedId)?.r_classroom?.ta_id)
                        ?.username
                    }
                  </div>
                </div>
              </>
            )}

            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('lesson_title')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail?.lesson_name}
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('lesson_content_youtube')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <a
                className='underline text-primary-blue-600'
                href={
                  schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail?.youtube_link
                }
                target='_blank'
              >
                {schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail?.youtube_link}
              </a>
            </div>
            {currentUser?.user_job_title != USER_ROLE.STUDENT && (
              <>
                <div className='grid grid-cols-[320px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('lesson_content_drive')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <a
                    className='underline text-primary-blue-600'
                    href={
                      schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail?.drive_link
                    }
                    target='_blank'
                  >
                    {schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail?.drive_link}
                  </a>
                </div>
              </>
            )}

            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('lesson_content_tiktok')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <a
                className='underline text-primary-blue-600'
                href={
                  schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail?.tiktok_link
                }
                target='_blank'
              >
                {schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail?.tiktok_link}
              </a>
            </div>

            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('lesson_content')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div
                className=''
                dangerouslySetInnerHTML={{
                  __html: replaceNewlineWithBr(
                    schedules.find((schedule: any) => schedule?.id == selectedId)?.teaching_program_detail
                      ?.lesson_content
                  )
                }}
              />
            </div>
          </div>
          <div className='flex items-center justify-end p-3'>
            <Button
              variant='default'
              className='px-8'
              onClick={() => {
                setShowDetail(false);
              }}
            >
              {t('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ModalSetting
        show={showEdit}
        setShow={setShowEdit}
        schedule={scheduleDetail}
        onUpdate={handleChangeSchedule}
        errors={errors}
        setErrors={setErrors}
      />
    </div>
  );
};

export default ClassroomSetting;
