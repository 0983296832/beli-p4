import {
  EDIT_ICON,
  FILE_DOWNLOAD_ICON,
  CLOCK_ICON,
  STAR_ICON,
  CASH_ICON,
  CHECK_ICON,
  IDEA_ICON,
  NO_IMAGE,
  COPY_ICON
} from '@lib/ImageHelper';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import Icon from '@components/Icon';
import SwitchInput from '@components/fields/SwitchInput';
import { QuestionsTypeOptions } from '@components/selects/QuestionsTypeSelect';
import { removeInlineStyles } from '@lib/DomHelper';
import PreviewExercise from '@components/file/PreviewExerciseFile';

import AssignTaskSetup from './AssignTaskSetup';
import { getLetterByIndex } from '@lib/StringHelper';
import exerciseServices from '@services/exercise';
import { useNavigate, useParams } from 'react-router-dom';
import { FILL_IN_THE_BLANK, MATCHING, MOCK_DATA, MULTIPLE_CHOICE, ORDERING } from './constant';
import { Check, NotebookPen } from 'lucide-react';
import { getSubjectInfo } from '@lib/GetInfoHelper';
import Loading from '@components/loading';
import PrintPDF from './PrintPDF';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';
import { Toast } from '@components/toast';

const DetailExercise = () => {
  const { t } = useT();
  const { permissions, currentUser } = useRootStore();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [state, setState] = useState<'default' | 'assign_task' | 'print'>('default');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getDetail = async (filters?: any) => {
    let params = {
      fields:
        'identity,avatar,exercise_name,exercise_code,description,learning_program_id,subject_id,payment_type,retail_price,last_updated_by,last_updated_user,valid,created_at,updated_at,questions,user_ability,view_mode,learning_program,statistic',
      search: '',
      filtering: {}
    };

    setLoading(true);
    try {
      const response: any = await exerciseServices.getExercise(Number(id), params);
      setDetail(response?.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const postCopyExercise = async () => {
    setLoading(true);
    try {
      const response: any = await exerciseServices.postCopyExercise(Number(id));
      Toast('success', response?.message);
      navigate('/exercise/detail/' + response?.id);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Number(id) && getDetail();
  }, [id]);

  return (
    <>
      <Loading loading={loading} />
      {state === 'default' ? (
        <div className=''>
          <div className='p-6 bg-white rounded-lg shadow-lg mb-6'>
            <div className='flex items-start justify-between mb-9'>
              <div className='flex items-center gap-4'>
                <img src={detail?.avatar || NO_IMAGE} className='w-[130px] h-[115px] object-cover rounded-lg' />
                <div>
                  <p className='text-2xl font-medium mb-2'>
                    {detail?.exercise_code} - {detail?.exercise_name}
                  </p>
                  <div className='flex items-center gap-1 px-2 py-1.5 rounded-full bg-primary-blue-50 w-max mb-2'>
                    <p className='text-primary-blue-500 text-sm'>
                      {4.5}/{5.0}
                    </p>
                    <Icon icon={STAR_ICON} className='text-primary-warning' size={16} />
                  </div>
                  <div className='flex items-center gap-3 text-sm mb-1'>
                    <p className={`text-primary-neutral-500 custom_marker`}>
                      {getSubjectInfo(detail?.subject_id)?.subject_code} -{' '}
                      {getSubjectInfo(detail?.subject_id)?.subject_name}
                    </p>
                    <p className='text-primary-neutral-500 custom_marker'>
                      {detail?.learning_program?.learning_program_code} -{' '}
                      {detail?.learning_program?.learning_program_name}
                    </p>
                  </div>
                  <div className='flex items-center gap-3 text-sm'>
                    <p className={`text-primary-neutral-500 custom_marker`}>
                      {t('access_count')}: {detail?.statistic?.total_exam_access}
                    </p>
                    <p className='text-primary-neutral-500 custom_marker'>
                      {t('completion_attempts')}: {detail?.statistic?.total_submission}
                    </p>
                    <p className='text-primary-neutral-500 custom_marker'>
                      {t('evaluation_attempts')}: {detail?.statistic?.total_rates}
                    </p>
                  </div>
                </div>
              </div>
              {/* <div className='bg-secondary-neutral-50 border border-secondary-neutral-500 py-3 px-4 rounded-lg flex items-center gap-2'>
                <Icon icon={CASH_ICON} className='text-secondary-neutral-600' height={18} />
                <p className='text-secondary-neutral-600'>{detail?.retail_price} VND</p>
              </div> */}
            </div>
            <div className='flex items-center justify-between '>
              <div className='flex items-center gap-3'>
                {!!permissions?.CREATE_STUDY_PROGRAM && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      navigate('/exercise/edit/' + id);
                    }}
                  >
                    <Icon icon={EDIT_ICON} className='text-primary-neutral-900' />
                    {t('edit')}
                  </Button>
                )}
                {!!permissions?.CREATE_STUDY_PROGRAM && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      postCopyExercise();
                    }}
                  >
                    <Icon icon={COPY_ICON} className='text-primary-neutral-500' />
                    {t('copy')}
                  </Button>
                )}
                {!!permissions?.UPDATE_STUDY_PROGRAM && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      setState('print');
                    }}
                  >
                    <Icon icon={FILE_DOWNLOAD_ICON} className='text-primary-neutral-900' />
                    {t('download_and_print')}
                  </Button>
                )}
              </div>
              <div className='flex items-center gap-3'>
                {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                  <Button
                    variant='outline'
                    className='text-primary-blue-500 bg-primary-blue-50 hover:bg-primary-blue-50 hover:text-primary-blue-500'
                    onClick={() => {
                      navigate('/try-assignment/' + id);
                    }}
                  >
                    <NotebookPen className='text-primary-blue-500 size-5' />
                    {t('do_assignment_as_student')}
                  </Button>
                )}

                <Button
                  variant='outline'
                  className='text-primary-blue-500 bg-primary-blue-50 hover:bg-primary-blue-50 hover:text-primary-blue-500'
                  onClick={() => {
                    setState('assign_task');
                  }}
                >
                  <Icon icon={CLOCK_ICON} className='text-primary-blue-500' />
                  {t('assign_task')}
                </Button>
              </div>
            </div>
          </div>
          <div className=' bg-white rounded-lg shadow-lg'>
            <div className='flex items-center justify-between px-4 py-[22px] '>
              <p className='uppercase font-semibold text-primary-neutral-700'>
                {detail?.questions?.length} {t('question')}
              </p>
              <div className='flex items-center gap-3 w-max'>
                <div className='flex-1'>
                  <p className=' font-semibold w-max text-primary-neutral-700'>{t('show_answer')}</p>
                </div>
                <SwitchInput
                  checked={showAnswer}
                  onCheckedChange={(value) => {
                    setShowAnswer(value);
                  }}
                />
              </div>
            </div>
            {detail?.questions?.map((question: any, index: number) => {
              const questionType = QuestionsTypeOptions.find((type) => type.value === question?.question_type);
              return (
                <div className='border-t p-4'>
                  <p className='uppercase my-2'>
                    {index + 1}. {questionType?.label}
                  </p>
                  <div className='flex mb-4 gap-3'>
                    {question?.question_file?.url && (
                      <PreviewExercise
                        file={question?.question_file}
                        className={`h-[81px]  ${question?.question_file?.type == 'audio' ? 'w-[300px]' : question?.question_file?.type == 'video' ? 'w-[250px] !h-[200px]' : 'w-[150px]'} rounded-lg flex items-center justify-center `}
                      />
                    )}
                    <div
                      className=' font-semibold text-primary-neutral-900 no-underline not-italic'
                      dangerouslySetInnerHTML={{ __html: removeInlineStyles(question?.question_title) }}
                    />
                  </div>
                  {question?.question_type === 1 ? (
                    <div className='flex items-start flex-wrap mb-2 gap-y-6'>
                      {question?.multiple_choice_answers?.options?.map((answer: any, index: number) => {
                        return (
                          <div
                            className={`flex ${answer?.file?.url && answer?.file?.type == 'image' ? 'items-start' : 'items-center'}  gap-2 w-1/2`}
                            key={index}
                          >
                            {showAnswer && answer?.is_correct_answer == MULTIPLE_CHOICE ? (
                              <div
                                className={`bg-primary-success rounded-full size-4 flex items-center justify-center ${answer?.file?.url && answer?.file?.type == 'image' && 'mt-2'}`}
                              >
                                <Check className='size-3 text-white' />
                              </div>
                            ) : (
                              <div
                                className={`border border-primary-neutral-900 rounded-full size-4 flex items-center justify-center ${answer?.file?.url && answer?.file?.type == 'image' && 'mt-2'}`}
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
                                dangerouslySetInnerHTML={{ __html: removeInlineStyles(answer?.answer_title) }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : question?.question_type === FILL_IN_THE_BLANK ? (
                    <>
                      <div className='flex items-center gap-2'>
                        {showAnswer && (
                          <>
                            <p>{t('answers')}:</p>{' '}
                            <p className='text-sm font-medium'>{question?.fill_in_the_blank?.answer_title}</p>
                          </>
                        )}
                      </div>
                      {showAnswer && question?.fill_in_the_blank?.other_correct_answer?.length > 0 && (
                        <p className=' text-sm font-medium mt-2'>
                          {t('other_answer')}: {question?.fill_in_the_blank?.other_correct_answer?.join(', ')}
                        </p>
                      )}
                    </>
                  ) : question?.question_type === MATCHING || question?.question_type === ORDERING ? (
                    <div className='gap-y-6 flex flex-wrap'>
                      {(question?.question_type === MATCHING ? question?.matching : question?.sort)?.options?.map(
                        (answer: any, index: number) => {
                          return (
                            <div className='flex items-center gap-6 w-full' key={index}>
                              <div className='flex gap-2 w-1/2'>
                                <p>{index + 1}. </p>
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
                                    className='text-sm font-medium text-primary-neutral-900 no-underline not-italic mt-0.5'
                                    dangerouslySetInnerHTML={{ __html: removeInlineStyles(answer?.answer_title) }}
                                  />
                                )}
                              </div>
                              <div className='flex w-1/2 gap-2'>
                                <p>{getLetterByIndex(index)}.</p>{' '}
                                <div
                                  className='text-sm font-medium text-primary-neutral-900 no-underline not-italic mt-0.5'
                                  dangerouslySetInnerHTML={{
                                    __html: removeInlineStyles(
                                      (question?.question_type === 3 ? question?.matching : question?.sort)
                                        ?.descriptions[index]?.answer_description || ''
                                    )
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                      {showAnswer && (
                        <div className='flex items-center gap-2'>
                          <p>{t('answers')}:</p>
                          <div className='flex'>
                            {(question?.question_type === 3 ? question?.matching : question?.sort)?.options?.map(
                              (answer: any, idx: number, arr: any[]) => {
                                const answer_desc_idx = (
                                  question?.question_type === 3 ? question?.matching : question?.sort
                                )?.descriptions?.findIndex((desc: any) => desc?.answer_id == answer?.id);
                                return (
                                  <p key={idx}>
                                    {idx + 1} -{' '}
                                    <span className='text-primary-success'>{getLetterByIndex(answer_desc_idx)}</span>
                                    <span className='mr-2'>{idx < arr?.length - 1 ? ', ' : ' '}</span>
                                  </p>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      {showAnswer && (
                        <>
                          <p>{t('answers')}:</p>{' '}
                          <p className='text-sm font-medium'>
                            {question?.reverse_word?.options?.map((word: any) => (
                              <span key={word?.id}>{word?.answer_title} </span>
                            ))}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  {showAnswer && (
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
                            className='size-7 rounded-lg flex items-center justify-center'
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : state === 'assign_task' ? (
        <AssignTaskSetup state={state} setState={setState} exerciseId={Number(id)} detailExercise={detail} />
      ) : (
        <PrintPDF data={detail} setState={setState} />
      )}
    </>
  );
};

export default DetailExercise;
