import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { NO_AVATAR } from '@lib/ImageHelper';
import { useNavigate, useParams } from 'react-router-dom';
import studentServices from '@services/student';
import { convertTimestampToString } from '@lib/TimeHelper';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import Loading from '@components/loading';
import { Toast } from '@components/toast';
import Confirm from '@components/confirm';
import { getClassroomInfo } from '@lib/GetInfoHelper';
import DrawerStatistic from '@components/DrawerStatistic/index';
import {
  RiArrowLeftLine,
  RiBarChart2Line,
  RiCalendarCheckLine,
  RiCalendarLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFileTextLine,
  RiMailLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiUser3Line,
  RiUserLine
} from '@remixicon/react';

interface Props {}

const StudentDetail = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [statisticInfo, setStatisticInfo] = useState<any>({
    show: false,
    extraFilter: {},
    type: '',
    objectId: 0
  });

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'user_id,age,province_name,district_name,ward_name,username,user_job_title,description,email,phone,display_name,avatar,birthday,gender,verify_code,verify_status,status,valid,role_id,created_at,updated_at,address,working_status,province_id,district_id,ward_id,manager_statistic,user_ability,latest_attendance_time'
    };
    try {
      const res: any = await studentServices.getStudent(Number(id), params);
      setDetail(res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await studentServices.deleteStudent(Number(id));
      Toast('success', response?.message);
      setIsShowConfirm(false);
      navigate('/user/student/list');
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };

  useEffect(() => {
    id && getDetail();
  }, [id]);

  const addressLine =
    detail?.address || detail?.ward_name || detail?.district_name || detail?.province_name
      ? `${detail?.address} ${detail?.ward_name} ${detail?.district_name} ${detail?.province_name}`
      : t('not_updated');

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

      <div className='mx-auto w-full max-w-6xl space-y-4'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='min-w-0'>
              <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>{t('student_detail')}</p>
              <h1 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                {detail?.display_name || '—'}
              </h1>
              <p className='mt-0.5 truncate text-sm text-slate-600'>{detail?.username}</p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                title={t('delete')}
                size='icon'
                className='rounded-xl border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                onClick={() => {
                  setIsShowConfirm(true);
                }}
              >
                <RiDeleteBin6Line className='size-4' />
              </Button>
              <Button
                type='button'
                variant='outline'
                title={t('edit')}
                size='icon'
                className='rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                onClick={() => {
                  navigate('/user/student/edit/' + id);
                }}
              >
                <RiEdit2Line className='size-4' />
              </Button>
            </div>
          </div>

          <div className='p-5 lg:p-6'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
              <aside className='w-full shrink-0 lg:w-72'>
                <div className='rounded-2xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm'>
                  <div className='overflow-hidden rounded-xl border border-white bg-white shadow-inner'>
                    <img
                      className='aspect-square w-full object-cover'
                      src={detail.avatar || NO_AVATAR}
                      alt=''
                    />
                  </div>
                  <div className='mt-4 space-y-2 text-center lg:text-left'>
                    <div className='flex flex-wrap items-center justify-center gap-2 lg:justify-start'>
                      <span className='inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800'>
                        <RiUser3Line className='size-3.5' />
                        {detail?.username}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          detail.working_status == 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {detail.working_status == 1 ? t('active') : t('inactive')}
                      </span>
                    </div>
                    <p className='text-sm font-medium text-slate-800'>{detail?.display_name}</p>
                  </div>
                </div>
              </aside>

              <div className='min-w-0 flex-1 space-y-4'>
                <div className='grid gap-4 lg:grid-cols-12'>
                  <section className='rounded-2xl border border-violet-200 bg-white lg:col-span-7'>
                    <div className='flex items-center gap-2 border-b border-violet-100 bg-violet-50/80 px-4 py-3'>
                      <RiUserLine className='size-5 text-violet-600' />
                      <h2 className='text-sm font-semibold text-violet-900'>{t('personal_info')}</h2>
                    </div>
                    <div className='divide-y divide-violet-100 p-4 text-sm'>
                      <div className='grid grid-cols-1 gap-1 py-3 first:pt-0 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='font-medium text-slate-500'>{t('admin_name')}</span>
                        <span className='text-slate-800'>{detail?.display_name}</span>
                      </div>
                      <div className='grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='font-medium text-slate-500'>{t('code')}</span>
                        <span className='text-slate-800'>{detail?.username}</span>
                      </div>
                      <div className='grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='inline-flex items-center gap-1 font-medium text-slate-500'>
                          <RiCalendarLine className='size-4 text-violet-500' />
                          {t('date_of_birth')}
                        </span>
                        <span className='text-slate-800'>
                          {convertTimestampToString(detail?.birthday) || t('not_updated')}
                        </span>
                      </div>
                      <div className='grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='font-medium text-slate-500'>{t('gender')}</span>
                        <span className='text-slate-800'>
                          {detail?.gender === 1 ? t('male') : t('female')}
                        </span>
                      </div>
                      <div className='grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='font-medium text-slate-500'>{t('age')}</span>
                        <span className='text-slate-800'>{detail?.age || t('not_updated')}</span>
                      </div>
                      <div className='grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='inline-flex items-center gap-1 font-medium text-slate-500'>
                          <RiPhoneLine className='size-4 text-amber-600' />
                          {t('phone')}
                        </span>
                        <span className='text-slate-800'>{detail?.phone || t('not_updated')}</span>
                      </div>
                      <div className='grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='inline-flex items-center gap-1 font-medium text-slate-500'>
                          <RiMailLine className='size-4 text-amber-600' />
                          {t('email')}
                        </span>
                        <span className='break-all text-slate-800'>{detail?.email || t('not_updated')}</span>
                      </div>
                      <div className='grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-3'>
                        <span className='inline-flex items-start gap-1 font-medium text-slate-500'>
                          <RiMapPin2Line className='mt-0.5 size-4 shrink-0 text-amber-600' />
                          {t('address')}
                        </span>
                        <span className='text-slate-800'>{addressLine}</span>
                      </div>
                    </div>
                  </section>

                  <section className='rounded-2xl border border-emerald-200 bg-white lg:col-span-5'>
                    <div className='flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/80 px-4 py-3'>
                      <RiBarChart2Line className='size-5 text-emerald-600' />
                      <h2 className='text-sm font-semibold text-emerald-900'>{t('management_info')}</h2>
                    </div>
                    <div className='divide-y divide-emerald-100 p-4 text-sm'>
                      <div className='flex items-center justify-between gap-3 py-3 first:pt-0'>
                        <span className='font-medium text-slate-600'>{t('classroom')}</span>
                        <button
                          type='button'
                          className='min-w-[2rem] rounded-lg bg-emerald-50 px-2 py-1 text-right font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:bg-emerald-100'
                          onClick={() => {
                            setStatisticInfo({
                              show: true,
                              objectId: detail?.id,
                              type: 'classroom',
                              extraFilter: {
                                filterings: {
                                  ['student_id:eq']: detail?.id
                                }
                              }
                            });
                          }}
                        >
                          {detail?.manager_statistic?.classrooms}
                        </button>
                      </div>
                      <div className='flex items-center justify-between gap-3 py-3'>
                        <span className='font-medium text-slate-600'>{t('subject')}</span>
                        <button
                          type='button'
                          className='min-w-[2rem] rounded-lg bg-emerald-50 px-2 py-1 text-right font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:bg-emerald-100'
                          onClick={() => {
                            setStatisticInfo({
                              show: true,
                              objectId: detail?.id,
                              type: 'subject',
                              extraFilter: {
                                filterings: {
                                  ['student_id:eq']: detail?.id
                                }
                              }
                            });
                          }}
                        >
                          {detail?.manager_statistic?.subjects}
                        </button>
                      </div>
                      <div className='flex items-center justify-between gap-3 py-3'>
                        <span className='font-medium text-slate-600'>{t('location')}</span>
                        <button
                          type='button'
                          className='min-w-[2rem] rounded-lg bg-emerald-50 px-2 py-1 text-right font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:bg-emerald-100'
                          onClick={() => {
                            setStatisticInfo({
                              show: true,
                              objectId: detail?.id,
                              type: 'location',
                              extraFilter: {
                                filterings: {
                                  ['student_id:eq']: detail?.id
                                }
                              }
                            });
                          }}
                        >
                          {detail?.manager_statistic?.teaching_locations}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                <section className='rounded-2xl border border-sky-200 bg-sky-50/30'>
                  <div className='flex items-center gap-2 border-b border-sky-100 bg-white/80 px-4 py-3'>
                    <RiCalendarCheckLine className='size-5 text-sky-600' />
                    <h2 className='text-sm font-semibold text-sky-900'>{t('last_student_attendance_date')}</h2>
                  </div>
                  <div className='bg-white p-4 text-sm text-slate-700 lg:p-5'>
                    <div className='flex min-h-[100px] flex-wrap items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/40 p-4'>
                      <p>{convertTimestampToString(detail?.latest_attendance_time?.attendance_time)}</p>
                      <p>{getClassroomInfo(detail?.latest_attendance_time?.classroom_id)?.classroom_name}</p>
                    </div>
                  </div>
                </section>

                <section className='rounded-2xl border border-rose-200 bg-rose-50/30'>
                  <div className='flex items-center gap-2 border-b border-rose-100 bg-white/80 px-4 py-3'>
                    <RiFileTextLine className='size-5 text-rose-600' />
                    <h2 className='text-sm font-semibold text-rose-900'>{t('description')}</h2>
                  </div>
                  <div className='min-h-[120px] bg-white p-4 text-sm text-slate-700 lg:p-5'>
                    <div
                      className='rounded-xl border border-rose-100 bg-white p-4 leading-relaxed'
                      dangerouslySetInnerHTML={{
                        __html: replaceNewlineWithBr(detail?.description || t('not_updated'))
                      }}
                    />
                  </div>
                </section>

                <div className='flex justify-end pt-1'>
                  <Button
                    type='button'
                    className='rounded-xl bg-emerald-500 px-8 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/user/student/list');
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

      <DrawerStatistic
        show={statisticInfo?.show}
        setShow={(show: boolean) => {
          setStatisticInfo({ ...statisticInfo, show });
        }}
        objectId={statisticInfo?.objectId}
        type={statisticInfo?.type}
        extraFilter={statisticInfo?.extraFilter}
      />
    </div>
  );
};

export default StudentDetail;
