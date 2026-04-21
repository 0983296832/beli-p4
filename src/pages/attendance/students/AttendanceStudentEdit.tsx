import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useT } from '@hooks/useT';
import CalendarCustom from '@components/calendarUI/index';
import SelectInput from '@components/fields/SelectInput';
import Loading from '@components/loading/index';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import { TypeErrors } from '@/src/interface';
import { AVATAR, NO_AVATAR, WARNING } from '@lib/ImageHelper';
import SearchInput from '@components/fields/SearchInput';
import SwitchInput from '@components/fields/SwitchInput';
import TextAreaInput from '@components/fields/TextAreaInput';
import { Toast } from '@components/toast';
import _, { filter } from 'lodash';
import CLassroomSelect from '@components/selects/ClassroomSelect';
import NumberInput from '@components/fields/NumberInput';
import AttitudeSelect from '@components/selects/AttitudeSelect';
import { Button } from '@components/ui/button';
import PeriodSelect from '@components/selects/PeriodSelect';
import attendanceServices from '@services/attendance';
import {
  convertTimestampToString,
  getConvertTimestampToStartEnd,
  getCurrentTimestamp,
  getDayOfWeek
} from '@lib/TimeHelper';
import studentServices from '@services/student';
import { useRootStore } from '@store/index';
import { getUserInfo } from '@lib/GetInfoHelper';
import Confirm from '@components/confirm';
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
import { getFormattedSchedule, roundNumber } from '@lib/JsHelper';

interface Props {}

