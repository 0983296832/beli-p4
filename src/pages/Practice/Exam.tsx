import {
  CHEVRON_LEFT_ICON,
  FILL_THE_BLANK_ICON,
  FLAG_ACTIVE_ICON,
  FLAG_ICON,
  LOGO,
  MATCHING_ICON,
  MULTI_CHOICE_ICON,
  PRACTICE_BG,
  PRACTICE_BG_01,
  SORT_ICON
} from '@lib/ImageHelper';
import React, { useEffect, useState, useRef, useMemo, memo, useCallback } from 'react';
import { useT } from '@hooks/useT';
import { FILL_IN_THE_BLANK, MATCHING, MOCK_DATA, MULTIPLE_CHOICE, ORDERING, REVERSE_WORD } from '../Exercise/constant';
import { Button } from '@components/ui/button';
import CountdownTimer, { CountdownTimerHandle } from '@components/countdownTimer';
import { useRootStore } from '@store/index';
import { cloneDeep, isEqual, uniqueId } from 'lodash';
import PreviewMultiChoice from '@components/exercise/PreviewMultiChoice';
import { AnswerType, ExamSetting, StudentAnswerType } from './type';
import PreviewFillTheBlank from '@components/exercise/PreviewFillTheBlank';
import PreviewMatching from '@components/exercise/PreviewMatching';
import PreviewSort from '@components/exercise/PreviewSort';
import Icon from '@components/Icon/index';
import Confirm from '@components/confirm/index';
import { useNavigate } from 'react-router-dom';
import '@assets/styles/practice-theme.css';
import exerciseServices from '@services/exercise';
import themeAudio from '@assets/audios/nhac-nen2.wav';
import choseAnswerAudio from '@assets/audios/chon-dap-an.wav';
import confetti from 'canvas-confetti';
import { FlagTriangleRight } from 'lucide-react';
import { emitter } from '@lib/SocketClient';
import { Toast } from '@components/toast';
import PreviewReverseWord from '@components/exercise/PreviewReverseWord';
import { VolumeControl } from '@components/Volume/VolumeControl';

