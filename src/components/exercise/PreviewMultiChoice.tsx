import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { cn } from '@lib/utils';
import CheckboxInput from '@components/fields/CheckboxInput';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { union } from 'lodash';
import { useDevice } from '@hooks/useDevice';
import SmartHtmlSpeaker from '../TextToSpeek/SmartHtmlSpeaker';

interface Props {
  index: number;
  total: number;
  data: any;
  mode?: 'preview' | 'test' | 'training';
  className?: string;
  defaultCorrectAnswer?: string[]; // mảng id
  answerValue?: string[]; //mảng id
  setAnswerValue?: (answer: string[]) => void;
  soundEffect?: HTMLAudioElement;
  key?: any;
}

const clStyles = [
  // 'bg-gradient-to-b from-[#2D9DA6] to-[#113D40]  shadow-[0px_4px_0px_#0D2D2F]',
  // 'bg-gradient-to-b from-[#EFAF17] to-[#956C0B]  shadow-[0px_4px_0px_#62490B]',
  // 'bg-gradient-to-b from-[#C935CF] to-[#661B69]  shadow-[0px_4px_0px_#48154B]',
  // 'bg-gradient-to-b from-[#EF4980] to-[#7D2441]  shadow-[0px_4px_0px_#63142E]',
  // 'bg-gradient-to-b from-[#35CF4F] to-[#11471A]  shadow-[0px_4px_0px_#0D3514]',
  'bg-[#2D9DA6]  shadow-[0px_4px_0px_#1D8B94]',
  'bg-[#EFAF17]  shadow-[0px_4px_0px_#C59522]',
  'bg-[#C935CF]  shadow-[0px_4px_0px_#A32EA7]',
  'bg-[#EF4980]  shadow-[0px_4px_0px_#C32A5C]',
  'bg-[#35CF4F]  shadow-[0px_4px_0px_#1E792D]'
];

const gridCols = {
  5: 'grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(5,1fr)]',
  4: 'grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(4,1fr)]',
  3: 'grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(3,1fr)]',
  2: 'grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(2,1fr)]',
  1: 'grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(1,1fr)]'
};

