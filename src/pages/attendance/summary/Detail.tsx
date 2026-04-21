import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { NO_AVATAR } from '@lib/ImageHelper';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import SelectInput from '@components/fields/SelectInput';
import CalendarCustom from '@components/calendarUI/index';
import attendanceServices from '@services/attendance';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { filter, isEmpty } from 'lodash';
import EmptyTable from '@components/empty/EmptyTable';
import { calculateTimeDifference, convertTo12HourFormat } from '@lib/TimeHelper';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import { roundNumber } from '@lib/JsHelper';
import { RiArrowLeftLine } from '@remixicon/react';

interface Props {}

const AttendanceSummaryDetail = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState([
    { value: 'attend_class', label: t('attend_class') },
    { value: 'absent', label: t('absent') },
    { value: 'exclude_lesson', label: t('exclude_lesson') },
    { value: 'no_deduction_class', label: t('no_deduction_class') }
  ]);
  const [filterBy, setFilterBy] = useState(null);
  const lesson_statuses = [
    { value: 1, label: t('attend_class') },
    { value: 2, label: t('absent') }
  ];

  const attitudes = [
    { value: 1, label: t('attitude_excellent') },
    { value: 2, label: t('attitude_good') },
    { value: 3, label: t('attitude_average') },
    { value: 4, label: t('attitude_poor') },
    { value: 5, label: t('poor_behavior') }
  ];

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'identity,attendance_code,timeline_id,classroom_id,subject_id,location_id,teaching_program_id,teaching_program,teaching_program_detail_number,teaching_program_detail,student_attendance,teacher_attendance,ta_attendance,admin_assigned_id,attendance_time,status,valid,created_at,updated_at'
    };
    try {
      const { data }: any = await attendanceServices.getAttendance(Number(id), params);
      setDetail({
        ...data,
        student_attendance: {
          ...data?.student_attendance,
          students: data?.student_attendance?.students?.map((student: any) => ({
            ...student,
            student_name: getUserInfo(student?.student_id)?.display_name
          }))
        }
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    id && getDetail();
  }, [id]);

  return (
    <>
      <div className='pb-28'>
        <div className='mx-auto max-w-6xl'>
          <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
            <div className='border-b border-violet-200 bg-violet-50 px-5 py-4'>
              <h3 className='text-xl font-semibold tracking-wide text-slate-800'>{t('attendance_summary')}</h3>
            </div>
            <div className='p-5 lg:p-6'>
              <div className='flex flex-col gap-8 lg:flex-row lg:gap-9'>
              <div className='w-full shrink-0 lg:w-[300px]'>
                <div className='mb-6 rounded-2xl border border-violet-100 bg-violet-50/50 p-3'>
                  <CalendarCustom value={detail?.attendance_time} className='px-2 pt-2 pb-0' />
                </div>
                <div className='space-y-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm'>
                  <div className='grid grid-cols-[110px_12px_1fr] gap-y-1 text-sm'>
                    <div className='text-slate-500'>{t('subject')}</div>
                    <div className='text-slate-400'>:</div>
                    <div className='text-slate-800'>
                      {' '}
                      {getSubjectInfo(detail?.subject_id)?.subject_name} -{' '}
                      {getSubjectInfo(detail?.subject_id)?.subject_code}
                    </div>
                  </div>
                  <div className='grid grid-cols-[110px_12px_1fr] gap-y-1 text-sm'>
                    <div className='text-slate-500'>{t('teaching_location')}</div>
                    <div className='text-slate-400'>:</div>
                    <div className='text-slate-800'>
                      {getLocationInfo(detail?.location_id)?.location_name} -{' '}
                      {getLocationInfo(detail?.location_id)?.location_code}
                    </div>
                  </div>
                  <div className='grid grid-cols-[110px_12px_1fr] gap-y-1 text-sm'>
                    <div className='text-slate-500'>{t('classroom')}</div>
                    <div className='text-slate-400'>:</div>
                    <div className='text-slate-800'>
                      {' '}
                      {getClassroomInfo(detail?.classroom_id)?.classroom_name} -{' '}
                      {getClassroomInfo(detail?.classroom_id)?.classroom_code}
                    </div>
                  </div>
                  <div className='grid grid-cols-[110px_12px_1fr] gap-y-1 text-sm'>
                    <div className='text-slate-500'>{t('period')}</div>
                    <div className='text-slate-400'>:</div>
                    <div className='text-slate-800'>
                      {detail?.teaching_program_detail?.lesson_name} -{' '}
                      {detail?.teaching_program_detail?.teaching_program_detail_code}
                    </div>
                  </div>
                </div>
              </div>
              <div className='min-w-0 flex-1 space-y-6'>
                <div className='w-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='p-5 lg:p-6'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('attendance_session_code')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='flex items-center gap-3'>
                          <p>{detail?.attendance_code}</p>
                          <div
                            className={`px-2 py-1 ${detail?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : detail?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                          >
                            {t(
                              detail?.status == 0
                                ? 'submitted_not_approved'
                                : detail?.status == 1
                                  ? 'approved'
                                  : 'canceled_not_approved'
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('teaching_program')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {detail?.teaching_program?.program_code} - {detail?.teaching_program?.program_name}
                        </div>
                      </div>
                      <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('period_order_in_program')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {' '}
                          {`${detail?.teaching_program_detail_number}/${detail?.teaching_program?.lesson_count} (${roundNumber((detail?.teaching_program_detail_number / detail?.teaching_program?.lesson_count) * 100)}%)`}
                        </div>
                      </div>
                      <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('responsible_admin')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {getUserInfo(detail?.admin_assigned_id)?.display_name} -{' '}
                          {getUserInfo(detail?.admin_assigned_id)?.username}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='w-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                    <h3 className='text-base font-semibold text-violet-900'>{t('lesson_content')}</h3>
                  </div>
                  <div className='p-5 lg:p-6'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-[350px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('lesson_title')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>{detail?.teaching_program_detail?.lesson_name}</div>
                      </div>

                      <div className='grid grid-cols-[350px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('lesson_content_youtube')}</div>
                        <div className='text-slate-400'>:</div>
                        <a
                          className='font-medium text-violet-700 underline hover:text-violet-900'
                          href={detail?.teaching_program_detail?.youtube_link}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {detail?.teaching_program_detail?.youtube_link}
                        </a>
                      </div>
                      <div className='grid grid-cols-[350px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('lesson_content_drive')}</div>
                        <div className='text-slate-400'>:</div>
                        <a
                          className='font-medium text-violet-700 underline hover:text-violet-900'
                          href={detail?.teaching_program_detail?.drive_link}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {detail?.teaching_program_detail?.drive_link}
                        </a>
                      </div>
                      <div className='grid grid-cols-[350px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('lesson_content_tiktok')}</div>
                        <div className='text-slate-400'>:</div>
                        <a
                          className='font-medium text-violet-700 underline hover:text-violet-900'
                          href={detail?.teaching_program_detail?.tiktok_link}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {detail?.teaching_program_detail?.tiktok_link}
                        </a>
                      </div>

                      <div className='grid grid-cols-[350px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('lesson_content')}</div>
                        <div className='text-slate-400'>:</div>
                        <div
                          className='text-sm text-slate-800'
                          dangerouslySetInnerHTML={{
                            __html: replaceNewlineWithBr(detail?.teaching_program_detail?.lesson_content)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='w-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='flex flex-wrap items-center gap-2 border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                    <h3 className='text-base font-semibold text-violet-900'>{t('teacher_working_time')}</h3>
                    {detail?.teacher_attendance && (
                      <div
                        className={`px-2 py-1 ${detail?.teacher_attendance?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : detail?.teacher_attendance?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                      >
                        {t(
                          detail?.teacher_attendance?.status == 0
                            ? 'submitted_not_approved'
                            : detail?.teacher_attendance?.status == 1
                              ? 'approved'
                              : 'canceled_not_approved'
                        )}
                      </div>
                    )}
                  </div>
                  <div className='p-5 lg:p-6'>
                    {isEmpty(detail?.teacher_attendance) ? (
                      <div className='w-full'>
                        <EmptyTable />
                      </div>
                    ) : (
                      <div className='flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8'>
                        <div className='w-full space-y-4 border-violet-100 lg:w-1/2 lg:border-r lg:pr-8'>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('teacher_name')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {getUserInfo(detail?.teacher_attendance?.teacher_id)?.display_name}
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('code')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{getUserInfo(detail?.teacher_attendance?.teacher_id)?.username}</div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('start')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{convertTo12HourFormat(detail?.teacher_attendance?.start_time)}</div>
                          </div>
                          {/* <div className='grid grid-cols-[150px_30px_1fr]'>
                            <div className='text-primary-neutral-600'>{t('timestamp_picture')}</div>
                            <div className='text-primary-neutral-600'>:</div>
                            <PhotoProvider>
                              <PhotoView src={detail?.teacher_attendance?.checkin_timestamp}>
                                <p className='text-primary-blue-500 underline cursor-pointer'>{t('checkin_image')}</p>
                              </PhotoView>
                            </PhotoProvider>
                          </div> */}
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('finish')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{convertTo12HourFormat(detail?.teacher_attendance?.end_time)}</div>
                          </div>
                          {/* <div className='grid grid-cols-[150px_30px_1fr]'>
                            <div className='text-primary-neutral-600'>{t('timestamp_picture')}</div>
                            <div className='text-primary-neutral-600'>:</div>
                            <PhotoProvider>
                              <PhotoView src={detail?.teacher_attendance?.checkout_timestamp}>
                                <p className='text-primary-blue-500 underline cursor-pointer'>{t('checkout_image')}</p>
                              </PhotoView>
                            </PhotoProvider>
                          </div> */}
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('total_minutes_taught')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {
                                calculateTimeDifference(
                                  detail?.teacher_attendance?.start_time,
                                  detail?.teacher_attendance?.end_time
                                )?.minutes
                              }
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('total_hours_taught')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {
                                calculateTimeDifference(
                                  detail?.teacher_attendance?.start_time,
                                  detail?.teacher_attendance?.end_time
                                )?.hours
                              }
                            </div>
                          </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-4'>
                            <div className='text-sm font-medium text-slate-600'>{t('personal_report_notes')} :</div>

                            <div
                              className='mt-1 text-sm text-slate-800'
                              dangerouslySetInnerHTML={{
                                __html: replaceNewlineWithBr(detail?.teacher_attendance?.note)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className='w-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='flex flex-wrap items-center gap-2 border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                    <h3 className='text-base font-semibold text-violet-900'>{t('teaching_assistant_working_time')} </h3>
                    {detail?.ta_attendance && (
                      <div
                        className={`px-2 py-1 ${detail?.ta_attendance?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : detail?.ta_attendance?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                      >
                        {t(
                          detail?.ta_attendance?.status == 0
                            ? 'submitted_not_approved'
                            : detail?.ta_attendance?.status == 1
                              ? 'approved'
                              : 'canceled_not_approved'
                        )}
                      </div>
                    )}
                  </div>
                  <div className='p-5 lg:p-6'>
                    {isEmpty(detail?.ta_attendance) ? (
                      <div className='w-full'>
                        <EmptyTable />
                      </div>
                    ) : (
                      <div className='flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8'>
                        <div className='w-full space-y-4 border-violet-100 lg:w-1/2 lg:border-r lg:pr-8'>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('teacher_name')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{getUserInfo(detail?.ta_attendance?.teacher_id)?.display_name}</div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('code')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{getUserInfo(detail?.ta_attendance?.teacher_id)?.username}</div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('start')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{convertTo12HourFormat(detail?.ta_attendance?.start_time)}</div>
                          </div>
                          {/* <div className='grid grid-cols-[150px_30px_1fr]'>
                            <div className='text-primary-neutral-600'>{t('timestamp_picture')}</div>
                            <div className='text-primary-neutral-600'>:</div>
                            <PhotoProvider>
                              <PhotoView src={detail?.ta_attendance?.checkin_timestamp}>
                                <p className='text-primary-blue-500 underline cursor-pointer'>{t('checkin_image')}</p>
                              </PhotoView>
                            </PhotoProvider>
                          </div> */}
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('finish')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{convertTo12HourFormat(detail?.ta_attendance?.end_time)}</div>
                          </div>
                          {/* <div className='grid grid-cols-[150px_30px_1fr]'>
                            <div className='text-primary-neutral-600'>{t('timestamp_picture')}</div>
                            <div className='text-primary-neutral-600'>:</div>
                            <PhotoProvider>
                              <PhotoView src={detail?.ta_attendance?.checkout_timestamp}>
                                <p className='text-primary-blue-500 underline cursor-pointer'>{t('checkout_image')}</p>
                              </PhotoView>
                            </PhotoProvider>
                          </div> */}
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('total_minutes_taught')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {
                                calculateTimeDifference(
                                  detail?.ta_attendance?.start_time,
                                  detail?.ta_attendance?.end_time
                                )?.minutes
                              }
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                            <div className='text-slate-500'>{t('total_hours_taught')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {
                                calculateTimeDifference(
                                  detail?.ta_attendance?.start_time,
                                  detail?.ta_attendance?.end_time
                                )?.hours
                              }
                            </div>
                          </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-4'>
                            <div className='text-sm font-medium text-slate-600'>{t('personal_report_notes')} :</div>

                            <div
                              className='mt-1 text-sm text-slate-800'
                              dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(detail?.ta_attendance?.note) }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className='w-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='flex flex-col gap-3 border-b border-violet-100 bg-violet-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3 className='text-base font-semibold text-violet-900'>{t('student_list')}</h3>
                      {detail?.student_attendance && (
                        <div
                          className={`px-2 py-1 ${detail?.student_attendance?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : detail?.student_attendance?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                        >
                          {t(
                            detail?.student_attendance?.status == 0
                              ? 'submitted_not_approved'
                              : detail?.student_attendance?.status == 1
                                ? 'approved'
                                : 'canceled_not_approved'
                          )}
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
                      <div className='w-full min-w-0 sm:w-[280px] lg:w-[360px]'>
                        <SearchInput
                          placeholder={t('search')}
                          className='w-full'
                          value={search}
                          onChange={(value) => {
                            setSearch(value);
                          }}
                        />
                      </div>

                      <div className='w-full sm:w-56'>
                        <SelectInput
                          placeholder={t('filter_status')}
                          options={filterStatus}
                          isClearable
                          value={filterStatus.find((v) => v?.value === filterBy) ?? null}
                          onChange={(value) => {
                            setFilterBy(value?.value);
                          }}
                        />
                      </div>
                      <div className='flex h-10 items-center whitespace-nowrap rounded-xl border border-violet-200 bg-white px-4 text-sm text-slate-600 shadow-sm'>
                        {t('total')}:{' '}
                        <span className='ms-2 font-semibold text-violet-700'>
                          {detail?.student_attendance?.students?.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='divide-y divide-violet-100'>
                    {detail?.student_attendance?.students
                      ?.filter((student: any) => {
                        if (search) {
                          return student?.student_name?.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
                        } else return true;
                      })
                      ?.filter((student: any) => {
                        if (filterBy === 'attend_class') return student?.status === 1;
                        if (filterBy === 'absent') return student?.status === 2;
                        if (filterBy === 'exclude_lesson') return student?.counted === 1;
                        if (filterBy === 'no_deduction_class') return student?.counted === 0;
                        return true;
                      })
                      ?.map((student: any) => {
                        return (
                          <div
                            className='flex flex-col gap-4 p-5 transition-colors hover:bg-violet-50/40 lg:flex-row lg:items-start'
                            key={student?.student_id}
                          >
                            <div className='flex w-full max-w-full gap-4 border-violet-100 lg:w-max lg:border-r lg:pr-8'>
                              <div className='w-[143px] h-[155px]'>
                                <img
                                  className='object-cover w-full rounded-lg'
                                  src={getUserInfo(student?.student_id)?.avatar || NO_AVATAR}
                                  alt=''
                                />
                              </div>
                              <div className='min-w-0 flex-1 space-y-3'>
                                <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                                  <div className='text-slate-500'>{t('student_name')}</div>
                                  <div className='text-slate-400'>:</div>
                                  <div className='text-slate-800'>
                                    {' '}
                                    {getUserInfo(student?.student_id)?.display_name} -{' '}
                                    {getUserInfo(student?.student_id)?.username}
                                  </div>
                                </div>
                                <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                                  <div className='text-slate-500'>{t('lesson_status')}</div>
                                  <div className='text-slate-400'>:</div>
                                  <div className='text-slate-800'>
                                    {lesson_statuses?.find((s) => s?.value == student?.status)?.label}
                                  </div>
                                </div>
                                <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                                  <div className='text-slate-500'>{t('academic_grading')}</div>
                                  <div className='text-slate-400'>:</div>
                                  <div className='text-slate-800'>{student?.point}</div>
                                </div>
                                <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                                  <div className='text-slate-500'>{t('attitude_evaluation')}</div>
                                  <div className='text-slate-400'>:</div>
                                  <div className='text-slate-800'>
                                    {' '}
                                    {attitudes?.find((s) => s?.value == student?.attitude)?.label}
                                  </div>
                                </div>
                                <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                                  <div className='text-slate-500'>{t('exclude_lesson')}</div>
                                  <div className='text-slate-400'>:</div>
                                  <div className='text-slate-800'>{t(student?.counted == 1 ? 'yes' : 'no')}</div>
                                </div>
                              </div>
                            </div>
                            <div className='min-w-0 flex-1 lg:pl-4'>
                              <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-4'>
                                <div className='text-sm font-medium text-slate-600'>{t('message_to_parents')} :</div>
                                <div
                                  className='mt-1 text-sm text-slate-800'
                                  dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(student?.message) }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className='flex justify-end pt-2'>
                  <Button
                    className='rounded-xl bg-emerald-500 px-6 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/attendance/summary/list');
                    }}
                  >
                    <RiArrowLeftLine className='size-4' />
                    {t('close')}
                  </Button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/95 p-3 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 md:gap-4'>
          <div className='flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-900'>
            {t('attend_class')}
            <span className='rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-emerald-800 shadow-sm'>
              {filter(detail?.student_attendance?.students, (item) => [1].includes(item?.status))?.length}/
              {detail?.student_attendance?.students?.length || 0} (
              {roundNumber(
                (filter(detail?.student_attendance?.students, (item) => [1].includes(item?.status))?.length /
                  detail?.student_attendance?.students?.length) *
                  100 || 0
              )}
              %)
            </span>
          </div>
          <div className='flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-900'>
            {t('absent')}
            <span className='rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-sm'>
              {filter(detail?.student_attendance?.students, (item) => [2].includes(item?.status))?.length}/
              {detail?.student_attendance?.students?.length || 0} (
              {roundNumber(
                (filter(detail?.student_attendance?.students, (item) => [2].includes(item?.status))?.length /
                  detail?.student_attendance?.students?.length) *
                  100 || 0
              )}
              %)
            </span>
          </div>
          <div className='flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-sm text-rose-900'>
            {t('_exclude_lesson')}
            <span className='rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-rose-800 shadow-sm'>
              {filter(detail?.student_attendance?.students, (item) => item?.counted == 1)?.length}/
              {detail?.student_attendance?.students?.length || 0} (
              {roundNumber(
                (filter(detail?.student_attendance?.students, (item) => item?.counted == 1)?.length /
                  detail?.student_attendance?.students?.length) *
                  100 || 0
              )}
              %)
            </span>
          </div>
          <div className='flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-900'>
            {t('_no_deduction_class')}
            <span className='rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-emerald-800 shadow-sm'>
              {filter(detail?.student_attendance?.students, (item) => item?.counted !== 1)?.length}/
              {detail?.student_attendance?.students?.length || 0} (
              {roundNumber(
                (filter(detail?.student_attendance?.students, (item) => item?.counted !== 1)?.length /
                  detail?.student_attendance?.students?.length) *
                  100 || 0
              )}
              %)
            </span>
          </div>
          <div className='flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-sm text-violet-900'>
            {t('status')}
            <span className='rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-violet-800 shadow-sm'>
              {t(
                detail?.status == 0
                  ? 'submitted_not_approved'
                  : detail?.status == 1
                    ? 'approved'
                    : 'canceled_not_approved'
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceSummaryDetail;
