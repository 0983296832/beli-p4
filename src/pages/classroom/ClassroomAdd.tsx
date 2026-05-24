import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import TextInput from '@components/fields/TextInput';
import DateInput from '@components/fields/DateInput';
import { Button } from '@components/ui/button';
import { ERROR_RED, NO_AVATAR, NO_IMAGE } from '@lib/ImageHelper';
import { useNavigate, useParams } from 'react-router-dom';
import GenderSelect from '@components/selects/GenderSelect';
import dayjs from 'dayjs';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import StudentSelect from '@components/selects/StudentSelect';
import Upload, { UploadTrigger } from '@components/upload';
import Loading from '@components/loading';
import WeekdaySelect from '@components/selects/WeekDaySelect';
import UsersSelect from '@components/selects/UsersSelect';
import NumberInput from '@components/fields/NumberInput';
import { Toast } from '@components/toast';
import classroomServices from '@services/classroom';
import TimeInput from '@components/fields/TimeInput';
import _, { difference } from 'lodash';
import { ChevronDown } from 'lucide-react';
import UserList from '@components/userList';
import StudentWithFilterSelect from '@components/selects/StudentWithFilterSelect';
import Tooltip from '@components/tooltip';
import { TypeUser, useRootStore } from '@store/index';
import TeachingProgramsSelect from '@components/selects/TeachingProgramSelect';
import { calculateTimeDifference } from '@lib/TimeHelper';
import { roundNumber } from '@lib/JsHelper';
import {
  RiAddLine,
  RiArrowLeftLine,
  RiBookOpenLine,
  RiCalendarScheduleLine,
  RiCameraLine,
  RiDeleteBin6Line,
  RiGroupLine,
  RiInformationLine,
  RiRefreshLine
} from '@remixicon/react';

interface Props {}

