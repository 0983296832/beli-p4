import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import CLassroomSelect from '@components/selects/ClassroomSelect';
import DateInput from '@components/fields/DateInput';
import SplitTimeInput from '@components/fields/SplitTimeInput';
import { useT } from '@hooks/useT';
import SwitchInput from '@components/fields/SwitchInput';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter } from '@components/ui/alert-dialog';
import Icon from '../../components/Icon/index';
import {
  DELETE_03,
  INFORMATION_CIRCLE_ICON,
  PRACTICE_MODE_1,
  PRACTICE_MODE_2,
  RADIO_CHECK_BLUE
} from '@lib/ImageHelper';
import SelectInput from '@components/fields/SelectInput';
import StudentsGroupSelect from '@components/selects/GroupStudentSelect';
import { TypeErrors } from '@/interface';
import { convertTimestampToString, getCurrentTimestamp, getTimeAgo, getTimeUntil } from '@lib/TimeHelper';
import NumberInput from '@components/fields/NumberInput';
import exerciseServices from '@services/exercise';
import { cloneDeep, uniq } from 'lodash';
import { Toast } from '@components/toast';
import dayjs from 'dayjs';
import { getSubjectInfo } from '@lib/GetInfoHelper';
import Tooltip from '@components/tooltip';
import { useNavigate } from 'react-router-dom';
import Loading from '@components/loading';
import TextInput from '@components/fields/TextInput';
import StudentsGroupSelectVirtualized from '../../components/selects/GroupStudentSelectVirtualized';

interface Props {
  state: 'default' | 'assign_task' | 'print';
  setState: React.Dispatch<React.SetStateAction<'default' | 'assign_task' | 'print'>>;
  exerciseId: number;
  detailExercise: any;
}

