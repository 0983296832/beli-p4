import { PRACTICE_BG_01, PRACTICE_MODE_1, PRACTICE_MODE_2, RADIO_CHECK_BLUE } from '@lib/ImageHelper';
import React, { useEffect, useState } from 'react';
import Loading from '@components/loading/index';
import Training from './Training';
import Exam from './Exam';
import exerciseServices from '@services/exercise';
import { useParams } from 'react-router-dom';
import '@assets/styles/practice-theme.css';
import { useT } from '@hooks/useT';
import { useRootStore } from '@store/index';
import { Button } from '@components/ui/button';
import { MULTIPLE_CHOICE, MATCHING, ORDERING, REVERSE_WORD } from '@pages/Exercise/constant';
import Icon from '@components/Icon';
import SelectInput from '@components/fields/SelectInput';
import NumberInput from '@components/fields/NumberInput';
import { USER_ROLE } from '@constants/index';
import { Helmet } from 'react-helmet-async';

interface Props {}

const TryAssignment = (props: Props) => {
  const { currentUser } = useRootStore();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const [examData, setExamData] = useState<any>({});
  const [setting, setSetting] = useState<any>({});
  const [isReady, setIsReady] = useState(false);
  const { t } = useT();
  const [examDetail, setExamDetail] = useState({
    exercise_name: '',
    exercise_code: ''
  });

  const show_answer_opts = [
    {
      value: 1,
      label: t('on')
    },
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
    {
      value: 0,
      label: t('off')
    }
  ];

  const getDetail = async () => {
    let params = {
      fields: 'questions,exercise_name,exercise_code',
      search: '',
      filtering: {}
    };

    setLoading(true);
    try {
      const response: any = await exerciseServices.getExercise(Number(id), params);
      const _examData = response?.data;
      setExamDetail(_examData);

      _examData.questions = _examData.questions?.sort(() => Math.random() - 0.5);

      _examData.questions = _examData.questions?.map((question: any) => {
        if (question?.question_type == MULTIPLE_CHOICE) {
          return {
            ...question,
            multiple_choice_answers: {
              ...question?.multiple_choice_answers,
              options: question?.multiple_choice_answers?.options?.sort(() => Math.random() - 0.5)
            }
          };
        } else if (question?.question_type == MATCHING) {
          return {
            ...question,
            matching: {
              ...question?.matching,
              options: question?.matching?.options?.sort(() => Math.random() - 0.5),
              descriptions: question?.matching?.descriptions?.sort(() => Math.random() - 0.5)
            }
          };
        } else if (question?.question_type == ORDERING) {
          return {
            ...question,
            sort: {
              ...question?.sort,
              options: question?.sort?.options?.sort(() => Math.random() - 0.5)
            }
          };
        } else if (question?.question_type == REVERSE_WORD) {
          return {
            ...question,
            reverse_word: {
              ...question?.reverse_word,
              options: question?.reverse_word?.options?.sort(() => Math.random() - 0.5)
            }
          };
        } else {
          return question;
        }
      });

      setExamData({
        questions: _examData.questions,
        view_mode: 1,
        exercise_code: _examData?.exercise_code,
        exercise_name: _examData?.exercise_name
      });
      setSetting({ mode: 1, show_answer_during_exam: 1 });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  //   const getDetail = async () => {
  //     setLoading(true);
  //     try {
  //       const res: any = await exerciseServices.getDetailStudentExercise(Number(id));
  //       let paramsExam = {
  //         fields:
  //           'exercise_name,exercise_code,description,learning_program_id,learning_program,subject_id,questions,view_mode'
  //       };

  //       const _response: any = await exerciseServices.getExercise(Number(res?.data?.exercise_id), paramsExam);
  //       const _examData = _response?.data;

  //       if (res?.data?.is_shuffle_questions || _examData?.view_mode == 1) {
  //         _examData.questions = _examData.questions?.sort(() => Math.random() - 0.5);
  //       }
  //       if (res?.data?.is_shuffle_answer || _examData?.view_mode == 1) {
  //         _examData.questions = _examData.questions?.map((question: any) => {
  //           if (question?.question_type == MULTIPLE_CHOICE) {
  //             return {
  //               ...question,
  //               multiple_choice_answers: {
  //                 ...question?.multiple_choice_answers,
  //                 options: question?.multiple_choice_answers?.options?.sort(() => Math.random() - 0.5)
  //               }
  //             };
  //           } else if (question?.question_type == MATCHING) {
  //             return {
  //               ...question,
  //               matching: {
  //                 ...question?.matching,
  //                 options: question?.matching?.options?.sort(() => Math.random() - 0.5),
  //                 descriptions: question?.matching?.descriptions?.sort(() => Math.random() - 0.5)
  //               }
  //             };
  //           } else if (question?.question_type == ORDERING) {
  //             return {
  //               ...question,
  //               sort: {
  //                 ...question?.sort,
  //                 options: question?.sort?.options?.sort(() => Math.random() - 0.5)
  //               }
  //             };
  //           } else if (question?.question_type == REVERSE_WORD) {
  //             return {
  //               ...question,
  //               reverse_word: {
  //                 ...question?.reverse_word,
  //                 options: question?.reverse_word?.options?.sort(() => Math.random() - 0.5)
  //               }
  //             };
  //           } else {
  //             return question;
  //           }
  //         });
  //       }
  //       setExamData({ ..._examData });

  //       if (_examData?.view_mode == 1) {
  //         setSetting({ mode: 1 });
  //       } else {
  //         setSetting({ ...res?.data });
  //       }

  //       setLoading(false);
  //     } catch (error) {
  //       setLoading(false);
  //     }
  //   };

  useEffect(() => {
    getDetail();
  }, []);

  return (
    <>
      <Helmet>
        <title>
          {examDetail ? `Bài tập ${examDetail.exercise_code} | ${examDetail.exercise_name}` : 'Đang tải...'}
        </title>
        {examDetail && (
          <meta
            name='description'
            content={`Chi tiết bài tập ${examDetail.exercise_code}: ${examDetail.exercise_name}`}
          />
        )}
      </Helmet>
      <div
        className={`min-h-screen h-max  relative theme-practice-pink`}
        style={{
          backgroundImage: `url('${PRACTICE_BG_01}')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <Loading loading={loading} className='bg-black/60' />
        {!loading && (
          <>
            {isReady ? (
              <>
                {setting?.mode == 3 ? (
                  <Exam examData={examData} setting={setting} examId={Number(id)} isTryAssignment />
                ) : (
                  <Training examData={examData} setting={setting} examId={Number(id)} isTryAssignment />
                )}
              </>
            ) : (
              <div className='w-screen h-screen flex items-center justify-center'>
                <div className='p-4  bg-[var(--practice-finish-layer,#ff836f87)] rounded-xl min-w-[300px] md:min-w-[500px] xl:min-w-[772px] mx-2'>
                  {examData?.view_mode == 1 ? (
                    <>
                      <div className='flex items-start gap-4 mt-4'>
                        <div className=' p-4 bg-[var(--practice-finish-bg,#ff836f)] rounded-xl min-h-[231px] w-1/2'>
                          <p className='text-white text-base font-semibold text-center mb-2'>{t('practice_mode')}</p>
                          <p className='text-white text-sm font-medium text-center  mb-3'>{t('multiple_attempts')}</p>
                          <div
                            className={`${setting?.mode === 1 && 'border-primary-blue-500  bg-primary-blue-50'} mt-8 mx-4 border rounded-lg cursor-pointer bg-primary-blue-50 relative`}
                            onClick={() => {
                              setSetting({ ...setting, mode: 1, show_answer_after_exam: 0, time_for_exam: 0 });
                            }}
                          >
                            {setting?.mode === 1 && <Icon icon={RADIO_CHECK_BLUE} className='absolute top-2 right-2' />}

                            <img src={PRACTICE_MODE_1} className='mx-auto w-24 mt-7 mb-2' />
                          </div>
                        </div>
                        <div className=' p-4 bg-[var(--practice-finish-bg,#ff836f)] rounded-xl min-h-[231px] w-1/2 '>
                          <p className='text-white text-base font-semibold text-center mb-2'>{t('test_mode')}</p>
                          <p className='text-white text-sm font-medium text-center break-words mb-3 w-64 mx-auto'>
                            {t('custom_time_message')}
                          </p>
                          <div
                            className={`${setting?.mode === 3 && 'border-primary-blue-500  bg-primary-blue-50'} mx-4 border rounded-lg cursor-pointer bg-primary-blue-50 relative`}
                            onClick={() => {
                              setSetting({
                                ...setting,
                                mode: 3,
                                show_answer_during_exam: 0,
                                time_for_each_question: 0
                              });
                            }}
                          >
                            {setting?.mode === 3 && <Icon icon={RADIO_CHECK_BLUE} className='absolute top-2 right-2' />}
                            <img src={PRACTICE_MODE_2} className='mx-auto w-20 mt-7 mb-2' />
                          </div>
                        </div>
                      </div>
                      {setting?.mode === 1 ? (
                        <div className='bg-white mt-4 p-4 border rounded-lg space-y-7'>
                          <div className='flex items-start justify-between gap-14'>
                            <div className='flex-1'>
                              <p className='font-semibold mb-2'>{t('show_answers_in_session')}</p>
                              <p className='text-sm text-primary-neutral-700'>{t('show_explain_each')}</p>
                            </div>
                            <div className='w-44'>
                              <SelectInput
                                options={show_answer_opts}
                                value={
                                  show_answer_opts.find((vl) => vl?.value == setting?.show_answer_during_exam) ?? null
                                }
                                onChange={(val) => {
                                  setSetting({ ...setting, show_answer_during_exam: val?.value });
                                }}
                              />
                            </div>
                          </div>

                          <div className='flex items-start justify-between gap-14'>
                            <div className='flex-1'>
                              <p className='font-semibold mb-2'>
                                {t('timer_each_question')}{' '}
                                <span className='text-sm text-primary-neutral-600'>
                                  ({t('second').toLocaleLowerCase()})
                                </span>
                              </p>
                              <p className='text-sm text-primary-neutral-700'>{t('timer_each_bonus')}</p>
                            </div>
                            <div className='w-44'>
                              <NumberInput
                                value={setting?.time_for_each_question}
                                suffix={' ' + t('second').toLocaleLowerCase()}
                                onChange={(value) => {
                                  setSetting({ ...setting, time_for_each_question: value });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='bg-white mt-4 p-4 border rounded-lg space-y-7'>
                          <div className='flex items-start justify-between gap-14'>
                            <div className='flex-1'>
                              <p className='font-semibold mb-2'>{t('show_answers_after')}</p>
                              <p className='text-sm text-primary-neutral-700'>{t('show_explain_after')}</p>
                            </div>
                            <div className='w-44'>
                              <SelectInput
                                options={show_question_opts}
                                value={
                                  show_question_opts.find((vl) => vl?.value == setting?.show_answer_after_exam) ?? null
                                }
                                onChange={(val) => {
                                  setSetting({ ...setting, show_answer_after_exam: val?.value });
                                }}
                              />
                            </div>
                          </div>

                          <div className='flex items-start justify-between gap-14'>
                            <div className='flex-1'>
                              <p className='font-semibold mb-2'>
                                {t('timer_whole_test')}{' '}
                                <span className='text-sm text-primary-neutral-600'>
                                  ({t('minute').toLocaleLowerCase()})
                                </span>
                              </p>
                              <p className='text-sm text-primary-neutral-700'>{t('timer_each_bonus')}</p>
                            </div>
                            <div className='w-44'>
                              <NumberInput
                                value={setting?.time_for_exam}
                                suffix={' ' + t('minute').toLocaleLowerCase()}
                                onChange={(value) => {
                                  setSetting({ ...setting, time_for_exam: value });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className='py-4 px-2 xl:px-20 bg-[var(--practice-finish-bg,#ff836f)] rounded-xl'>
                        <p className='text-4xl font-semibold text-primary-neutral-50 mb-3 text-center'>
                          {t('ready_to_start')}
                        </p>
                        <p className='text-base font-semibold text-primary-neutral-50 mb-3 text-center'>
                          {t('one_chance_notice')}
                        </p>
                        <div className='flex items-center justify-center mb-6'>
                          <div className='flex items-center gap-3'>
                            <img src={currentUser?.avatar} className='size-10 min-w-10 rounded-full object-cover' />
                            <p className='text-lg font-semibold text-primary-neutral-50'>
                              {currentUser?.display_name} - {currentUser?.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                    <div className='flex items-center justify-center mt-4'>
                      <Button
                        variant={'secondary'}
                        onClick={() => {
                          setIsReady(true);
                        }}
                      >
                        {t('ready_to_do_test')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TryAssignment;
