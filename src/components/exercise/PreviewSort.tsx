import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { cn } from '@lib/utils';
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useSensors,
  MouseSensor,
  TouchSensor,
  useSensor
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { filter, zip } from 'lodash';
import { useDevice } from '@hooks/useDevice';
import SmartHtmlSpeaker from '../TextToSpeek/SmartHtmlSpeaker';

interface Props {
  index: number;
  total: number;
  data: any;
  mode?: 'preview' | 'test' | 'training';
  className?: string;
  defaultCorrectAnswer?: {
    top: (string | null)[];
    bottom: (string | null)[];
  };
  answerValue?: {
    top: (string | null)[];
    bottom: (string | null)[];
  };
  setAnswerValue?: (value: { top: (string | null)[]; bottom: (string | null)[] }, matches: string[]) => void;
  soundEffect?: HTMLAudioElement;
  key?: any;
}

interface Answer {
  id: string;
  answer_title: string;
  file?: {
    url: string;
    type: string | null;
  };
}

interface ItemState {
  top: (Answer | null)[];
  bottom: (Answer | null)[];
}

interface DroppableSlotProps {
  id: string;
  children: React.ReactNode;
  isOver: boolean;
  wasOver: boolean;
  label?: string | null;
}

interface DraggableItemProps {
  answer: Answer;
  mode?: string;
}

function DraggableItem({ mode, answer, isDragging = false }: DraggableItemProps & { isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: answer.id.toString() });
  const { isMobile } = useDevice();

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-[var(--practice-answer-sort-top,#fa8d7a)] w-full h-full rounded-xl text-2xl flex items-center justify-center cursor-grab ${answer?.file?.type == 'image' && 'p-4 sm:p-0'} `}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: 'none' as const // quan trọng cho mobile
      }}
      onClick={(e) => {
        // click trực tiếp: trả về bank
        e.stopPropagation();
      }}
      // onPointerDownCapture={(e) => {
      //   e.stopPropagation();
      // }}
    >
      {answer?.file?.url ? (
        <>
          <PreviewExercise
            isIcon={isMobile}
            isViewImage={mode != 'preview'}
            file={answer.file}
            className={`w-full h-full rounded-lg flex items-center justify-center ${isDragging ? 'pointer-events-none select-none' : ''} `}
            imageClassName='max-h-[170px] xl:max-h-none'
          />
        </>
      ) : (
        <div
          className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words w-full'
          dangerouslySetInnerHTML={{ __html: answer.answer_title ?? '' }}
        />
      )}
    </div>
  );
}

