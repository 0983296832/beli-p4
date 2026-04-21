import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '@hooks/useT';
import Icon from '@components/Icon';
import {
  AVATAR,
  CALENDAR_ICON,
  CANCEL_ICON,
  CLOCK_ICON,
  CLOCK_ICON_2,
  CLOSE_CIRCLE_WHITE,
  COPY_ICON,
  DELETE_03,
  DOWNLOAD_ICON,
  EDIT_ICON,
  EXAM_REPORT_1,
  EXAM_REPORT_2,
  EXAM_REPORT_3,
  EXAM_REPORT_4,
  IDEA_ICON,
  INFORMATION_CIRCLE_ICON,
  SETTING_ICON,
  SORTUP_BTN_ICON,
  TICK_ICON
} from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { ChevronDown, ChevronLeftIcon } from 'lucide-react';
import TextInput from '@components/fields/TextInput';
import { Toast } from '@components/toast';
import EmptyTable from '@components/empty/EmptyTable';
import { useRootStore } from '@store/index';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import TextAreaInput from '@components/fields/TextAreaInput';
import Loading from '@components/loading';
import Tooltip from '@components/tooltip';
import { QRCodeSVG } from 'qrcode.react';
import reportExamServices from '@services/reportExam';
import { getBaseUrl } from '@lib/HttpHelper';
import { Dialog, DialogContent } from '@components/ui/dialog';
import { cloneDeep, isEmpty, uniq } from 'lodash';
import { QuestionsTypeOptions } from '@components/selects/QuestionsTypeSelect';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { removeInlineStyles } from '@lib/DomHelper';
import { getLetterByIndex } from '@lib/StringHelper';
import SelectInput from '@components/fields/SelectInput';
import { mergeObjects, roundNumber } from '@lib/JsHelper';
import { MULTIPLE_CHOICE, FILL_IN_THE_BLANK, MATCHING, ORDERING } from '@pages/Exercise/constant';
import { convertTimestampToString, getCurrentTimestamp } from '@lib/TimeHelper';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@components/ui/sheet';
import { ModalTimeSetup } from '../Exercise/AssignTaskSetup';
import dayjs from 'dayjs';
import { TypeErrors } from '@/interface';
import SwitchInput from '@components/fields/SwitchInput';
import NumberInput from '@components/fields/NumberInput';
import exerciseServices from '@services/exercise';
import { downloadFileFromBlob } from '@lib/FileHelper';
import StudentsGroupSelectVirtualized from '@components/selects/GroupStudentSelectVirtualized';
import CLassroomSelect from '@components/selects/ClassroomSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';