const PreviewMultiChoice = ({
  index,
  total,
  data,
  mode = 'test',
  className,
  defaultCorrectAnswer,
  answerValue,
  setAnswerValue,
  soundEffect,
  key
}: Props) => {
  const { t } = useT();
  const { isMobile } = useDevice();
  // State nội bộ chỉ dùng khi không có controlled props answerValue
  const [internalAnswer, setInternalAnswer] = useState<string[]>([]);

  const options = data?.multiple_choice_answers?.options || [];
  const isMultiple = data?.multiple_choice_answers?.is_multiple_choice;

  const selectedAnswers = answerValue ?? internalAnswer;

  const optionCount = (options.length as 1 | 2 | 3 | 4 | 5) || 1;

  // Xử lý chọn đáp án theo id
  const onSelect = (id: string) => {
    let newSelected: string[] = [];

    if (isMultiple) {
      if (selectedAnswers.includes(id)) {
        newSelected = selectedAnswers.length === 1 ? [] : selectedAnswers.filter((i) => i !== id);
      } else {
        newSelected = [...selectedAnswers, id];
      }
    } else {
      newSelected = [id];
    }

    if (setAnswerValue) {
      setAnswerValue(newSelected);
    } else {
      setInternalAnswer(newSelected);
    }
    if (soundEffect) {
      const sound = soundEffect.cloneNode() as HTMLAudioElement;
      sound.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  // Hàm render mỗi option
  const renderOption = (
    answer: {
      id: string;
      answer_title: string;
      file: {
        url: string;
        type: string;
      };
    },
    index: number,
    selected: boolean
  ) => {
    const opacityClass =
      (mode == 'preview' && selectedAnswers.length > 0 ? !selected : selectedAnswers.length > 0 && !selected) &&
      !isMultiple
        ? `${mode == 'training' && defaultCorrectAnswer ? 'opacity-0' : 'opacity-30'}`
        : '';
    const bgClass =
      mode == 'training' && defaultCorrectAnswer
        ? defaultCorrectAnswer?.includes(answer?.id)
          ? `${answer?.file?.type === 'image' || answer?.file?.type === 'video' ? 'border-[10px] border-[#35CF4F] bg-[#35CF4F]' : 'bg-[#35CF4F]   shadow-[0px_4px_0px_#0D3514]'} `
          : `${answer?.file?.type === 'image' || answer?.file?.type === 'video' ? 'border-[10px] border-[#F7493E] bg-[#F7493E]' : 'bg-[#F7493E]   shadow-[0px_4px_0px_#A42A22]'} `
        : // ? `${answer?.file?.type === 'image' || answer?.file?.type === 'video' ? 'border-[10px] border-[#35CF4F]' : 'bg-gradient-to-b from-[#35CF4F] to-[#11471A]  shadow-[0px_4px_0px_#0D3514]'} `
          // : `${answer?.file?.type === 'image' || answer?.file?.type === 'video' ? 'border-[10px] border-[#F7493E]' : 'bg-gradient-to-b from-[#F7493E] to-[#B9342B]  shadow-[0px_4px_0px_#A42A22]'} `
          clStyles[index % clStyles.length];

    return (
      <div
        key={answer.id}
        className={cn(
          bgClass,
          'h-full w-full rounded-xl cursor-pointer text-2xl flex items-center justify-center relative min-h-[240px] xl:h-[280px] 2xl:h-[315px] ',
          opacityClass
        )}
        onClick={() => {
          !defaultCorrectAnswer && onSelect(answer.id);
        }}
      >
        {answer?.file?.url ? (
          <PreviewExercise
            isIcon={(answer.file?.type == 'video' || answer.file?.type == 'audio') && isMobile}
            isViewImage={mode != 'preview'}
            file={answer.file}
            className='w-full min-h-[240px] xl:h-[280px] 2xl:h-[315px] rounded-lg flex items-center justify-center '
            imageClassName='min-h-[240px] xl:h-[280px] 2xl:h-[315px]'
          />
        ) : (
          <div
            className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words'
            dangerouslySetInnerHTML={{ __html: answer.answer_title }}
          />
        )}

        {answer.file?.type === 'video' && !isMobile && (
          <div className='absolute top-0 left-0 right-0 bottom-24 bg-transparent' />
        )}
        {/* <div className='w-full h-[1px] answer-btn-line absolute top-2 left-0 right-0' /> */}
        {isMultiple ? (
          <div className={`absolute top-3 ${isMobile ? 'left-3' : 'right-3'} `}>
            <CheckboxInput
              checked={selected}
              className='size-6 border-[#094448] data-[state=checked]:bg-[#217076] data-[state=checked]:border-[#217076]'
            />
          </div>
        ) : null}
      </div>
    );
  };

  const currentSelected =
    mode === 'training' ? union(defaultCorrectAnswer, selectedAnswers) : (defaultCorrectAnswer ?? selectedAnswers);

  useEffect(() => {
    if (answerValue) {
      setInternalAnswer(answerValue);
    }
  }, [answerValue]);

  return (
    <div className={cn('w-full', className)} key={key}>
      <div className='flex gap-3 sm:gap-10 lg:gap-[120px] justify-center'>
        {data?.question_file?.url && (
          <PreviewExercise
            isIcon={isMobile}
            isViewImage={mode != 'preview'}
            file={data?.question_file}
            className={`rounded-lg flex items-center justify-center ${
              data?.question_file?.type == 'audio' ? 'h-[80px] ' : `h-[230px] `
            } ${isMobile ? 'min-w-[50px] h-[90px]' : 'min-w-[150px]'} sm:w-[400px]`}
          />
        )}
        <div
          className={`relative mb-4  ${mode == 'test' || mode == 'training' ? 'min-h-[200px] xl:min-h-[230px] 2xl:min-h-[255px]' : 'flex-1'}`}
        >
          <div
            className={`w-full relative ${
              mode == 'test' || mode == 'training'
                ? `min-h-[89px] w-max ${data?.question_file?.url ? 'min-w-[300px]' : 'min-w-[400px]'}  md:min-w-[700px] mx-auto`
                : 'min-h-[150px] sm:min-h-[200px] xl:min-h-[230px] 2xl:min-h-[255px] flex-1 w-full'
            } max-w-[calc(100vw-120px)]  rounded-2xl border border-[var(--practice-question-count-border,#ff917f)]  flex items-center justify-center 
             bg-[var(--practice-question,#ff836f)] text-2xl py-6 px-10`}
          >
            <div
              className='font-medium text-base sm:text-2xl break-words'
              dangerouslySetInnerHTML={{
                __html: data?.question_title
              }}
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

      <div className={`grid ${gridCols[optionCount]} gap-3 min-h-[240px] xl:h-[280px] 2xl:h-[315px] mt-4 xl:mt-0`}>
        {options.map((answer: any, index: number) => renderOption(answer, index, currentSelected.includes(answer.id)))}
      </div>
    </div>
  );
};

export default PreviewMultiChoice;
