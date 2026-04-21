import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { useNavigate, useParams } from 'react-router-dom';
import TextInput from '@components/fields/TextInput';
import TextAreaInput from '@components/fields/TextAreaInput';
import { Button } from '@components/ui/button';
import CurriculumSelect from '@components/selects/CurriculumSelect';
import Loading from '@components/loading';
import EmptyTable from '@components/empty/EmptyTable';
import EditQuestion from './components/EditQuestion';
import {
  ARROW_RIGHT,
  CAMERA,
  TICK_ICON,
  CANCEL_ICON,
  DELETE_03,
  DELETE_BLACK,
  EDIT_BLACK,
  IDEA_ICON,
  MULTI_CHOICE,
  NO_IMAGE,
  PLAY_SQUARE,
  PLUS_BLUE,
  PLUS_WHITE,
  ERROR_RED
} from '@lib/ImageHelper';
import { QuestionsTypeOptions } from '@components/selects/QuestionsTypeSelect';
import Confirm from '../../components/confirm/index';
import ScoreSelect from '@components/selects/ScoreSelect';
import ModalPreview from './components/ModalPreview';
import { removeInlineStyles } from '@lib/DomHelper';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import Upload, { UploadTrigger } from '@components/upload';
import NumberInput from '../../components/fields/NumberInput';
import SelectInput from '@components/fields/SelectInput';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import CLassroomSelect from '@components/selects/ClassroomSelect';
import { FILL_IN_THE_BLANK, MATCHING, MOCK_DATA, MULTIPLE_CHOICE, ORDERING } from './constant';
import Icon from '@components/Icon';
import { Toast } from '@components/toast';
import exerciseServices from '../../services/exercise';
import { cloneDeep, difference } from 'lodash';
import { TypeUser } from '@store/index';
import Tooltip from '@components/tooltip';
import { ChevronDown } from 'lucide-react';
import StudentWithFilterSelect from '@components/selects/StudentWithFilterSelect';
import StudentsGroupSelect from '../../components/selects/GroupStudentSelect';
import LearningProgramsSelect from '@components/selects/LearningProgramSelect';
import { cn } from '@lib/utils';
import { MultipleChoiceOption, ReverseWordOption } from '@/types';

