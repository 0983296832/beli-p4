import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { AVATAR, DELETE_04, DOWNLOAD_ICON, EDIT_02, IMAGE_ICON, SETTING_01, WARNING } from '@lib/ImageHelper';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextInput from '@components/fields/TextInput';
import TextAreaInput from '@components/fields/TextAreaInput';
import SearchInput from '@components/fields/SearchInput';
import SelectInput from '@components/fields/SelectInput';
import SwitchInput from '@components/fields/SwitchInput';
import CalendarCustom from '@components/calendarUI/index';
import { TypeErrors } from '@/src/interface';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import CLassroomSelect from '@components/selects/ClassroomSelect';
import Upload, { UploadTrigger } from '@components/upload';
import Icon from '@components/Icon';
import NumberInput from '@components/fields/NumberInput';
import TimeInput from '@components/fields/TimeInput';
import TeacherSelect from '@components/selects/TeacherSelect';
import UsersSelect from '@components/selects/UsersSelect';
import { cloneDeep, isEmpty } from 'lodash';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { X } from 'lucide-react';
import attendanceServices from '@services/attendance';
import { Toast } from '@components/toast';
import PeriodSelect from '@components/selects/PeriodSelect';
import {
  calculateTimeDifference,
  convertStringToUnixTimeStamp,
  convertTimestampToString,
  formatUnixToHHMM,
  getConvertTimestampToStartEnd,
  getCurrentTimestamp,
  getDayOfWeek
} from '@lib/TimeHelper';
import dayjs from 'dayjs';
import Loading from '@components/loading';
import { getFormattedSchedule } from '@lib/JsHelper';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';
interface Props {}

