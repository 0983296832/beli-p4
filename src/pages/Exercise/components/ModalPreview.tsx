import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogHeader } from '@components/ui/alert-dialog';
import {
  MULTI_CHOICE_ICON,
  FILL_THE_BLANK_ICON,
  MATCHING_ICON,
  SORT_ICON,
  CLOSE_CIRCLE_WHITE,
  EYE_WHITE,
  EYE_SLASH_WHITE
} from '@lib/ImageHelper';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import PreviewFillTheBlank from '@components/exercise/PreviewFillTheBlank';
import PreviewMatching, { Matching } from '@components/exercise/PreviewMatching';
import PreviewSort from '@components/exercise/PreviewSort';
import PreviewMultiChoice from '@components/exercise/PreviewMultiChoice';
import '@assets/styles/practice-theme.css';
import { FILL_IN_THE_BLANK, MATCHING, MULTIPLE_CHOICE, ORDERING } from '../constant';
import PreviewReverseWord from '@components/exercise/PreviewReverseWord';

interface Props {
  index: number;
  total: number;
  data: any;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  type: 'multiple_choice' | 'fill_the_blank' | 'matching' | 'sort' | 'reverse_word';
}

const ModalPreview = (props: Props) => {
  const { index, total, data, show, setShow, type } = props;
  const { t } = useT();
  const [isShowAnswer, setIsShowAnswer] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsShowAnswer(false);
    }
  }, [show]);

  return (
    <AlertDialog
      open={show}
      onOpenChange={(open) => {
        setShow(open);
      }}
    >
      <AlertDialogContent
        overwriteClass={
          type === 'sort' || type == 'reverse_word'
            ? 'fixed inset-0 flex items-center justify-center z-50 my-12 mx-auto '
            : undefined
        }
        className='rounded-3xl border-none gap-0 p-4 max-w-[calc(100vw-200px)] bg-transparent min-h-[calc(100vh-200px)] items-start shadow-none bg-primary-blue-900 theme-practice-blue'
      >
        <div className='h-full theme-practice-blue w-[calc(100vw-232px)]'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary-neutral-700 text-white flex items-center justify-center px-3 h-10 rounded-lg'>
                <p className=''>
                  <span className='font-semibold'>{index ?? 0}</span>/<span className='text-xs'>{total ?? 0}</span>
                </p>
              </div>
              <div className='bg-primary-blue-400 text-white flex items-center justify-center gap-1 px-3 h-10 rounded-lg'>
                <img
                  src={
                    data?.question_type == 1
                      ? MULTI_CHOICE_ICON
                      : data?.question_type == 2
                        ? FILL_THE_BLANK_ICON
                        : data?.question_type == 3
                          ? MATCHING_ICON
                          : SORT_ICON
                  }
                  className='size-4'
                />
                <p>
                  {t(
                    data?.question_type == MULTIPLE_CHOICE
                      ? 'multiple_choice'
                      : data?.question_type == FILL_IN_THE_BLANK
                        ? 'fill_in_the_blank'
                        : data?.question_type == MATCHING
                          ? 'matching'
                          : data?.question_type == ORDERING
                            ? 'ordering'
                            : 'reorder'
                  )}
                </p>
              </div>
            </div>
            <div className='bg-primary-neutral-700 text-white flex items-center justify-center px-3 h-10 rounded-lg font-semibold text-sm mr-[147px]'>
              <p className=''>{t('player_view_mode')}</p>
            </div>

            <div
              className='bg-primary-neutral-700 flex items-center justify-center  size-10 rounded-lg cursor-pointer'
              onClick={() => {
                setShow(false);
              }}
            >
              <img src={CLOSE_CIRCLE_WHITE} />
            </div>
          </div>
          <div className='min-h-[calc(100vh-240px)] max-h-[calc(100vh-240px)] overflow-y-auto bg-primary-blue-600 rounded-2xl  p-6'>
            {type === 'multiple_choice' && (
              <PreviewMultiChoice
                index={index}
                total={total}
                data={data}
                mode='preview'
                defaultCorrectAnswer={
                  isShowAnswer
                    ? data?.multiple_choice_answers?.options
                        ?.filter((opt: any) => opt?.is_correct_answer)
                        ?.map((opt: any) => opt?.id)
                    : null
                }
              />
            )}

            {type === 'fill_the_blank' && (
              <PreviewFillTheBlank
                index={index}
                total={total}
                data={data}
                mode='preview'
                defaultCorrectAnswer={
                  isShowAnswer
                    ? {
                        defaultCorrectAnswer: data?.fill_in_the_blank?.answer_title,
                        otherCorrectAnswer: data?.fill_in_the_blank?.other_correct_answer,
                        ignoreCase: !!data?.fill_in_the_blank?.ignore_case
                      }
                    : undefined
                }
              />
            )}

            {type === 'matching' && (
              <PreviewMatching
                index={index}
                total={total}
                data={data}
                mode='preview'
                defaultCorrectAnswer={
                  isShowAnswer
                    ? data?.matching?.options?.map((answer: any, index: number) => {
                        const answer_description = data?.matching?.descriptions?.find(
                          (desc: any) => desc?.answer_id == answer?.id
                        );
                        return { top: answer?.id, bottom: answer_description?.id };
                      })
                    : null
                }
              />
            )}
            {type === 'sort' && (
              <PreviewSort
                index={index}
                total={total}
                data={data}
                mode='preview'
                setAnswerValue={() => {}}
                defaultCorrectAnswer={
                  isShowAnswer
                    ? {
                        top: data?.sort?.options?.map(() => {
                          return null;
                        }),
                        bottom: data?.sort?.descriptions?.map((desc: any) => {
                          const correctAnswer: number = data?.sort?.options?.find(
                            (opt: { id: number }) => opt?.id == desc?.answer_id
                          )?.id;
                          return correctAnswer;
                        })
                      }
                    : undefined
                }
              />
            )}

            {type === 'reverse_word' && (
              <PreviewReverseWord
                index={index}
                total={total}
                data={data}
                mode='preview'
                defaultCorrectAnswer={isShowAnswer ? data?.reverse_word?.options : undefined}
              />
            )}

            {isShowAnswer && (
              <div className='mt-4'>
                <p className='text-primary-neutral-50 font-semibold text-base mb-2'>{t('answer_explanation')}</p>
                <div className='w-full min-h-[161px] rounded-2xl border border-primary-blue-300 flex items-center justify-center bg-[#0A3D6D] text-2xl py-2 px-10 '>
                  <div
                    className='font-medium text-2xl break-words break-all'
                    dangerouslySetInnerHTML={{ __html: data?.answer_explanation?.explain_description }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className='mt-4 flex items-center justify-between'>
            <Button
              className='bg-primary-blue-400 hover:bg-primary-blue-400/80 text-white'
              onClick={() => {
                setIsShowAnswer(!isShowAnswer);
              }}
            >
              <img src={isShowAnswer ? EYE_SLASH_WHITE : EYE_WHITE} />
              {t(isShowAnswer ? 'hide_answer' : 'show_answer')}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModalPreview;