function DroppableSlot({ id, children, isOver, wasOver, label }: DroppableSlotProps) {
  const { setNodeRef } = useDroppable({ id });

  const scale = isOver ? 'scale-105' : 'scale-100';

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-xl w-[180px] xs:w-[250px] sm:w-full h-[200px] xl:h-[230px] 2xl:h-[255px] 
        flex items-center justify-center transition-transform duration-150 bg-[var(--practice-answer-sort-bottom,#dd6450)] ${scale}`}
    >
      {children}
      {label && (
        <div
          className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words'
          dangerouslySetInnerHTML={{ __html: label }}
        />
      )}
    </div>
  );
}

const PreviewSort = (props: Props) => {
  const { data, className, defaultCorrectAnswer, answerValue, setAnswerValue, index, total, mode, soundEffect, key } =
    props;
  const { t } = useT();
  const { isMobile } = useDevice();

  // Internal state chứa Answer (object), dùng để render
  const [internalItems, setInternalItems] = useState<ItemState>({ top: [], bottom: [] });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  );

  // Khi component mount: map answerValue (id number) sang internalItems (Answer|null)
  useEffect(() => {
    const mapIdsToObjects = (ids: (string | null)[], container: 'top' | 'bottom'): (Answer | null)[] => {
      return ids.map((id) => {
        if (id === null) return null;
        if (container === 'top') {
          return data?.sort?.options?.find((a: Answer) => a.id === id) ?? null;
        } else {
          return data?.sort?.options?.find((a: Answer) => a.id === id);
        }
      });
    };

    if (answerValue && answerValue.top?.length > 0 && answerValue.bottom?.length > 0) {
      setInternalItems({
        top: mapIdsToObjects(answerValue.top, 'top'),
        bottom: mapIdsToObjects(answerValue.bottom, 'bottom')
      });
    } else {
      setInternalItems({
        top: data?.sort?.options ?? [],
        bottom: data?.sort?.options?.map(() => null) ?? []
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Tìm vị trí trong internalItems theo id string (convert id number sang string để so sánh)
  const findItemPosition = (id: string) => {
    const idNum = id;

    for (const container of ['top', 'bottom'] as const) {
      const index = internalItems[container].findIndex((val) => val?.id === idNum);
      if (index !== -1) return { container, index };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (soundEffect) {
      const sound = soundEffect.cloneNode() as HTMLAudioElement;
      sound.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!setAnswerValue) return; // Nếu ko có setAnswerValue thì ko cho drag
    const { active, over } = event;
    if (!over) return;
    setOverId(over.id as string);

    const activeItemId = active.id as string;
    const [overContainerStr, overIndexStr] = (over.id as string).split('-');
    const overContainer = overContainerStr as keyof ItemState;
    const overIndex = parseInt(overIndexStr);

    const from = findItemPosition(activeItemId);

    if (!from) return;
    if (from.container === overContainer && from.index === overIndex) return;

    const newInternalItems: ItemState = {
      top: [...internalItems.top],
      bottom: [...internalItems.bottom]
    };

    // Hoán đổi 2 phần tử
    const temp = newInternalItems[overContainer][overIndex];
    newInternalItems[overContainer][overIndex] = newInternalItems[from.container][from.index];
    newInternalItems[from.container][from.index] = temp;

    setInternalItems(newInternalItems);

    // Cập nhật lại mảng id number | null rồi gọi setAnswerValue
    if (setAnswerValue) {
      setAnswerValue(
        {
          top: newInternalItems.top.map((item) => (item ? item.id : null)),
          bottom: newInternalItems.bottom.map((item) => (item ? item.id : null))
        },
        newInternalItems.bottom
          .map((item) => (item ? item.id : null))
          ?.map((answer_id, index) => `${answer_id || 'null'}|-|${data?.sort?.descriptions?.[index]?.id}`)
      );
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
    setOverId(null);
  };

  const renderSlots = (container: keyof ItemState) => {
    return internalItems[container].map((val, idx) => {
      const slotId = `${container}-${idx}`;
      const labelChar = container === 'bottom' ? data?.sort?.descriptions?.[idx]?.answer_description : undefined;
      const isOver = slotId === overId;
      const showItem = !(activeId && val?.id.toString() === activeId);

      return (
        <>
          <DroppableSlot
            key={slotId}
            id={slotId}
            isOver={isOver}
            wasOver={false}
            label={!val && container === 'bottom' ? labelChar : null}
          >
            {val && showItem && <DraggableItem mode={mode} answer={val} />}
          </DroppableSlot>
        </>
      );
    });
  };

  const gridCols = {
    5: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(5,1fr)]',
    4: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(4,1fr)]',
    3: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(3,1fr)]',
    2: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(2,1fr)]',
    1: 'grid-rows-4 grid-grid-cols-none sm:grid-rows-none sm:grid-cols-[repeat(1,1fr)]'
  };

  const optionCount = (data?.sort?.options?.length as 1 | 2 | 3 | 4 | 5) || 1;

  return (
    <div className={cn('w-full z-10', className)} key={key}>
      <div className='flex gap-3 sm:gap-10 lg:gap-[120px] justify-center mb-2'>
        {data?.question_file?.url && (
          <PreviewExercise
            isIcon={isMobile}
            isViewImage={mode != 'preview'}
            file={data?.question_file}
            className={`rounded-lg flex items-center justify-center ${data?.question_file?.type == 'audio' ? 'h-[80px] ' : 'h-[150px] sm:h-[250px]'} 
            ${isMobile ? 'min-w-[50px] h-[80px]' : 'min-w-[150px]'} sm:w-[400px] `}
          />
        )}
        <div
          className={`relative mb-4 ${mode === 'test' || mode == 'training' ? 'min-h-[100px] xl:min-h-[150px] 2xl:min-h-[200px]' : 'flex-1'}`}
        >
          <div
            className={`relative min-h-[89px] w-max ${data?.question_file?.url ? 'min-w-[280px]' : 'min-w-[380px]'}  sm:min-w-[700px] mx-auto rounded-2xl border border-[var(--practice-question-count-border,#ff917f)] 
          flex items-center justify-center bg-[var(--practice-question,#ff836f)] text-2xl max-w-[calc(100vw-120px)] p-4 sm:py-6 sm:px-10`}
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
            className={`absolute top-0 ${mode == 'preview' ? 'left-[49%]' : 'left-[46%]'} -translate-y-[50%] border border-[var(--practice-question-count-border,#ff917f)] 
            px-3 py-2 bg-[var(--practice-question-count,#ff6046)] rounded-full text-white`}
          >
            <p>
              {index}/{total}
            </p>
          </div>
        </div>
      </div>

      {mode === 'training' && defaultCorrectAnswer && (
        <div className='grid grid-cols-2 sm:block sm:grid-cols-none'>
          <div className={`grid ${gridCols[optionCount]} gap-3 justify-center`}>
            {answerValue?.top.map((answer, index) => {
              const currentAnswer = data?.sort?.options?.find((val: any) => val?.id == answer);
              return (
                <div
                  key={index}
                  className={`relative rounded-xl w-[180px] h-[180px] sm:w-full sm:h-[255px] flex items-center justify-center transition-transform duration-150 ${currentAnswer ? 'bg-[var(--practice-answer-sort-top,#fa8d7a)]' : 'bg-[var(--practice-answer-sort-bottom,#dd6450)]'} mb-3`}
                >
                  {currentAnswer?.file?.url ? (
                    <PreviewExercise
                      isIcon={isMobile}
                      isViewImage
                      file={currentAnswer.file}
                      className='w-full h-full rounded-lg flex items-center justify-center'
                    />
                  ) : (
                    <div
                      className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words'
                      dangerouslySetInnerHTML={{ __html: currentAnswer?.answer_title ?? '' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className={`grid ${gridCols[optionCount]} gap-3 justify-center sm:mb-10`}>
            {answerValue?.bottom.map((answer, index) => {
              const currentAnswer = data?.sort?.options?.find((val: any) => val?.id == answer);
              const currentDesc = data?.sort?.descriptions[index];
              const correctAnswerList = filter(
                zip(defaultCorrectAnswer?.bottom, answerValue?.bottom),
                ([a, b]) => a === b
              ).map(([a, b]) => a);
              return (
                <div
                  key={index}
                  className={`relative rounded-xl w-[180px] h-[180px] sm:w-full sm:h-[255px] flex items-center justify-center transition-transform duration-150 bg-[var(--practice-answer-sort-bottom,#dd6450)]`}
                >
                  <div
                    className={`${currentAnswer ? 'bg-[var(--practice-answer-sort-top,#fa8d7a)]' : ''} w-full h-[180px] sm:h-full rounded-xl text-2xl flex items-center justify-center border-8 ${correctAnswerList?.includes(currentAnswer?.id) ? 'border-primary-success' : 'border-primary-error'}`}
                  >
                    {currentAnswer?.id ? (
                      <>
                        {currentAnswer?.file?.url ? (
                          <PreviewExercise
                            isViewImage
                            isIcon={isMobile}
                            file={currentAnswer.file}
                            className='w-full h-full rounded-lg flex items-center justify-center'
                          />
                        ) : (
                          <div
                            className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words'
                            dangerouslySetInnerHTML={{ __html: currentAnswer?.answer_title ?? '' }}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {' '}
                        <div
                          className='font-medium text-sm sm:text-2xl p-1 sm:p-3 break-words'
                          dangerouslySetInnerHTML={{ __html: currentDesc?.answer_description ?? '' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className='text-2xl text-[var(--practice-correct-answer-text,#333333)] mb-10 font-medium'>
            {t('_correct_answer')}
          </p>
        </div>
      )}

      <div className='space-y-0 space-x-3 sm:space-y-3 sm:space-x-0 grid grid-cols-2 sm:block sm:grid-cols-none'>
        {defaultCorrectAnswer ? (
          <>
            <div className={`grid ${gridCols[optionCount]} gap-3 justify-center`}>
              {defaultCorrectAnswer.top.map((_, index) => (
                <div
                  key={index}
                  className='relative rounded-xl w-[180px] h-[180px] sm:w-full sm:h-[255px] flex items-center justify-center transition-transform duration-150 bg-[var(--practice-answer-sort-bottom,#dd6450)]'
                />
              ))}
            </div>
            <div className={`grid ${gridCols[optionCount]} gap-3 justify-center`}>
              {defaultCorrectAnswer.bottom.map((answer, index) => {
                const currentAnswer = data?.sort?.options?.find((val: any) => val?.id == answer);

                return (
                  <div
                    key={index}
                    className='relative rounded-xl w-[180px] h-[180px] sm:w-full sm:h-[255px] flex items-center justify-center transition-transform duration-150 bg-[var(--practice-answer-sort-bottom,#dd6450)]'
                  >
                    <div className='bg-[var(--practice-answer-sort-top,#fa8d7a)] w-full h-full rounded-xl text-2xl flex items-center justify-center border-8 border-primary-success'>
                      {currentAnswer?.file?.url ? (
                        <PreviewExercise
                          isIcon={isMobile}
                          isViewImage={mode != 'preview'}
                          file={currentAnswer.file}
                          className='w-full h-full rounded-lg flex items-center justify-center'
                        />
                      ) : (
                        <div
                          className='font-medium text-md sm:text-2xl p-1 sm:p-3 break-words'
                          dangerouslySetInnerHTML={{ __html: currentAnswer?.answer_title ?? '' }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className={`grid ${gridCols[optionCount]} gap-3 justify-center`}>{renderSlots('top')}</div>
              <div className={`grid ${gridCols[optionCount]} gap-3 justify-center`}>{renderSlots('bottom')}</div>
              <DragOverlay>
                {activeId && (
                  <DraggableItem
                    mode={mode}
                    answer={
                      internalItems.top
                        .concat(internalItems.bottom)
                        .find((val) => val?.id.toString() === activeId) as Answer
                    }
                    isDragging={true}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewSort;
