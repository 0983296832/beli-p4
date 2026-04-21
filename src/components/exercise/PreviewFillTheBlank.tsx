import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { cn } from '@lib/utils';
import FlexibleOTPInput from '@components/fields/FillInBlankInput';
import TextInput from '@components/fields/TextInput';
import { isEqual } from 'lodash';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { useDevice } from '@hooks/useDevice';
import SmartHtmlSpeaker from '../TextToSpeek/SmartHtmlSpeaker';

interface Props {
  index: number;
  total: number;
  data: any;
  mode?: 'preview' | 'test' | 'training';
  className?: string;
  defaultCorrectAnswer?: {
    defaultCorrectAnswer: string;
    otherCorrectAnswer: string[];
    ignoreCase: boolean;
  };
  answerValue?: string;
  setAnswerValue?: (answer: string) => void;
  soundEffect?: HTMLAudioElement;
  key?: any;
}

const PreviewFillTheBlank = (props: Props) => {
  const {
    data,
    mode = 'test',
    className,
    defaultCorrectAnswer,
    answerValue,
    setAnswerValue,
    index,
    total,
    soundEffect,
    key
  } = props;
  const { t } = useT();
  const { isMobile } = useDevice();

  return (
    <div className={cn('w-full', className)} key={key}>
      <div className='flex gap-3 sm:gap-10 lg:gap-[120px] justify-center'>
        {data?.question_file?.url && (
          <PreviewExercise
            isIcon={isMobile}
            isViewImage={mode != 'preview'}
            file={data?.question_file}
            className={`rounded-lg flex items-center justify-center ${
              data?.question_file?.type == 'audio' ? 'h-[80px] ' : 'h-[150px] sm:h-[250px]'
            } ${isMobile ? 'min-w-[50px] h-[90px]' : 'min-w-[150px]'} sm:w-[400px] `}
          />
        )}
        <div
          className={`relative mb-4 ${mode == 'test' || mode == 'training' ? 'min-h-[200px] xl:min-h-[250px] 2xl:min-h-[285px]' : 'flex-1'}`}
        >
          <div
            className={`w-full relative ${
              mode == 'test' || mode == 'training'
                ? `min-h-[89px] w-max ${
                    data?.question_file?.url ? 'min-w-[calc(100vw-80px)]' : 'min-w-[calc(100vw-16px)]'
                  } sm:min-w-[700px] mx-auto`
                : 'min-h-[200px] xl:min-h-[250px] 2xl:min-h-[285px]'
            } max-w-[calc(100vw-120px)] py-6 rounded-2xl border border-[var(--practice-question-count-border,#ff917f)] flex items-center 
            justify-center bg-[var(--practice-question,#ff836f)] text-2xl px-10`}
          >
            <div
              className='font-medium text-base sm:text-2xl break-words'
              dangerouslySetInnerHTML={{ __html: data?.question_title }}
            />
            <div className='absolute bottom-2 right-2'>
              <SmartHtmlSpeaker html={data?.question_title} className='' />
            </div>
          </div>
          <div
            className={`absolute top-0 ${
              mode == 'preview' ? 'left-[49%]' : 'left-[46%]'
            } -translate-y-[50%] border bg-[var(--practice-question-count,#ff6046)] border-[var(--practice-question-count-border,#ff917f)] px-3 py-2 rounded-full text-white`}
          >
            <p>
              {index}/{total}
            </p>
          </div>
        </div>
      </div>

      <div
        className={` gap-3 min-h-[250px] h-max xl:min-h-[295px] 2xl:min-h-[305px] bg-[var(--practice-answer-fill-blank-bg,#ff836f)] rounded-2xl flex items-center justify-center py-4`}
      >
        <div className='flex items-center justify-center flex-col'>
          <p className='text-center font-semibold text-base sm:text-2xl mb-6 text-[var(--practice-answer-fill-blank-text,#ffffff)]'>
            {t('enter_answer_in_boxes')}
          </p>
          {defaultCorrectAnswer ? (
            mode === 'training' ? (
              <>
                {!isEqual(
                  defaultCorrectAnswer?.ignoreCase
                    ? defaultCorrectAnswer?.defaultCorrectAnswer.toLocaleLowerCase()
                    : defaultCorrectAnswer?.defaultCorrectAnswer,
                  defaultCorrectAnswer?.ignoreCase ? answerValue?.toLocaleLowerCase() : answerValue
                ) && (
                  <>
                    {data?.fill_in_the_blank?.input_type == 1 ? (
                      <div className=' h-[60px] min-w-[calc(100vw-32px)] sm:min-w-[550px] w-max bg-primary-error rounded-lg flex items-center justify-start px-4 mb-3'>
                        <p className='text-primary-neutral-50 text-md sm:text-2xl font-medium'>{answerValue}</p>
                      </div>
                    ) : (
                      <div className='flex items-center mx-auto gap-2 flex-wrap'>
                        {defaultCorrectAnswer?.defaultCorrectAnswer?.split('')?.map((text: string, index: number) => {
                          if (text === ' ') {
                            return <div className='w-5' />;
                          } else
                            return (
                              <div
                                key={index}
                                className=' size-[60px] bg-primary-error rounded-lg flex items-center justify-center'
                              >
                                <p className='text-primary-neutral-50 text-md sm:text-2xl font-medium'>
                                  {answerValue?.[index]}
                                </p>
                              </div>
                            );
                        })}
                      </div>
                    )}
                  </>
                )}
                {data?.fill_in_the_blank?.input_type == 1 ? (
                  <div className=' h-[60px] min-w-[calc(100vw-32px)] sm:min-w-[550px] w-max bg-primary-success rounded-lg flex items-center justify-start px-4 '>
                    <p className='text-primary-neutral-50 text-md sm:text-2xl font-medium'>
                      {defaultCorrectAnswer?.ignoreCase &&
                      isEqual(
                        defaultCorrectAnswer?.defaultCorrectAnswer.toLocaleLowerCase(),
                        answerValue?.toLocaleLowerCase()
                      )
                        ? answerValue
                        : defaultCorrectAnswer?.defaultCorrectAnswer}
                    </p>
                  </div>
                ) : (
                  <div className='flex items-center mx-auto gap-2 flex-wrap mt-6 max-w-[calc(100vw-32px)] sm:max-w-none'>
                    {defaultCorrectAnswer?.defaultCorrectAnswer?.split('')?.map((text: string, index: number) => {
                      if (text === ' ') {
                        return <div className='w-5' />;
                      } else
                        return (
                          <div
                            key={index}
                            className=' size-[60px] bg-primary-success rounded-lg flex items-center justify-center'
                          >
                            <p className='text-primary-neutral-50 text-md sm:text-2xl font-medium'>{text}</p>
                          </div>
                        );
                    })}
                  </div>
                )}
                {data?.fill_in_the_blank?.other_correct_answer?.length ? (
                  <p className='text-[var(--practice-other-correct-answer-text,#ffffff)] text-xl font-semibold mt-4'>
                    {t('other_answer')}: {data?.fill_in_the_blank?.other_correct_answer?.join(', ')}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                {data?.fill_in_the_blank?.input_type == 1 ? (
                  <div className=' h-[60px] min-w-[calc(100vw-32px)] sm:min-w-[550px] w-max bg-primary-success rounded-lg flex items-center justify-start px-4'>
                    <p className='text-primary-neutral-50 text-md sm:text-2xl font-medium'>
                      {defaultCorrectAnswer?.defaultCorrectAnswer}
                    </p>
                  </div>
                ) : (
                  <div className='flex items-center mx-auto gap-2 flex-wrap mt-6 max-w-[calc(100vw-32px)] sm:max-w-none'>
                    {defaultCorrectAnswer?.defaultCorrectAnswer?.split('')?.map((text: string, index: number) => {
                      if (text === ' ') {
                        return <div className='w-5' />;
                      } else
                        return (
                          <div
                            key={index}
                            className=' size-[60px] bg-primary-success rounded-lg flex items-center justify-center max-w-[calc(100vw-32px)] sm:max-w-none'
                          >
                            <p className='text-primary-neutral-50 text-md sm:text-2xl font-medium'>{text}</p>
                          </div>
                        );
                    })}
                  </div>
                )}
                {defaultCorrectAnswer?.otherCorrectAnswer?.length > 0 && (
                  <p className='text-primary-blue-200 text-sm 2xl:text-xl font-semibold mt-4'>
                    {t('other_answer')}: {defaultCorrectAnswer?.otherCorrectAnswer?.join(', ')}
                  </p>
                )}
              </>
            )
          ) : (
            <>
              {data?.fill_in_the_blank?.input_type == 1 ? (
                <TextInput
                  value={answerValue}
                  placeholder={t('enter_answer')}
                  className='focus-visible:border-primary-neutral-50 border-transparent text-primary-neutral-200 bg-[var(--practice-answer-fill-blank,#b61b02)] 
                  h-[60px] text-md 2xl:text-xl md:text-2xl font-medium min-w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] sm:min-w-[550px]'
                  onChange={(value) => {
                    setAnswerValue?.(value);
                  }}
                />
              ) : (
                <div>
                  <FlexibleOTPInput
                    inputClassName='bg-[var(--practice-answer-fill-blank,#b61b02)] sm:size-[60px] size-10 text-base sm:text-2xl'
                    inputString={data?.fill_in_the_blank?.answer_title}
                    value={answerValue}
                    onChange={(value) => {
                      setAnswerValue?.(value);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewFillTheBlank;
