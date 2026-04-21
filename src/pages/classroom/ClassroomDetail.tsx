import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { NO_AVATAR, NO_IMAGE } from '@lib/ImageHelper';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import classroomServices from '@services/classroom';
import { Toast } from '@components/toast';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import { convertTimestampToString, getDayOfWeek } from '@lib/TimeHelper';
import { getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@components/ui/sheet';
import EmptyTable from '@components/empty/EmptyTable';
import { RiArrowLeftLine, RiDeleteBin6Line, RiEdit2Line } from '@remixicon/react';

const TABLE_SHELL =
  'w-full border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

interface Props {}

const ClassroomDetail = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [showDrawerStudents, setShowDrawerStudents] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'classroom_name,status,classroom_code,classroom_avatar,location_id,subject_id,lessons,start_date,end_date,schedules,students,updated_at,teaching_program,teacher_id,ta_id,user_ability,latest_attendance'
    };
    try {
      const { data }: any = await classroomServices.getClassroom(Number(id), params);
      setDetail(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await classroomServices.deleteClassroom(Number(id));
      Toast('success', response?.message);
      setIsShowConfirm(false);
      navigate('/classroom/list');
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };

  useEffect(() => {
    id && getDetail();
  }, [id]);

  const studentLinkClass =
    'cursor-pointer font-medium text-violet-700 underline-offset-2 transition-colors hover:text-violet-900 hover:underline';

  return (
    <div className='pb-24'>
      <Loading loading={loading} />
      <Confirm
        show={isShowConfirm}
        type='warning'
        onCancel={() => {
          setIsShowConfirm(false);
        }}
        onSuccess={handleDelete}
        description={t('txt_confirm_delete')}
      />
      <div className='mx-auto max-w-6xl'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <h3 className='text-xl font-semibold tracking-wide text-slate-800'>{t('detailed_info')}</h3>
            <div className='flex flex-wrap items-center gap-2'>
              {detail?.user_ability?.can_delete == 1 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  title={t('delete')}
                  onClick={() => {
                    setIsShowConfirm(true);
                  }}
                >
                  <RiDeleteBin6Line className='size-5' />
                </Button>
              )}
              {detail?.user_ability?.can_delete == 1 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  title={t('edit')}
                  onClick={() => {
                    navigate('/classroom/edit/' + id);
                  }}
                >
                  <RiEdit2Line className='size-5' />
                </Button>
              )}
            </div>
          </div>
          <div className='p-5 lg:p-6'>
            <div className='flex flex-col gap-8 lg:flex-row lg:gap-9'>
              <div className='mx-auto w-full max-w-[280px] shrink-0 lg:mx-0'>
                <div className='overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/40 p-4 shadow-sm'>
                  <div className='mb-3 overflow-hidden rounded-xl border border-violet-100 bg-white'>
                    <img
                      className='aspect-square w-full object-cover'
                      src={detail?.classroom_avatar || NO_IMAGE}
                      alt=''
                    />
                  </div>
                  <div className='space-y-2 text-center'>
                    <div className='text-sm font-semibold text-slate-800'>
                      {detail?.classroom_name} — {detail?.classroom_code}
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        detail.status == 1
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {detail.status == 1 ? t('active') : t('inactive')}
                    </span>
                  </div>
                </div>
              </div>
              <div className='min-w-0 flex-1 space-y-6'>
                <div className='flex flex-col gap-6 lg:flex-row'>
                  <div className='min-w-0 flex-1 lg:w-3/5'>
                    <div className='overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                      <div className='border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                        <h3 className='text-base font-semibold text-violet-900'>{t('class_info')}</h3>
                      </div>
                      <div className='p-5 lg:p-6'>
                        <div className='grid gap-y-4 text-sm'>
                          <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('class_name')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.classroom_name}</div>
                          </div>
                          <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('code')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.classroom_code}</div>
                          </div>
                          <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('location')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{getLocationInfo(detail?.location_id)?.location_name}</div>
                          </div>
                          <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('class_strength')}</div>
                            <div className='text-slate-400'>:</div>
                            <div>
                              <button type='button' className={studentLinkClass} onClick={() => setShowDrawerStudents(true)}>
                                {detail?.students?.length} {t('students').toLocaleLowerCase()}
                              </button>
                            </div>
                          </div>
                          <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('fixed_schedule')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='space-y-1 text-slate-800'>
                              <p className='font-medium text-emerald-700'>{detail?.fixed_schedule}</p>
                              {detail?.schedules
                                ?.filter((schedule: any) => schedule?.valid === 1)
                                ?.map((schedule: any, idx: number) => (
                                  <div key={idx}>
                                    {getDayOfWeek(schedule?.day_of_week)}: {schedule?.start_time} - {schedule?.end_time}
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('last_updated')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{convertTimestampToString(detail?.updated_at, 'right')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='min-w-0 lg:w-2/5'>
                    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                      <div className='border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                        <h3 className='text-base font-semibold text-violet-900'>{t('teaching_info')}</h3>
                      </div>
                      <div className='flex-1 p-5 lg:p-6'>
                        <div className='grid gap-y-4 text-sm'>
                          <div className='grid grid-cols-[100px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('subject')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {getSubjectInfo(detail?.subject_id)?.subject_name} (
                              {getSubjectInfo(detail?.subject_id)?.subject_code})
                            </div>
                          </div>
                          <div className='grid grid-cols-[100px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('program')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {detail?.teaching_program?.program_name} -{detail?.teaching_program?.lesson_count}{' '}
                              {t('period')} ({detail?.teaching_program?.program_code})
                            </div>
                          </div>
                          <div className='grid grid-cols-[100px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('class_progress')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {detail?.teaching_program?.updated_lesson_count ?? 0}/
                              {detail?.teaching_program?.lesson_count ?? 0} (
                              {(
                                (detail?.teaching_program?.updated_lesson_count ??
                                  0 / detail?.teaching_program?.lesson_count) * 100
                              ).toFixed(2)}
                              %)
                            </div>
                          </div>
                          <div className='grid grid-cols-[100px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('latest_attendance')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='capitalize text-slate-800'>
                              {convertTimestampToString(
                                detail?.latest_attendance?.attendance_time,
                                undefined,
                                'dddd, DD/MM/YYYY'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                    <h3 className='text-base font-semibold text-violet-900'>{t('responsible_teachers')}</h3>
                  </div>
                  <div className='p-5 lg:p-6'>
                    <div className='grid gap-y-4 text-sm'>
                      <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                        <div className='text-slate-500'>{t('teachers')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {getUserInfo(detail?.teacher_id)?.display_name} - {getUserInfo(detail?.teacher_id)?.username}
                        </div>
                      </div>
                      <div className='grid grid-cols-[130px_30px_1fr] gap-y-1'>
                        <div className='text-slate-500'>{t('teaching_assistant')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {getUserInfo(detail?.ta_id)?.display_name} - {getUserInfo(detail?.ta_id)?.username}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex justify-end pt-1'>
                  <Button
                    className='rounded-xl bg-emerald-500 px-6 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/classroom/list');
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
      <Sheet
        open={showDrawerStudents}
        onOpenChange={(open) => {
          setShowDrawerStudents(open);
        }}
      >
        <SheetContent className='flex !w-[min(100%,628px)] max-w-[628px] flex-col border-l border-violet-200 bg-white px-6 py-0 sm:max-w-[628px]'>
          <SheetHeader className='border-b border-violet-100 py-6'>
            <SheetTitle className='text-lg font-semibold text-violet-950'>{t('student_list')}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 overflow-y-auto py-6'>
            <div className='overflow-hidden rounded-2xl border border-violet-100'>
              <table className={TABLE_SHELL}>
                <thead>
                  <tr>
                    <th scope='col' className='bg-violet-100/80 text-violet-900'>
                      {t('number_order')}
                    </th>
                    <th scope='col' className='bg-violet-100/80 text-violet-900'>
                      {t('code_and_name')}
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white'>
                  {detail?.students?.length > 0 ? (
                    detail?.students?.map((item: any, index: number) => (
                      <tr
                        key={index}
                        className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/60'
                      >
                        <td className='text-slate-800'>{index + 1}</td>
                        <td>
                          <div className='flex items-center gap-3'>
                            <img
                              className='size-10 min-h-10 min-w-10 rounded-full object-cover ring-2 ring-violet-100'
                              src={item?.student_avatar || NO_AVATAR}
                              alt=''
                            />
                            <div className='text-left'>
                              <p className='text-sm font-medium text-slate-700'>{item?.student_code}</p>
                              <Link
                                to={`/user/student/detail/${item?.student_id}`}
                                target='_blank'
                                rel='noreferrer'
                                className='text-sm font-medium text-violet-700 underline-offset-2 hover:text-violet-900 hover:underline'
                              >
                                {item?.student_name}
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2}>
                        <EmptyTable />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClassroomDetail;