const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const ExamComponent = ({
  examData,
  setting,
  examId,
  isTryAssignment
}: {
  examData: typeof MOCK_DATA;
  setting: ExamSetting;
  examId: number;
  isTryAssignment?: boolean;
}) => {
  const { t } = useT();
  const { currentUser } = useRootStore();
  const navigate = useNavigate();
  const [count, setCount] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showStartText, setShowStartText] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [data, setData] = useState(examData);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [flags, setFlags] = useState<number[]>([]);
  const [startTestCountdown, setStartTestCountdown] = useState(false);
  const [formData, setFormData] = useState<{ student_answers: StudentAnswerType[] }>({
    student_answers: []
  });
  const [isShowConfirmSubmit, setIsShowConfirmSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const countdownRef = useRef<CountdownTimerHandle | null>(null);
  const [emptyAnswer, setEmptyAnswer] = useState<StudentAnswerType[]>([]);
  let themeBgAudio = new Audio(themeAudio);
  let _choseAnswerAudio = new Audio(choseAnswerAudio);
  const [volume, setVolume] = useState(0.01);

  // giữ 1 ref cho audio, tránh reinit mỗi render
  const themeBgAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleCheckUnDoQuestion = useCallback(
    (answer: StudentAnswerType) => {
      const currentEmptyAnswer = emptyAnswer.find((e_answer) => e_answer?.question_id == answer?.question_id);
      if (isEqual(currentEmptyAnswer?.answer, answer?.answer)) {
        return true;
      }
      return false;
    },
    [emptyAnswer]
  );

  const handleSubmit = useCallback(async () => {
    setIsShowConfirmSubmit(false);
    setShowContent(false);
    setStartTestCountdown(false);
    countdownRef?.current?.reset();
    countdownRef?.current?.pause();
    setShowFinalMessage(true);

    try {
      const body = cloneDeep(formData);
      body.student_answers = body.student_answers
        .map(({ flagged, ...rest }) => {
          return { ...rest };
        })
        .filter((s_answer) => {
          if (handleCheckUnDoQuestion(s_answer)) {
            return false;
          }
          return true;
        });
      if (!isTryAssignment) {
        await exerciseServices.postSubmitExam(Number(examId), body);
      }

      setTimeout(() => {
        setShowFinalMessage(false);
        setIsSubmitted(true);
      }, 1000);
    } catch (err) {
      setTimeout(() => {
        setShowFinalMessage(false);
        setIsSubmitted(true);
      }, 1000);
    }
  }, [formData, examId, handleCheckUnDoQuestion]);

  const handleQuestionScrollToView = () => {
    document.getElementById('question-view')?.scrollIntoView({ block: 'start' });
  };

  const handleToggleFlag = () => {
    formData.student_answers[activeQuestion].flagged = !formData.student_answers[activeQuestion].flagged;
    setFormData({ ...formData });
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showContent && !isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn rời khỏi? Tiến trình làm bài sẽ bị mất.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showContent, isSubmitted]);

  useEffect(() => {
    const initStudentAnswer = cloneDeep(data?.questions)?.map((q) => {
      const id = q?.id;
      switch (q?.question_type) {
        case MULTIPLE_CHOICE:
          return { question_id: id, flagged: false, answer: [] };
        case FILL_IN_THE_BLANK:
          return { question_id: id, flagged: false, answer: '' };
        case MATCHING:
          return { question_id: id, flagged: false, answer: [] };
        case ORDERING:
          return {
            question_id: id,
            flagged: false,
            answer: {
              top: q?.sort?.options?.map((opt) => opt?.id),
              bottom: q?.sort?.descriptions?.map(() => null)
            }
          };
        case REVERSE_WORD:
          return {
            question_id: id,
            answer: []
          };
        default:
          return { question_id: id, flagged: false, answer: null };
      }
    }) as StudentAnswerType[];

    setFormData({ student_answers: cloneDeep(initStudentAnswer) });
    setEmptyAnswer(initStudentAnswer);
  }, [data]);

  // useEffect(() => {
  //   if (count > 0) {
  //     const timer = setTimeout(() => setCount(count - 1), 1000);
  //     return () => clearTimeout(timer);
  //   } else {
  //     setShowStartText(true);
  //     themeBgAudio.loop = true;
  //     themeBgAudio.volume = 0.01;
  //     themeBgAudio?.play().catch((error) => {
  //       console.error('Error playing audio:', error);
  //     });
  //   }
  //   return () => {
  //     themeBgAudio?.pause();
  //   };
  // }, [count]);

  useEffect(() => {
    if (!themeBgAudioRef.current) {
      themeBgAudioRef.current = new Audio(themeAudio);
    }
    const themeBgAudio = themeBgAudioRef.current;

    if (count > 0) {
      const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowStartText(true);
      if (false) {
        // if (!isIOS()) {
        themeBgAudio.loop = true;
        themeBgAudio.volume = volume; // gắn theo state
        themeBgAudio.play().catch((error) => console.error('Error playing audio:', error));
      }
    }

    // cleanup audio khi unmount
    return () => {
      themeBgAudio.pause();
      themeBgAudio.currentTime = 0;
    };
  }, [count]);

  // cập nhật âm lượng khi user chỉnh VolumeControl
  useEffect(() => {
    if (themeBgAudioRef.current) {
      themeBgAudioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (showStartText) {
      const timer = setTimeout(() => {
        setShowCountdown(false);
        setShowContent(true);
        setStartTestCountdown(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showStartText]);

  useEffect(() => {
    if (isSubmitted) {
      var duration = 10 * 1000;
      var animationEnd = Date.now() + duration;
      var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [isSubmitted]);

  useEffect(() => {
    emitter.on('STOP_EXAM', (data: any) => {
      if (examId == data?.exam_id) {
        handleSubmit();
        Toast('info', t('exam_session_stopped'));
      }
    });
    return () => {
      emitter.off('STOP_EXAM');
    };
  }, [formData]);

  const type = data?.questions?.[activeQuestion]?.question_type;

  const map: any = {
    [MULTIPLE_CHOICE]: [MULTI_CHOICE_ICON, 'multiple_choice'],
    [FILL_IN_THE_BLANK]: [FILL_THE_BLANK_ICON, 'fill_in_the_blank'],
    [MATCHING]: [MATCHING_ICON, 'matching'],
    [ORDERING]: [SORT_ICON, 'ordering'],
    [REVERSE_WORD]: [SORT_ICON, 'reorder']
  };

  return (
    <div
      className={`min-h-screen h-max  relative`}
      style={{
        backgroundImage: `url('${PRACTICE_BG_01}')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <Confirm
        show={isShowConfirmSubmit}
        type='warning'
        onCancel={() => {
          setIsShowConfirmSubmit(false);
        }}
        onSuccess={handleSubmit}
        description={t('confirm_submit_test')}
      />
      {showCountdown && (
        <div className='absolute top-0 left-0 w-full h-full bg-black/60 text-white text-[80px] xl:text-[200px] flex justify-center items-center z-10'>
          {showStartText ? t('start') : count}
        </div>
      )}
      {showContent && !isSubmitted && (
        <div className={`min-h-screen h-max w-[calc(100vw-6px)] pt-5 px-2 sm:px-[62px] pb-24 overflow-y-auto`}>
          <div className='p-6 rounded-sm bg-white flex items-start justify-between shadow-lg mb-6'>
            <div className='flex'>
              <div className='max-w-[83px] pr-1 border-r'>
                <img src={LOGO} className='size-[78px] min-w-[78px]' />
                <p className='text-primary-blue-500 break-words text-center text-[10px] hidden sm:block'>
                  VHS foreign language center
                </p>

                <p className='custom_marker !text-primary-neutral-300 mb-2 text-xs font-medium block sm:hidden'>
                  {t('_completed')}
                </p>
                <p className='custom_marker mb-2 !text-primary-error text-xs font-medium block sm:hidden'>
                  {t('review')}
                </p>
                <p className='custom_marker text-primary-blue-500 text-xs font-medium block sm:hidden'>
                  {t('current')}
                </p>
              </div>
              <div className='p-[7px]'>
                <p className='text-sm sm:text-lg font-semibold mb-3 hidden sm:block'>{examData?.exercise_name}</p>
                <p className='text-sm font-medium mb-3 hidden sm:block'>
                  {t('exercise_code')}: {examData?.exercise_code}
                </p>
                <p className='text-sm font-medium mb-3 hidden sm:block'>
                  {t('total_questions')}: {examData?.questions?.length} {t('questions')}
                </p>
                <p className='text-sm font-medium hidden sm:block'>
                  {t('time_limit')}: {setting?.time_for_exam} {t('minutes')}
                </p>
              </div>
            </div>
            <div className='hidden grid-cols-5  xl:grid-cols-7 2xl:grid-cols-10 sm:grid gap-2'>
              {data?.questions?.map((_, index) => {
                return (
                  <div
                    key={index}
                    className={`relative flex items-center justify-center border rounded cursor-pointer ${activeQuestion === index && 'border-primary-blue-500'} ${formData.student_answers[index].flagged && ' text-primary-error'} w-10 h-[31px]`}
                    onClick={() => {
                      setActiveQuestion(index);
                    }}
                  >
                    <p className='text-sm font-medium'>{index + 1}</p>
                    {formData.student_answers[index].flagged && (
                      <FlagTriangleRight className='size-3 text-primary-error absolute -top-2 -right-1' />
                    )}
                  </div>
                );
              })}
            </div>
            <div>
              <div className='flex items-center gap-3 sm:mb-5'>
                <div className={`items-center justify-center border rounded-lg min-w-[70px] h-10 hidden sm:flex`}>
                  <p className='text-sm font-medium'>
                    {activeQuestion + 1}/{data?.questions?.length}
                  </p>
                </div>
                {setting?.time_for_exam ? (
                  <CountdownTimer
                    minutes={setting?.time_for_exam}
                    ref={countdownRef}
                    start={startTestCountdown}
                    onComplete={() => {
                      handleSubmit();
                      setStartTestCountdown(false);
                    }}
                    onRender={(time) => {
                      return (
                        <div
                          className={`flex items-center justify-center rounded-lg px-2.5 h-10 bg-primary-error text-white min-w-[90px] sm:min-w-[150px]`}
                        >
                          <p className='text-sm font-medium'>
                            <span className='hidden sm:inline'>{t('time')}:</span> {time}
                          </p>
                        </div>
                      );
                    }}
                  />
                ) : null}

                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => {
                      setIsShowConfirmSubmit(true);
                    }}
                  >
                    {t('submit_test')}
                  </Button>
                  <VolumeControl
                    className='bg-[var(--practice-score,#ff836f)] hover:bg-[var(--practice-score,#ff836f)]'
                    volumeClassName='bg-[var(--practice-score,#ff836f)]'
                    defaultVolume={2}
                    onVolumeChange={(v) => {
                      const normalized = v / 100; // chuyển % về 0–1
                      setVolume(normalized);
                    }}
                  />
                </div>
              </div>
              <div className='p-[7px]'>
                <p className='text-sm font-semibold block sm:hidden'>
                  {examData?.exercise_code} - {examData?.exercise_name}
                </p>
                <div className='flex items-center gap-2'>
                  <p className='text-xs font-medium block sm:hidden text-primary-neutral-500'>
                    {examData?.questions?.length} {t('questions')}
                  </p>
                  <p className='text-xs font-medium block sm:hidden text-primary-neutral-500'>
                    - {t('time_limit')}: {setting?.time_for_exam} {t('minutes')}
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-6 gap-2 sm:hidden'>
                {data?.questions?.map((_, index) => {
                  return (
                    <div
                      key={index}
                      className={`relative flex items-center justify-center border rounded cursor-pointer ${activeQuestion === index && 'border-primary-blue-500'} ${formData.student_answers[index].flagged && ' text-primary-error'} w-9 h-[25px]`}
                      onClick={() => {
                        setActiveQuestion(index);
                      }}
                    >
                      <p className='text-sm font-medium'>{index + 1}</p>
                      {formData.student_answers[index].flagged && (
                        <FlagTriangleRight className='size-3 text-primary-error absolute -top-2 -right-1' />
                      )}
                    </div>
                  );
                })}
              </div>

              <p className='custom_marker !text-primary-neutral-300 mb-2 text-sm font-medium hidden sm:block'>
                {t('completed_question')}
              </p>
              <p className='custom_marker mb-2 !text-primary-error text-sm font-medium hidden sm:block'>
                {t('review_question')}
              </p>
              <p className='custom_marker text-primary-blue-500 text-sm font-medium hidden sm:block'>
                {t('current_question')}
              </p>
            </div>
          </div>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary-neutral-700 text-white flex items-center justify-center px-3 h-10 rounded-lg'>
                <p className=''>
                  <span className='font-semibold'>{activeQuestion + 1}</span>/
                  <span className='text-xs'>{data?.questions?.length ?? 0}</span>
                </p>
              </div>
              <div className='bg-[var(--practice-question-type,#ff6b54)]  text-white flex items-center justify-center gap-1 px-3 h-10 rounded-lg'>
                <img src={map[type]?.[0]} className='size-4' />
                <p>{t(map[type]?.[1])}</p>
              </div>
            </div>

            <div
              className='bg-primary-neutral-700 flex items-center justify-center  size-10 rounded-lg cursor-pointer'
              onClick={() => {
                handleToggleFlag();
              }}
            >
              <Icon
                icon={formData.student_answers[activeQuestion].flagged ? FLAG_ACTIVE_ICON : FLAG_ICON}
                className={`${formData.student_answers[activeQuestion].flagged ? '' : 'text-primary-neutral-50'}`}
              />
            </div>
          </div>
          <div id='question-view'>
            {data?.questions?.[activeQuestion]?.question_type === MULTIPLE_CHOICE ? (
              <PreviewMultiChoice
                index={activeQuestion + 1}
                total={data?.questions?.length}
                data={data?.questions?.[activeQuestion]}
                mode='test'
                soundEffect={_choseAnswerAudio}
                answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['multi_choice']}
                setAnswerValue={(answer) => {
                  formData.student_answers[activeQuestion].answer = answer;
                  setFormData({ ...formData });
                }}
              />
            ) : data?.questions?.[activeQuestion]?.question_type === FILL_IN_THE_BLANK ? (
              <PreviewFillTheBlank
                index={activeQuestion + 1}
                total={data?.questions?.length}
                data={data?.questions?.[activeQuestion]}
                mode='test'
                soundEffect={_choseAnswerAudio}
                answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['fill_the_blank']}
                setAnswerValue={(answer) => {
                  formData.student_answers[activeQuestion].answer = answer;
                  setFormData({ ...formData });
                }}
              />
            ) : data?.questions?.[activeQuestion]?.question_type === MATCHING ? (
              <PreviewMatching
                index={activeQuestion + 1}
                total={data?.questions?.length}
                data={data?.questions?.[activeQuestion]}
                mode='test'
                soundEffect={_choseAnswerAudio}
                answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['matching']}
                setAnswerValue={(answer) => {
                  formData.student_answers[activeQuestion].answer = answer;
                  setFormData({ ...formData });
                }}
              />
            ) : data?.questions?.[activeQuestion]?.question_type === ORDERING ? (
              <PreviewSort
                mode='test'
                index={activeQuestion + 1}
                total={data?.questions?.length}
                data={data?.questions?.[activeQuestion]}
                soundEffect={_choseAnswerAudio}
                answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['ordering']}
                setAnswerValue={(answer, matches) => {
                  formData.student_answers[activeQuestion].answer = {
                    ...answer,
                    matches: matches?.filter((vl) => vl?.split('|-|')[0] != 'null')
                  };
                  setFormData({ ...formData });
                }}
              />
            ) : (
              <PreviewReverseWord
                key={activeQuestion}
                soundEffect={_choseAnswerAudio}
                mode='training'
                index={activeQuestion + 1}
                total={data?.questions?.length}
                data={data?.questions?.[activeQuestion]}
                answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['reverse_word']}
                setAnswerValue={(answer) => {
                  formData.student_answers[activeQuestion].answer = answer;
                  setFormData({ ...formData });
                }}
              />
            )}
          </div>
          <div className='flex items-center justify-center gap-2 mt-6'>
            <div
              className='bg-primary-neutral-700 flex items-center justify-center  size-10 rounded-lg cursor-pointer'
              onClick={() => {
                if (activeQuestion == 0) return;
                setActiveQuestion(activeQuestion - 1);
                handleQuestionScrollToView();
              }}
            >
              <Icon
                icon={CHEVRON_LEFT_ICON}
                className={`${activeQuestion == 0 ? 'text-primary-neutral-400' : 'text-primary-neutral-50'}`}
              />
            </div>
            <div
              className='bg-primary-neutral-700 flex items-center justify-center  size-10 rounded-lg cursor-pointer'
              onClick={() => {
                if (activeQuestion == formData.student_answers?.length - 1) return;
                setActiveQuestion(activeQuestion + 1);
                handleQuestionScrollToView();
              }}
            >
              <Icon
                icon={CHEVRON_LEFT_ICON}
                className={`${activeQuestion == formData.student_answers?.length - 1 ? 'text-primary-neutral-400' : 'text-primary-neutral-50'} rotate-180`}
              />
            </div>
          </div>
        </div>
      )}
      {showContent && !isSubmitted && (
        <div className='fixed bottom-0 left-0 right-0 px-6 py-3 bg-[#333333]/70 z-10'>
          <div className='flex items-center gap-3'>
            <img src={currentUser?.avatar} className='size-10 min-w-10 rounded-full object-cover' />
            <p className='text-base sm:text-lg font-semibold text-primary-neutral-50'>
              {currentUser?.display_name} - {currentUser?.username}
            </p>
          </div>
        </div>
      )}

      {showFinalMessage && (
        <div className='absolute top-0 left-0 w-full h-full bg-black/60 z-[100] flex justify-center items-center'>
          <p className='text-white text-[80px] xl:text-[200px]'>{t('finish')}</p>
        </div>
      )}

      {isSubmitted && (
        <div className='w-screen h-screen flex items-center justify-center'>
          <div className='p-4  bg-[var(--practice-finish-layer,#ff836f87)] rounded-xl'>
            <div className='py-4 px-20 bg-[var(--practice-finish-bg,#ff836f)] rounded-xl'>
              <p className='text-base font-semibold text-primary-neutral-50 mb-3 text-center'>{t('_summary')}</p>
              <p className='text-base font-semibold text-primary-neutral-50 mb-3 text-center'>
                {t('congratulations_complete')}
              </p>
              <div className='flex items-center justify-center mb-6'>
                <div className='flex items-center gap-3'>
                  <img src={currentUser?.avatar} className='size-10 min-w-10 rounded-full object-cover' />
                  <p className='text-lg font-semibold text-primary-neutral-50'>
                    {currentUser?.display_name} - {currentUser?.username}
                  </p>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                {isTryAssignment ? (
                  <Button
                    variant={'secondary'}
                    onClick={() => {
                      navigate('/exercise/detail/' + examId);
                    }}
                  >
                    {t('go_back_to_assignment')}
                  </Button>
                ) : (
                  <Button
                    variant={'secondary'}
                    onClick={() => {
                      navigate('/exercise/list');
                    }}
                  >
                    {t('back_to_list')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Exam = memo(ExamComponent);

export default Exam;
