import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@hooks/useT';
import { cn } from '@lib/utils';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { filter, zip } from 'lodash';
import { useDevice } from '@hooks/useDevice';
import SmartHtmlSpeaker from '../TextToSpeek/SmartHtmlSpeaker';

type Word = { id: string; answer_title?: string; position?: number };
type Answers = { id: string; position: number };

interface Props {
  index: number;
  total: number;
  data: any;
  mode?: 'preview' | 'test' | 'training';
  className?: string;
  defaultCorrectAnswer?: Word[];
  answerValue?: Answers[];
  setAnswerValue?: (value: Answers[]) => void;
  soundEffect?: HTMLAudioElement;
  key?: any;
}

/* ------------------------- Draggable item (click trực tiếp) ------------------------- */
function DraggableItem({ word, onClick }: { word: Word; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: word.id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
  };

  return (
    <motion.div
      layout
      ref={setNodeRef}
      {...listeners} // kéo trực tiếp trên toàn khối
      {...attributes}
      style={style}
      initial={{ opacity: 1, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}
      className={`border border-gray-400 rounded-md px-3 py-2 m-1 cursor-grab select-none min-w-9 text-center 
        ${isDragging ? 'bg-blue-100 opacity-70 w-full' : 'bg-gray-100 hover:bg-red-100'}`}
      onClick={(e) => {
        // click trực tiếp: trả về bank
        e.stopPropagation();
        onClick?.();
      }}
      onPointerDownCapture={(e) => {
        e.stopPropagation();
      }}
    >
      {word.answer_title}
    </motion.div>
  );
}

/* ------------------------- Droppable slot ------------------------- */
function DroppableSlot({
  word,
  activeId,
  overId,
  children
}: {
  word: Word;
  activeId: string | null;
  overId: string | null;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: word.id });
  const showIndicator = overId === word.id && activeId !== word.id;

  return (
    <div ref={setNodeRef} className='flex items-center'>
      {showIndicator && <div className='w-1 h-full bg-yellow-400 mx-1 rounded' />}
      {children}
    </div>
  );
}

/* ------------------------- Droppable rỗng cuối ------------------------- */
function EndDroppable({ activeId, overId }: { activeId: string | null; overId: string | null }) {
  const { setNodeRef } = useDroppable({ id: 'end-slot' });
  const showIndicator = overId === 'end-slot' && activeId !== 'end-slot';
  return (
    <div ref={setNodeRef} className='flex items-center min-w-[40px] min-h-[40px]'>
      {showIndicator && <div className='w-1 h-full bg-yellow-400 mx-1 rounded' />}
    </div>
  );
}

/* ------------------------- Main ------------------------- */

