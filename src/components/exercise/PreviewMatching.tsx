import React, { useEffect, useRef, useState } from 'react';
import { useT } from '@hooks/useT';
import { cn } from '@lib/utils';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import CHECK_WHITE from '@assets/images/check-white.svg';
import { intersectionWith } from 'lodash';
import { useMultiCanvasLineConnector } from '@hooks/useMultiCanvasLineConnector';
// import { AutoConnector } from '../autoConnector';
import LeaderLine from 'leader-line-new';
import { useDevice } from '@hooks/useDevice';
import SmartHtmlSpeaker from '../TextToSpeek/SmartHtmlSpeaker';

type Connection = { top: string; bottom: string; answer_color?: string };

type MultiLineTreeByIdProps = {
  connections: Connection[];
  color?: string;
  dashed?: boolean;
};

export const MultiLineTreeById: React.FC<MultiLineTreeByIdProps> = ({ connections, color, dashed = false }) => {
  const linesRef = useRef<LeaderLine[]>([]);

  const getColor = (top?: string) => {
    if (top === undefined || top === null) return colorsHex[0];
    return colorsHex[Number(top.split('_')?.[1]) % colorsHex.length];
  };
  useEffect(() => {
    linesRef.current = [];

    const newLines: LeaderLine[] = [];

    for (const { top, bottom, answer_color } of connections) {
      const startEl = document.getElementById(top);
      const endEl = document.getElementById(bottom);

      if (startEl && endEl) {
        const line = new LeaderLine(
          LeaderLine.pointAnchor(startEl, { x: '50%', y: '65%' }),
          LeaderLine.pointAnchor(endEl, {
            x: '50%',
            y: '25%'
          }),
          {
            path: 'straight',
            startSocket: 'top',
            endSocket: 'bottom',
            color: answer_color || color || getColor(top),
            // dash: { animation: true },
            size: 6,
            startPlug: 'behind',
            endPlug: 'behind'
          }
        );
        if (line) newLines.push(line);
      }
    }

    linesRef.current = newLines;

    const reposition = () => {
      linesRef?.current?.forEach((line) => line.position());
    };

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    reposition();

    return () => {
      linesRef?.current?.forEach((line) => line.remove());
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [JSON.stringify(connections), color, dashed]);

  return null;
};

interface Props {
  index: number;
  total: number;
  data: any;
  mode?: 'preview' | 'test' | 'training';
  className?: string;
  defaultCorrectAnswer?: Matching[]; // mảng theo id number
  answerValue?: Matching[]; // mảng theo id number
  setAnswerValue?: (answer: Matching[]) => void;
  soundEffect?: HTMLAudioElement;
  key?: any;
}

const COLORS: string[] = [
  'border-primary-answer-purple',
  'border-primary-answer-pink',
  'border-primary-answer-blue',
  'border-primary-answer-yellow',
  'border-primary-answer-green'
];

const colorsHex = ['#A435CD', '#F9ACAC', '#8FCBFF', '#FFC658', '#2AAD40'];

export type Matching = {
  top: string;
  bottom: string;
};

type ItemType = 'top' | 'bottom';

const PreviewMatching = (props: Props) => {
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

  const [topSelected, setTopSelected] = useState<string | null>(null);
  const [bottomSelected, setBottomSelected] = useState<string | null>(null);
  const [matchings, setMatchings] = useState<Matching[]>(answerValue || []);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const { isMobile } = useDevice();

  useEffect(() => {
    if (answerValue) {
      setMatchings(answerValue);
    }
  }, [answerValue]);

  const createOrReplaceMatching = (top: string, bottom: string) => {
    const updated = matchings.filter((m) => m.top !== top && m.bottom !== bottom);
    updated.push({ top, bottom });

    setMatchings(updated);
    if (setAnswerValue) setAnswerValue(updated);
  };

  const handleTopClick = (id: string) => {
    setTopSelected(id);
    if (bottomSelected !== null) {
      createOrReplaceMatching(id, bottomSelected);
      setTopSelected(null);
      setBottomSelected(null);
    }
    if (soundEffect) {
      soundEffect.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handleBottomClick = (id: string) => {
    setBottomSelected(id);
    if (topSelected !== null) {
      createOrReplaceMatching(topSelected, id);
      setTopSelected(null);
      setBottomSelected(null);
    }
    if (soundEffect) {
      const sound = soundEffect.cloneNode() as HTMLAudioElement;
      sound.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  // Với id number thì hash đơn giản mod COLORS.length
  const getColor = (top?: string, type: 'hex' | 'class' = 'class') => {
    if (top === undefined || top === null) return (type == 'hex' ? colorsHex : COLORS)[0];
    return (type == 'hex' ? colorsHex : COLORS)[
      Number(top.split('_')?.[1]) % (type == 'hex' ? colorsHex : COLORS).length
    ];
  };

  const gridCols = {
    5: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(5,1fr)]',
    4: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(4,1fr)]',
    3: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(3,1fr)]',
    2: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(2,1fr)]',
    1: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(1,1fr)]'
  };

  const optionCount = (data?.matching?.options?.length as 1 | 2 | 3 | 4 | 5) || 1;

  const renderItem = (id: string, type: ItemType, label: string, file?: { url: string; type: string }) => {
    const match = matchings.find((m) => (type === 'top' ? m.top === id : m.bottom === id));
    const border = match ? getColor(match.top) : 'border-transparent';
    const selected = (type === 'top' ? topSelected : bottomSelected) === id;

    return (
      <div
        key={`${type}-${id}`}
        onClick={() => (type === 'top' ? handleTopClick(id) : handleBottomClick(id))}
        className={`${match && 'border-8'} ${border} ${
          selected ? 'ring-8 ring-white' : ''
        } ${type === 'top' ? 'bg-[var(--practice-answer-matching-top,#fa8d7a)] ' : 'bg-[var(--practice-answer-matching-bottom,#dd6450)]'} h-[150px] sm:h-full w-full rounded-xl cursor-pointer text-2xl flex items-center justify-center relative `}
      >
        {file?.url ? (
          <PreviewExercise
            isIcon={(file?.type == 'video' || file?.type == 'audio') && isMobile}
            isViewImage={mode != 'preview'}
            file={file}
            className={`w-full min-w-[150px] h-[150px] sm:h-[200px] xl:h-[230px] 2xl:h-[255px] rounded-lg flex items-center justify-center ${match && 'p-2'}`}
          />
        ) : (
          <div
            className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words'
            dangerouslySetInnerHTML={{ __html: label }}
          />
        )}
        {file?.type === 'video' && <div className='absolute top-0 left-0 right-0 bottom-24 bg-transparent' />}
        <div
          className={`absolute ${type === 'top' ? '-bottom-2.5 top-element' : '-top-2.5  bottom-element'}  left-[50%] translate-x-[-50%] w-5 h-5 min-w-5 rounded-full bg-transparent`}
          id={id}
        />
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)} key={key}>
      <div className='flex gap-3 sm:gap-10 lg:gap-[120px] justify-center mb-2'>
        {data?.question_file?.url && (
          <PreviewExercise
            isIcon={isMobile}
            isViewImage={mode != 'preview'}
            file={data?.question_file}
            className={`rounded-lg flex items-center justify-center ${
              data?.question_file?.type == 'audio' ? 'h-[80px] ' : 'h-[150px] sm:h-[250px] '
            } ${isMobile ? 'min-w-[50px] h-[90px]' : 'min-w-[150px]'} sm:w-[400px] `}
          />
        )}
        <div
          className={`relative mb-4 ${mode === 'test' || mode == 'training' ? 'min-h-[100px] xl:min-h-[150px] 2xl:min-h-[200px]' : 'flex-1'}`}
        >
          <div
            className='relative min-h-[89px] w-max min-w-[calc(100vw-80px)] sm:min-w-[700px] mx-auto rounded-2xl border border-[var(--practice-question-count-border,#ff917f)] flex items-center
           justify-center bg-[var(--practice-question,#ff836f)] text-2xl max-w-[calc(100vw-120px)] py-6 px-10'
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
            className={`absolute top-0 ${mode == 'preview' ? 'left-[49%]' : 'left-[46%]'} -translate-y-[50%] border bg-[var(--practice-question-count,#ff6046)] 
            border-[var(--practice-question-count-border,#ff917f)] px-3 py-2 rounded-full text-white`}
          >
            <p>
              {index}/{total}
            </p>
          </div>
        </div>
      </div>

      {mode === 'training' && defaultCorrectAnswer && (
        <>
          <div className=' space-y-0 space-x-3 sm:space-y-16 sm:space-x-0 grid grid-cols-2 mb-10 sm:block sm:grid-cols-none'>
            <div
              className={`grid ${gridCols[optionCount]} gap-3 min-h-[150px] sm:h-[200px] xl:h-[230px] 2xl:h-[255px]`}
            >
              {data?.matching?.options?.map((answer: any, index: number) => {
                const match = intersectionWith(
                  defaultCorrectAnswer ?? [],
                  answerValue ?? [],
                  (a, b) => a.top === b.top && a.bottom === b.bottom
                )?.find((m) => m.top === answer.id);

                const border = match ? getColor(match.top) : 'border-primary-error';
                return (
                  <div
                    className={`border-8 ${border} bg-[var(--practice-answer-matching-top,#fa8d7a)] h-[200px] sm:h-full w-full rounded-xl cursor-pointer text-2xl flex items-center justify-center relative `}
                    key={answer.id}
                  >
                    {answer?.file?.url ? (
                      <PreviewExercise
                        isIcon={(answer.file?.type == 'video' || answer.file?.type == 'audio') && isMobile}
                        file={answer?.file}
                        className='w-full rounded-lg flex items-center justify-center h-[184px] sm:h-[200px] xl:h-[230px] 2xl:h-[255px]'
                      />
                    ) : (
                      <div
                        className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words break-all'
                        dangerouslySetInnerHTML={{ __html: answer?.answer_title }}
                      />
                    )}
                    <div
                      className={`absolute -bottom-2.5 left-[50%] translate-x-[-50%] w-5 h-5 min-w-5 rounded-full bg-transparent`}
                      id={'your-answer-' + answer?.id}
                    />
                  </div>
                );
              })}
            </div>
            <div
              className={`grid ${gridCols[optionCount]} gap-3 min-h-[150px] sm:h-[200px] xl:h-[230px] 2xl:h-[255px]`}
            >
              {data?.matching?.descriptions?.map((answer: any, index: number) => {
                const match = intersectionWith(
                  defaultCorrectAnswer ?? [],
                  answerValue ?? [],
                  (a, b) => a.top === b.top && a.bottom === b.bottom
                )?.find((m) => m.bottom === answer.id);
                const border = match ? getColor(match.top) : 'border-primary-error';
                return (
                  <div
                    className={`border-8 ${border} bg-[var(--practice-answer-matching-bottom,#dd6450)] h-[200px] xl:h-[230px] 2xl:h-[255px] w-full rounded-xl cursor-pointer text-2xl flex items-center justify-center relative`}
                    key={answer.id}
                  >
                    <div
                      className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words break-all'
                      dangerouslySetInnerHTML={{ __html: answer?.answer_description }}
                    />
                    <div
                      className={`absolute -top-2.5 left-[50%] translate-x-[-50%] w-5 h-5 min-w-5 rounded-full bg-transparent`}
                      id={'your-answer-' + answer?.id}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <p className='text-2xl text-[var(--practice-correct-answer-text,#333333)] mb-10 font-medium'>
            {t('_correct_answer')}
          </p>
        </>
      )}

      <div className='space-y-0 space-x-3 sm:space-y-16 sm:space-x-0 grid grid-cols-2 sm:block sm:grid-cols-none'>
        <div
          className={`grid ${gridCols[optionCount]} gap-3 min-h-[150px] sm:h-[200px] xl:h-[230px] 2xl:h-[255px]`}
          ref={topRef}
        >
          {data?.matching?.options?.map((answer: any) => {
            const match = defaultCorrectAnswer?.find((m) => m.top === answer.id);
            const border = match ? getColor(match.top) : 'border-transparent';

            return defaultCorrectAnswer ? (
              <div
                className={`border-8 ${border} bg-[var(--practice-answer-matching-top,#fa8d7a)] h-[200px] xl:h-[230px] 2xl:h-[255px] w-full 
                rounded-xl cursor-pointer text-2xl flex items-center justify-center relative 
                ${defaultCorrectAnswer && 'overflow-hidden'}`}
                key={answer.id}
              >
                {answer?.file?.url ? (
                  <PreviewExercise
                    isIcon={isMobile}
                    isViewImage={mode != 'preview'}
                    file={answer?.file}
                    className='w-full rounded-lg flex items-center justify-center h-[200px] xl:h-[230px] 2xl:h-[255px]'
                  />
                ) : (
                  <div
                    className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words break-all'
                    dangerouslySetInnerHTML={{ __html: answer?.answer_title }}
                  />
                )}
                <div
                  className={`absolute -bottom-2.5 left-[50%] translate-x-[-50%] w-5 h-5 min-w-5 rounded-full bg-transparent`}
                  id={answer?.id}
                />
              </div>
            ) : (
              renderItem(answer.id, 'top', answer?.answer_title, answer?.file)
            );
          })}
        </div>
        <div
          className={`grid ${gridCols[optionCount]} gap-3 min-h-[150px] sm:h-[200px] xl:h-[230px] 2xl:h-[255px]`}
          ref={bottomRef}
        >
          {data?.matching?.descriptions?.map((answer: any) => {
            const match = defaultCorrectAnswer?.find((m) => m.bottom === answer.id);
            const border = match ? getColor(match.top) : 'border-transparent';
            return defaultCorrectAnswer ? (
              <div
                className={`border-8 ${border} bg-[var(--practice-answer-matching-bottom,#dd6450)] min-h-[200px] h-full sm:h-full w-full rounded-xl cursor-pointer flex items-center justify-center relative`}
                key={answer.id}
              >
                <div
                  className='font-medium text-sm sm:text-2xl p-3 break-words break-all'
                  dangerouslySetInnerHTML={{ __html: answer?.answer_description }}
                />
                <div
                  className={`absolute -top-2.5 left-[50%] translate-x-[-50%] w-5 h-5 min-w-5 rounded-full bg-transparent`}
                  id={answer?.id}
                />
              </div>
            ) : (
              renderItem(answer.id, 'bottom', answer?.answer_description)
            );
          })}
        </div>
      </div>

      <MultiLineTreeById
        color={isMobile ? 'transparent' : ''}
        connections={
          defaultCorrectAnswer
            ? matchings?.map((item) => ({
                top: 'your-answer-' + item?.top,
                bottom: 'your-answer-' + item?.bottom,
                answer_color: isMobile
                  ? 'transparent'
                  : intersectionWith(
                        defaultCorrectAnswer ?? [],
                        answerValue ?? [],
                        (a, b) => a.top === b.top && a.bottom === b.bottom
                      )?.find((m: any) => m.top === item?.top)
                    ? getColor(item.top, 'hex')
                    : 'red'
              }))
            : matchings
        }
        dashed={false}
      />
      <MultiLineTreeById
        color={isMobile ? 'transparent' : ''}
        connections={defaultCorrectAnswer || []}
        dashed={false}
      />
    </div>
  );
};

export default PreviewMatching;