const ExerciseEdit = () => {
  const { t } = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>({ questions: [] });
  const [errors, setErrors] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [type, setType] = useState<'add' | 'edit'>('add');
  const [showModalPreview, setShowModalPreview] = useState(false);
  const [previewType, setPreviewType] = useState<
    'multiple_choice' | 'fill_the_blank' | 'matching' | 'sort' | 'reverse_word'
  >('multiple_choice');
  const statuses = [
    { value: 1, label: t('public') },
    { value: 2, label: t('restriction') }
  ];

  const getDetail = async (filters?: any) => {
    let params = {
      fields:
        'identity,avatar,exercise_name,exercise_code,description,learning_program_id,subject_id,payment_type,retail_price,last_updated_by,last_updated_user,valid,created_at,updated_at,questions,user_ability,view_mode',

      search: '',
      filtering: {}
    };

    setLoading(true);
    try {
      const { data }: any = await exerciseServices.getExercise(Number(id), params);
      const {
        avatar,
        exercise_name,
        exercise_code,
        description,
        learning_program_id,
        subject_id,
        questions,
        view_mode
      } = data;
      setFormData({
        avatar,
        exercise_name,
        exercise_code,
        description,
        learning_program_id,
        subject_id,
        questions,
        view_mode
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Number(id) && getDetail();
  }, [id]);

  const onUpdate = async () => {
    setLoading(true);
    try {
      if (Number(id)) {
        const body = cloneDeep(formData);
        const res: any = await exerciseServices.putExercise(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/exercise/list');
      } else {
        const body = cloneDeep(formData);
        const res: any = await exerciseServices.postExercise(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/exercise/list');
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  const onAddQuestion = (index: number, new_question: any) => {
    if (index < 0) {
      formData?.questions.push(new_question);
      setFormData({ ...formData });
    } else {
      formData?.questions.splice(index + 1, 0, new_question);
      setFormData({ ...formData });
    }
  };
  const onUpdateQuestion = (index: number, new_question: any) => {
    if (index >= 0) {
      formData.questions[index] = new_question;
      setFormData({ ...formData });
    }
  };

  const handleDelete = () => {
    formData.questions = formData.questions?.filter((_: any, idx: number) => idx !== questionIndex);
    setFormData({ ...formData });
    setIsShowConfirm(false);
  };

  useEffect(() => {
    const sessionCurriculumId = sessionStorage.getItem('curriculum_id');
    const subjectId = sessionStorage.getItem('subject_id');
    if (sessionCurriculumId && subjectId) {
      setFormData({ ...formData, learning_program_id: Number(sessionCurriculumId), subject_id: Number(subjectId) });
    }
    return () => {
      sessionStorage.removeItem('curriculum_id');
      sessionStorage.removeItem('subject_id');
    };
  }, []);

  return (
    <div className='space-y-6'>
      <div className='shadow-lg card bg-primary-neutral-50 '>
        <Loading loading={loading} />
        <Confirm
          show={isShowConfirm}
          type='warning'
          onCancel={() => {
            setIsShowConfirm(false);
          }}
          onSuccess={handleDelete}
          description={t('confirm_delete_question')}
        />
        <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
          <h3 className='text-base font-semibold leading-[100%]'>
            {t(Number(id) ? 'edit_exercise' : 'add_new_exercise')}
          </h3>
          <Button
            variant='secondary'
            className='text-primary-blue-500'
            onClick={() => {
              onUpdate();
            }}
          >
            {t('publish')}
          </Button>
        </div>

        <div className='p-6 card-body space-y-6'>
          <div className=' border border-primary-neutral-200 card flex-1'>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t(id ? 'edit_exercise' : 'add_new_exercise')}</h3>
            </div>
            <div className='p-6 card-body '>
              <div className='relative w-[206px] h-[186px] border border-primary-neutral-300 rounded-lg flex justify-center items-center mb-6'>
                <img
                  src={formData?.avatar || NO_IMAGE}
                  alt='No Image'
                  className={`absolute object-cover w-full h-full p-3 ${!formData?.avatar && 'opacity-50'} `}
                />
                <Upload
                  className='mb-5'
                  value={[]}
                  isSingle
                  maxFiles={1}
                  onChange={(files) => {
                    setFormData({ ...formData, avatar: files?.[0].url });
                  }}
                  accept={{ 'image/*': [] }}
                >
                  <UploadTrigger>
                    <div className='absolute flex items-center justify-center p-1 rounded-full bg-primary-neutral-50 bottom-1 right-1 size-12'>
                      <img src={CAMERA} alt='No Image' className='absolute object-cover opacity-50 size-5' />
                    </div>
                  </UploadTrigger>
                </Upload>
              </div>

              <div className='flex gap-x-9 mb-6'>
                <div className='w-1/2'>
                  <TextInput
                    required
                    label={t('exercise_name')}
                    placeholder={t('enter_exercise_name')}
                    value={formData.exercise_name}
                    error={errors?.exercise_name}
                    className='w-full mb-2.5'
                    onChange={(val) => {
                      setFormData({
                        ...formData,
                        exercise_name: val
                      });
                      setErrors({ ...errors, exercise_name: '' });
                    }}
                  />

                  <LearningProgramsSelect
                    required
                    label={t('curriculum')}
                    value={formData.learning_program_id}
                    error={errors?.learning_program_id}
                    className='w-full'
                    onChange={(val) => {
                      setFormData({
                        ...formData,
                        learning_program_id: val?.id,
                        subject_id: val?.subject_id
                      });
                      setErrors({ ...errors, learning_program_id: '' });
                    }}
                  />
                </div>
                <div className='w-1/2'>
                  <TextAreaInput
                    label={t('exersice_description')}
                    rows={5}
                    value={formData.description}
                    error={errors?.description}
                    onChange={(val) => {
                      setFormData({
                        ...formData,
                        description: val
                      });
                      setErrors({ ...errors, description: '' });
                    }}
                  />
                </div>
              </div>

              <div className='flex items-center gap-9 mb-6'>
                <div className='w-full'>
                  <SelectInput
                    label={t('status')}
                    options={statuses}
                    value={statuses?.find((status) => status?.value === formData?.view_mode)}
                    error={errors?.view_mode}
                    className='w-full'
                    onChange={(val) => {
                      setFormData({
                        ...formData,
                        view_mode: val?.value
                      });
                      setErrors({ ...errors, view_mode: '' });
                    }}
                  />
                </div>
                {/* <div className='w-1/2'>
                  <NumberInput
                    label={t('price')}
                    suffix='VNĐ'
                    placeholder='0 VNĐ'
                    type='currency'
                    value={formData.price}
                    error={errors?.price}
                    className='w-full'
                    onChange={(val) => {
                      setFormData({
                        ...formData,
                        price: val
                      });
                      setErrors({ ...errors, price: '' });
                    }}
                  />
                </div> */}
              </div>
              {/* {formData?.locations?.map((location: any, index: number) => {
                return (
                  <div key={index}>
                    <div className='flex items-center justify-between mb-2'>
                      <p className='text-primary-blue-700 text-base font-semibold'>
                        {t('location')} #{index + 1}
                      </p>
                      <Button
                        variant={'destructive'}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            locations: formData?.locations?.filter((_: any, idx: number) => index !== idx)
                          });
                        }}
                      >
                        <img src={DELETE_03} />
                        {t('delete')}
                      </Button>
                    </div>
                    <div className='flex items-center gap-9 mb-4'>
                      <div className='w-1/2'>
                        <TeachingLocationSelect
                          label={t('location')}
                          required
                          value={location?.teaching_location}
                          error={errors?.[`location.${index}.teaching_location`]}
                          className='w-full'
                          onChange={(val) => {
                            location.teaching_location = val?.id;
                            setFormData({
                              ...formData
                            });
                            setErrors({ ...errors, [`location.${index}.teaching_location`]: '' });
                          }}
                        />
                      </div>
                      <div className='w-1/2'>
                        <CLassroomSelect
                          required
                          label={t('classroom')}
                          isMulti
                          isClearable
                          value={location.classrooms}
                          error={errors?.classrooms}
                          className='w-full'
                          onChange={(val) => {
                            location.classrooms = val?.map((v) => v?.id) || [];
                            setFormData({
                              ...formData
                            });
                            setErrors({ ...errors, [`location.${index}.classrooms`]: '' });
                          }}
                        />
                      </div>
                    </div>
                    <div className='mb-3'>
                      <StudentsGroupSelect
                        label={t('student_list')}
                        isMulti
                        classroomIds={location?.classrooms}
                        value={location.students}
                        onChange={(val) => {
                          location.students = val?.map((v) => v?.id) || [];
                          setFormData({
                            ...formData
                          });
                          setErrors({ ...errors, [`location.${index}.students`]: '' });
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <Button
                className='bg-primary-success hover:bg-primary-success/80'
                onClick={() => {
                  formData.locations?.push({
                    id: 0,
                    teaching_location: null,
                    classrooms: []
                  });
                  setFormData({
                    ...formData
                  });
                }}
              >
                <img src={PLUS_WHITE} />
                {t('add_location')}
              </Button> */}
            </div>
          </div>
        </div>
      </div>
      <div className=' border border-primary-neutral-200 mt-6 card shadow-lg card bg-primary-neutral-50 p-6'>
        <div className='flex items-center justify-between mb-[30.5px]'>
          <p className=''>
            {formData?.questions?.length} {t('question').toLocaleLowerCase()} (
            {formData?.questions?.reduce((prev: any, curr: any) => prev + curr?.score, 0)}{' '}
            {t('score').toLocaleLowerCase()})
          </p>{' '}
          <Button
            className='text-primary-blue-500 hover:text-primary-blue-500/80 border border-primary-blue-400 bg-primary-blue-50 hover:bg-primary-blue-50'
            variant={'outline'}
            onClick={() => {
              setShowEditQuestion(true);
              setQuestionIndex(-1);
              setType('add');
            }}
          >
            <img src={PLUS_BLUE} />
            {t('add_question')}
          </Button>
        </div>

        {formData?.questions?.length > 0 ? (
          formData?.questions?.map((question: any, question_index: number) => {
            const questionType = QuestionsTypeOptions.find((type) => type.value === question?.question_type);
            const errorKey = Object.keys(errors)?.find((err: string) =>
              err?.includes(`questions.${question_index}.${questionType?.type}`)
            );
            return (
              <div className='relative' key={question_index}>
                <div
                  className={cn(
                    `border rounded-lg p-6`,
                    Object.keys(errors)?.find((err: string) =>
                      err?.includes(`questions.${question_index}.${questionType?.type}`)
                    )
                      ? 'border-red-500'
                      : ''
                  )}
                >
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-2'>
                      <div className='px-3 py-2 rounded-lg border border-primary-neutral-300 flex items-center gap-2 '>
                        <img src={questionType?.icon} />
                        <p className='text-sm font-medium'>{questionType?.label}</p>
                      </div>

                      <div className='w-36'>
                        <ScoreSelect
                          value={question?.score}
                          onChange={(value) => {
                            question.score = value.value;
                            setFormData({ ...formData });
                            delete errors?.[errorKey as string];
                            setErrors({ ...errors });
                          }}
                        />
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className='px-3 py-2 rounded-lg border border-primary-neutral-300 flex items-center justify-center cursor-pointer gap-2 hover:bg-primary-neutral-100'
                        onClick={() => {
                          setShowModalPreview(true);
                          setQuestionIndex(question_index);
                          setPreviewType(
                            question?.question_type == MULTIPLE_CHOICE
                              ? 'multiple_choice'
                              : question?.question_type == FILL_IN_THE_BLANK
                                ? 'fill_the_blank'
                                : question?.question_type == MATCHING
                                  ? 'matching'
                                  : question?.question_type == ORDERING
                                    ? 'sort'
                                    : 'reverse_word'
                          );
                        }}
                      >
                        <img src={PLAY_SQUARE} />
                        <p className='text-sm font-medium'> {t('preview')}</p>
                      </div>
                      <div
                        className='px-3 py-2 rounded-lg border border-primary-neutral-300 flex items-center justify-center cursor-pointer gap-2 hover:bg-primary-neutral-100'
                        onClick={() => {
                          setShowEditQuestion(true);
                          setQuestionIndex(question_index);
                          setType('edit');
                          delete errors?.[errorKey as string];
                          setErrors({ ...errors });
                        }}
                      >
                        <img src={EDIT_BLACK} />
                        <p className='text-sm font-medium'> {t('edit')}</p>
                      </div>
                      <div
                        className='px-3 py-2 rounded-lg border border-primary-neutral-300 flex items-center justify-center cursor-pointer gap-2 hover:bg-primary-neutral-100'
                        onClick={() => {
                          setQuestionIndex(question_index);
                          setIsShowConfirm(true);
                        }}
                      >
                        <img src={DELETE_BLACK} />
                      </div>
                    </div>
                  </div>
                  <div className='flex mb-3 gap-3 space-y-3'>
                    {question?.question_file?.url && (
                      <PreviewExercise
                        file={question?.question_file}
                        className={`h-[81px] ${
                          question?.question_file?.type == 'audio'
                            ? 'w-[300px]'
                            : question?.question_file?.type == 'video'
                              ? 'w-[250px] !h-[200px]'
                              : 'w-[150px]'
                        }  rounded-lg flex items-center justify-center`}
                      />
                    )}
                    <div
                      className='text-sm font-medium text-primary-neutral-900 no-underline not-italic'
                      dangerouslySetInnerHTML={{ __html: removeInlineStyles(question?.question_title) }}
                    />
                  </div>

                  <p className='text-xs font-medium mb-2 text-primary-neutral-500'>{t('select_answer')}</p>
                  {question?.question_type === MULTIPLE_CHOICE ? (
                    <div className='flex items-start flex-wrap mb-2 gap-y-6'>
                      {question?.multiple_choice_answers?.options?.map(
                        (answer: MultipleChoiceOption, index: number) => {
                          return (
                            <div
                              className={`flex ${answer?.file?.url && answer?.file?.type == 'image' ? 'items-start' : 'items-center'} gap-2 w-1/2`}
                              key={index}
                            >
                              {answer?.is_correct_answer ? (
                                <Icon
                                  icon={TICK_ICON}
                                  className={`text-primary-success ${answer?.file?.url && answer?.file?.type == 'image' && 'mt-2'} size-4`}
                                />
                              ) : (
                                <Icon
                                  icon={CANCEL_ICON}
                                  className={`text-primary-error ${answer?.file?.url && answer?.file?.type == 'image' && 'mt-2'} size-4`}
                                />
                              )}

                              {answer?.file?.url ? (
                                <PreviewExercise
                                  isIcon
                                  file={answer?.file}
                                  className='w-min rounded-lg flex items-start mt-0'
                                  imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                  audioClassName='h-min'
                                />
                              ) : (
                                <div
                                  className='text-sm font-medium text-primary-neutral-900 no-underline not-italic'
                                  dangerouslySetInnerHTML={{ __html: removeInlineStyles(answer?.answer_title || '') }}
                                />
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : question?.question_type === FILL_IN_THE_BLANK ? (
                    <>
                      <div className='flex items-center gap-2'>
                        <Icon icon={TICK_ICON} className='text-primary-success size-4' />
                        <p className='text-sm font-medium whitespace-pre-wrap'>
                          {question?.fill_in_the_blank?.answer_title}
                        </p>
                      </div>
                      {question?.fill_in_the_blank?.other_correct_answer?.length > 0 && (
                        <p className=' text-sm font-medium mt-2'>
                          {t('other_answer')}: {question?.fill_in_the_blank?.other_correct_answer?.join(', ')}
                        </p> 
                      )}
                    </>
                  ) : question?.question_type === MATCHING || question?.question_type === ORDERING ? (
                    <div className='gap-y-6 flex flex-wrap'>
                      {(question?.question_type === 3 ? question?.matching : question?.sort)?.options?.map(
                        (answer: any, index: number) => {
                          return (
                            <div className='flex items-center gap-6 w-1/2' key={index}>
                              {answer?.file?.url ? (
                                <PreviewExercise
                                  isIcon
                                  file={answer?.file}
                                  imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                  className='flex items-center w-min'
                                  audioClassName='mx-0'
                                />
                              ) : (
                                <div
                                  className='text-sm font-medium text-primary-neutral-900 no-underline not-italic'
                                  dangerouslySetInnerHTML={{ __html: removeInlineStyles(answer?.answer_title) }}
                                />
                              )}
                              <img src={ARROW_RIGHT} />
                              <div
                                className='text-sm font-medium text-primary-neutral-900 no-underline not-italic'
                                dangerouslySetInnerHTML={{
                                  __html: removeInlineStyles(
                                    (question?.question_type === 3 ? question?.matching : question?.sort)?.descriptions[
                                      index
                                    ]?.answer_description
                                  )
                                }}
                              />
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center gap-2'>
                        <Icon icon={TICK_ICON} className='text-primary-success size-4' />
                        <p className='text-sm font-medium whitespace-pre-wrap'>
                          {question?.reverse_word?.options?.map((word: ReverseWordOption) => {
                            return <span key={word?.id}>{word?.answer_title} </span>;
                          })}
                        </p>
                      </div>
                    </>
                  )}

                  <div className='flex gap-2 mt-2'>
                    <div className='flex items-center gap-1'>
                      <Icon icon={IDEA_ICON} className='text-primary-neutral-900' />
                      <p className='text-sm font-medium'>{t('answer_explanation')}: </p>
                    </div>
                    <div className='flex gap-3'>
                      {question?.answer_explanation?.explain_file?.url && (
                        <PreviewExercise
                          isIcon
                          file={question?.answer_explanation?.explain_file}
                          className='size-10 rounded-lg flex items-center justify-center'
                        />
                      )}
                      <div
                        className='text-sm font-medium text-primary-neutral-900 no-underline not-italic leading-9'
                        dangerouslySetInnerHTML={{
                          __html: removeInlineStyles(question?.answer_explanation?.explain_description)
                        }}
                      />
                    </div>
                  </div>
                </div>
                {errorKey ? (
                  <div className='flex items-center gap-2 mt-2'>
                    <img src={ERROR_RED} /> <p className='text-sm text-primary-error'>{errors?.[errorKey]}</p>
                  </div>
                ) : null}
                {question_index === formData?.questions?.length - 1 ? (
                  <div className='flex items-center justify-center mt-6'>
                    <Button
                      className='text-primary-blue-500 hover:text-primary-blue-500/80 border border-primary-blue-400 bg-primary-blue-50 hover:bg-primary-blue-50'
                      variant={'outline'}
                      onClick={() => {
                        setShowEditQuestion(true);
                        setQuestionIndex(-1);
                        setType('add');
                      }}
                    >
                      <img src={PLUS_BLUE} />
                      {t('add_question')}
                    </Button>
                  </div>
                ) : (
                  <div className='h-[46px] py-2 relative flex items-center justify-center group'>
                    <div className='w-full h-[1px] bg-primary-blue-500 top-[50%] translate-y-[-50%] z-[1] absolute hidden group-hover:block' />
                    <Button
                      className='text-primary-blue-500 hover:text-primary-blue-500/80 border border-primary-blue-400 bg-primary-blue-50 hover:bg-primary-blue-50 h-[30px] z-[2] hidden group-hover:flex'
                      variant={'outline'}
                      onClick={() => {
                        setQuestionIndex(question_index);
                        setShowEditQuestion(true);
                        setType('add');
                      }}
                    >
                      <img src={PLUS_BLUE} />
                      {t('add_question')}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div>
            <EmptyTable className='mb-6' />
            <div className='flex items-center justify-center'>
              <Button
                className='text-primary-blue-500 hover:text-primary-blue-500/80 border border-primary-blue-400 bg-primary-blue-50 hover:bg-primary-blue-50'
                variant={'outline'}
                onClick={() => {
                  setShowEditQuestion(true);
                  setQuestionIndex(-1);
                  setType('add');
                }}
              >
                <img src={PLUS_BLUE} />
                {t('add_question')}
              </Button>
            </div>
          </div>
        )}
      </div>
      <EditQuestion
        type={type}
        questionIndex={questionIndex}
        show={showEditQuestion}
        setShow={setShowEditQuestion}
        exerciseFormData={formData}
        setExerciseFormData={setFormData}
        onSuccess={(new_question: any, index: number) => {
          if (type === 'edit') {
            onUpdateQuestion(index, new_question);
          } else {
            onAddQuestion(index, new_question);
          }
        }}
      />
      <ModalPreview
        index={questionIndex + 1}
        total={formData?.questions?.length}
        show={showModalPreview}
        setShow={setShowModalPreview}
        data={formData?.questions[questionIndex]}
        type={previewType}
      />
    </div>
  );
};

export default ExerciseEdit;