const ClassroomAdd = (props: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const { syncClassroomsStore, syncUsersStore } = useRootStore();
  const [formData, setFormData] = useState<any>({
    schedules: [],
    students: [],
    removed_schedule_ids: [],
    removed_student_ids: []
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;
  const [showSelectUser, setShowSelectUser] = useState(false);
  const [initStudentIds, setInitStudentIds] = useState<number[]>([]);
  const [schedule, setSchedule] = useState([
    { period: '00-03', slot: [0, 0, 0, 0, 0, 0, 0] },
    { period: '03-06', slot: [0, 0, 0, 0, 0, 0, 0] },
    { period: '06-09', slot: [0, 0, 0, 0, 0, 0, 0] },
    { period: '09-12', slot: [0, 0, 0, 0, 0, 0, 0] },
    { period: '12-15', slot: [0, 0, 0, 0, 0, 0, 0] },
    { period: '15-18', slot: [0, 0, 0, 0, 0, 0, 0] },
    { period: '18-21', slot: [0, 0, 0, 0, 0, 0, 0] },
    { period: '21-24', slot: [0, 0, 0, 0, 0, 0, 0] }
  ]);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'classroom_name,classroom_code,classroom_avatar,location_id,subject_id,lessons,start_date,end_date,schedules,students,teaching_program_id,admin_assigned_id,teacher_id,ta_id,teaching_program'
    };
    try {
      const { data }: any = await classroomServices.getClassroom(Number(id), params);
      setFormData({
        classroom_name: data?.classroom_name,
        classroom_code: data?.classroom_code,
        classroom_avatar: data?.classroom_avatar,
        location_id: +data?.location_id,
        subject_id: +data?.subject_id,
        admin_assigned_id: +data?.admin_assigned_id,
        lesson_count: +data?.teaching_program?.lesson_count,
        start_date: data?.start_date,
        end_date: data?.end_date,
        teaching_program_id: data?.teaching_program_id,
        teacher_id: data?.teacher_id,
        ta_id: data?.ta_id,
        schedules: data?.schedules?.map((schedule: any) => ({
          ...schedule,
          start_time: dayjs(schedule?.start_time, 'HH:mm').unix(),
          end_time: dayjs(schedule?.end_time, 'HH:mm').unix()
        })),
        students: data?.students?.map((user: any) => ({
          id: user?.student_id,
          student_code: user?.student_code,
          student_name: user?.student_name,
          student_avatar: user?.student_avatar
        })),
        removed_schedule_ids: [],
        removed_student_ids: []
      });
      setInitStudentIds(data?.students?.map((user: any) => user?.student_id));
      classifyByTimePeriod(
        data?.schedules?.map((schedule: any) => ({
          ...schedule,
          start_time: dayjs(schedule?.start_time, 'HH:mm').unix(),
          end_time: dayjs(schedule?.end_time, 'HH:mm').unix()
        }))
      );
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    if (formData?.schedules?.length == 0) {
      return Toast(`warning`, t('schedule_cannot_be_empty'));
    }
    setLoading(true);
    try {
      if (id) {
        const body = _.cloneDeep(formData);
        body.schedules = body.schedules.map((vl: any) => ({
          ...vl,
          start_time: dayjs.unix(vl?.start_time).format('HH:mm'),
          end_time: dayjs.unix(vl?.end_time).format('HH:mm')
        }));
        delete body?.lesson_count;
        body.students = body.students?.map((student: { id: number }) => ({ student_id: student?.id }));

        const res: any = await classroomServices.putClassroom(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/classroom/list');
        syncClassroomsStore();
      } else {
        const body = _.cloneDeep(formData);
        body.schedules = body.schedules.map((vl: any) => ({
          ...vl,
          start_time: dayjs.unix(vl?.start_time).format('HH:mm'),
          end_time: dayjs.unix(vl?.end_time).format('HH:mm')
        }));
        body.students = body.students?.map((student: { id: number }) => ({ student_id: student?.id }));
        delete body.removed_schedule_ids;
        delete body.removed_student_ids;
        delete body?.lesson_count;
        const res: any = await classroomServices.postClassroom(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/classroom/list');
        syncClassroomsStore();
        syncUsersStore();
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  function classifyByTimePeriod(data: { day_of_week: number; start_time: number; end_time: number }[]) {
    const time_periods = [
      { period: '00-03', start: 0, end: 3 },
      { period: '03-06', start: 3, end: 6 },
      { period: '06-09', start: 6, end: 9 },
      { period: '09-12', start: 9, end: 12 },
      { period: '12-15', start: 12, end: 15 },
      { period: '15-18', start: 15, end: 18 },
      { period: '18-21', start: 18, end: 21 },
      { period: '21-24', start: 21, end: 24 }
    ];

    data.map(({ day_of_week, start_time, end_time }, index) => {
      if (!(day_of_week && start_time && end_time && start_time < end_time)) {
        Toast(
          'warning',
          t('row_num_wrong_data', {
            num: index + 1,
            err: t(!day_of_week ? 'select_day_of_week' : 'start_time_must_be_less').toLocaleLowerCase()
          })
        );
      }
    });

    const result = time_periods.map(({ period, start, end }) => {
      const slot: number[] = Array(7).fill(0); // Mảng slot với 7 giá trị mặc định là 0

      data.forEach(({ day_of_week, start_time, end_time }, index) => {
        if (day_of_week && start_time && end_time && start_time < end_time) {
          const startHour = dayjs.unix(start_time).hour(); // Sử dụng `.hour()` để lấy giờ từ `start_time`
          if (startHour >= start && startHour < end) {
            slot[day_of_week - 2] += 1; // Tăng số lượng cho ngày tương ứng trong tuần
          }
        }
      });

      return { period, slot };
    });

    setSchedule(result); // Giả sử setSchedule là hàm để cập nhật kết quả
  }

  const getHourOfMonth = (): number => {
    const daysInRange: number[] = [];
    let currentDate = new Date(formData?.start_date * 1000); // Chuyển start_date thành Date
    const endDateObj = new Date(formData?.end_date * 1000); // Chuyển end_date thành Date

    // Lặp qua từng ngày trong khoảng thời gian
    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay(); // 0 - Chủ nhật, 1 - Thứ 2, ..., 6 - Thứ 7
      // Chuyển đổi sang hệ thống ngày của bạn (2 - Thứ 2, ..., 8 - Chủ nhật)
      const customDayOfWeek = dayOfWeek === 0 ? 8 : dayOfWeek + 1;
      daysInRange.push(customDayOfWeek);
      currentDate.setDate(currentDate.getDate() + 1); // Tăng ngày lên 1
    }

    // Tạo mảng mới với ngày cần thiết theo day_of_week
    return _.flatMap(formData?.schedules, (schedule) => {
      return daysInRange.filter((day) => day === schedule.day_of_week).map(() => ({ ...schedule }));
    })?.reduce((prev: any, curr: any) => {
      return roundNumber(
        prev +
          calculateTimeDifference(
            dayjs.unix(curr?.start_time).format('hh:mm'),
            dayjs.unix(curr?.end_time).format('hh:mm')
          )?.hours
      );
    }, 0);
  };

  useEffect(() => {
    if (id) {
      getDetail();
    }
  }, [id]);

  return (
    <div>
      <Loading loading={loading} />
      <div className='mx-auto w-full max-w-6xl pb-24'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>
                  {isEdit ? t('edit_class_info') : t('add_new_class')}
                </p>
                <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                  {formData?.classroom_name || t('class_name')}
                </h3>
                <p className='mt-0.5 text-sm text-slate-600'>
                  {isEdit ? formData?.classroom_code : t('class_info')}
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-100'
                onClick={() => {
                  navigate('/classroom/list');
                }}
              >
                <RiArrowLeftLine className='size-4' />
                {t('back')}
              </Button>
            </div>
          </div>

          <div className='p-5 lg:p-6'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
              <aside className='w-full shrink-0 lg:w-72'>
                <div className='rounded-2xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm'>
                  <div className='relative overflow-hidden rounded-xl border border-white bg-white shadow-inner'>
                    <img
                      src={formData?.classroom_avatar || NO_IMAGE}
                      alt='No Image'
                      className={`aspect-square w-full object-cover ${!formData?.classroom_avatar ? 'opacity-50' : ''}`}
                    />
                    <Upload
                      className='mb-5'
                      value={[]}
                      isSingle
                      maxFiles={1}
                      onChange={(files) => {
                        setFormData({ ...formData, classroom_avatar: files?.[0].url });
                      }}
                      accept={{ 'image/*': [] }}
                    >
                      <UploadTrigger>
                        <div className='absolute bottom-3 right-3 inline-flex size-10 items-center justify-center rounded-full border border-violet-200 bg-white/95 text-violet-700 shadow-sm transition-colors hover:bg-violet-50'>
                          <RiCameraLine className='size-4' />
                        </div>
                      </UploadTrigger>
                    </Upload>
                  </div>
                  <p className='mt-3 text-center text-xs text-slate-500'>{t('avatar')}</p>
                </div>
              </aside>

              <div className='min-w-0 flex-1 space-y-4'>
                <section className='rounded-2xl border border-violet-200 bg-white'>
                  <div className='flex items-center gap-2 border-b border-violet-100 bg-violet-50/80 px-4 py-3'>
                    <RiInformationLine className='size-5 text-violet-600' />
                    <h2 className='text-sm font-semibold text-violet-900'>{t('class_info')}</h2>
                  </div>
                  <div className='space-y-4 p-4 lg:p-5'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-7'>
                      <div className='flex w-full flex-col gap-3 lg:w-1/2 lg:flex-row'>
                        <div className={`rounded-xl border border-violet-100 bg-violet-50/40 p-3 ${!id ? 'w-full' : 'w-2/3'}`}>
                          <TextInput
                            label={t('class_name')}
                            required
                            className='w-full'
                            value={formData?.classroom_name}
                            error={errors?.classroom_name}
                            onChange={(value) => {
                              setFormData((prev: any) => ({
                                ...prev,
                                classroom_name: value
                              }));
                              setErrors({ ...errors, classroom_name: '' });
                            }}
                          />
                        </div>
                        {id && (
                          <div className='w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 lg:w-1/3'>
                            <TextInput label={t('code')} className='w-full' disabled value={formData?.classroom_code} />
                          </div>
                        )}
                      </div>
                      <div className='w-full rounded-xl border border-violet-100 bg-violet-50/40 p-3 lg:w-1/2'>
                        <UsersSelect
                          label={t('administrator')}
                          value={formData?.admin_assigned_id}
                          error={errors?.admin_assigned_id}
                          isClearable
                          role={'ADMIN'}
                          onChange={(value) => {
                            formData.admin_assigned_id = value?.id;
                            setFormData({ ...formData });
                            setErrors({ ...errors, admin_assigned_id: '' });
                          }}
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7'>
                      <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-3'>
                        <UsersSelect
                          label={t('teachers')}
                          value={formData?.teacher_id}
                          error={errors?.teacher_id}
                          isClearable
                          role={'TEACHER'}
                          onChange={(value) => {
                            formData.teacher_id = value?.id;
                            setFormData({ ...formData });
                            setErrors({ ...errors, teacher_id: '' });
                          }}
                        />
                      </div>
                      <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-3'>
                        <UsersSelect
                          label={t('teaching_assistant')}
                          value={formData?.ta_id}
                          isClearable
                          error={errors?.ta_id}
                          role={'TA'}
                          onChange={(value) => {
                            formData.ta_id = value?.id;
                            setFormData({ ...formData });
                            setErrors({ ...errors, ta_id: '' });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className='rounded-2xl border border-emerald-200 bg-white'>
                  <div className='flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/80 px-4 py-3'>
                    <RiBookOpenLine className='size-5 text-emerald-600' />
                    <h2 className='text-sm font-semibold text-emerald-900'>{t('subject')}</h2>
                  </div>
                  <div className='space-y-4 p-4 lg:p-5'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
                      <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
                        <TeachingLocationSelect
                          label={t('select_teaching_location')}
                          placeholder={t('select_teaching_location')}
                          error={errors?.location_id}
                          value={formData.location_id}
                          onChange={(val) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              location_id: val?.id
                            }));
                            setErrors({ ...errors, location_id: '' });
                          }}
                        />
                      </div>
                      <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
                        <SubjectsSelect
                          label={t('select_subject')}
                          placeholder={t('select_subject')}
                          error={errors?.subject_id}
                          value={formData.subject_id}
                          onChange={(val) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              subject_id: val?.id
                            }));
                            setErrors({ ...errors, subject_id: '' });
                          }}
                        />
                      </div>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3'>
                        <TeachingProgramsSelect
                          label={t('teaching_program')}
                          required
                          placeholder={t('please_select')}
                          error={errors?.teaching_program_id}
                          value={formData.teaching_program_id}
                          onChange={(val) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              teaching_program_id: val?.id,
                              lesson_count: val?.lesson_count
                            }));
                            setErrors({ ...errors, teaching_program_id: '' });
                          }}
                        />
                      </div>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3'>
                        <NumberInput
                          label={t('class_periods')}
                          className='w-full'
                          error={errors?.lesson_count}
                          value={formData.lesson_count}
                          disabled
                        />
                      </div>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3 md:col-span-2'>
                        <DateInput
                          label={t('start_time')}
                          placeholder={'dd/mm/yyyy'}
                          error={errors?.start_date}
                          value={formData.start_date}
                          onChange={(value) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              start_date: value || null
                            }));
                            setErrors({ ...errors, start_date: '' });
                          }}
                        />
                      </div>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3 md:col-span-2'>
                        <DateInput
                          label={t('end_time_estimated')}
                          placeholder={'dd/mm/yyyy'}
                          error={errors?.end_date}
                          value={formData.end_date}
                          onChange={(value) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              end_date: value || null
                            }));
                            setErrors({ ...errors, end_date: '' });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className='rounded-2xl border border-fuchsia-200 bg-white'>
                  <div className='flex items-center gap-2 border-b border-fuchsia-100 bg-fuchsia-50/80 px-4 py-3'>
                    <RiGroupLine className='size-5 text-fuchsia-600' />
                    <h2 className='text-sm font-semibold text-fuchsia-900'>{t('add_student')}</h2>
                  </div>
                  <div className='p-4 lg:p-5'>
                    <p className='mb-2 text-sm font-normal text-slate-700'>{t('student_list')}</p>
                    <div
                      className='flex h-10 cursor-pointer items-center justify-between rounded-xl border border-fuchsia-200 bg-fuchsia-50/40 px-3 transition-colors hover:bg-fuchsia-50'
                      onClick={() => {
                        setShowSelectUser(true);
                      }}
                    >
                      <div className='flex items-center'>
                        <div className='flex items-center'>
                          <div className='flex items-center -space-x-1'>
                            {formData?.students?.slice(0, 30).map((user: any) => (
                              <div key={user?.id} className='relative flex items-center'>
                                <Tooltip description={`${user?.student_code} - ${user?.student_name}`}>
                                  <img
                                    src={user?.student_avatar || NO_AVATAR}
                                    alt={user?.student_name}
                                    className='h-8 min-w-8 w-8 rounded-full border object-cover'
                                  />
                                </Tooltip>
                              </div>
                            ))}
                          </div>
                          {formData?.students?.length > 30 && (
                            <div className='ml-2 flex h-8 min-w-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-800'>
                              +{formData?.students?.length - 30}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronDown className='size-4 text-fuchsia-700' />
                    </div>
                    {errors?.students && (
                      <div className='mt-2 flex items-center gap-2'>
                        <img src={ERROR_RED} alt='' /> <p className='text-sm text-primary-error'>{errors?.students}</p>
                      </div>
                    )}
                    <StudentWithFilterSelect
                      show={showSelectUser}
                      setShow={setShowSelectUser}
                      hasTab={!!Number(id)}
                      role='STUDENT'
                      value={formData?.students?.map((user: { id: number }) => user?.id)}
                      onChange={(value) => {
                        if (Number(id)) {
                          formData.removed_student_ids = difference(
                            initStudentIds,
                            value?.map((user) => user?.id)
                          );
                        }
                        setFormData({
                          ...formData,
                          students: value?.map((student) => ({
                            id: student?.id,
                            student_code: student?.username,
                            student_name: student?.display_name,
                            student_avatar: student?.avatar
                          }))
                        });
                        setErrors({ ...errors, students: '' });
                      }}
                    />
                  </div>
                </section>

                <section className='rounded-2xl border border-sky-200 bg-white'>
                  <div className='flex items-center gap-2 border-b border-sky-100 bg-sky-50/80 px-4 py-3'>
                    <RiCalendarScheduleLine className='size-5 text-sky-600' />
                    <h2 className='text-sm font-semibold text-sky-900'>{t('add_schedule')}</h2>
                  </div>
                  <div className='space-y-4 p-4 lg:p-5'>
                    {formData.schedules.map((item: any, index: number) => (
                      <div
                        key={`schedule-${index}`}
                        className='rounded-xl border border-violet-100 bg-violet-50/30 p-4'
                      >
                        <div className='mb-4 flex items-center justify-between border-b border-violet-100 pb-2'>
                          <span className='text-sm font-semibold text-violet-900'>
                            {t('schedule')} #{index + 1}
                          </span>
                          <Button
                            variant={'destructive'}
                            type='button'
                            onClick={() => {
                              const newSchedule = formData.schedules.filter((_: any, idx: number) => idx !== index);
                              item?.id && formData?.removed_schedule_ids?.push(item?.id);
                              setFormData((prev: any) => ({ ...prev, schedules: newSchedule }));
                            }}
                            className='rounded-xl'
                          >
                            <RiDeleteBin6Line className='size-4' />
                            {t('delete')}
                          </Button>
                        </div>
                        <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-2 xl:grid-cols-4'>
                          <WeekdaySelect
                            label={t('weekday')}
                            error={errors?.[`schedules.${index}.day_of_week`]}
                            value={item?.day_of_week}
                            onChange={(value) => {
                              item.day_of_week = value.value;
                              setFormData({ ...formData });
                              setErrors({ ...errors, [`schedules.${index}.day_of_week`]: '' });
                            }}
                          />
                          <TimeInput
                            label={t('start_time')}
                            placeholder={t('start_time')}
                            error={errors?.[`schedules.${index}.start_time`]}
                            value={item?.start_time}
                            onChange={(value) => {
                              item.start_time = value;
                              setFormData({ ...formData });
                              setErrors({ ...errors, [`schedules.${index}.start_time`]: '' });
                            }}
                          />
                          <TimeInput
                            label={t('end_time')}
                            placeholder={t('end_time')}
                            error={errors?.[`schedules.${index}.end_time`]}
                            value={item?.end_time}
                            onChange={(value) => {
                              item.end_time = value;
                              setFormData({ ...formData });
                              setErrors({ ...errors, [`schedules.${index}.end_time`]: '' });
                            }}
                          />
                          <NumberInput
                            label={t('total_minutes_taught')}
                            disabled
                            value={
                              calculateTimeDifference(
                                dayjs.unix(item?.start_time).format('hh:mm'),
                                dayjs.unix(item?.end_time).format('hh:mm')
                              )?.minutes
                            }
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type='button'
                      onClick={() => {
                        setFormData((prev: any) => ({
                          ...prev,
                          schedules: [...prev.schedules, { day_of_week: '', start_time: '', end_time: '' }]
                        }));
                      }}
                      className='rounded-xl bg-emerald-500 text-white hover:bg-emerald-600'
                    >
                      <RiAddLine className='size-4' />
                      {t('add_schedule')}
                    </Button>
                  </div>
                </section>

                <section className='overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/30 p-4'>
                  <div className='overflow-x-auto'>
                    <table className='table-rounded mt-0'>
                      <thead>
                        <tr className='bg-white'>
                          <th colSpan={8} className='bg-white'>
                            <div className='flex justify-start'>
                              <Button
                                type='button'
                                onClick={() => {
                                  classifyByTimePeriod(formData?.schedules);
                                }}
                                className='rounded-xl bg-emerald-500 text-white hover:bg-emerald-600'
                              >
                                <RiRefreshLine className='size-4' />
                                {t('refresh')}
                              </Button>
                            </div>
                          </th>
                        </tr>
                        <tr className='tr-sub bg-primary-blue-100'>
                          <th scope='col' className='w-[1%] whitespace-nowrap'>
                            UTC + 07:00
                          </th>
                          <th scope='col'>{t('monday')}</th>
                          <th scope='col'>{t('tuesday')}</th>
                          <th scope='col'>{t('wednesday')}</th>
                          <th scope='col'>{t('thursday')}</th>
                          <th scope='col'>{t('friday')}</th>
                          <th scope='col'>{t('saturday')}</th>
                          <th scope='col'>{t('sunday')}</th>
                        </tr>
                      </thead>
                      <tbody className='bg-white'>
                        {schedule?.map((sch) => {
                          return (
                            <tr key={sch?.period}>
                              <td className='bg-primary-blue-100'>
                                <div>{sch?.period}</div>
                              </td>
                              {sch?.slot?.map((value, idx) => {
                                return (
                                  <td key={idx} className={`${value && 'bg-secondary-neutral-200'}`}>
                                    {value ? value + ' ' + t('period').toLocaleLowerCase() : ''}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className='my-4 flex flex-wrap items-center justify-center gap-4 lg:gap-10'>
                    <div className='rounded-xl border border-sky-200 bg-white p-2.5'>
                      <p className='text-md font-medium text-sky-800'>
                        {t('estimated_hours_per_week')}:{' '}
                        <span className='text-emerald-600'>
                          {formData?.schedules?.reduce((prev: any, curr: any) => {
                            return (
                              prev +
                              calculateTimeDifference(
                                dayjs.unix(curr?.start_time).format('hh:mm'),
                                dayjs.unix(curr?.end_time).format('hh:mm')
                              )?.hours
                            );
                          }, 0)}
                          h
                        </span>
                      </p>
                    </div>
                    <div className='rounded-xl border border-sky-200 bg-white p-2.5'>
                      <p className='text-md font-medium text-sky-800'>
                        {t('estimated_hours_per_month')}:{' '}
                        <span className='text-emerald-600'>{getHourOfMonth() || 0}h</span>
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/95 px-4 py-2 shadow-[0_-6px_14px_-12px_rgba(15,23,42,0.25)]'>
          <div className='mx-auto flex w-full max-w-6xl justify-center gap-4'>
            <Button
              variant='outline'
              type='button'
              className='min-w-[140px] rounded-xl border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
              onClick={() => {
                navigate('/classroom/list');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant='default'
              type='button'
              className='min-w-[160px] rounded-xl bg-emerald-500 text-white hover:bg-emerald-600'
              onClick={onUpdate}
              disabled={loading}
            >
              {isEdit ? t('update') : t('create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomAdd;