export const ModalTimeSetup = ({
  show,
  setShow,
  formData,
  setFormData
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
}) => {
  const [isUnlimited, setIsUnlimited] = useState(false);
  const { t } = useT();

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent className='max-w-[786px] p-5 bg-white'>
        <div>
          <p className='text-lg font-semibold mb-3'>{t('start_end_time')}</p>
          <div className='border-t py-6'>
            <p className='text-lg font-semibold mb-3'>{t('start_time')}</p>
            <div className='flex justify-between mb-6'>
              <p className=' text-primary-neutral-700 mb-6 font-medium'>
                {formData?.start_time ? (
                  <>
                    {t('exam_start_in')} <span className='font-bold'>{getTimeUntil(formData?.start_time)}</span>
                  </>
                ) : (
                  t('not_set_up')
                )}
              </p>
              <div className='flex items-center gap-3'>
                <p className='text-lg font-semibold'>{t('start_immediately')}</p>
                <div>
                  <SwitchInput
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        start_time: checked && dayjs.unix(dayjs().unix()).add(1, 'minute').unix()
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='w-2/5'>
                <DateInput
                  value={formData?.start_time}
                  onChange={(value) => {
                    setFormData({ ...formData, start_time: value });
                  }}
                />
              </div>
              <div className='w-2/5'>
                <SplitTimeInput
                  value={formData?.start_time}
                  defaultDate={formData?.start_time}
                  onChange={(value) => {
                    setFormData({ ...formData, start_time: value });
                  }}
                />
              </div>
            </div>
          </div>

          <div className='border-t py-6'>
            <p className='text-lg font-semibold mb-3'>{t('end_time')}</p>
            <div className='flex justify-between '>
              <p className=' text-primary-neutral-700 mb-6 font-medium'>
                {t('end_in')} <span className='font-bold'>{getTimeUntil(formData?.end_time)}</span>
              </p>
              <div className='flex items-center gap-3'>
                <p className='text-lg font-semibold'>{t('no_deadline')}</p>
                <div>
                  <SwitchInput
                    checked={isUnlimited}
                    onCheckedChange={(checked) => {
                      setIsUnlimited(checked);
                      setFormData({
                        ...formData,
                        end_time: checked
                          ? dayjs
                              .unix(formData?.start_time ? formData?.start_time : dayjs().unix())
                              .add(10, 'y')
                              .unix()
                          : dayjs
                              .unix(formData?.start_time ? formData?.start_time : dayjs().unix())
                              .add(30, 'minute')
                              .unix()
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='w-2/5'>
                <DateInput
                  disabled={isUnlimited}
                  value={formData?.end_time}
                  onChange={(value) => {
                    setFormData({ ...formData, end_time: value });
                  }}
                />
              </div>
              <div className='w-2/5'>
                <SplitTimeInput
                  disabled={isUnlimited}
                  value={formData?.end_time}
                  defaultDate={formData?.end_time}
                  onChange={(value) => {
                    setFormData({ ...formData, end_time: value });
                  }}
                />
              </div>
            </div>
          </div>
          <div className='border-t pt-6 pb-1'>
            <div className='flex items-center gap-2'>
              <p className='font-medium'>{t('end_by')}:</p>
              <div
                className='rounded-full border px-3 py-2 hover:bg-primary-neutral-200 cursor-pointer'
                onClick={() => {
                  setFormData({ ...formData, end_time: dayjs().add(1, 'day').unix() });
                }}
              >
                <p>1 {t('days').toLocaleLowerCase()}</p>
              </div>
              <div
                className='rounded-full border px-3 py-2 hover:bg-primary-neutral-200 cursor-pointer'
                onClick={() => {
                  setFormData({ ...formData, end_time: dayjs().add(1, 'week').unix() });
                }}
              >
                <p>1 {t('weeks').toLocaleLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
        <AlertDialogFooter className='flex justify-end'>
          <Button
            type='submit'
            className='px-10'
            onClick={() => {
              setShow(false);
            }}
          >
            {t('close')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const AssignTaskSetup = ({ exerciseId, setState, detailExercise }: Props) => {
  const { t } = useT();
  const [showModalSetupTime, setShowModalSetupTime] = useState(false);
  const [formData, setFormData] = useState<any>({
    mode: 1,
    filters: [],
    start_time: dayjs.unix(dayjs().unix()).add(30, 'minute').unix(),
    end_time: dayjs.unix(dayjs().unix()).add(300, 'minute').unix(),
    is_shuffle_questions: 1,
    is_shuffle_answer: 1,
    show_answer_during_exam: 1
  });
  const [errors, setErrors] = useState<TypeErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const time_attempt_opts = [
    {
      value: 0,
      label: t('unlimited')
    },
    {
      value: 1,
      label: 1
    },
    {
      value: 2,
      label: 2
    },
    {
      value: 3,
      label: 3
    },
    {
      value: 4,
      label: 4
    },
    {
      value: 5,
      label: 5
    }
  ];
  const proficiency_goal = [
    {
      value: 60,
      label: '60%'
    },
    {
      value: 70,
      label: '70%'
    },
    {
      value: 80,
      label: '80%'
    },
    {
      value: 90,
      label: '90%'
    },
    {
      value: 100,
      label: '100%'
    }
  ];
  const retry_per_question = [
    {
      value: 1,
      label: t('time_to_retry', { time: 1 })
    },
    {
      value: 2,
      label: t('time_to_retry', { time: 2 })
    },
    {
      value: 3,
      label: t('unlimited')
    }
  ];
  const show_answer_opts = [
    {
      value: 1,
      label: t('on')
    },
    // {
    //   value: 2,
    //   label: t('show_correct_only')
    // },
    {
      value: 0,
      label: t('off')
    }
  ];
  const show_question_opts = [
    {
      value: 1,
      label: t('on')
    },
    // {
    //   value: 2,
    //   label: t('show_questions_only')
    // },
    {
      value: 0,
      label: t('off')
    }
  ];
  const show_answer_after_session_opts = [
    {
      value: 1,
      label: t('on')
    },
    {
      value: 0,
      label: t('off')
    }
  ];
  const timer_opts = [
    {
      value: 1,
      label: t('on')
    },
    {
      value: 0,
      label: t('off')
    }
  ];
  const rank_opts = [
    {
      value: 1,
      label: t('on')
    },
    {
      value: 0,
      label: t('off')
    }
  ];

  const onAssign = async () => {
    if (!formData?.exam_name?.trim()) {
      errors.exam_name = 'assignment_name_cannot_be_empty';
      setErrors({ ...errors });
      return Toast('warning', t('assignment_name_cannot_be_empty'));
    }
    if (!formData?.filters?.length) {
      return Toast('warning', t('assigned_object_cannot_be_empty'));
    }
    if (!formData?.start_time) {
      return Toast('warning', t('please_select_start_time'));
    }
    if (!formData?.end_time) {
      return Toast('warning', t('please_select_end_time'));
    }
    setLoading(true);
    try {
      const body = cloneDeep(formData);
      if (body.mode == 1) {
        delete body.target_percentage;
        delete body.time_for_exam;
      }
      if (body?.mode == 2) {
        delete body.target_percentage;
        delete body.time_for_exam;
      }
      if (body?.mode == 3) {
        delete body.try_number_per_question;
        delete body.target_percentage;
        delete body.ranking;
        delete body.time_for_each_question;
        body.show_answer_during_exam = 0;
      }

      const res: any = await exerciseServices.postAssignExercise(exerciseId, body);
      Toast('success', res?.message);
      setErrors({});
      setLoading(false);
      setState('default');
      navigate(`/curriculum/report/detail/${res?.id}`);
    } catch (error: any) {
      setLoading(false);
      setErrors(error?.response?.data?.errors);
    }
  };

  return (
    <div className='no-padding-container relative'>
      <Loading loading={loading} />
      <div className='px-10 py-3 bg-white border-t flex items-center justify-between fixed top-[62px] left-[70px] right-0 z-[10] shadow-sm'>
        <div className='flex items-center gap-2'>
          <Button
            variant={'outline'}
            className='size-10 p-0'
            onClick={() => {
              setState('default');
            }}
          >
            <ChevronLeft width={36} height={36} />
          </Button>
          <div className='px-2.5 border-r-2 h-10 flex items-center justify-center'>
            <p className='text-lg text-primary-neutral-700'>{t('name_of_lesson')}</p>
          </div>
          <div className='flex items-center gap-4 text-sm h-10'>
            <div className='w-72'>
              <TextInput
                placeholder={t('example_test_15min')}
                className={errors.exam_name ? 'border-red-500 bg-red-100' : ''}
                value={formData?.exam_name}
                onChange={(value) => {
                  setFormData({ ...formData, exam_name: value });
                  errors.exam_name = '';
                  setErrors({ ...errors });
                }}
              />
            </div>
            <p className={`text-primary-neutral-700 custom_marker`}>
              {' '}
              {getSubjectInfo(detailExercise?.subject_id)?.subject_name} -{' '}
              {getSubjectInfo(detailExercise?.subject_id)?.subject_code}
            </p>
            <p className='text-primary-neutral-700 custom_marker'>
              {detailExercise?.learning_program?.learning_program_name} -{' '}
              {detailExercise?.learning_program?.learning_program_code}
            </p>
            <p className='text-primary-neutral-700 custom_marker'>
              {detailExercise?.questions?.length} {t('questions').toLocaleLowerCase()}
            </p>
          </div>
        </div>
        <Button
          disabled={loading}
          onClick={() => {
            onAssign();
          }}
        >
          {t('assign_task')}
        </Button>
      </div>
      <div className='py-6 w-[800px] mx-auto mt-[60px]'>
        <div className='mx-auto  bg-white rounded-lg shadow-lg p-6'>
          <div className='py-3 border-b mb-6'>
            <p className='text-2xl font-semibold'>{t('task_assignment_settings')}</p>
          </div>
          <p className='text-lg font-semibold mb-3'>{t('assign_task_to_class')}</p>
          <p className='text-sm mb-3 text-primary-neutral-700'>{t('assign_task_to_class')}</p>
          <div className='border-b space-y-4 pb-6'>
            {formData?.filters?.map((filter: any, index: number) => {
              return (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <p className=''>
                      {t('location')} # {index + 1}
                    </p>
                    <Button
                      variant={'destructive'}
                      type='button'
                      onClick={() => {
                        setFormData({
                          ...formData,
                          filters: formData?.filters?.filter((_: any, idx: number) => idx != index)
                        });
                      }}
                      className=''
                    >
                      <img src={DELETE_03} alt='' />
                      {t('delete')}
                    </Button>
                  </div>

                  <div className='flex items-center gap-3  '>
                    <div className='w-3/5'>
                      <TeachingLocationSelect
                        value={filter?.location_id}
                        label={t('location')}
                        error={errors?.[`filters.${index}.location_id`]}
                        isClearable
                        onChange={(value) => {
                          filter.location_id = value?.id;
                          setFormData({ ...formData });
                          errors[`filters.${index}.location_id`] = '';
                          setErrors({ ...errors });
                        }}
                      />
                    </div>
                    <div className='w-2/5'>
                      <CLassroomSelect
                        locationId={filter?.location_id}
                        isClearable
                        isMulti
                        label={t('classroom')}
                        value={filter?.classroom_ids}
                        error={errors?.[`filters.${index}.classroom_ids`]}
                        onChange={(value) => {
                          filter.classroom_ids = value?.map((cl) => cl?.id);
                          setFormData({ ...formData });
                          errors[`filters.${index}.classroom_ids`] = '';
                          setErrors({ ...errors });
                        }}
                      />
                    </div>
                  </div>
                  <div className='w-full mt-3 '>
                    <StudentsGroupSelectVirtualized
                      isMulti
                      role='STUDENT'
                      label={t('students')}
                      isClearable
                      classroomIds={filter?.classroom_ids}
                      placeholder={t('select_student')}
                      value={filter?.student_ids || []}
                      error={errors?.[`filters.${index}.student_ids`]}
                      onChange={(users) => {
                        filter.student_ids = uniq(users?.map((user) => user?.id));
                        setFormData({ ...formData });
                        errors[`filters.${index}.student_ids`] = '';
                        setErrors({ ...errors });
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <Button
              className='bg-primary-success hover:bg-primary-success/80 mt-3'
              onClick={() => {
                formData.filters.push({ location_id: null, classroom_ids: [], student_ids: [] });
                setFormData({ ...formData });
              }}
            >
              {t('add_new_locations')}
            </Button>
          </div>

          <p className='text-lg font-semibold mt-6 mb-3'>{t('start_end_time')}</p>
          <div className='flex items-center justify-between border-b'>
            <div>
              <p className=' text-primary-neutral-700 mb-4'>
                {t('start_immediately')} -{' '}
                {formData?.start_time ? convertTimestampToString(formData?.start_time, 'right') : t('not_set_up')}
              </p>
              <div className='flex items-center gap-2 mb-6'>
                <p className='font-medium'>{t('end_by')}:</p>
                {formData?.end_time ? convertTimestampToString(formData?.end_time, 'right') : t('not_set_up')}
                {/* <div className='rounded-full border px-3 py-2 ml-2 hover:bg-primary-neutral-200 cursor-pointer'>
                  <p>{t('no_deadline')}</p>
                </div>
                <div className='rounded-full border px-3 py-2 hover:bg-primary-neutral-200 cursor-pointer'>
                  <p>1 {t('days').toLocaleLowerCase()}</p>
                </div>
                <div className='rounded-full border px-3 py-2 hover:bg-primary-neutral-200 cursor-pointer'>
                  <p>1 {t('weeks').toLocaleLowerCase()}</p>
                </div> */}
              </div>
            </div>
            <Button variant={'outline'} onClick={() => setShowModalSetupTime(true)}>
              {t('change')} <ChevronDown size={36} />
            </Button>
          </div>
          <p className='text-lg font-semibold mb-3 mt-6'>{t('select_test_mode')}</p>
          <div className='grid grid-cols-3 gap-6 w-full pb-6 border-b'>
            <div>
              <div
                className={`${formData?.mode === 1 && 'border-primary-blue-500  bg-primary-blue-50'} border rounded-lg cursor-pointer hover:border-primary-blue-500  hover:bg-primary-blue-50 relative`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    mode: 1,
                    target_percentage: undefined,
                    time_for_exam: undefined,
                    show_answer_during_exam: 1
                  });
                }}
              >
                {formData?.mode === 1 && <Icon icon={RADIO_CHECK_BLUE} className='absolute top-2 right-2' />}

                <img src={PRACTICE_MODE_1} className='mx-auto w-24 mt-7 mb-2' />
              </div>
              <p className={`mt-4 text-center ${formData?.mode === 1 && 'text-primary-blue-500'} font-medium`}>
                {t('practice_mode')}
              </p>
              <p className='text-sm text-primary-neutral-700 text-center'>{t('multiple_attempts')}</p>
            </div>
            <div>
              <div
                className={`${formData?.mode === 2 && 'border-primary-blue-500  bg-primary-blue-50'} border rounded-lg cursor-pointer hover:border-primary-blue-500  hover:bg-primary-blue-50 relative`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    mode: 2,
                    try_number: undefined,
                    time_for_exam: undefined,
                    show_answer_during_exam: 1
                  });
                }}
              >
                {formData?.mode === 2 && <Icon icon={RADIO_CHECK_BLUE} className='absolute top-2 right-2' />}
                <img src={PRACTICE_MODE_2} className='mx-auto w-20 mt-7 mb-2' />
              </div>
              <p className={`mt-4 text-center ${formData?.mode === 2 && 'text-primary-blue-500'} font-medium`}>
                {t('correct_answer')}
              </p>
              <p className='text-sm text-primary-neutral-700 text-center'>{t('complete_until_pass')}</p>
            </div>
            <div>
              <div
                className={`${formData?.mode === 3 && 'border-primary-blue-500  bg-primary-blue-50'} border rounded-lg cursor-pointer hover:border-primary-blue-500  hover:bg-primary-blue-50 relative`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    mode: 3,
                    show_answer_during_exam: 0,
                    try_number: undefined,
                    target_percentage: undefined,
                    time_for_each_question: undefined
                  });
                }}
              >
                {formData?.mode === 3 && <Icon icon={RADIO_CHECK_BLUE} className='absolute top-2 right-2' />}
                <img src={PRACTICE_MODE_2} className='mx-auto w-20 mt-7 mb-2' />
              </div>
              <p className={`mt-4 text-center ${formData?.mode === 3 && 'text-primary-blue-500'} font-medium`}>
                {t('test_mode')}
              </p>
              <p className='text-sm text-primary-neutral-700 text-center'>{t('one_time_attempt')}</p>
            </div>
          </div>
          <p className='text-lg font-semibold mb-3 mt-6'>{t('session_settings')}</p>
          <div className='border-t py-6 space-y-7'>
            {formData?.mode == 2 && (
              <>
                <div className='flex items-start justify-between gap-14'>
                  <div className='flex-1'>
                    <p className='font-semibold'>{t('set_proficiency_goal')}</p>
                  </div>
                  <div className='w-44'>
                    <SelectInput
                      options={proficiency_goal}
                      error={errors?.target_percentage}
                      value={proficiency_goal.find((vl) => vl?.value == formData?.target_percentage) ?? null}
                      onChange={(val) => {
                        setFormData({ ...formData, target_percentage: val?.value });
                        setErrors({ ...errors, target_percentage: '' });
                      }}
                    />
                  </div>
                </div>
                {/* <div className='flex items-start justify-between gap-14'>
                  <div className='flex-1'>
                    <p className='font-semibold'>{t('retry_per_question')}</p>
                  </div>
                  <div className='w-44'>
                    <SelectInput
                      options={retry_per_question}
                      error={errors?.try_number_per_question}
                      value={retry_per_question.find((vl) => vl?.value == formData?.try_number_per_question) ?? null}
                      onChange={(val) => {
                        setFormData({ ...formData, try_number_per_question: val?.value });
                        setErrors({ ...errors, try_number_per_question: '' });
                      }}
                    />
                  </div>
                </div> */}
              </>
            )}
            {formData?.mode == 1 && (
              <div className='flex items-center justify-between gap-14'>
                <div className='flex-1 flex items-center gap-3'>
                  <p className='font-semibold mb-2'>{t('student_attempts')}</p>
                  <Tooltip description={t('attempts_per_session')}>
                    <Icon icon={INFORMATION_CIRCLE_ICON} />
                  </Tooltip>
                </div>
                <div className='w-44'>
                  <SelectInput
                    options={time_attempt_opts}
                    error={errors?.try_number}
                    value={time_attempt_opts.find((vl) => vl?.value == formData?.try_number) ?? null}
                    onChange={(val) => {
                      setFormData({ ...formData, try_number: val?.value });
                      setErrors({ ...errors, try_number: '' });
                    }}
                  />
                </div>
              </div>
            )}

            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>{t('show_answer_after_question')}</p>
                <Tooltip description={t('show_explain_each')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>

              <div className='w-44'>
                <SelectInput
                  options={show_answer_opts}
                  disabled={formData?.mode == 3}
                  error={errors?.show_answer_during_exam}
                  value={show_answer_opts.find((vl) => vl?.value == formData?.show_answer_during_exam) ?? null}
                  onChange={(val) => {
                    setFormData({ ...formData, show_answer_during_exam: val?.value });
                    setErrors({ ...errors, show_answer_during_exam: '' });
                  }}
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>{t('show_answer_after_submission')}</p>
                <Tooltip description={t('show_explain_after')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>

              <div className='w-44'>
                <SelectInput
                  options={show_question_opts}
                  error={errors?.show_answer_after_exam}
                  value={show_question_opts.find((vl) => vl?.value == formData?.show_answer_after_exam) ?? null}
                  onChange={(val) => {
                    setFormData({ ...formData, show_answer_after_exam: val?.value });
                    setErrors({ ...errors, show_answer_after_exam: '' });
                  }}
                />
              </div>
            </div>
            <div className='flex items-start justify-between gap-14 w-full'>
              <div className='flex-1'>
                <p className='font-semibold mb-2 '>{t('shuffle_questions')}</p>
              </div>
              <div className='w-max'>
                <SwitchInput
                  checked={formData?.is_shuffle_questions == 1}
                  onCheckedChange={(value) => {
                    setFormData({ ...formData, is_shuffle_questions: value ? 1 : 0 });
                  }}
                />
              </div>
            </div>
            <div className='flex items-start justify-between gap-14 w-full'>
              <div className='flex-1'>
                <p className='font-semibold mb-2'>{t('shuffle_choices')}</p>
              </div>
              <div className='w-max'>
                <SwitchInput
                  checked={formData?.is_shuffle_answer == 1}
                  onCheckedChange={(value) => {
                    setFormData({ ...formData, is_shuffle_answer: value ? 1 : 0 });
                  }}
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>
                  {t('timer_each_question')}{' '}
                  <span className='text-sm text-primary-neutral-600'>({t('second').toLocaleLowerCase()})</span>
                </p>
                <Tooltip description={t('timer_each_bonus')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>
              <div className='w-44'>
                <NumberInput
                  disabled={formData.mode == 3}
                  value={formData?.time_for_each_question}
                  error={errors?.time_for_each_question}
                  suffix={' ' + t('second').toLocaleLowerCase()}
                  onChange={(value) => {
                    setFormData({ ...formData, time_for_each_question: value });
                    setErrors({ ...errors, time_for_each_question: '' });
                  }}
                />
              </div>
            </div>
            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>
                  {t('timer_whole_test')}{' '}
                  <span className='text-sm text-primary-neutral-600'>({t('minute').toLocaleLowerCase()})</span>
                </p>
                <Tooltip description={t('total_countdown_time')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>

              <div className='w-44'>
                <NumberInput
                  disabled={formData.mode !== 3}
                  value={formData?.time_for_exam}
                  error={errors?.time_for_exam}
                  suffix={' ' + t('minute').toLocaleLowerCase()}
                  onChange={(value) => {
                    setFormData({ ...formData, time_for_exam: value });
                    setErrors({ ...errors, time_for_exam: '' });
                  }}
                />
              </div>
            </div>
            {formData.mode == 1 && (
              <div className='flex items-start justify-between gap-14'>
                <div className='flex-1'>
                  <p className='font-semibold mb-2'>{t('show_leaderboard')}</p>
                </div>
                <div className='w-44'>
                  <SelectInput
                    options={rank_opts}
                    error={errors?.ranking}
                    value={rank_opts.find((vl) => vl?.value == formData?.ranking) ?? null}
                    onChange={(val) => {
                      setFormData({ ...formData, ranking: val?.value });
                      setErrors({ ...errors, ranking: '' });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalTimeSetup
        show={showModalSetupTime}
        setShow={setShowModalSetupTime}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default AssignTaskSetup;