const AttendanceTeacherEdit = (props: Props) => {
  const { id } = useParams();
  const { currentUser } = useRootStore();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({
    classroom_id: null,
    // checkin_timestamp: null,
    // checkout_timestamp: null,
    attendance_time: getConvertTimestampToStartEnd(getCurrentTimestamp(), 'start'),
    teacher_id: currentUser?.user_job_title == USER_ROLE.TEACHER ? currentUser?.user_id : null
  });
  const [errors, setErrors] = useState<TypeErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [duplicateData, setDuplicateData] = useState<any>({});
  const [isShowDuplicate, setIsShowDuplicate] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'identity,timeline_id,attendance_code,attendance_time,classroom_id,status,teaching_program_id,teaching_program_detail_number,admin_assigned_id,subject_id,location_id,teacher_id,start_time,end_time,checkin_timestamp,checkout_timestamp,note,valid,user_ability,teaching_program_detail,teaching_program'
    };
    try {
      const { data }: any = await attendanceServices.getTeacherAttendance(Number(id), params);
      setFormData({
        teaching_program: data?.teaching_program,
        teaching_program_detail_number: data?.teaching_program_detail_number,
        classroom_id: data?.classroom_id,
        location_id: data?.location_id,
        subject_id: data?.subject_id,
        teacher_id: data?.teacher_id,
        timeline_id: data?.timeline_id,
        // start_time: convertStringToUnixTimeStamp(data?.start_time),
        // end_time: convertStringToUnixTimeStamp(data?.end_time),
        // checkin_timestamp: { url: data?.checkin_timestamp, file_name: 'Ảnh checkout' },
        // checkout_timestamp: {
        //   url: data?.checkout_timestamp,
        //   file_name: 'Ảnh checkout'
        // },
        note: data?.note
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    setLoading(true);
    try {
      if (Number(id)) {
        const body = cloneDeep(formData);
        // body.start_time = formatUnixToHHMM(body.start_time);
        // body.end_time = formatUnixToHHMM(body.end_time);
        // body.checkin_timestamp = body.checkin_timestamp?.url;
        // body.checkout_timestamp = body.checkout_timestamp?.url;
        delete body.schedules;
        delete body.start_date;
        delete body.end_date;
        const res: any = await attendanceServices.putTeacherAttendance(Number(id), {
          // start_time: body?.start_time,
          // end_time: body?.end_time,
          // checkin_timestamp: body?.checkin_timestamp,
          // checkout_timestamp: body?.checkout_timestamp,
          note: body?.note
        });
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/attendance/teachers/list');
      } else {
        const isDuplicate = await checkDuplicate();
        if (isDuplicate) {
          setIsShowDuplicate(true);
        } else {
          const body = cloneDeep(formData);
          // body.start_time = formatUnixToHHMM(body.start_time);
          // body.end_time = formatUnixToHHMM(body.end_time);
          // body.checkin_timestamp = body.checkin_timestamp?.url;
          // body.checkout_timestamp = body.checkout_timestamp?.url;
          delete body.subject_id;
          delete body.location_id;
          delete body.schedules;
          delete body.start_date;
          delete body.end_date;
          const res: any = await attendanceServices.postTeacherAttendance(body);
          Toast('success', res?.message);
          setFormData({});
          setErrors({});
          setLoading(false);
          navigate('/attendance/teachers/list');
        }
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  const checkDuplicate = async () => {
    setLoading(true);
    try {
      const res: any = await attendanceServices.postTeacherAttendanceDuplicate({ timeline_id: formData?.timeline_id });
      if (res?.is_duplicate == 1) {
        setDuplicateData(res);
        setLoading(false);
        return true;
      } else {
        setDuplicateData({});
        return false;
      }
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (Number(id)) {
      getDetail();
    }
  }, [id]);

  return (
    <>
      <AlertDialog open={isShowDuplicate} onOpenChange={setIsShowDuplicate}>
        <AlertDialogContent className='max-w-[350px] rounded-lg'>
          <AlertDialogHeader>
            <AlertDialogDescription
              className={`text-center text-primary-neutral-900 text-sm font-medium flex items-center justify-center flex-col gap-4`}
            >
              <img src={WARNING} />

              {t('attendance_exists')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className=' flex justify-center items-center flex-col gap-4'>
            <Link
              to={`/attendance/teachers/detail/${duplicateData?.attendance_id}`}
              className='text-primary-blue-500 underline cursor-pointer'
            >
              {duplicateData?.attendance_code}
            </Link>
            <Button onClick={() => setIsShowDuplicate(false)} className='w-20'>
              {t('close')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Loading loading={loading} />
      <div className='pb-20'>
        <div className='shadow-lg card bg-primary-neutral-50 '>
          <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
            <h3 className='text-base font-semibold leading-[100%]'>{t('teacher_attendance')}</h3>
            <Button
              variant='secondary'
              className='text-primary-success px-7'
              size={'sm'}
              onClick={onUpdate}
              disabled={loading}
            >
              {t(Number(id) ? 'update' : 'create')}
            </Button>
          </div>
          <div className='p-6 card-body'>
            <div className='flex gap-9'>
              <div className='w-[310px]'>
                <div className='p-2 space-y-4 border rounded-lg border-primary-neutral-300 mb-6 '>
                  <CalendarCustom
                    value={formData?.attendance_time}
                    className='px-2 pt-2 pb-0'
                    onChange={(value) => {
                      if (!!Number(id)) {
                        return;
                      }
                      setFormData({ ...formData, attendance_time: value, timeline_id: undefined });
                    }}
                  />
                </div>
                <div className='p-2 space-y-4 rounded-lg'>
                  <div className='w-full'>
                    <SubjectsSelect
                      required
                      disabled={!!Number(id)}
                      label={t('subject')}
                      value={formData?.subject_id}
                      error={errors?.subject_id}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          subject_id: val?.id,
                          end_date: undefined,
                          start_date: undefined,
                          classroom_id: undefined,
                          schedules: undefined
                        });
                        setErrors({ ...errors, subject_id: '' });
                      }}
                    />
                  </div>
                  <div className='full'>
                    <TeachingLocationSelect
                      required
                      disabled={!!Number(id)}
                      label={t('teaching_location')}
                      error={errors?.location_id}
                      value={formData?.location_id}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          location_id: val?.id,
                          end_date: undefined,
                          start_date: undefined,
                          classroom_id: undefined,
                          schedules: undefined,
                          timeline_id: undefined
                        });
                        setErrors({ ...errors, location_id: '' });
                      }}
                    />
                  </div>
                  <div className='full'>
                    <CLassroomSelect
                      required
                      label={t('classroom')}
                      disabled={!!Number(id)}
                      error={errors?.classroom_id}
                      locationId={formData?.location_id}
                      subjectId={formData?.subject_id}
                      value={formData?.classroom_id}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          timeline_id: undefined,
                          schedules: val?.schedules,
                          start_date: val?.start_date,
                          end_date: val?.end_date,
                          classroom_id: val?.id
                        });

                        setErrors({ ...errors, classroom_id: '' });
                      }}
                    />
                    {formData?.schedules && (
                      <div className='pl-2'>
                        <p className='text-primary-neutral-400 text-xs mt-2'>
                          {t('start')}: {convertTimestampToString(formData?.start_date)} - {t('finish')}:{' '}
                          {convertTimestampToString(formData?.end_date)}
                        </p>
                        <p className='text-primary-neutral-400 text-xs'>
                          {
                            getFormattedSchedule(formData?.schedules?.filter((schedule: any) => schedule?.valid === 1))
                              ?.count
                          }{' '}
                          {t('session_per_week')}
                        </p>

                        {getFormattedSchedule(
                          formData?.schedules?.filter((schedule: any) => schedule?.valid === 1)
                        )?.sessions?.map((schedule: any, idx: number) => {
                          return (
                            <div key={idx} className='text-primary-neutral-400 text-xs'>
                              {getDayOfWeek(schedule?.day)}: {schedule?.time}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className='full'>
                    <PeriodSelect
                      required
                      menuPlacement='top'
                      disabled={!!Number(id)}
                      label={t('period')}
                      onFirstLoadValue={!Number(id)}
                      value={formData?.timeline_id}
                      onChange={(value) => {
                        setFormData({ ...formData, timeline_id: value?.id });
                        setErrors({ ...errors, timeline_id: '' });
                      }}
                      classroomId={formData?.classroom_id}
                      date={formData?.attendance_time}
                    />
                  </div>
                </div>
              </div>
              <div className='flex-1 space-y-6'>
                {Number(id) ? (
                  <div className='w-full border border-primary-neutral-300 card'>
                    <div className='p-6 card-body'>
                      <div className='grid grid-cols-2 gap-x-8'>
                        <TextInput
                          label={t('teaching_program_code')}
                          disabled
                          value={formData.teaching_program?.program_code}
                        />
                        <TextInput
                          label={t('period_order_in_program')}
                          disabled
                          value={`${formData.teaching_program_detail_number}/${formData.teaching_program?.lesson_count} (${(formData.teaching_program_detail_number / formData.teaching_program?.lesson_count) * 100}%)`}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className='w-full border border-primary-neutral-300 card'>
                  <div className='border-b card-header text-primary-blue-600 border-primary-neutral-300 bg-primary-blue-50'>
                    <h3 className='text-base font-semibold leading-[100%]'>{t('working_time')}</h3>
                  </div>
                  <div className='p-6 card-body'>
                    <div
                      className={`${currentUser?.user_job_title != USER_ROLE.TEACHER && 'grid grid-cols-2 gap-x-6 gap-y-4'}`}
                    >
                      <div className='grid grid-cols-2 gap-6'>
                        {currentUser?.user_job_title != USER_ROLE.TEACHER && (
                          <div className='col-span-2'>
                            <UsersSelect
                              label={t('teachers')}
                              value={formData?.teacher_id}
                              error={errors?.teacher_id}
                              onChange={(val) => {
                                setFormData({ ...formData, teacher_id: val?.id });
                                setErrors({ ...errors, teacher_id: '' });
                              }}
                              role='TEACHER'
                            />
                          </div>
                        )}

                        {/* <TimeInput
                            label={t('start_time')}
                            value={formData?.start_time}
                            error={errors?.start_time}
                            onChange={(val) => {
                              setFormData({ ...formData, start_time: val });
                              setErrors({ ...errors, start_time: '' });
                            }}
                          />
                          <TimeInput
                            label={t('end_time')}
                            value={formData?.end_time}
                            error={errors?.end_time}
                            onChange={(val) => {
                              setFormData({ ...formData, end_time: val });
                              setErrors({ ...errors, end_time: '' });
                            }}
                          />

                          {!isEmpty(formData?.checkin_timestamp) ? (
                            <div className='flex items-center justify-between border border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 w-full rounded p-2'>
                              <PhotoProvider>
                                <PhotoView src={formData?.checkin_timestamp?.url}>
                                  <div className='flex items-center gap-2 '>
                                    <Icon icon={IMAGE_ICON} className='text-primary-blue-500 size-5 min-w-5' />
                                    <p className='text-primary-blue-500 cursor-pointer line-clamp-1'>
                                      {formData?.checkin_timestamp?.file_name}
                                    </p>
                                  </div>
                                </PhotoView>
                              </PhotoProvider>

                              <X
                                className='text-primary-neutral-700 size-4 min-w-4 cursor-pointer hover:text-primary-neutral-900'
                                onClick={() => {
                                  setFormData({ ...formData, checkin_timestamp: null });
                                }}
                              />
                            </div>
                          ) : (
                            <Upload
                              className='w-full'
                              isSingle
                              maxFiles={1}
                              onChange={(files) => {
                                setFormData({
                                  ...formData,
                                  checkin_timestamp: {
                                    id: files?.[0]?.id,
                                    url: files?.[0]?.url,
                                    file_name: 'Ảnh checkin'
                                  }
                                });
                              }}
                              accept={{ 'image/*': [] }}
                            >
                              <UploadTrigger
                                render={(loading) => {
                                  return (
                                    <Button
                                      variant={'outline'}
                                      className='text-primary-blue-500 border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 hover:text-primary-blue-500 w-full'
                                    >
                                      {loading ? (
                                        <svg
                                          aria-hidden='true'
                                          className='w-12 h-12 text-white animate-spin dark:text-gray-600 fill-primary-blue'
                                          viewBox='0 0 100 101'
                                          fill='none'
                                          xmlns='http://www.w3.org/2000/svg'
                                        >
                                          <path
                                            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                            fill='currentColor'
                                          />
                                          <path
                                            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                            fill='currentFill'
                                          />
                                        </svg>
                                      ) : (
                                        <Icon icon={DOWNLOAD_ICON} className='text-primary-blue-500 ' />
                                      )}

                                      {t('add_file')}
                                    </Button>
                                  );
                                }}
                              />
                            </Upload>
                          )}

                          {!isEmpty(formData?.checkout_timestamp) ? (
                            <div className='flex items-center justify-between border border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 w-full rounded p-2'>
                              <PhotoProvider>
                                <PhotoView src={formData?.checkout_timestamp?.url}>
                                  <div className='flex items-center gap-2 '>
                                    <Icon icon={IMAGE_ICON} className='text-primary-blue-500 size-5  min-w-5' />
                                    <p className='text-primary-blue-500 cursor-pointer line-clamp-1'>
                                      {formData?.checkout_timestamp?.file_name}
                                    </p>
                                  </div>
                                </PhotoView>
                              </PhotoProvider>

                              <X
                                className='text-primary-neutral-700 size-4 min-w-4 cursor-pointer hover:text-primary-neutral-900'
                                onClick={() => {
                                  setFormData({ ...formData, checkout_timestamp: null });
                                }}
                              />
                            </div>
                          ) : (
                            <Upload
                              className='w-full'
                              isSingle
                              maxFiles={1}
                              onChange={(files) => {
                                setFormData({
                                  ...formData,
                                  checkout_timestamp: {
                                    id: files?.[0]?.id,
                                    url: files?.[0]?.url,
                                    file_name: 'Ảnh checkout'
                                  }
                                });
                              }}
                              accept={{ 'image/*': [] }}
                            >
                              <UploadTrigger
                                render={(loading) => {
                                  return (
                                    <Button
                                      variant={'outline'}
                                      className='text-primary-blue-500 border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 hover:text-primary-blue-500 w-full'
                                    >
                                      {loading ? (
                                        <svg
                                          aria-hidden='true'
                                          className='w-12 h-12 text-white animate-spin dark:text-gray-600 fill-primary-blue'
                                          viewBox='0 0 100 101'
                                          fill='none'
                                          xmlns='http://www.w3.org/2000/svg'
                                        >
                                          <path
                                            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                            fill='currentColor'
                                          />
                                          <path
                                            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                            fill='currentFill'
                                          />
                                        </svg>
                                      ) : (
                                        <Icon icon={DOWNLOAD_ICON} className='text-primary-blue-500 ' />
                                      )}

                                      {t('add_file')}
                                    </Button>
                                  );
                                }}
                              />
                            </Upload>
                          )}

                          <NumberInput
                            label={t('total_minutes_taught')}
                            disabled
                            value={
                              calculateTimeDifference(
                                dayjs.unix(formData?.start_time).format('hh:mm'),
                                dayjs.unix(formData?.end_time).format('hh:mm')
                              )?.minutes
                            }
                          />
                          <NumberInput
                            label={t('total_hours_taught')}
                            disabled
                            value={
                              calculateTimeDifference(
                                dayjs.unix(formData?.start_time).format('hh:mm'),
                                dayjs.unix(formData?.end_time).format('hh:mm')
                              )?.hours
                            }
                          /> */}
                      </div>

                      <div className=''>
                        <TextAreaInput
                          label={t('personal_report_notes')}
                          className='border-primary-neutral-200'
                          placeholder={t('enter_description')}
                          rows={11}
                          value={formData?.note}
                          error={errors?.note}
                          onChange={(value) => {
                            formData.note = value;
                            setFormData({ ...formData });
                            setErrors({ ...errors, note: '' });
                          }}
                        />
                      </div>
                    </div>
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

export default AttendanceTeacherEdit;