export default function ScrambleGame(props: Props) {
  const { t } = useT();
  const { data, className, defaultCorrectAnswer, answerValue, setAnswerValue, index, total, mode, soundEffect, key } =
    props;
  // ===== Controlled vs Uncontrolled =====
  const isControlled = Array.isArray(answerValue) && typeof setAnswerValue === 'function';
  const [internalSlots, setInternalSlots] = useState<Word[]>([]);
  const refHint = useRef<any>(null);
  const [width, setWidth] = useState<string>('w-full ');
  const { isMobile } = useDevice();

  useEffect(() => {
    if (refHint?.current?.offsetWidth < 700) {
      setWidth('w-[400] sm:w-[300] md:w-[500px] lg:w-[900px] ');
    }
    if (refHint?.current?.offsetWidth < 500) {
      setWidth('w-[400] sm:w-[300] md:w-[500px] lg:w-[900px] ');
    }
  }, []);

  // slots dùng cho render & logic, tùy theo controlled/uncontrolled
  const slots: Word[] = isControlled
    ? (answerValue?.map((val) => {
        const awn_title = data?.reverse_word?.options?.find((opt: { id: string }) => opt?.id == val?.id);
        return { ...val, answer_title: awn_title?.answer_title };
      }) as Word[])
    : internalSlots;

  // Hàm cập nhật slots an toàn
  const updateSlots = (next: Word[]) => {
    if (isControlled) {
      (setAnswerValue as (value: Answers[]) => void)(
        next?.map((v, index) => ({ id: v?.id, position: index + 1 })) as Answers[]
      );
    } else {
      setInternalSlots(next);
    }
  };

  // Khi đổi câu hỏi (data thay đổi) thì reset ở chế độ uncontrolled
  useEffect(() => {
    if (!isControlled) {
      setInternalSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  // ===== Bank được tính từ data?.reverse_word - slots =====
  const bank: Word[] = useMemo(() => {
    const all: Word[] = Array.isArray(data?.reverse_word?.options) ? data.reverse_word?.options : [];
    if (!slots?.length) return all;
    const inSlots = new Set(slots.map((w) => w.id));
    return all.filter((w) => !inSlots.has(w.id));
  }, [data?.reverse_word?.options, slots]);

  // ===== DnD sensors & states =====
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  );

  const { setNodeRef: setSlotsContainerRef } = useDroppable({ id: 'slots-droppable' });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleSelect = (word: Word) => {
    // chọn từ bank -> thêm vào slots
    updateSlots([...slots, word]);
    if (soundEffect) {
      const sound = soundEffect.cloneNode() as HTMLAudioElement;
      sound.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handleReturnToBank = (word: Word) => {
    // trả về bank -> xóa khỏi slots
    updateSlots(slots.filter((w) => w.id !== word.id));
    if (soundEffect) {
      const sound = soundEffect.cloneNode() as HTMLAudioElement;
      sound.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
    if (soundEffect) {
      const sound = soundEffect.cloneNode() as HTMLAudioElement;
      sound.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };
  const handleDragOver = (e: DragOverEvent) => setOverId((e.over?.id as string) ?? null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    // thả vào end-slot: thêm vào cuối slots
    if (over.id === 'end-slot') {
      const wordFromBank = bank.find((w) => w.id === active.id);
      if (wordFromBank) {
        updateSlots([...slots, wordFromBank]);
      } else {
        // kéo từ slots -> đẩy item đó xuống cuối
        const copy = [...slots];
        const activeIndex = copy.findIndex((i) => i.id === active.id);
        if (activeIndex !== -1) {
          const [removed] = copy.splice(activeIndex, 1);
          copy.push(removed);
          updateSlots(copy);
        }
      }
      return;
    }

    if (over.id === 'slots-droppable') return;

    const overIndex = slots.findIndex((i) => i.id === over.id);
    const wordFromBank = bank.find((w) => w.id === active.id);

    if (wordFromBank) {
      const copy = [...slots];
      const insertAt = overIndex >= 0 ? overIndex : copy.length;
      copy.splice(insertAt, 0, wordFromBank);
      updateSlots(copy);
      return;
    }

    const activeIndex = slots.findIndex((i) => i.id === active.id);
    if (activeIndex === -1 || overIndex === -1) return;

    // hoán vị trong slots
    {
      const copy = [...slots];
      const [removed] = copy.splice(activeIndex, 1);
      const newOverIndex = copy.findIndex((i) => i.id === over.id);
      const insertAt = newOverIndex >= 0 ? newOverIndex : copy.length;
      copy.splice(insertAt, 0, removed);
      updateSlots(copy);
    }
  };

  const activeWord = activeId && (slots.find((w) => w.id === activeId) || bank.find((w) => w.id === activeId));

  return (
    <div className={cn('w-full z-10', className)} key={key}>
      <div className='flex gap-3 sm:gap-10 lg:gap-[120px] justify-center mb-2'>
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
          className={`relative mb-4 ${mode === 'test' || mode == 'training' ? 'min-h-[100px] xl:min-h-[150px] 2xl:min-h-[200px]' : 'flex-1'}`}
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
            className={`absolute top-0 ${mode == 'preview' ? 'left-[49%]' : 'left-[46%]'}  -translate-y-[50%] border border-[var(--practice-question-count-border,#ff917f)] px-3 py-2 bg-[var(--practice-question-count,#ff6046)] rounded-full text-white`}
          >
            <p>
              {index}/{total}
            </p>
          </div>
        </div>
      </div>

      {mode === 'training' && defaultCorrectAnswer && (
        <>
          <div
            className={`flex flex-wrap border-dashed border-2 border-[var(--practice-question-count-border,#ff917f)] p-2 min-h-[70px] ${width} 
            rounded-2xl bg-[var(--practice-answer-reverse-word-bg,#b61b02)] justify-center mx-auto `}
          >
            {answerValue?.map((word, index) => {
              const wordTitle = data?.reverse_word?.options?.find((opt: { id: string }) => word?.id === opt.id);
              const defaultCorrectAnswerTitle = data?.reverse_word?.options?.find(
                (opt: { id: string }) => opt?.id === defaultCorrectAnswer[index].id
              );

              const isCorrect = defaultCorrectAnswerTitle?.answer_title === wordTitle?.answer_title;

              return (
                <div
                  key={word?.id}
                  className={`border border-gray-400 rounded-md px-3 py-2 m-1 cursor-grab select-none min-w-9 text-center 
              ${!isCorrect ? 'bg-primary-error' : 'bg-primary-answer-green'} text-white`}
                >
                  {wordTitle.answer_title}
                </div>
              );
            })}
          </div>
          <p className='text-base sm:text-2xl text-[var(--practice-correct-answer-text,#333333)] mb-10 font-medium'>
            {t('_correct_answer')}
          </p>
        </>
      )}

      <div className='space-y-3'>
        {defaultCorrectAnswer ? (
          <div
            className={`flex flex-wrap border-dashed border-2 border-[var(--practice-question-count-border,#ff917f)] p-2 min-h-[70px] ${width} rounded-2xl bg-[var(--practice-answer-reverse-word-bg,#b61b02)] justify-center mx-auto `}
          >
            {defaultCorrectAnswer?.map((word) => {
              const wordTitle = data?.reverse_word?.options?.find((opt: { id: string }) => word?.id == opt?.id);
              return (
                <div
                  key={word?.id}
                  className={`border border-gray-400 rounded-md px-3 py-2 m-1 cursor-grab select-none min-w-9 text-center 
                            bg-primary-answer-green text-white`}
                >
                  {wordTitle?.answer_title}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div
              className={` h-max max-h-[250px] xl:max-h-[295px] 2xl:max-h-[305px] bg-[var(--practice-answer-fill-blank-bg,#ff836f)] rounded-2xl p-4 pb-6 mb-6`}
            >
              <p className='text-center font-semibold text-base sm:text-2xl mb-3 sm:mb-6 text-[var(--practice-answer-fill-blank-text,#ffffff)]'>
                {t('drag_drop_to_sort_answers')}
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div
                  ref={setSlotsContainerRef}
                  className={`flex flex-wrap border-dashed border-2 border-[var(--practice-question-count-border,#ff917f)] p-2 min-h-[70px] ${width} justify-center rounded-2xl bg-[var(--practice-answer-reverse-word-bg,#b61b02)]  mx-auto`}
                >
                  <AnimatePresence initial={false}>
                    {slots.map((w) =>
                      activeId === w.id ? (
                        <motion.div
                          key={w.id}
                          layout
                          initial={{ opacity: 0.5, scale: 0.95 }}
                          animate={{ opacity: 0.7, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className='border border-gray-300 rounded-md px-3  py-2 m-1 bg-gray-200 opacity-70'
                        >
                          {w.answer_title}
                        </motion.div>
                      ) : (
                        <DroppableSlot key={w.id} word={w} activeId={activeId} overId={overId}>
                          <DraggableItem word={w} onClick={() => handleReturnToBank(w)} />
                        </DroppableSlot>
                      )
                    )}
                  </AnimatePresence>
                  <EndDroppable activeId={activeId} overId={overId} />
                </div>

                <DragOverlay>
                  {activeWord ? (
                    <div className='border border-blue-500 rounded-md px-3 py-2 m-1 bg-blue-100 shadow-lg'>
                      {activeWord.answer_title}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>

            <div
              className={` gap-3 h-[250px] xl:h-[295px] 2xl:h-[305px] bg-[var(--practice-answer-fill-blank-bg,#ff836f)] rounded-2xl`}
            >
              <div className='flex items-center justify-center flex-col'>
                <p className='text-center font-semibold text-base sm:text-2xl mb-3 sm:mb-6 text-[var(--practice-answer-fill-blank-text,#ffffff)] mt-4'>
                  {t('sentence_completion_hints')}
                </p>
                <div className='flex flex-wrap px-4' ref={refHint}>
                  <AnimatePresence initial={false}>
                    {bank.map((w) => (
                      <motion.button
                        key={w.id}
                        onClick={() => handleSelect(w)}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.18 }}
                        className={`border border-blue-500 m-1 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 min-w-9 `}
                      >
                        {w.answer_title}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
