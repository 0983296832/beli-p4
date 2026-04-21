import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextAreaInput from '@components/fields/TextAreaInput';
import CalendarCustom from '@components/calendarUI/index';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import Confirm from '@components/confirm';
import attendanceServices from '@services/attendance';
import { Toast } from '@components/toast';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { calculateTimeDifference, convertTo12HourFormat } from '@lib/TimeHelper';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import Loading from '@components/loading';
import { roundNumber } from '@lib/JsHelper';
import { RiArrowLeftLine, RiCheckLine, RiCloseLine, RiDeleteBin6Line, RiEdit2Line } from '@remixicon/react';

interface Props {}

const AttendanceTeacherAssistantDetail = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isShowDelete, setIsShowDelete] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowRefuse, setIsShowRefuse] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'identity,timeline_id,attendance_code,attendance_time,classroom_id,status,teaching_program_id,teaching_program_detail_number,admin_assigned_id,subject_id,location_id,ta_id,start_time,end_time,checkin_timestamp,checkout_timestamp,note,valid,user_ability,created_at,updated_at,teaching_program_detail,teaching_program'
    };
    try {
      const { data }: any = await attendanceServices.getTAAttendance(Number(id), params);
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
      const response: any = await attendanceServices.deleteTAAttendance(Number(id));
      Toast('success', response?.message);
      setIsShowConfirm(false);
      navigate('/attendance/teachers_assistant/list');
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };

  const handleConfirm_Refuse = async (body: { status: 1 | 2; refuse_note?: string }) => {
    if (!body?.refuse_note && body?.status == 2) {
      return Toast('warning', t('reject_reason_required'));
    }
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await attendanceServices.putTAAttendance(Number(id), body);
      Toast('success', response?.message);
      setRefuseReason('');
      setIsShowConfirm(false);
      setIsShowRefuse(false);
      getDetail();
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
      setIsShowRefuse(false);
    }
  };

  useEffect(() => {
    id && getDetail();
  }, [id]);

  return (
    <>
      <Loading loading={loading} />
      <Confirm
        show={isShowDelete}
        type='warning'
        onCancel={() => {
          setIsShowDelete(false);
        }}
        onSuccess={handleDelete}
        description={t('txt_confirm_delete')}
      />
      <Confirm
        show={isShowConfirm}
        type='warning'
        onCancel={() => {
          setIsShowConfirm(false);
        }}
        onSuccess={() => handleConfirm_Refuse({ status: 1 })}
        description={t('confirm_approve_attendance')}
      />
      <Confirm
        className='w-[500px]'
        show={isShowRefuse}
        type='warning'
        onCancel={() => {
          setIsShowRefuse(false);
        }}
        onSuccess={() => handleConfirm_Refuse({ status: 2, refuse_note: refuseReason })}
        description={
          <div className='w-full'>
            <p className='mb-2 font-semibold text-center'>{t('confirm_reject_attendance')}</p>
            <TextAreaInput
              required
              label={t('reason_for_rejection')}
              className='border-primary-neutral-200'
              placeholder={t('enter_reason_for_rejection')}
              rows={6}
              value={refuseReason}
              onChange={(value) => {
                setRefuseReason(value);
              }}
            />
          </div>
        }
      />
      <div className='pb-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-violet-200 bg-violet-50 px-5 py-4'>
              <h3 className='text-xl font-semibold tracking-wide text-slate-800'>{t('assistant_attendance')}</h3>
              <div className='flex flex-wrap items-center gap-2'>
                {detail?.user_ability?.can_approve === 1 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    onClick={() => {
                      setIsShowConfirm(true);
                    }}
                  >
                    <RiCheckLine className='size-4' />
                    {t('approve')}
                  </Button>
                )}
                {detail?.user_ability?.can_refuse === 1 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='rounded-lg border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                    onClick={() => {
                      setIsShowRefuse(true);
                    }}
                  >
                    <RiCloseLine className='size-4' />
                    {t('refuse')}
                  </Button>
                )}
                {detail?.user_ability?.can_edit === 1 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='rounded-lg border border-violet-200 bg-white text-violet-800 hover:bg-violet-50'
                    onClick={() => {
                      navigate('/attendance/teachers_assistant/edit/' + id);
                    }}
                  >
                    <RiEdit2Line className='size-4' />
                    {t('edit')}
                  </Button>
                )}
                {detail?.user_ability?.can_delete === 1 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='rounded-lg border border-rose-300 bg-rose-600 text-white hover:bg-rose-700'
                    onClick={() => {
                      setIsShowDelete(true);
                    }}
                  >
                    <RiDeleteBin6Line className='size-4' />
                    {t('delete')}
                  </Button>
                )}
              </div>
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
                      {getClassroomInfo(detail?.classroom_id)?.classroom_name} -{' '}
                      {getClassroomInfo(detail?.classroom_id)?.classroom_code}
                    </div>
                  </div>
                  <div className='grid grid-cols-[110px_12px_1fr] gap-y-1 text-sm'>
                    <div className='text-slate-500'>{t('period')}</div>
                    <div className='text-slate-400'>:</div>
                    <div className='text-slate-800'>
                      {' '}
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
                        <div className='text-slate-800'>{`${detail?.teaching_program_detail_number}/${detail?.teaching_program?.lesson_count} (${roundNumber((detail?.teaching_program_detail_number / detail?.teaching_program?.lesson_count) * 100)}%)`}</div>
                      </div>
                      <div className='grid grid-cols-[250px_30px_1fr] gap-y-1 text-sm'>
                        <div className='text-slate-500'>{t('responsible_admin')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {' '}
                          {getUserInfo(detail?.admin_assigned_id)?.display_name} -{' '}
                          {getUserInfo(detail?.admin_assigned_id)?.username}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='w-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                    <h3 className='text-base font-semibold text-violet-900'>{t('working_time')}</h3>
                  </div>
                  <div className='p-5 lg:p-6'>
                    <div className='flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8'>
                      <div className='w-full space-y-4 border-violet-100 lg:w-1/2 lg:border-r lg:pr-8'>
                        <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                          <div className='text-slate-500'>{t('teaching_assistant_name')}</div>
                          <div className='text-slate-400'>:</div>
                          <div className='text-slate-800'>{getUserInfo(detail?.ta_id)?.display_name}</div>
                        </div>
                        <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                          <div className='text-slate-500'>{t('code')}</div>
                          <div className='text-slate-400'>:</div>
                          <div className='text-slate-800'>{getUserInfo(detail?.ta_id)?.username}</div>
                        </div>
                        <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                          <div className='text-slate-500'>{t('start')}</div>
                          <div className='text-slate-400'>:</div>
                          <div className='text-slate-800'>{convertTo12HourFormat(detail?.start_time)}</div>
                        </div>
                        {/* <div className='grid grid-cols-[150px_30px_1fr]'>
                          <div className='text-primary-neutral-600'>{t('timestamp_picture')}</div>
                          <div className='text-primary-neutral-600'>:</div>
                          <PhotoProvider>
                            <PhotoView src={detail?.checkin_timestamp}>
                              <p className='text-primary-blue-500 underline cursor-pointer'>Ảnh checkin</p>
                            </PhotoView>
                          </PhotoProvider>
                        </div> */}
                        <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                          <div className='text-slate-500'>{t('finish')}</div>
                          <div className='text-slate-400'>:</div>
                          <div className='text-slate-800'>{convertTo12HourFormat(detail?.end_time)}</div>
                        </div>
                        {/* <div className='grid grid-cols-[150px_30px_1fr]'>
                          <div className='text-primary-neutral-600'>{t('timestamp_picture')}</div>
                          <div className='text-primary-neutral-600'>:</div>
                          <PhotoProvider>
                            <PhotoView src={detail?.checkout_timestamp}>
                              <p className='text-primary-blue-500 underline cursor-pointer'>Ảnh checkout</p>
                            </PhotoView>
                          </PhotoProvider>
                        </div> */}
                        <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                          <div className='text-slate-500'>{t('total_minutes_taught')}</div>
                          <div className='text-slate-400'>:</div>
                          <div className='text-slate-800'>
                            {calculateTimeDifference(detail?.start_time, detail?.end_time)?.minutes}
                          </div>
                        </div>
                        <div className='grid grid-cols-[150px_30px_1fr] gap-y-1 text-sm'>
                          <div className='text-slate-500'>{t('total_hours_taught')}</div>
                          <div className='text-slate-400'>:</div>
                          <div className='text-slate-800'>
                            {calculateTimeDifference(detail?.start_time, detail?.end_time)?.hours}
                          </div>
                        </div>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-4'>
                          <div className='text-sm font-medium text-slate-600'>{t('personal_report_notes')} :</div>

                          <div
                            className='mt-1 text-sm text-slate-800'
                            dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(detail?.note) }}
                          />
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

                <div className='flex justify-end pt-2'>
                  <Button
                    className='rounded-xl bg-emerald-500 px-6 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/attendance/teachers_assistant/list');
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
    </>
  );
};

export default AttendanceTeacherAssistantDetail;
