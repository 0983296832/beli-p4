import {
  CHEVRON_LEFT_ICON,
  CORRECT_ANSWER_ICON,
  FILL_THE_BLANK_ICON,
  FLAG_ICON,
  LOGO,
  MATCHING_ICON,
  MEDAL_ICON,
  MULTI_CHOICE_ICON,
  PRACTICE_BG,
  PRACTICE_BG_01,
  SORT_ICON,
  WRONG_ANSWER_ICON
} from '@lib/ImageHelper';
import React, { useEffect, useState, useRef } from 'react';
import { useT } from '@hooks/useT';
import { FILL_IN_THE_BLANK, MATCHING, MOCK_DATA, MULTIPLE_CHOICE, ORDERING, REVERSE_WORD } from '../Exercise/constant';
import { Button } from '@components/ui/button';
import CountdownTimer, { CountdownTimerHandle } from '@components/countdownTimer';
import { useRootStore } from '@store/index';
import { cloneDeep, isEqual, sumBy, uniqueId } from 'lodash';
import PreviewMultiChoice from '@components/exercise/PreviewMultiChoice';
import { AnswerType, ExamSetting, StudentAnswerType } from './type';
import PreviewFillTheBlank from '@components/exercise/PreviewFillTheBlank';
import PreviewMatching from '@components/exercise/PreviewMatching';
import PreviewSort from '@components/exercise/PreviewSort';
import Icon from '@components/Icon/index';
import Confirm from '@components/confirm/index';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@components/ui/dialog';
import Rate from '@components/Rate';
import '@assets/styles/practice-theme.css';
import exerciseServices from '@services/exercise';
import wrongAudio from '@assets/audios/lost.wav';
import correctAudio from '@assets/audios/won.wav';
import themeAudio from '@assets/audios/nhac-nen2.wav';
import choseAnswerAudio from '@assets/audios/chon-dap-an.wav';
import confetti from 'canvas-confetti';
import Loading from '@components/loading';
import TextAreaInput from '@components/fields/TextAreaInput';
import { Toast } from '@components/toast';
import { emitter } from '@lib/SocketClient';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { useDevice } from '@hooks/useDevice';
import PreviewReverseWord from '@components/exercise/PreviewReverseWord';
import { VolumeControl } from '@components/Volume/VolumeControl';
import { AnimatePresence, motion } from 'framer-motion';