const AttendanceStudentEdit = (props: Props) => {
  const { users } = useRootStore();
  const { id } = useParams();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({
    attendance_time: getConvertTimestampToStartEnd(getCurrentTimestamp(), 'start')
  });
  const [errors, setErrors] = useState<TypeErrors>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [duplicateData, setDuplicateData] = useState<any>({});
  const [isShowDuplicate, setIsShowDuplicate] = useState(false);
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

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'identity,attendance_id,timeline_id,student_attendance_code,attendance_time,classroom_id,teaching_program_id,teaching_program_detail_number,admin_assigned_id,subject_id,location_id,status,students'
    };
    try {
      const { data }: any = await attendanceServices.getStudentAttendance(Number(id), params);
      setFormData({
        ...data,
        students: data?.students?.map((student: any) => ({
          ...student,
          student_name: getUserInfo(student?.student_id)?.display_name
        }))
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
        const body = _.cloneDeep(formData);
        body.students = body.students?.map(({ student_name, updated_at, created_at, ...rest }: any) => ({ ...rest }));
        delete body.schedules;
        delete body.start_date;
        delete body.end_date;
        const res: any = await attendanceServices.putStudentAttendance(Number(id), { students: body.students });
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/attendance/students/list');
      } else {
        const isDuplicate = await checkDuplicate();
        if (isDuplicate) {
          setIsShowDuplicate(true);
        } else {
          const body = _.cloneDeep(formData);
          body.students = body.students?.map(({ student_name, ...rest }: any) => ({ ...rest }));
          delete body.schedules;
          delete body.start_date;
          delete body.end_date;
          const res: any = await attendanceServices.postStudentAttendance(body);
          Toast('success', res?.message);
          setFormData({});
          setErrors({});
          setLoading(false);
          navigate('/attendance/students/list');
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
      const res: any = await attendanceServices.postStudentAttendanceDuplicate({ timeline_id: formData?.timeline_id });
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
              to={`/attendance/students/detail/${duplicateData?.attendance_id}`}
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
      <div className='pb-20'>
        <Loading loading={loading} />
        <div className='shadow-lg card bg-primary-neutral-50 '>
          <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
            <h3 className='text-base font-semibold leading-[100%]'>{t('student_attendance')}</h3>
            <Button variant='secondary' className='text-primary-success  px-7' onClick={onUpdate} disabled={loading}>
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
                      } else setFormData({ ...formData, attendance_time: value, timeline_id: undefined });
                    }}
                  />
                </div>
                <div className='p-2 space-y-4 rounded-lg'>
                  <div className='w-full'>
                    <SubjectsSelect
                      required
                      label={t('subject')}
                      disabled={!!Number(id)}
                      value={formData?.subject_id ?? null}
                      error={errors?.subject_id}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          subject_id: val?.id,
                          classroom_id: undefined,
                          schedules: undefined,
                          end_date: undefined,
                          start_date: undefined,
                          students: undefined
                        });
                        setErrors({ ...errors, subject_id: '' });
                      }}
                    />
                  </div>
                  <div className='full'>
                    <TeachingLocationSelect
                      required
                      label={t('teaching_location')}
                      disabled={!!Number(id)}
                      error={errors?.location_id}
                      value={formData?.location_id ?? null}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          timeline_id: undefined,
                          location_id: val?.id,
                          classroom_id: undefined,
                          schedules: undefined,
                          end_date: undefined,
                          start_date: undefined,
                          students: undefined
                        });
                        setErrors({ ...errors, location_id: '' });
                      }}
                    />
                  </div>
                  <div className='full'>
                    <CLassroomSelect
                      required
                      label={t('classroom')}
                      menuPlacement='top'
                      disabled={!!Number(id)}
                      error={errors?.classroom_id}
                      locationId={formData?.location_id}
                      subjectId={formData?.subject_id}
                      value={formData?.classroom_id ?? null}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          timeline_id: undefined,
                          classroom_id: val?.id,
                          schedules: val?.schedules,
                          start_date: val?.start_date,
                          end_date: val?.end_date,
                          students: val?.students?.map((user) => ({
                            student_id: user?.student_id,
                            student_name: user?.student_name,
                            point: 0,
                            attitude: '',
                            message: '',
                            counted: 1,
                            status: 1
                          }))
                        });

                        setErrors({ ...errors, classroom_id: '' });
                      }}
                    />
                    {formData?.schedules && (
                      <div>
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
                      value={formData?.timeline_id ?? null}
                      error={errors?.timeline_id}
                      onFirstLoadValue={!Number(id)}
                      onChange={(value) => {
                        setFormData({ ...formData, timeline_id: value?.id });
                        setErrors({ ...errors, timeline_id: '' });
                      }}
                      date={formData?.attendance_time}
                      classroomId={formData?.classroom_id}
                    />
                  </div>
                </div>
              </div>
              <div className='flex-1 space-y-6'>
                <div className='w-full border border-primary-neutral-300 card'>
                  <div className='flex items-center justify-between border-b card-header text-primary-blue-600 border-primary-neutral-300 bg-primary-blue-50'>
                    <h3 className='text-base font-semibold leading-[100%]'>{t('student_list')}</h3>
                    <div className='flex gap-3'>
                      <div className='w-[400px]'>
                        <SearchInput
                          placeholder={t('search')}
                          className='w-[400px]'
                          value={search}
                          onChange={(value) => {
                            setSearch(value);
                          }}
                        />
                      </div>

                      <div className='w-56'>
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
                      <div className='flex items-center h-10 px-5 py-1 border rounded-lg text-primary-neutral-500 bg-primary-neutral-50 whitespace-nowrap'>
                        {t('total')}:{' '}
                        <span className='text-primary-blue-500 ms-2'>{formData?.students?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className='max-h-[calc(100vh-100px)] overflow-y-auto'>
                    {formData?.classroom_id && (
                      <div className='card-body divide-y'>
                        {formData?.students
                          ?.filter((student: any) => {
                            if (search)
                              return student?.student_name?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
                            return true;
                          })
                          ?.filter((student: any) => {
                            if (filterBy === 'attend_class') return student?.status === 1;
                            if (filterBy === 'absent') return student?.status === 2;
                            if (filterBy === 'exclude_lesson') return student?.counted === 1;
                            if (filterBy === 'no_deduction_class') return student?.counted === 0;
                            return true;
                          })
                          ?.map((student: any, index: number) => {
                            return (
                              <div className='flex gap-4 p-6' key={student?.student_id}>
                                <div className='w-[143px] h-[155px]'>
                                  <img
                                    className='object-cover w-full rounded-lg h-full'
                                    src={getUserInfo(student?.student_id)?.avatar || NO_AVATAR}
                                    alt=''
                                  />
                                </div>
                                <div className='flex-1'>
                                  <div className='mb-3 text-lg'>
                                    {getUserInfo(student?.student_id)?.display_name} -{' '}
                                    {getUserInfo(student?.student_id)?.username}
                                  </div>
                                  <div className='flex gap-3'>
                                    <div className='w-1/2 space-y-4'>
                                      <SelectInput
                                        required
                                        label={t('attendance_status')}
                                        options={lesson_statuses}
                                        value={lesson_statuses.find((s) => s?.value == student?.status)}
                                        error={errors?.[`students.${index}.status`]}
                                        onChange={(value) => {
                                          student.status = value?.value;
                                          setFormData({ ...formData });
                                          errors[`students.${index}.status`] = '';
                                          setErrors({ ...errors });
                                        }}
                                      />
                                      <div className='grid grid-cols-2 gap-x-3'>
                                        <NumberInput
                                          label={t('academic_grading')}
                                          value={student?.point}
                                          error={errors?.[`students.${index}.point`]}
                                          onChange={(value) => {
                                            student.point = value;
                                            setFormData({ ...formData });
                                            errors[`students.${index}.point`] = '';
                                            setErrors({ ...errors });
                                          }}
                                        />
                                        <AttitudeSelect
                                          label={t('attitude_evaluation')}
                                          value={student?.attitude}
                                          error={errors?.[`students.${index}.attitude`]}
                                          onChange={(value) => {
                                            student.attitude = value?.value;
                                            setFormData({ ...formData });
                                            errors[`students.${index}.attitude`] = '';
                                            setErrors({ ...errors });
                                          }}
                                        />
                                      </div>
                                      <SwitchInput
                                        label={t('exclude_lesson')}
                                        checked={student?.counted}
                                        onCheckedChange={(value) => {
                                          student.counted = value ? 1 : 0;
                                          setFormData({ ...formData });
                                        }}
                                      />
                                    </div>
                                    <div className='w-1/2'>
                                      <TextAreaInput
                                        label={t('message_to_parents')}
                                        className='border-primary-neutral-200'
                                        rows={8}
                                        error={errors?.[`students.${index}.message`]}
                                        value={student?.message}
                                        onChange={(value) => {
                                          student.message = value;
                                          setFormData({ ...formData });
                                          errors[`students.${index}.message`] = '';
                                          setErrors({ ...errors });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='fixed bottom-0 left-[70px] right-0 z-[1] p-4 bg-primary-neutral-50 border-t border-primary-neutral-300'>
          <div className='flex items-center justify-center gap-7'>
            <div className='flex items-center gap-1 px-2 py-1 text-sm text-white rounded-lg bg-primary-success'>
              {t('attend_class')}
              <div className='px-2 py-1 text-primary-success bg-[#e4ffe9] rounded-lg w-fit text-xs'>
                {filter(formData?.students, (item) => [1].includes(item?.status))?.length}/
                {formData?.students?.length || 0} (
                {roundNumber(
                  (filter(formData?.students, (item) => [1].includes(item?.status))?.length /
                    formData?.students?.length) *
                    100 || 0
                )}
                %)
              </div>
            </div>
            <div className='flex items-center gap-1 px-2 py-1 text-sm text-white rounded-lg bg-secondary-neutral-600'>
              {t('absent')}
              <div className='px-2 py-1 text-xs rounded-lg text-secondary-neutral-600 bg-secondary-neutral-50 w-fit'>
                {filter(formData?.students, (item) => [2].includes(item?.status))?.length}/
                {formData?.students?.length || 0} (
                {roundNumber(
                  (filter(formData?.students, (item) => [2].includes(item?.status))?.length /
                    formData?.students?.length) *
                    100 || 0
                )}
                %)
              </div>
            </div>
            <div className='flex items-center gap-1 px-2 py-1 text-sm text-white rounded-lg bg-primary-error'>
              {t('_exclude_lesson')}
              <div className='px-2 py-1 text-primary-error bg-[#fafafa] rounded-lg w-fit text-xs'>
                {filter(formData?.students, (item) => item?.counted == 1)?.length}/{formData?.students?.length || 0} (
                {roundNumber(
                  (filter(formData?.students, (item) => item?.counted == 1)?.length / formData?.students?.length) *
                    100 || 0
                )}
                %)
              </div>
            </div>
            <div className='flex items-center gap-1 px-2 py-1 text-sm text-white rounded-lg bg-primary-success'>
              {t('_no_deduction_class')}
              <div className='px-2 py-1 text-primary-success bg-[#e4ffe9] rounded-lg w-fit text-xs'>
                {' '}
                {filter(formData?.students, (item) => item?.counted !== 1)?.length}/{formData?.students?.length || 0} (
                {roundNumber(
                  (filter(formData?.students, (item) => item?.counted !== 1)?.length / formData?.students?.length) *
                    100 || 0
                )}
                %)
              </div>
            </div>
            {!!Number(id) && (
              <div className='flex items-center gap-1 px-2 py-1 text-sm text-white rounded-lg bg-primary-blue-600'>
                {t('status')}
                <div className='px-2 py-1 text-primary-neutral-500 bg-primary-blue-50 rounded-lg w-fit text-xs'>
                  {t(
                    formData?.status == 0
                      ? 'submitted_not_approved'
                      : formData?.status == 1
                        ? 'approved'
                        : 'canceled_not_approved'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceStudentEdit;
