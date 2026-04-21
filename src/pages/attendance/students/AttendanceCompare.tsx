import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useT } from '@hooks/useT';
import CalendarCustom from '@components/calendarUI/index';
import SelectInput from '@components/fields/SelectInput';
import Loading from '@components/loading/index';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import { TypeErrors } from '@/src/interface';
import { AVATAR } from '@lib/ImageHelper';
import SearchInput from '@components/fields/SearchInput';
import SwitchInput from '@components/fields/SwitchInput';
import TextAreaInput from '@components/fields/TextAreaInput';
import { Toast } from '@components/toast';
import _, { filter, has } from 'lodash';
import CLassroomSelect from '@components/selects/ClassroomSelect';
import NumberInput from '@components/fields/NumberInput';
import AttitudeSelect from '@components/selects/AttitudeSelect';
import { Button } from '@components/ui/button';
import PeriodSelect from '@components/selects/PeriodSelect';
import attendanceServices from '@services/attendance';
import { getCurrentTimestamp } from '@lib/TimeHelper';
import studentServices from '@services/student';
import { useRootStore } from '@store/index';
import { getUserInfo } from '@lib/GetInfoHelper';

interface Props {}

const AttendanceCompare = (props: Props) => {
  const { users } = useRootStore();
  const { id, log_id } = useParams();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({
    attendance_time: getCurrentTimestamp()
  });
  const [logVersion, setLogVerSion] = useState<any>({});
  const [newestVersion, setNewestVersion] = useState<any>({});
  const [differences, setDifferences] = useState<any>({});
  const [errors, setErrors] = useState<TypeErrors>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [version, setVersion] = useState<'new' | 'old'>('new');
  const [filterStatus, setFilterStatus] = useState([
    { value: 'attend_class', label: t('attend_class') },
    { value: 'absent', label: t('absent') },
    { value: 'exclude_lesson', label: t('exclude_lesson') },
    { value: 'no_deduction_class', label: t('no_deduction_class') }
  ]);
  const [filterBy, setFilterBy] = useState(null);

  const lesson_statuses = [
    { value: 1, label: t('arrived_early') },
    { value: 2, label: t('arrived_on_time') },
    { value: 3, label: t('arrived_late') },
    { value: 4, label: t('absent_with_permission') },
    { value: 5, label: t('absent_without_permission') }
  ];

  const getDataCompare = async () => {
    setLoading(true);
    try {
      const response: any = await attendanceServices.getStudentAttendancesLogCompare(Number(id), Number(log_id));
      setLogVerSion(response?.log_version);
      setNewestVersion(response?.newest_version);
      setFormData(response?.newest_version);
      setDifferences(response?.differences);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkKeyDiff = (key: string) => {
    let text_class = 'text-primary-neutral-900 font-normal';
    if (version == 'new') {
      if (has(differences, key)) {
        text_class = 'text-primary-success font-semibold';
      }
    } else {
      if (has(differences, key)) {
        text_class = 'text-primary-error font-semibold';
      }
    }
    return text_class;
  };

  useEffect(() => {
    if (Number(id) && Number(log_id)) {
      getDataCompare();
    }
  }, [id]);

  return (
    <>
      <div className='pb-20'>
        <Loading loading={loading} />
        <div className='shadow-lg card bg-primary-neutral-50 '>
          <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
            <h3 className='text-base font-semibold leading-[100%]'>{t('student_attendance')}</h3>
            <div className='flex items-center gap-2'>
              <Button
                className={`${version == 'new' ? 'bg-primary-success text-white hover:bg-primary-success hover:text-white' : 'bg-white text-primary-neutral-900 hover:bg-white hover:text-primary-neutral-900'}`}
                size={'sm'}
                onClick={() => {
                  setFormData(newestVersion);
                  setVersion('new');
                }}
              >
                {t('new_version')}
              </Button>
              <Button
                className={`${version == 'old' ? 'bg-primary-success text-white hover:bg-primary-success hover:text-white' : 'bg-white text-primary-neutral-900 hover:bg-white hover:text-primary-neutral-900'}`}
                size={'sm'}
                onClick={() => {
                  setFormData(logVersion);
                  setVersion('old');
                }}
              >
                {t('old_version')}
              </Button>
            </div>
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
                      } else setFormData({ ...formData, attendance_time: value });
                    }}
                  />
                </div>
                <div className='p-2 space-y-4 rounded-lg'>
                  <div className='w-full'>
                    <SubjectsSelect
                      label={t('subject')}
                      disabled
                      required
                      value={formData?.subject_id}
                      error={errors?.subject_id}
                      onChange={(val) => {
                        setFormData({ ...formData, subject_id: val?.id });
                        setErrors({ ...errors, subject_id: '' });
                      }}
                    />
                  </div>
                  <div className='full'>
                    <TeachingLocationSelect
                      label={t('teaching_location')}
                      disabled
                      required
                      error={errors?.location_id}
                      value={formData?.location_id}
                      onChange={(val) => {
                        setFormData({ ...formData, location_id: val?.id });
                        setErrors({ ...errors, location_id: '' });
                      }}
                    />
                  </div>
                  <div className='full'>
                    <CLassroomSelect
                      label={t('classroom')}
                      disabled
                      required
                      error={errors?.classroom_id}
                      locationId={formData?.location_id}
                      subjectId={formData?.subject_id}
                      value={formData?.classroom_id}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          classroom_id: val?.id,
                          students: val?.students?.map((user) => ({
                            student_id: user?.student_id,
                            student_name: user?.student_name,
                            point: 10,
                            attitude: '',
                            message: '',
                            counted: 1,
                            status: 1
                          }))
                        });

                        setErrors({ ...errors, classroom_id: '' });
                      }}
                    />
                  </div>
                  <div className='full'>
                    <PeriodSelect
                      menuPlacement='top'
                      disabled
                      required
                      label={t('period')}
                      value={formData?.timeline_id}
                      error={errors?.timeline_id}
                      onChange={(value) => {
                        setFormData({ ...formData, timeline_id: value?.id });
                        setErrors({ ...errors, timeline_id: '' });
                      }}
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
                  {formData?.classroom_id && (
                    <div className='card-body divide-y'>
                      {formData?.students
                        ?.filter((student: any) => {
                          if (search) {
                            return student?.student_name?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
                          } else return true;
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
                                  className='object-cover w-full rounded-lg'
                                  src={getUserInfo(student?.student_id)?.avatar}
                                  alt=''
                                />
                              </div>
                              <div className='flex-1'>
                                <div className='mb-3 text-lg'>
                                  {getUserInfo(student?.student_id)?.display_name} -{' '}
                                  {getUserInfo(student?.student_id)?.username}
                                </div>
                                <div className='flex gap-3'>
                                  <div className='w-1/3 space-y-4'>
                                    <p className={`${checkKeyDiff(`students.${index}.status`)} text-sm mb-2`}>
                                      {t('lesson_status')}
                                      <span className='text-primary-error'>*</span>
                                    </p>
                                    <SelectInput
                                      required
                                      disabled
                                      options={lesson_statuses}
                                      value={lesson_statuses.find((s) => s?.value == student?.status)}
                                      error={errors?.[`students.${index}.status`]}
                                      onChange={(value) => {}}
                                    />
                                    <div className='grid grid-cols-2 gap-x-3'>
                                      <div>
                                        <p className={`${checkKeyDiff(`students.${index}.point`)} text-sm mb-2`}>
                                          {t('academic_grading')}
                                          <span className='text-primary-error'>*</span>
                                        </p>
                                        <NumberInput
                                          required
                                          disabled
                                          value={student?.point}
                                          error={errors?.[`students.${index}.point`]}
                                          onChange={(value) => {}}
                                        />
                                      </div>
                                      <div>
                                        <p className={`${checkKeyDiff(`students.${index}.attitude`)} text-sm mb-2`}>
                                          {t('attitude_evaluation')}
                                          <span className='text-primary-error'>*</span>
                                        </p>
                                        <AttitudeSelect
                                          required
                                          disabled
                                          value={student?.attitude}
                                          error={errors?.[`students.${index}.attitude`]}
                                          onChange={(value) => {}}
                                        />
                                      </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                      <SwitchInput
                                        className='w-max'
                                        disabled
                                        checked={student?.counted}
                                        onCheckedChange={(value) => {}}
                                      />
                                      <p className={`${checkKeyDiff(`students.${index}.counted`)} text-sm`}>
                                        {t('exclude_lesson')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className='w-2/3'>
                                    <p className={`${checkKeyDiff(`students.${index}.message`)} text-sm mb-2`}>
                                      {t('message_to_parents')}
                                    </p>
                                    <TextAreaInput
                                      className='border-primary-neutral-200'
                                      rows={8}
                                      disabled
                                      error={errors?.[`students.${index}.message`]}
                                      value={student?.message}
                                      onChange={(value) => {}}
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
    </>
  );
};

export default AttendanceCompare;