const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const Training = ({
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
  const [startTestCountdown, setStartTestCountdown] = useState(false);
  const [formData, setFormData] = useState<{ student_answers: StudentAnswerType[] }>({
    student_answers: []
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const countdownRef = useRef<CountdownTimerHandle | null>(null);
  const [answerStatus, setAnswerStatus] = useState(0);
  const [isShowAnswer, setIsShowAnswer] = useState(false);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState<any>(null);
  const [currentExplainAnswer, setCurrentExplainAnswer] = useState<any>(null);
  const [openRating, setOpenRating] = useState(false);
  const [rating, setRating] = useState('0');
  const [comment, setComment] = useState('');
  const [emptyAnswer, setEmptyAnswer] = useState<StudentAnswerType[]>([]);
  const [totalPoint, setTotalPoint] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitStat, setSubmitStat] = useState<any>({});
  let wrongAnswerAudio = new Audio(wrongAudio);
  let correctAnswerAudio = new Audio(correctAudio);
  let themeBgAudio = new Audio(themeAudio);
  let _choseAnswerAudio = new Audio(choseAnswerAudio);
  const { isMobile } = useDevice();
  const [volume, setVolume] = useState(0.01);

  console.log(examData);

  // giữ 1 ref cho audio, tránh reinit mỗi render
  const themeBgAudioRef = useRef<HTMLAudioElement | null>(null);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showFixedHeader, setShowFixedHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const rect = headerRef.current.getBoundingClientRect();
      setShowFixedHeader(rect.bottom <= 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useEffect(() => {
  //   const observer = new IntersectionObserver(([entry]) => setShowFixedHeader(!entry.isIntersecting), { threshold: 0 });

  //   if (headerRef.current) observer.observe(headerRef.current);
  //   return () => observer.disconnect();
  // }, []);

  const handleCheckUnDoQuestion = (answer: StudentAnswerType) => {
    const currentEmptyAnswer = emptyAnswer.find((e_answer) => e_answer?.question_id == answer?.question_id);
    if (isEqual(currentEmptyAnswer?.answer, answer?.answer)) {
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    setShowContent(false);
    setStartTestCountdown(false);
    countdownRef?.current?.pause();
    setShowFinalMessage(true);
    try {
      const body = cloneDeep(formData);

      body.student_answers = body.student_answers.filter((s_answer) => {
        if (handleCheckUnDoQuestion(s_answer)) {
          return false;
        }
        return true;
      });
      body.student_answers = body.student_answers.map((s_answer) => {
        const _question = examData?.questions?.find((question) => question?.id === s_answer?.question_id);
        if (_question?.question_type === ORDERING) {
          return {
            ...s_answer,
            answer: {
              ...(s_answer?.answer as any),
              matches: Array.isArray((s_answer?.answer as any)?.bottom)
                ? ((s_answer?.answer as any).bottom as (string | null)[])
                    .map((s_an: string | null, index: number) => {
                      if (s_an) {
                        return `${s_an}|-|${_question?.sort?.descriptions?.[index]?.id}`;
                      } else {
                        return s_an;
                      }
                    })
                    .filter((v: string | null) => v)
                : []
            }
          };
        } else {
          return { ...s_answer };
        }
      });
      if (!isTryAssignment) {
        const res: any = await exerciseServices.postSubmitExam(Number(examId), body);
        await handleStatisticAfterSubmit(res?.id);
      }

      setTimeout(() => {
        setShowFinalMessage(false);
        setIsSubmitted(true);
        // setOpenRating(true);
      }, 1000);
    } catch (err) {
      setTimeout(() => {
        setShowFinalMessage(false);
        setIsSubmitted(true);
        // setOpenRating(true);
      }, 1000);
    }
  };

  const handleRate = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const res: any = await exerciseServices.postExamRate({
        exam_id: examId,
        rate: +rating,
        comment: comment
      });
      setOpenRating(false);
      setLoading(false);
      Toast('success', res?.message);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleStatisticAfterSubmit = async (submit_id: number) => {
    setLoading(true);
    try {
      setLoading(false);
      const res: any = await exerciseServices.getSubmitStat(submit_id);
      setOpenRating(false);
      setLoading(false);
      setSubmitStat(res);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleCheckCorrectAnswer = async () => {
    let correctAnswer: any;
    // setLoading(true);
    try {
      const res: any = await exerciseServices.postCheckQuestion(data?.questions?.[activeQuestion]?.id, {
        answer: formData?.student_answers?.[activeQuestion]?.answer
      });
      setIsShowAnswer(true);
      switch (res?.question?.question_type) {
        case MULTIPLE_CHOICE: {
          correctAnswer = res?.question?.multiple_choice_answers?.options
            ?.filter((opt: any) => opt?.is_correct_answer)
            ?.map((opt: any) => opt?.id);
          const answer_status = res?.is_correct == 1;
          setAnswerStatus(answer_status ? 1 : 2);
          if (answer_status) {
            correctAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
            setTotalPoint(totalPoint + data?.questions?.[activeQuestion]?.score);
          } else {
            wrongAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
          }
          break;
        }

        case FILL_IN_THE_BLANK: {
          const inOtherCorrectAnswer = res?.question?.fill_in_the_blank?.other_correct_answer?.find(
            (answer: string) =>
              (!!res?.question?.fill_in_the_blank?.ignore_case
                ? (formData?.student_answers?.[activeQuestion]?.answer as string)?.toLocaleLowerCase()
                : formData?.student_answers?.[activeQuestion]?.answer) ==
              (!!res?.question?.fill_in_the_blank?.ignore_case ? answer?.toLocaleLowerCase() : answer)
          );
          correctAnswer = {
            defaultCorrectAnswer: inOtherCorrectAnswer
              ? inOtherCorrectAnswer
              : res?.question?.fill_in_the_blank?.answer_title,
            otherCorrectAnswer: res?.question?.fill_in_the_blank?.other_correct_answer,
            ignoreCase: !!res?.question?.fill_in_the_blank?.ignore_case
          };
          const answer_status = res?.is_correct == 1;
          setAnswerStatus(answer_status ? 1 : 2);
          if (answer_status) {
            correctAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
            setTotalPoint(totalPoint + data?.questions?.[activeQuestion]?.score);
          } else {
            wrongAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
          }
          break;
        }

        case MATCHING: {
          correctAnswer = res?.question?.matching?.options?.map((answer: any, index: number) => {
            const answer_description = res?.question?.matching?.descriptions?.find(
              (desc: any) => desc?.answer_id == answer?.id
            );
            return { top: answer?.id, bottom: answer_description?.id };
          });
          const answer_status = res?.is_correct == 1;
          setAnswerStatus(answer_status ? 1 : 2);
          if (answer_status) {
            correctAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
            setTotalPoint(totalPoint + data?.questions?.[activeQuestion]?.score);
          } else {
            wrongAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
          }
          break;
        }

        case ORDERING: {
          correctAnswer = {
            top: res?.question?.sort?.options?.map(() => {
              return null;
            }),
            bottom: res?.question?.sort?.descriptions?.map((desc: any) => {
              const correctAnswer: number = res?.question?.sort?.options?.find(
                (opt: { id: number }) => opt?.id == desc?.answer_id
              )?.id as number;
              return correctAnswer;
            })
          };
          const answer_status = res?.is_correct == 1;
          setAnswerStatus(answer_status ? 1 : 2);
          if (answer_status) {
            correctAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
            setTotalPoint(totalPoint + data?.questions?.[activeQuestion]?.score);
          } else {
            wrongAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
          }
          break;
        }

        case REVERSE_WORD: {
          correctAnswer = res?.question?.reverse_word?.options?.map((val: any) => {
            return { id: val?.id, position: val?.position };
          });
          const answer_status = res?.is_correct == 1;
          setAnswerStatus(answer_status ? 1 : 2);
          if (answer_status) {
            correctAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
            setTotalPoint(totalPoint + data?.questions?.[activeQuestion]?.score);
          } else {
            wrongAnswerAudio.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
          }
          break;
        }

        default:
          break;
      }
      countdownRef?.current?.pause();
      setCurrentExplainAnswer(res?.question?.answer_explanation);

      setCurrentCorrectAnswer(correctAnswer);
    } catch (error) {
      setCurrentExplainAnswer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initStudentAnswer = cloneDeep(data?.questions)?.map((q) => {
      const id = q?.id as number;
      switch (q?.question_type) {
        case MULTIPLE_CHOICE:
          return { question_id: id, answer: [] };
        case FILL_IN_THE_BLANK:
          return { question_id: id, answer: '' };
        case MATCHING:
          return { question_id: id, answer: [] };
        case ORDERING:
          return {
            question_id: id,

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
          return { question_id: id, answer: null };
      }
    }) as StudentAnswerType[];
    setFormData({
      student_answers: cloneDeep(initStudentAnswer)
    });
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

  return (
    <div
      className={`min-h-screen h-max relative`}
      style={{
        backgroundImage: `url('${PRACTICE_BG_01}')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <Loading loading={loading} />
      {showCountdown && (
        <div className='absolute top-0 left-0 w-full h-full bg-black/60 text-white text-[80px] xl:text-[200px] flex justify-center items-center z-10'>
          {showStartText ? t('start') : count}
        </div>
      )}
      <AnimatePresence>
        {showFixedHeader && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className='fixed top-0 left-0 right-0 z-[9999] bg-[var(--practice-score,#ff836f)] text-white shadow p-1 sm:p-2 border-b sm:flex justify-between gap-2'
          >
            <p className='text-sm font-medium line-clamp-1'>
              {t('homework')}:{' '}
              <span className='text-sm font-normal'>
                {examData?.exercise_code} | {examData?.exercise_name}
              </span>
            </p>
            <p className='text-sm font-medium line-clamp-1'>
              {t('student')}:{' '}
              <span className='text-sm font-normal'>
                {currentUser?.username} - {currentUser?.display_name}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {showContent && !isSubmitted && (
        <div className={`min-h-screen h-max w-[calc(100vw-6px)]   pb-28`}>
          <div
            ref={headerRef}
            className=' p-1 sm:p-2 bg-[var(--practice-score,#ff836f)] text-white sm:flex justify-between gap-2'
          >
            <p className='text-sm font-medium line-clamp-1'>
              {t('homework')}:{' '}
              <span className='text-sm font-normal'>
                {examData?.exercise_code} | {examData?.exercise_name}
              </span>
            </p>
            <p className='text-sm font-medium line-clamp-1'>
              {t('student')}:{' '}
              <span className='text-sm font-normal'>
                {currentUser?.display_name} - {currentUser?.username}
              </span>
            </p>
          </div>
          <div className='pt-5 px-2 sm:px-[62px]'>
            <div className='rounded-sm  flex items-start justify-between mb-16'>
              {setting?.time_for_each_question ? (
                <CountdownTimer
                  minutes={setting?.time_for_each_question / 60}
                  ref={countdownRef}
                  start={startTestCountdown}
                  onComplete={() => {
                    if (setting?.show_answer_during_exam == 1) {
                      countdownRef?.current?.pause();
                      handleCheckCorrectAnswer();
                    } else {
                      if (activeQuestion < data?.questions?.length - 1) {
                        setActiveQuestion(activeQuestion + 1);
                        setAnswerStatus(0);
                        // setStartTestCountdown(false);
                        setTimeout(() => {
                          countdownRef?.current?.reset();
                        }, 500);
                        setIsShowAnswer(false);
                        setCurrentCorrectAnswer(null);
                      } else {
                        countdownRef?.current?.pause();
                        handleSubmit();
                      }
                    }
                  }}
                  onRender={(time) => {
                    return (
                      <div
                        className={`flex items-center justify-center rounded-lg px-1 h-10 bg-white text-primary-error min-w-[80px] border border-[var(--practice-question-description-border,#ff836f)]`}
                      >
                        <p className='text-sm font-medium'>{time}</p>
                      </div>
                    );
                  }}
                />
              ) : (
                <div />
              )}

              <div className='flex items-center gap-2'>
                <Button
                  className='w-20 bg-[var(--practice-score,#ff836f)] hover:bg-[var(--practice-score,#ff836f)]'
                  onClick={() => {
                    countdownRef?.current?.reset();
                  }}
                >
                  {totalPoint ?? 0}
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

            <div id='question-view'>
              {data?.questions?.[activeQuestion]?.question_type === MULTIPLE_CHOICE ? (
                <PreviewMultiChoice
                  key={activeQuestion}
                  soundEffect={_choseAnswerAudio}
                  index={activeQuestion + 1}
                  total={data?.questions?.length}
                  data={data?.questions?.[activeQuestion]}
                  mode='training'
                  defaultCorrectAnswer={currentCorrectAnswer}
                  answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['multi_choice']}
                  setAnswerValue={(answer) => {
                    formData.student_answers[activeQuestion].answer = answer;
                    setFormData({ ...formData });
                  }}
                />
              ) : data?.questions?.[activeQuestion]?.question_type === FILL_IN_THE_BLANK ? (
                <PreviewFillTheBlank
                  key={activeQuestion}
                  soundEffect={_choseAnswerAudio}
                  index={activeQuestion + 1}
                  total={data?.questions?.length}
                  data={data?.questions?.[activeQuestion]}
                  mode='training'
                  defaultCorrectAnswer={currentCorrectAnswer}
                  answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['fill_the_blank']}
                  setAnswerValue={(answer) => {
                    formData.student_answers[activeQuestion].answer = answer;
                    setFormData({ ...formData });
                  }}
                />
              ) : data?.questions?.[activeQuestion]?.question_type === MATCHING ? (
                <PreviewMatching
                  key={activeQuestion}
                  soundEffect={_choseAnswerAudio}
                  index={activeQuestion + 1}
                  total={data?.questions?.length}
                  data={data?.questions?.[activeQuestion]}
                  mode='training'
                  defaultCorrectAnswer={currentCorrectAnswer}
                  answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['matching']}
                  setAnswerValue={(answer) => {
                    formData.student_answers[activeQuestion].answer = answer;
                    setFormData({ ...formData });
                  }}
                />
              ) : data?.questions?.[activeQuestion]?.question_type === ORDERING ? (
                <PreviewSort
                  key={activeQuestion}
                  soundEffect={_choseAnswerAudio}
                  mode='training'
                  index={activeQuestion + 1}
                  total={data?.questions?.length}
                  data={data?.questions?.[activeQuestion]}
                  defaultCorrectAnswer={currentCorrectAnswer}
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
                  defaultCorrectAnswer={currentCorrectAnswer}
                  answerValue={formData?.student_answers?.[activeQuestion]?.answer as AnswerType['reverse_word']}
                  setAnswerValue={(answer) => {
                    formData.student_answers[activeQuestion].answer = answer;
                    setFormData({ ...formData });
                  }}
                />
              )}
            </div>
            {isShowAnswer && (
              <div className='mt-4 z-[40]'>
                <p className='text-[var(--practice-question-text,#041724)] font-semibold text-base mb-2'>
                  {t('answer_explanation')}
                </p>
                <div className='flex items-start gap-3'>
                  <div className='min-h-[161px] w-max'>
                    {currentExplainAnswer?.explain_file?.url && (
                      <PreviewExercise
                        isIcon={isMobile}
                        isViewImage
                        file={currentExplainAnswer?.explain_file}
                        className={`rounded-lg flex items-center z-[1] justify-center ${currentExplainAnswer?.explain_file?.type == 'audio' ? 'h-[80px] ' : 'h-[150px] sm:h-[230px] 2xl:h-[250px] '} ${isMobile ? 'min-w-[50px] w-[50px]' : 'min-w-[150px] w-[150px]'} sm:w-[200px] lg:w-[400px]`}
                      />
                    )}
                  </div>
                  <div className='flex-1 min-h-[161px] rounded-2xl border border-[var(--practice-question-description-border,#ff836f)] flex items-center justify-center bg-[var(--practice-question-description,#ff836f)] text-2xl py-2 px-10 '>
                    <div
                      className='font-medium text-base sm:text-2xl break-words break-all'
                      dangerouslySetInnerHTML={{
                        __html: currentExplainAnswer?.explain_description
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showContent && !isSubmitted && (
        <div
          className={`fixed bottom-0 left-0 right-0 px-6 py-2.5 ${answerStatus === 1 ? 'bg-primary-success' : answerStatus === 2 ? 'bg-primary-error' : 'bg-[#333333]/70'} flex items-center justify-between z-[61]`}
        >
          <div className='flex items-center gap-3'>
            <img
              src={currentUser?.avatar}
              className='size-[50px] min-w-[50px] rounded-full object-cover hidden sm:block'
            />
            {answerStatus != 0 ? (
              <div className='p-2.5 rounded-sm bg-white hidden sm:block'>
                {t(answerStatus === 1 ? 'perfect_continue' : 'try_again')}
              </div>
            ) : (
              <p className='text-base sm:text-lg font-semibold text-primary-neutral-50'>
                {currentUser?.display_name} - {currentUser?.username}
              </p>
            )}
          </div>
          {answerStatus == 0 && (
            <>
              {setting?.show_answer_during_exam == 1 ? (
                <Button
                  className='bg-[var(--practice-btn-check-answer,#ff836f)] hover:bg-[var(--practice-btn-check-answer,#ff836f)]'
                  onClick={() => {
                    if (loading) return;
                    countdownRef?.current?.pause();
                    handleCheckCorrectAnswer();
                  }}
                >
                  {t('check_answer')}
                </Button>
              ) : (
                <Button
                  className='bg-[var(--practice-btn-check-answer,#ff836f)] hover:bg-[var(--practice-btn-check-answer,#ff836f)]'
                  onClick={() => {
                    if (loading) return;
                    if (activeQuestion < data?.questions?.length - 1) {
                      setActiveQuestion(activeQuestion + 1);
                      setAnswerStatus(0);
                      countdownRef?.current?.reset();
                      setIsShowAnswer(false);
                      setCurrentCorrectAnswer(null);
                    } else {
                      handleSubmit();
                    }
                  }}
                >
                  {t(activeQuestion < data?.questions?.length - 1 ? 'continue' : 'submit_test')}
                </Button>
              )}
            </>
          )}
          {/* {answerStatus == 0 && setting?.show_answer_during_exam == 1 ? (
            <>
              {activeQuestion < data?.questions?.length - 1 ? (
                <Button
                  className='bg-[var(--practice-btn-check-answer,#ff836f)] hover:bg-[var(--practice-btn-check-answer,#ff836f)]'
                  onClick={() => {
                    // handleCheckCorrectAnswer();
                    setActiveQuestion(activeQuestion + 1);
                  }}
                >
                  {t('check_answer')}
                </Button>
              ) : (
                <Button
                  className='bg-[var(--practice-btn-check-answer,#ff836f)] hover:bg-[var(--practice-btn-check-answer,#ff836f)]'
                  onClick={() => {
                    if (activeQuestion < data?.questions?.length - 1) {
                      setActiveQuestion(activeQuestion + 1);
                      setAnswerStatus(0);
                      countdownRef?.current?.reset();
                      setIsShowAnswer(false);
                      setCurrentCorrectAnswer(null);
                    } else {
                      handleSubmit();
                    }
                  }}
                >
                  {t('continue')}
                </Button>
              )}
            </>
          ) : (
            <></>
          )} */}
          {answerStatus != 0 && setting?.show_answer_during_exam == 1 && (
            <div className='flex items-center gap-3 z-[61]'>
              <div className={`py-2 pl-4 pr-20 bg-primary-neutral-50 rounded-lg text-left relative overflow-hidden`}>
                <p className={`${answerStatus === 1 ? 'text-[#4D9636]' : 'text-[#E93A3A]'} text-sm font-medium`}>
                  {t(answerStatus === 1 ? 'correct' : 'incorrect')}
                </p>
                <p
                  className={`${answerStatus === 1 ? 'text-[#4D9636]' : 'text-[#E93A3A]'} text-2xl font-semibold leading-6`}
                >
                  + {answerStatus === 1 ? data?.questions?.[activeQuestion]?.score : 0}
                </p>
                <img
                  src={answerStatus === 1 ? CORRECT_ANSWER_ICON : WRONG_ANSWER_ICON}
                  className='absolute top-3 -right-[52px] -translate-x-[50%] -translate-y-[50%]'
                />
              </div>

              <Button
                variant={'secondary'}
                className='h-[60px] px-5 text-2xl font-medium text-primary-blue-400 bg-primary-neutral-50 hover:bg-primary-neutral-50'
                onClick={() => {
                  if (loading) return;
                  if (activeQuestion < data?.questions?.length - 1) {
                    setActiveQuestion(activeQuestion + 1);
                    setAnswerStatus(0);
                    countdownRef?.current?.reset();
                    setIsShowAnswer(false);
                    setCurrentCorrectAnswer(null);
                  } else {
                    handleSubmit();
                  }
                }}
              >
                {t(activeQuestion < data?.questions?.length - 1 ? 'continue' : 'submit_test')}
              </Button>
            </div>
          )}
        </div>
      )}

      {showFinalMessage && (
        <div className='absolute top-0 left-0 w-full h-full bg-black/60 z-[100] flex justify-center items-center'>
          <p className='text-white text-[80px] xl:text-[200px]'>{t('finish')}</p>
        </div>
      )}

      {isSubmitted && (
        <div className='w-screen h-screen flex items-center justify-center'>
          <Dialog open={openRating} onOpenChange={setOpenRating}>
            <DialogContent className='p-5 rounded-lg bg-white z-50 max-w-[500px]'>
              <div>
                <p className='text-center mt-2 mb-4'>{t('rate_satisfaction')}</p>
                <Rate value={rating} onChange={(val) => setRating(val)} />
                <TextAreaInput
                  rows={3}
                  placeholder={t('feedback_comment')}
                  value={comment}
                  onChange={(val) => setComment(val)}
                  className='w-full my-3'
                />
                <div className='flex items-center justify-center'>
                  <Button
                    variant={'outline'}
                    className='text-primary-blue-500 border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 hover:text-primary-blue-500 mt-3'
                    onClick={() => {
                      handleRate();
                    }}
                  >
                    {t('submit_review')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className='p-4  bg-[var(--practice-finish-layer,#ff836f87)] rounded-xl'>
            <div className='py-4 px-20 bg-[var(--practice-finish-bg,#ff836f)]  rounded-xl'>
              <p className='text-base font-semibold text-primary-neutral-50 mb-3 text-center'>{t('_summary')}</p>
              <p className='text-base font-semibold text-primary-neutral-50 mb-3 text-center'>
                {t('congratulations_complete')}
              </p>
              <div className='flex items-center justify-center'>
                <div className='flex items-center gap-3'>
                  <img src={currentUser?.avatar} className='size-10 min-w-10 rounded-full object-cover' />
                  <p className='text-lg font-semibold text-primary-neutral-50'>
                    {currentUser?.display_name} - {currentUser?.username}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4 mt-4'>
              {!!setting?.ranking && (
                <div className='w-1/2 p-4 bg-[var(--practice-finish-bg,#ff836f)]   rounded-xl flex items-center justify-between'>
                  <div className='w-max'>
                    <p className='text-primary-blue-50 text-sm font-medium mb-2'>{t('ranking')}</p>
                    <p className='text-primary-blue-50 text-sm font-medium'>
                      {submitStat?.student_rank}/{submitStat?.total_students}
                    </p>
                  </div>
                  <div className='flex items-center justify-center bg-primary-blue-50 rounded-lg size-[30px]'>
                    <Icon icon={MEDAL_ICON} className='size-4' />
                  </div>
                </div>
              )}

              <div
                className={`${!!setting?.ranking ? 'w-1/2' : 'w-full'} p-4 bg-[var(--practice-finish-bg,#ff836f)]  rounded-xl flex items-center justify-between`}
              >
                <div className='w-max'>
                  <p className='text-primary-blue-50 text-sm font-medium mb-2'>{t('_score')}</p>
                  <p className='text-primary-blue-50 text-sm font-medium'>
                    {isTryAssignment ? totalPoint : submitStat?.total_score}
                  </p>
                </div>
                <div className='flex items-center justify-center bg-primary-blue-50 rounded-lg size-[30px]'>
                  <Icon icon={MEDAL_ICON} className='size-4' />
                </div>
              </div>
            </div>
            <div className='flex items-center justify-center mt-4 flex-col'>
              {!!setting?.show_answer_after_exam && (
                <Link
                  to={`/curriculum/report/detail-exercise/${examId}/${currentUser?.user_id}`}
                  className='text-[var(--practice-correct-answer-text,#333333)] underline pb-4'
                >
                  {t('view_exercise_result')}
                </Link>
              )}
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
      )}
    </div>
  );
};

export default Training;