const ModalDescription = (props: any) => {
  const { item, defaultDescription, onUpdateDescription } = props;
  const { t } = useT();
  const [show, setShow] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    show && setDescription(defaultDescription);
  }, [show]);

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogTrigger className='btn btn-danger cursor-pointer' asChild>
        <p className='text-primary-blue-500 cursor-pointer'>{t('comment')}</p>
      </AlertDialogTrigger>
      <AlertDialogContent className='rounded-lg border-none gap-0 p-0 max-w-[700px] overflow-hidden bg-transparent'>
        <AlertDialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
          <div className='flex items-center gap-3'>
            <img src={item?.avatar} className='size-10 min-w-10 rounded-full object-cover border-white' />
            <p className='text-sm font-medium'>
              {item?.display_name} - {item?.username}
            </p>
          </div>
          <AlertDialogCancel className='h-auto gap-0 p-0 mt-0 bg-transparent border-0 shadow-none hover:bg-transparent'>
            <img src={CLOSE_CIRCLE_WHITE} alt='' />
          </AlertDialogCancel>
        </AlertDialogHeader>
        <div className='flex flex-col items-center px-8 py-6 space-y-6 bg-white'>
          <TextAreaInput
            placeholder={t('enter_content')}
            rows={10}
            value={description}
            onChange={(val) => setDescription(val)}
          />
          <div>
            <Button
              variant='default'
              className='px-8'
              onClick={() => {
                onUpdateDescription(description);
                setShow(false);
              }}
            >
              {t('comment')}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ModalQuestion = (props: any) => {
  const { show, setShow, selectData } = props;
  const { t } = useT();
  const [infoSearch, setInfoSearch] = useState<any>({ question_status: 'all' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const questions_opt = [
    { value: 'all', label: t('all') },
    { value: 'unanswered', label: t('not_done') },
    { value: 'wrong', label: t('incorrect_question') },
    { value: 'correct', label: t('correct_question') }
  ];

  const getData = async (filters?: object) => {
    setLoading(true);
    try {
      let params: any = {
        student_id: selectData?.student_id,
        exam_id: selectData?.exam_id,
        answer_type: infoSearch?.question_status == 'all' ? undefined : infoSearch?.question_status
      };
      params = mergeObjects(params, filters);
      const res: any = await reportExamServices.getExamSubmission(params);
      setData(res);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    show && selectData?.exam_id && getData();
  }, [show]);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className='p-3 max-w-[calc(100vw-300px)]' showCloseButton={false}>
        {' '}
        <div className='p-6 bg-white rounded-lg shadow-lg h-[calc(100vh-100px)] overflow-y-auto'>
          <Loading loading={loading} />
          <div className='py-3 flex justify-between border-b'>
            <div className=''>
              <div className='flex items-center gap-2 mb-2'>
                <img src={selectData?.avatar} className='size-7 min-w-7 rounded-full object-cover' />
                <p className='text-lg font-semibold'>
                  {selectData?.display_name} - {selectData?.username}
                </p>
              </div>
              <p className='text-sm font-medium'>
                {t('submission_time')}: {convertTimestampToString(data?.submission?.created_at, 'right')}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-lg font-semibold'>{t('filter')}:</p>
              <div className='w-56'>
                <SelectInput
                  options={questions_opt}
                  value={questions_opt.find((opt) => opt?.value == infoSearch?.question_status)}
                  onChange={(val) => {
                    setInfoSearch({ question_status: val?.value });
                    getData({ answer_type: val?.value == 'all' ? undefined : val?.value });
                  }}
                />
              </div>
            </div>
          </div>
          {!isEmpty(data?.submissions) ? (
            <div className='py-6'>
              {data?.submissions?.length > 0 ? (
                <div className='space-y-6'>
                  {data?.submissions?.map((submission: any, index: number) => {
                    const questionType = QuestionsTypeOptions.find(
                      (type) => type.value === submission?.question?.question_type
                    );
                    return (
                      <div className='p-4 border rounded-lg' key={index}>
                        <div className='flex items-center gap-2 mb-6'>
                          <div
                            className={`rounded-sm px-4 py-[11px] ${submission?.unanswered == 1 ? 'bg-primary-neutral-200' : submission?.is_correct ? 'bg-[#E4FFE9]' : 'bg-[#FFDDDA]'} flex items-center gap-1`}
                          >
                            {submission?.unanswered == 1 ? (
                              <p className='text-primary-neutral-500 text-xs'>!</p>
                            ) : (
                              <Icon
                                icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                size={16}
                              />
                            )}

                            <p
                              className={`${
                                submission?.unanswered == 1
                                  ? 'text-primary-neutral-500'
                                  : submission?.is_correct
                                    ? 'text-primary-success'
                                    : 'text-primary-error'
                              }  text-xs`}
                            >
                              {t(
                                submission?.unanswered == 1
                                  ? 'not_done'
                                  : submission?.is_correct
                                    ? '_correct'
                                    : '_incorrect'
                              )}
                            </p>
                          </div>
                          <div className='px-3 py-2 rounded-sm border border-primary-neutral-300 flex items-center gap-2 '>
                            <img src={questionType?.icon} />
                            <p className='text-sm font-medium'>{questionType?.label}</p>
                          </div>
                          <div className='px-3 py-2 rounded-sm border border-primary-neutral-300 flex items-center gap-2 '>
                            <p className='text-sm font-medium'>
                              {submission?.score} {t('score').toLocaleLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className='flex mb-3 gap-3 space-y-3'>
                          {submission?.question?.question_file?.url && (
                            <PreviewExercise
                              file={submission?.question?.question_file}
                              className='h-[81px] w-[118px] rounded-lg flex items-center justify-center'
                            />
                          )}
                          <div
                            className='text-sm font-medium text-primary-neutral-900 no-underline not-italic'
                            dangerouslySetInnerHTML={{
                              __html: removeInlineStyles(submission?.question?.question_title)
                            }}
                          />
                        </div>
                        {submission?.question?.question_type === MULTIPLE_CHOICE ? (
                          <div className='flex items-center w-full'>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-neutral-500'>{t('your_answer')}</p>
                              {submission?.answer ? (
                                submission?.question?.multiple_choice_answers?.options
                                  ?.filter((opt: any) => submission?.answer?.includes(opt?.id))
                                  ?.map((opt: any) => (
                                    <div className=' flex items-center gap-1 w-max mt-3' key={opt?.id}>
                                      <Icon
                                        icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                        className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                        size={16}
                                      />
                                      {opt?.file?.url ? (
                                        <PreviewExercise
                                          isIcon
                                          file={opt?.file}
                                          className='w-min rounded-lg flex items-start mt-0'
                                          imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                          audioClassName='h-min'
                                        />
                                      ) : (
                                        <div
                                          className=' text-sm'
                                          dangerouslySetInnerHTML={{ __html: removeInlineStyles(opt?.answer_title) }}
                                        />
                                      )}
                                    </div>
                                  ))
                              ) : (
                                <p className='text-sm'>{t('no_answer_yet')}</p>
                              )}
                            </div>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-success'>{t('correct_answer_')}</p>
                              {submission?.question?.multiple_choice_answers?.options
                                ?.filter((opt: any) => opt?.is_correct_answer)
                                ?.map((opt: any) => (
                                  <div className=' flex items-center gap-1 w-max mt-3' key={opt?.id}>
                                    <Icon icon={TICK_ICON} className={`text-primary-success `} size={16} />
                                    {opt?.file?.url ? (
                                      <PreviewExercise
                                        isIcon
                                        file={opt?.file}
                                        className='w-min rounded-lg flex items-start mt-0'
                                        imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                        audioClassName='h-min'
                                      />
                                    ) : (
                                      <div
                                        className=' text-sm'
                                        dangerouslySetInnerHTML={{
                                          __html: removeInlineStyles(opt?.answer_title || '')
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : submission?.question?.question_type === FILL_IN_THE_BLANK ? (
                          <div className='flex items-center w-full'>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-neutral-500'>{t('your_answer')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                {submission?.answer ? (
                                  <>
                                    {' '}
                                    <Icon
                                      icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                      className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                      size={16}
                                    />
                                    <div
                                      className=' text-sm'
                                      dangerouslySetInnerHTML={{ __html: removeInlineStyles(submission?.answer || '') }}
                                    />
                                  </>
                                ) : (
                                  <p className='text-sm'>{t('no_answer_yet')}</p>
                                )}
                              </div>
                            </div>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-success'>{t('correct_answer_')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                <Icon icon={TICK_ICON} className={`text-primary-success `} size={16} />
                                <div
                                  className=' text-sm'
                                  dangerouslySetInnerHTML={{
                                    __html: removeInlineStyles(
                                      submission?.question?.fill_in_the_blank?.answer_title || ''
                                    )
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : submission?.question?.question_type === MATCHING ? (
                          <>
                            <table className='mt-5 table-rounded ' style={{ boxShadow: 'none' }}>
                              <thead>
                                <tr className='bg-primary-blue-50'>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('question')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('your_answer')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('correct_answer_')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='bg-white'>
                                {submission?.question?.matching?.options?.length > 0 ? (
                                  submission?.question?.matching?.options?.map((opt: any, idx: any) => {
                                    const student_desc_answer = submission?.question?.matching?.descriptions?.find(
                                      (desc: any) => {
                                        const stu_answer_id = submission?.answer?.find(
                                          (an: any) => an?.top == opt?.id
                                        )?.bottom;
                                        return desc?.id == stu_answer_id;
                                      }
                                    );
                                    const correct_student_answer =
                                      student_desc_answer?.answer_id ==
                                      submission?.question?.matching?.descriptions[idx]?.answer_id;
                                    return (
                                      <tr key={idx}>
                                        {/* câu hỏi */}
                                        <td className='text-left'>
                                          {opt?.file?.url ? (
                                            <PreviewExercise
                                              isIcon
                                              file={opt?.file}
                                              imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                              className='flex items-center w-min mx-auto'
                                              audioClassName='mx-0'
                                            />
                                          ) : (
                                            <div
                                              className='text-sm font-medium text-primary-neutral-900 no-underline not-italic mt-0.5'
                                              dangerouslySetInnerHTML={{
                                                __html: removeInlineStyles(opt?.answer_title || '')
                                              }}
                                            />
                                          )}
                                        </td>

                                        {/* câu tl học sinh */}
                                        <td
                                          className={`text-center ${!student_desc_answer?.answer_id ? '' : correct_student_answer ? 'text-primary-success' : 'text-primary-error'}`}
                                        >
                                          {student_desc_answer?.answer_id ? (
                                            <div
                                              className={`text-sm font-medium ${correct_student_answer ? 'text-primary-success' : 'text-primary-error'} no-underline not-italic mt-0.5`}
                                              dangerouslySetInnerHTML={{
                                                __html: removeInlineStyles(
                                                  student_desc_answer?.answer_description || ''
                                                )
                                              }}
                                            />
                                          ) : (
                                            <p className='text-sm'>{t('no_answer_yet')}</p>
                                          )}
                                        </td>

                                        {/* câu tl đúng */}
                                        <td className='text-center text-primary-success'>
                                          <div
                                            className='text-sm font-medium text-primary-success no-underline not-italic mt-0.5'
                                            dangerouslySetInnerHTML={{
                                              __html: removeInlineStyles(
                                                submission?.question?.matching?.descriptions[idx]?.answer_description ||
                                                  ''
                                              )
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td>
                                      <EmptyTable />
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </>
                        ) : submission?.question?.question_type === ORDERING ? (
                          <>
                            <table className='mt-5 table-rounded ' style={{ boxShadow: 'none' }}>
                              <thead>
                                <tr className='bg-primary-blue-50'>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('question')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('your_answer')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('correct_answer_')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='bg-white'>
                                {submission?.question?.sort?.descriptions?.length > 0 ? (
                                  submission?.question?.sort?.descriptions?.map((desc: any, idx: any) => {
                                    const match_opt_id = submission?.answer?.matches
                                      ?.find((match: string) => match?.split('|-|')?.[1] == desc?.id)
                                      ?.split('|-|')?.[0];
                                    const opt_matched = submission?.question?.sort?.options?.find(
                                      (opt: any) => opt?.id == match_opt_id
                                    );
                                    const correct_student_answer =
                                      match_opt_id == submission?.question?.sort?.options[idx]?.id;
                                    return (
                                      <tr key={idx}>
                                        {/* câu hỏi */}
                                        <td className='text-left'>
                                          <div
                                            className='text-sm font-medium text-primary-neutral-900 no-underline not-italic mt-0.5'
                                            dangerouslySetInnerHTML={{
                                              __html: removeInlineStyles(desc?.answer_description || '')
                                            }}
                                          />
                                        </td>

                                        {/* câu tl học sinh */}
                                        <td className='text-center'>
                                          <>
                                            {match_opt_id ? (
                                              <>
                                                {opt_matched?.file?.url ? (
                                                  <PreviewExercise
                                                    isIcon
                                                    file={opt_matched?.file}
                                                    imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                                    className='flex items-center w-min mx-auto'
                                                    audioClassName='mx-0'
                                                  />
                                                ) : (
                                                  <div
                                                    className={`text-sm font-medium ${correct_student_answer ? 'text-primary-success' : 'text-primary-error'} no-underline not-italic mt-0.5`}
                                                    dangerouslySetInnerHTML={{
                                                      __html: removeInlineStyles(opt_matched?.answer_title || '')
                                                    }}
                                                  />
                                                )}
                                              </>
                                            ) : (
                                              <p className='text-sm'>{t('no_answer_yet')}</p>
                                            )}
                                          </>
                                        </td>

                                        {/* câu tl đúng */}
                                        <td className='text-center'>
                                          {submission?.question?.sort?.options[idx]?.file?.url ? (
                                            <PreviewExercise
                                              isIcon
                                              file={submission?.question?.sort?.options[idx]?.file}
                                              imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                              className='flex items-center w-min mx-auto'
                                              audioClassName='mx-0'
                                            />
                                          ) : (
                                            <div
                                              className='text-sm font-medium text-primary-success no-underline not-italic mt-0.5'
                                              dangerouslySetInnerHTML={{
                                                __html: removeInlineStyles(
                                                  submission?.question?.sort?.options[idx]?.answer_title || ''
                                                )
                                              }}
                                            />
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td>
                                      <EmptyTable />
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </>
                        ) : (
                          <div className='flex items-center w-full'>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-neutral-500'>{t('your_answer')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                {submission?.answer ? (
                                  <>
                                    {' '}
                                    <Icon
                                      icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                      className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                      size={16}
                                    />
                                    <p className='text-sm font-medium'>
                                      {submission?.answer?.map((word: any) => {
                                        const title = submission?.question?.reverse_word?.options?.find(
                                          (val: any) => val?.id === word?.id
                                        )?.answer_title;
                                        return <span key={word?.id}>{title} </span>;
                                      })}
                                    </p>
                                  </>
                                ) : (
                                  <p className='text-sm'>{t('no_answer_yet')}</p>
                                )}
                              </div>
                            </div>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-success'>{t('correct_answer_')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                <Icon icon={TICK_ICON} className={`text-primary-success `} size={16} />
                                <p className='text-sm font-medium'>
                                  {submission?.question?.reverse_word?.options?.map((word: any) => {
                                    return <span key={word?.id}>{word?.answer_title} </span>;
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className='flex gap-2 mt-2'>
                          <div className='flex items-center gap-1'>
                            <Icon icon={IDEA_ICON} className='text-primary-neutral-900' />
                            <p className='text-sm font-medium'>{t('answer_explanation')}: </p>
                          </div>
                          <div className='flex gap-3 items-start'>
                            {submission?.question?.answer_explanation?.explain_file?.url && (
                              <PreviewExercise
                                isIcon
                                file={submission?.question?.answer_explanation?.explain_file}
                                className='h-[32px] w-[32px] rounded-lg flex items-center justify-center'
                              />
                            )}
                            <div
                              className='text-sm font-medium text-primary-neutral-900 no-underline not-italic leading-9'
                              dangerouslySetInnerHTML={{
                                __html: removeInlineStyles(
                                  submission?.question?.answer_explanation?.explain_description || ''
                                )
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyTable />
              )}
            </div>
          ) : (
            <EmptyTable note={t('teacher_not_graded')} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DrawerSetting = (props: any) => {
  const { show, setShow, data = {}, exerciseId, onSuccess } = props;
  const { t } = useT();
  const [formData, setFormData] = useState<any>({
    mode: 1,
    filters: [],
    start_time: dayjs.unix(dayjs().unix()).add(30, 'minute').unix(),
    end_time: dayjs.unix(dayjs().unix()).add(300, 'minute').unix(),
    is_shuffle_questions: 1,
    is_shuffle_answer: 1
  });
  const [showModalSetupTime, setShowModalSetupTime] = useState(false);
  const [errors, setErrors] = useState<TypeErrors>({});
  const time_attempt_opts = [
    {
      value: 0,
      label: t('unlimited')
    },
    {
      value: 1,
      label: 1
    },
    {
      value: 2,
      label: 2
    },
    {
      value: 3,
      label: 3
    },
    {
      value: 4,
      label: 4
    },
    {
      value: 5,
      label: 5
    }
  ];
  const proficiency_goal = [
    {
      value: 60,
      label: '60%'
    },
    {
      value: 70,
      label: '70%'
    },
    {
      value: 80,
      label: '80%'
    },
    {
      value: 90,
      label: '90%'
    },
    {
      value: 100,
      label: '100%'
    }
  ];
  const show_answer_opts = [
    {
      value: 1,
      label: t('on')
    },
    // {
    //   value: 2,
    //   label: t('show_correct_only')
    // },
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
    // {
    //   value: 2,
    //   label: t('show_questions_only')
    // },
    {
      value: 0,
      label: t('off')
    }
  ];
  const rank_opts = [
    {
      value: 1,
      label: t('on')
    },
    {
      value: 0,
      label: t('off')
    }
  ];

  const onUpdate = async () => {
    if (!formData?.start_time) {
      return Toast('warning', t('please_select_start_time'));
    }
    if (!formData?.end_time) {
      return Toast('warning', t('please_select_end_time'));
    }
    try {
      const body = cloneDeep(formData);
      if (body.mode == 1) {
        delete body.target_percentage;
        delete body.time_for_exam;
      }
      if (body?.mode == 2) {
        delete body.target_percentage;
        delete body.time_for_exam;
      }
      if (body?.mode == 3) {
        delete body.try_number_per_question;
        delete body.target_percentage;
        delete body.ranking;
        delete body.time_for_each_question;
        body.show_answer_during_exam = 0;
      }
      delete body?.id;

      const res: any = await exerciseServices.putAssignExercise(exerciseId, body);
      Toast('success', res?.message);
      onSuccess();
      setErrors({});
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
    }
  };

  useEffect(() => {
    const {
      end_time,
      is_shuffle_answer,
      is_shuffle_questions,
      mode,
      ranking,
      show_answer_after_exam,
      show_answer_during_exam,
      start_time,
      time_for_each_question,
      try_number,
      try_number_per_question,
      filters
    } = data;
    show &&
      !isEmpty(data) &&
      setFormData({
        end_time,
        is_shuffle_answer,
        is_shuffle_questions,
        mode,
        ranking,
        show_answer_after_exam,
        show_answer_during_exam,
        start_time,
        time_for_each_question,
        try_number,
        try_number_per_question,
        filters
      });
  }, [show, data]);

  return (
    <Sheet
      open={show}
      onOpenChange={(open) => {
        setShow(open);
      }}
    >
      <SheetContent className='!w-[628px] max-w-[628px] sm:max-w-[628px] bg-white px-6 py-0'>
        <SheetHeader className=' pt-6 pb-3 border-b flex items-center justify-between flex-row'>
          <SheetTitle className='text-2xl font-semibold'>{t('task_assignment_settings')}</SheetTitle>
          <Button onClick={onUpdate}>{t('update')}</Button>
        </SheetHeader>
        <div className='h-[calc(100vh-108px)] py-6 overflow-y-auto pr-4'>
          <p className='text-lg font-semibold mb-3'>{t('assign_task_to_class')}</p>
          <p className='text-sm mb-3 text-primary-neutral-700'>{t('assign_task_to_class')}</p>
          {/* <div className='border-b space-y-4 pb-6'>
            {formData?.filters?.map((filter: any, index: number) => {
              return (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <p className=''>
                      {t('location')} # {index + 1}
                    </p>
                    <Button
                      variant={'destructive'}
                      type='button'
                      onClick={() => {
                        setFormData({
                          ...formData,
                          filters: formData?.filters?.filter((_: any, idx: number) => idx != index)
                        });
                      }}
                      className=''
                    >
                      <img src={DELETE_03} alt='' />
                      {t('delete')}
                    </Button>
                  </div>

                  <div className='flex items-center gap-3  '>
                    <div className='w-3/5'>
                      <TeachingLocationSelect
                        value={filter?.location_id}
                        label={t('location')}
                        error={errors?.[`filters.${index}.location_id`]}
                        isClearable
                        onChange={(value) => {
                          filter.location_id = value?.id;
                          setFormData({ ...formData });
                          errors[`filters.${index}.location_id`] = '';
                          setErrors({ ...errors });
                        }}
                      />
                    </div>
                    <div className='w-2/5'>
                      <CLassroomSelect
                        locationId={filter?.location_id}
                        isClearable
                        isMulti
                        label={t('classroom')}
                        value={filter?.classroom_ids}
                        error={errors?.[`filters.${index}.classroom_ids`]}
                        onChange={(value) => {
                          filter.classroom_ids = value?.map((cl) => cl?.id);
                          setFormData({ ...formData });
                          errors[`filters.${index}.classroom_ids`] = '';
                          setErrors({ ...errors });
                        }}
                      />
                    </div>
                  </div>
                  <div className='w-full mt-3 '>
                    <StudentsGroupSelectVirtualized
                      isMulti
                      role='STUDENT'
                      label={t('students')}
                      isClearable
                      classroomIds={filter?.classroom_ids}
                      placeholder={t('select_student')}
                      value={filter?.student_ids || []}
                      error={errors?.[`filters.${index}.student_ids`]}
                      onChange={(users) => {
                        filter.student_ids = uniq(users?.map((user) => user?.id));
                        setFormData({ ...formData });
                        errors[`filters.${index}.student_ids`] = '';
                        setErrors({ ...errors });
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <Button
              className='bg-primary-success hover:bg-primary-success/80 mt-3'
              onClick={() => {
                formData.filters.push({ location_id: null, classroom_ids: [], student_ids: [] });
                setFormData({ ...formData });
              }}
            >
              {t('add_new_locations')}
            </Button>
          </div> */}
          <p className='text-lg font-semibold mt-6 mb-3'>{t('start_end_time')}</p>
          <div className='flex items-center justify-between border-b'>
            <div>
              <p className=' text-primary-neutral-700 mb-4'>
                {t('start_immediately')} -{' '}
                {formData?.start_time ? convertTimestampToString(formData?.start_time, 'right') : t('not_set_up')}
              </p>
              <div className='flex items-center gap-2 mb-6'>
                <p className='font-medium'>{t('end_by')}:</p>
                {formData?.end_time ? convertTimestampToString(formData?.end_time, 'right') : t('not_set_up')}
                {/* <div className='rounded-full border px-3 py-2 ml-2 hover:bg-primary-neutral-200 cursor-pointer'>
                  <p>{t('no_deadline')}</p>
                </div>
                <div className='rounded-full border px-3 py-2 hover:bg-primary-neutral-200 cursor-pointer'>
                  <p>1 {t('days').toLocaleLowerCase()}</p>
                </div>
                <div className='rounded-full border px-3 py-2 hover:bg-primary-neutral-200 cursor-pointer'>
                  <p>1 {t('weeks').toLocaleLowerCase()}</p>
                </div> */}
              </div>
            </div>
            <Button variant={'outline'} onClick={() => setShowModalSetupTime(true)}>
              {t('change')} <ChevronDown size={36} />
            </Button>
          </div>
          <p className='text-lg font-semibold mb-3 mt-6'>{t('session_settings')}</p>
          <div className='border-t py-6 space-y-7'>
            {formData?.mode == 2 && (
              <>
                <div className='flex items-start justify-between gap-14'>
                  <div className='flex-1'>
                    <p className='font-semibold'>{t('set_proficiency_goal')}</p>
                  </div>
                  <div className='w-44'>
                    <SelectInput
                      options={proficiency_goal}
                      error={errors?.target_percentage}
                      value={proficiency_goal.find((vl) => vl?.value == formData?.target_percentage) ?? null}
                      onChange={(val) => {
                        setFormData({ ...formData, target_percentage: val?.value });
                        setErrors({ ...errors, target_percentage: '' });
                      }}
                    />
                  </div>
                </div>
                {/* <div className='flex items-start justify-between gap-14'>
                  <div className='flex-1'>
                    <p className='font-semibold'>{t('retry_per_question')}</p>
                  </div>
                  <div className='w-44'>
                    <SelectInput
                      options={retry_per_question}
                      error={errors?.try_number_per_question}
                      value={retry_per_question.find((vl) => vl?.value == formData?.try_number_per_question) ?? null}
                      onChange={(val) => {
                        setFormData({ ...formData, try_number_per_question: val?.value });
                        setErrors({ ...errors, try_number_per_question: '' });
                      }}
                    />
                  </div>
                </div> */}
              </>
            )}
            {formData?.mode == 1 && (
              <div className='flex items-center justify-between gap-14'>
                <div className='flex-1 flex items-center gap-3'>
                  <p className='font-semibold mb-2'>{t('student_attempts')}</p>
                  <Tooltip description={t('attempts_per_session')}>
                    <Icon icon={INFORMATION_CIRCLE_ICON} />
                  </Tooltip>
                </div>
                <div className='w-44'>
                  <SelectInput
                    options={time_attempt_opts}
                    error={errors?.try_number}
                    value={time_attempt_opts.find((vl) => vl?.value == formData?.try_number) ?? null}
                    onChange={(val) => {
                      setFormData({ ...formData, try_number: val?.value });
                      setErrors({ ...errors, try_number: '' });
                    }}
                  />
                </div>
              </div>
            )}

            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>{t('show_answer_after_question')}</p>
                <Tooltip description={t('show_explain_each')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>

              <div className='w-44'>
                <SelectInput
                  options={show_answer_opts}
                  disabled={formData?.mode == 3}
                  error={errors?.show_answer_during_exam}
                  value={show_answer_opts.find((vl) => vl?.value == formData?.show_answer_during_exam) ?? null}
                  onChange={(val) => {
                    setFormData({ ...formData, show_answer_during_exam: val?.value });
                    setErrors({ ...errors, show_answer_during_exam: '' });
                  }}
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>{t('show_answer_after_submission')}</p>
                <Tooltip description={t('show_explain_after')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>

              <div className='w-44'>
                <SelectInput
                  options={show_question_opts}
                  error={errors?.show_answer_after_exam}
                  value={show_question_opts.find((vl) => vl?.value == formData?.show_answer_after_exam) ?? null}
                  onChange={(val) => {
                    setFormData({ ...formData, show_answer_after_exam: val?.value });
                    setErrors({ ...errors, show_answer_after_exam: '' });
                  }}
                />
              </div>
            </div>
            <div className='flex items-start justify-between gap-14 w-full'>
              <div className='flex-1'>
                <p className='font-semibold mb-2 '>{t('shuffle_questions')}</p>
              </div>
              <div className='w-max'>
                <SwitchInput
                  checked={formData?.is_shuffle_questions == 1}
                  onCheckedChange={(value) => {
                    setFormData({ ...formData, is_shuffle_questions: value ? 1 : 0 });
                  }}
                />
              </div>
            </div>
            <div className='flex items-start justify-between gap-14 w-full'>
              <div className='flex-1'>
                <p className='font-semibold mb-2'>{t('shuffle_choices')}</p>
              </div>
              <div className='w-max'>
                <SwitchInput
                  checked={formData?.is_shuffle_answer == 1}
                  onCheckedChange={(value) => {
                    setFormData({ ...formData, is_shuffle_answer: value ? 1 : 0 });
                  }}
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>
                  {t('timer_each_question')}{' '}
                  <span className='text-sm text-primary-neutral-600'>({t('second').toLocaleLowerCase()})</span>
                </p>
                <Tooltip description={t('timer_each_bonus')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>
              <div className='w-44'>
                <NumberInput
                  disabled={formData.mode == 3}
                  value={formData?.time_for_each_question}
                  error={errors?.time_for_each_question}
                  suffix={' ' + t('second').toLocaleLowerCase()}
                  onChange={(value) => {
                    setFormData({ ...formData, time_for_each_question: value });
                    setErrors({ ...errors, time_for_each_question: '' });
                  }}
                />
              </div>
            </div>
            <div className='flex items-center justify-between gap-14'>
              <div className='flex-1 flex items-center gap-3'>
                <p className='font-semibold mb-2'>
                  {t('timer_whole_test')}{' '}
                  <span className='text-sm text-primary-neutral-600'>({t('minute').toLocaleLowerCase()})</span>
                </p>
                <Tooltip description={t('total_countdown_time')}>
                  <Icon icon={INFORMATION_CIRCLE_ICON} />
                </Tooltip>
              </div>

              <div className='w-44'>
                <NumberInput
                  disabled={formData.mode !== 3}
                  value={formData?.time_for_exam}
                  error={errors?.time_for_exam}
                  suffix={' ' + t('minute').toLocaleLowerCase()}
                  onChange={(value) => {
                    setFormData({ ...formData, time_for_exam: value });
                    setErrors({ ...errors, time_for_exam: '' });
                  }}
                />
              </div>
            </div>
            {formData.mode == 1 && (
              <div className='flex items-start justify-between gap-14'>
                <div className='flex-1'>
                  <p className='font-semibold mb-2'>{t('show_leaderboard')}</p>
                </div>
                <div className='w-44'>
                  <SelectInput
                    options={rank_opts}
                    error={errors?.ranking}
                    value={rank_opts.find((vl) => vl?.value == formData?.ranking) ?? null}
                    onChange={(val) => {
                      setFormData({ ...formData, ranking: val?.value });
                      setErrors({ ...errors, ranking: '' });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <ModalTimeSetup
            show={showModalSetupTime}
            setShow={setShowModalSetupTime}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const DetailReport = () => {
  const { id } = useParams();
  const { t } = useT();
  const { currentUser } = useRootStore();
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [showDetailExam, setShowDetailExam] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ key: '', direction: 'asc' });
  const [selectData, setSelectData] = useState({});
  const [showEditSetting, setShowEditSetting] = useState(false);

  const getData = async () => {
    setLoading(true);
    try {
      const res: any = await reportExamServices.getExamSession(Number(id));
      setData(res);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  function copyText(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        Toast('success', t('copy_successful'));
      })
      .catch((err) => {
        console.error('Lỗi khi copy:', err);
      });
  }

  const onUpdateDescription = async (id: number, note: string) => {
    setLoading(true);
    try {
      const res: any = await reportExamServices.putExamStudentNote(Number(id), { note });
      await getData();
      Toast('success', res?.message);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
    }
  };

  const downloadSVG = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'qr-code.svg';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const onAssignResult = async () => {
    setLoading(true);
    try {
      const res: any = await reportExamServices.putExamAssignResult(Number(id));
      Toast('success', res?.message);
      await getData();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onFinishExam = async () => {
    setLoading(true);
    try {
      const res: any = await reportExamServices.putExamFinish(Number(id));
      Toast('success', res?.message);
      await getData();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onDownload = async () => {
    setLoading(true);
    try {
      const response: any = await reportExamServices.getExamSummariesExport(Number(id));
      downloadFileFromBlob(response, 'chi_tiet_bai_tap.xlsx');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Number(id) && getData();
  }, [id]);

  const isUnstarted = data?.exam?.start_time > getCurrentTimestamp();
  const isRunning = data?.exam?.start_time <= getCurrentTimestamp() && getCurrentTimestamp() < data?.exam?.end_time;
  const isEnded = getCurrentTimestamp() >= data?.exam?.end_time;

  return (
    <div>
      <Loading loading={loading} />
      <div className='flex justify-between mb-9'>
        <div>
          <div className='flex items-center gap-4 mb-2.5'>
            <p className='font-medium'>{data?.exam?.exam_name}</p>
            <div className='flex items-center gap-2 px-2 py-1 rounded bg-white'>
              {isUnstarted ? (
                <div className='size-1.5 rounded-full bg-primary-warning' />
              ) : isRunning ? (
                <div className='size-1.5 rounded-full bg-primary-success' />
              ) : (
                <div className='size-1.5 rounded-full bg-primary-error' />
              )}

              <p className='text-sm font-medium'>
                {isUnstarted ? t('not_started') : isRunning ? t('running') : t('ended')}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Icon icon={CALENDAR_ICON} className='text-primary-neutral-900' />
            <p>
              {t('start')}{' '}
              <span className='capitalize'>
                {convertTimestampToString(data?.exam?.start_time, 'right', 'dddd, DD/MM/YYYY')}
              </span>
            </p>
            <p>
              {' '}
              - {t('finish')}{' '}
              <span className='capitalize'>
                {convertTimestampToString(data?.exam?.end_time, 'right', 'dddd, DD/MM/YYYY')}
              </span>
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {(isRunning || isUnstarted) && (
            <Button
              variant={'secondary'}
              onClick={() => {
                setShowEditSetting(true);
              }}
            >
              <Icon icon={SETTING_ICON} className='size-4 text-primary-neutral-900' />
              {t('edit_settings')}
            </Button>
          )}

          {isUnstarted ? null : (
            <>
              {isRunning ? (
                <Button
                  variant={'outline'}
                  className='border-primary-error bg-[#FEEDEC] hover:bg-[#FEEDEC]/90 text-primary-error hover:text-primary-error'
                  onClick={() => {
                    onFinishExam();
                  }}
                >
                  {t('finish')}
                </Button>
              ) : (
                <Button
                  className='border-primary-blue-400 bg-primary-blue-50 hover:bg-primary-blue-50 text-primary-blue-500 hover:text-primary-blue-500'
                  variant={'outline'}
                  onClick={onAssignResult}
                >
                  {t('send_result_to_student')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <div>
        {isRunning && (
          <div className=' border border-primary-neutral-200 card w-[951px] shadow-lg mx-auto mb-6'>
            <div className='border-b card-header text-white border-primary-neutral-200 bg-primary-blue-500 flex items-center justify-between'>
              <div>
                <h3 className='text-base font-semibold leading-[100%] mb-2'>{t('invite_participants')}</h3>
                <div className='flex items-center gap-2'>
                  <Icon icon={CLOCK_ICON_2} className='text-white size-4' />
                  <p className='text-xs font-medium text-white'>
                    {t('deadline')}:{' '}
                    <span className='capitalize'>
                      {convertTimestampToString(data?.exam?.end_time, 'right', 'dddd, DD/MM/YYYY')}
                    </span>
                  </p>
                </div>
              </div>
              <div
                className='flex items-center gap-2 cursor-pointer'
                onClick={() => {
                  setShowMore(!showMore);
                }}
              >
                <p className='text-white text-sm font-medium'>{t(showMore ? 'collapse' : 'view_more')}</p>
                <ChevronLeftIcon size={16} className={showMore ? `rotate-90` : 'rotate-[270deg]'} />
              </div>
            </div>
            {showMore && (
              <div className='p-6 card-body bg-white'>
                <div className='flex items-start gap-9 w-full'>
                  <div className='flex-1'>
                    <div>
                      <p className='text-sm font-medium mb-2'>{t('exercise_link')}</p>
                      <div className='h-14 flex-1 border rounded-xl mb-4 flex items-center justify-between p-2'>
                        <p>{getBaseUrl() + `/#/practice/${data?.exam_id}`}</p>
                        <div
                          className='bg-primary-blue-50 rounded-md w-max flex items-center justify-center p-2 ml-auto cursor-pointer gap-2'
                          onClick={() => {
                            copyText(getBaseUrl() + `/#/practice/${data?.exam_id}`);
                          }}
                        >
                          <Icon icon={COPY_ICON} className='text-primary-blue-500' />
                          <p className='text-primary-blue-500 text-sm font-medium'>{t('copy')}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className='text-sm font-medium mb-2'>{t('exercise_code')}</p>
                      <div className='h-14 flex-1 border rounded-xl mb-4 flex items-center justify-between p-2'>
                        <p>{data?.exam?.exam_code}</p>
                        <div
                          className='bg-primary-blue-50 rounded-md w-max flex items-center justify-center p-2 ml-auto cursor-pointer gap-2'
                          onClick={() => {
                            copyText(data?.exam?.exam_code);
                          }}
                        >
                          <Icon icon={COPY_ICON} className='text-primary-blue-500' />
                          <p className='text-primary-blue-500 text-sm font-medium'>{t('copy')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className='text-sm font-medium mb-1'>{t('exercise_qr_code')}</p>
                    <div className='p-2 border rounded-xl'>
                      <div
                        className='bg-primary-blue-50 rounded-md w-max flex items-center justify-center p-2 ml-auto cursor-pointer'
                        onClick={downloadSVG}
                      >
                        <Icon icon={DOWNLOAD_ICON} className='text-primary-blue-500 size-4' />
                      </div>
                      <div className='size-28 mt-0.5'>
                        <QRCodeSVG id='qr-code' value={getBaseUrl() + `/practice/${id}`} size={112} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className=' border border-primary-neutral-200 card w-full shadow-lg mx-auto mb-6'>
          <div className='border-b card-header border-primary-neutral-200 bg-primary-neutral-100 flex items-center justify-between !p-4'>
            <div className='flex items-center gap-2'>
              <div
                className={`py-1 px-2 rounded ${
                  data?.exam?.mode == 1
                    ? 'text-primary-success bg-[#e4ffe9]'
                    : data?.exam?.mode == 2
                      ? 'bg-secondary-neutral-50 text-secondary-neutral-500'
                      : 'bg-red-50 text-red-500'
                } w-max mx-auto`}
              >
                <p className=' text-xs font-medium'>
                  {data?.exam?.mode == 1
                    ? t('practice_exercise')
                    : data?.exam?.mode == 2
                      ? t('training_test')
                      : t('exam')}
                </p>
              </div>
              <h3 className='text-lg font-semibold leading-[100%]'>{t('class_statistics_ratio')}</h3>
            </div>
            <Button
              className='border-primary-blue-400 bg-primary-blue-50 hover:bg-primary-blue-50 text-primary-blue-500 hover:text-primary-blue-500'
              variant={'outline'}
              onClick={() => {
                onDownload();
              }}
            >
              <Icon icon={DOWNLOAD_ICON} className='text-primary-blue-500 size-4' />
              {t('download_result')}
            </Button>
          </div>
          <div className='p-6 card-body bg-white'>
            <div className='grid grid-cols-4 gap-8'>
              <div className='p-2 border rounded-lg flex items-center gap-3'>
                <img src={EXAM_REPORT_1} />
                <div>
                  <p className='text-base font-medium mg-2'>{t('average_result')}</p>
                  <p className='text-2xl font-semibold'>{roundNumber(data?.statistic?.correct_percent)}%</p>
                </div>
              </div>
              <div className='p-2 border rounded-lg flex items-center gap-3'>
                <img src={EXAM_REPORT_2} />
                <div>
                  <p className='text-base font-medium mg-2'>{t('completion_ratio')}</p>
                  <p className='text-2xl font-semibold'>{roundNumber(data?.statistic?.progress_percent)}%</p>
                </div>
              </div>
              <div className='p-2 border rounded-lg flex items-center gap-3'>
                <img src={EXAM_REPORT_3} />
                <div>
                  <p className='text-base font-medium mg-2'>{t('total_students')}</p>
                  <p className='text-2xl font-semibold'>{roundNumber(data?.statistic?.total_students)}</p>
                </div>
              </div>
              <div className='p-2 border rounded-lg flex items-center gap-3'>
                <img src={EXAM_REPORT_4} />
                <div>
                  <p className='text-base font-medium mg-2'>{t('question')}</p>
                  <p className='text-2xl font-semibold'>{roundNumber(data?.statistic?.total_questions)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=' border border-primary-neutral-200 card w-full shadow-lg mx-auto mb-6 bg-white p-5'>
          <div className='flex items-center gap-4 border-b'>
            <div className='py-3 px-4 border-b border-primary-blue-500'>
              <p className='text-primary-blue-500 font-medium'>{t('overview')}</p>
            </div>
          </div>
          <div className='card-body bg-white mt-6 border rounded-lg p-5'>
            <div className='flex items-center justify-between pb-5 mb-5 border-b'>
              <div className='flex items-center gap-2'></div>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded-[2px] bg-primary-neutral-400' />
                  <p>{t('not_done')}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-6 rounded-[2px] bg-primary-error' />
                  <p>{t('incorrect_question')}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-6 rounded-[2px] bg-primary-success' />
                  <p>{t('correct_question')}</p>
                </div>
              </div>
            </div>
            <table className='mt-5 table-rounded '>
              <thead>
                <tr className='bg-primary-blue-50'>
                  <th scope='col'>{t('full_name')}</th>
                  <th scope='col'></th>
                  <th scope='col'>
                    <div className='flex items-center gap-2 justify-center'>
                      <p>{t('correct_ratio')}</p>
                      <div className='flex items-center justify-center flex-col gap-1'>
                        <Tooltip description={t('sort_ascending')}>
                          <Icon
                            icon={SORTUP_BTN_ICON}
                            className={`${filterOptions?.key == 'correct_percent' && filterOptions?.direction == 'asc' ? 'fill-primary-blue-500' : 'fill-primary-neutral-300'} w-2.5 h-2 cursor-pointer`}
                            onClick={() => {
                              if (filterOptions?.key == 'correct_percent' && filterOptions?.direction == 'asc') {
                                setFilterOptions({ key: '', direction: '' });
                              } else {
                                setFilterOptions({ key: 'correct_percent', direction: 'asc' });
                              }
                            }}
                          />
                        </Tooltip>
                        <Tooltip description={t('sort_descending')}>
                          <Icon
                            icon={SORTUP_BTN_ICON}
                            className={`${filterOptions?.key == 'correct_percent' && filterOptions?.direction == 'desc' ? 'fill-primary-blue-500' : 'fill-primary-neutral-300'} rotate-180 w-2.5 h-2 cursor-pointer`}
                            onClick={() => {
                              if (filterOptions?.key == 'correct_percent' && filterOptions?.direction == 'desc') {
                                setFilterOptions({ key: '', direction: '' });
                              } else {
                                setFilterOptions({ key: 'correct_percent', direction: 'desc' });
                              }
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </th>
                  <th scope='col'>
                    <div className='flex items-center gap-2 justify-center'>
                      <p>{t('correct_answer')}</p>
                      <div className='flex items-center justify-center flex-col gap-1'>
                        <Tooltip description={t('sort_ascending')}>
                          <Icon
                            icon={SORTUP_BTN_ICON}
                            className={`${filterOptions?.key == 'total_correct' && filterOptions?.direction == 'asc' ? 'fill-primary-blue-500' : 'fill-primary-neutral-300'} w-2.5 h-2 cursor-pointer`}
                            onClick={() => {
                              if (filterOptions?.key == 'total_correct' && filterOptions?.direction == 'asc') {
                                setFilterOptions({ key: '', direction: '' });
                              } else {
                                setFilterOptions({ key: 'total_correct', direction: 'asc' });
                              }
                            }}
                          />
                        </Tooltip>
                        <Tooltip description={t('sort_descending')}>
                          <Icon
                            icon={SORTUP_BTN_ICON}
                            className={`${filterOptions?.key == 'total_correct' && filterOptions?.direction == 'desc' ? 'fill-primary-blue-500' : 'fill-primary-neutral-300'} rotate-180 w-2.5 h-2 cursor-pointer`}
                            onClick={() => {
                              if (filterOptions?.key == 'total_correct' && filterOptions?.direction == 'desc') {
                                setFilterOptions({ key: '', direction: '' });
                              } else {
                                setFilterOptions({ key: 'total_correct', direction: 'desc' });
                              }
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </th>
                  <th scope='col'>
                    <div className='flex items-center gap-2 justify-center'>
                      <p>{t('score')}</p>
                      <div className='flex items-center justify-center flex-col gap-1'>
                        <Tooltip description={t('sort_ascending')}>
                          <Icon
                            icon={SORTUP_BTN_ICON}
                            className={`${filterOptions?.key == 'score' && filterOptions?.direction == 'asc' ? 'fill-primary-blue-500' : 'fill-primary-neutral-300'} w-2.5 h-2 cursor-pointer`}
                            onClick={() => {
                              if (filterOptions?.key == 'score' && filterOptions?.direction == 'asc') {
                                setFilterOptions({ key: '', direction: '' });
                              } else {
                                setFilterOptions({ key: 'score', direction: 'asc' });
                              }
                            }}
                          />
                        </Tooltip>
                        <Tooltip description={t('sort_descending')}>
                          <Icon
                            icon={SORTUP_BTN_ICON}
                            className={`${filterOptions?.key == 'score' && filterOptions?.direction == 'desc' ? 'fill-primary-blue-500' : 'fill-primary-neutral-300'} rotate-180 w-2.5 h-2 cursor-pointer`}
                            onClick={() => {
                              if (filterOptions?.key == 'score' && filterOptions?.direction == 'desc') {
                                setFilterOptions({ key: '', direction: '' });
                              } else {
                                setFilterOptions({ key: 'score', direction: 'desc' });
                              }
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </th>
                  <th scope='col' />
                </tr>
              </thead>
              <tbody className='bg-white'>
                {data?.submission_overviews?.length > 0 ? (
                  data?.submission_overviews
                    ?.sort((a: any, b: any) => {
                      if (filterOptions?.key == 'total_correct') {
                        return filterOptions?.direction == 'asc'
                          ? a?.total_correct - b?.total_correct
                          : b?.total_correct - a?.total_correct;
                      } else if (filterOptions?.key == 'score') {
                        return filterOptions?.direction == 'asc' ? a?.score - b?.score : b?.score - a?.score;
                      } else {
                        return filterOptions?.direction == 'asc'
                          ? a?.correct_percent - b?.correct_percent
                          : b?.correct_percent - a?.correct_percent;
                      }
                    })
                    ?.map((submission: any, index: any) => {
                      return (
                        <tr key={index}>
                          <td>
                            <div className='flex items-center gap-3'>
                              <img src={submission?.avatar} className='size-10 min-w-10 rounded-full object-cover' />
                              <Link
                                to={`/curriculum/report/detail-exercise/${id}/${submission?.student_id}`}
                                className='text-sm font-semibold text-primary-blue-500 cursor-pointer'
                              >
                                {submission?.username} - {submission?.display_name}
                              </Link>
                            </div>
                          </td>
                          <td>
                            <div
                              className='flex items-center rounded-full overflow-hidden w-[500px] mx-auto cursor-pointer'
                              onClick={() => {
                                setShowDetailExam(true);
                                setSelectData({ ...submission, exam_id: Number(id) });
                              }}
                            >
                              <div className='w-1/3 h-5 bg-primary-success text-right text-primary-neutral-50 px-4 flex items-center justify-end'>
                                {submission?.total_answered}
                              </div>
                              <div className='w-1/3 h-5 bg-primary-error text-right text-primary-neutral-50 px-4 flex items-center justify-end'>
                                {submission?.total_failed}
                              </div>
                              <div className='w-1/3 h-5 bg-primary-neutral-400 text-right text-primary-neutral-50 px-4 flex items-center justify-end'>
                                {submission?.total_unanswered}
                              </div>
                            </div>
                          </td>
                          <td>{roundNumber(submission?.correct_percent)}%</td>
                          <td>
                            {submission?.total_answered}/{submission?.total_questions}
                          </td>
                          <td>
                            <p>{submission?.score}</p>
                          </td>
                          <td>
                            <ModalDescription
                              item={submission}
                              defaultDescription={submission?.note}
                              onUpdateDescription={(desc: string) => {
                                onUpdateDescription(submission?.submission_id, desc);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyTable />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ModalQuestion
        show={showDetailExam}
        setShow={setShowDetailExam}
        questions={data?.exercise?.questions}
        selectData={selectData}
      />
      <DrawerSetting
        show={showEditSetting}
        setShow={setShowEditSetting}
        data={data?.exam}
        exerciseId={Number(data?.exam?.id)}
        onSuccess={getData}
      />
    </div>
  );
};

export default DetailReport;
