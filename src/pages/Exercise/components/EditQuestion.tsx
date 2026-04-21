import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import {
  IMAGE_WHITE,
  MIC_WHITE,
  VIDEO_WHITE,
  ANSWER_RADIO_UNCHECK,
  ANSWER_RADIO_CHECK,
  ANSWER_CHECKBOX_UNCHECK,
  ANSWER_CHECKBOX_CHECK,
  DELETE_03,
  PLUS_WHITE,
  SETTING_WHITE,
  EDIT_ICON
} from '@lib/ImageHelper';
import QuestionsTypeSelect from '@components/selects/QuestionsTypeSelect';
import ScoreSelect from '@components/selects/ScoreSelect';
import { useT } from '@hooks/useT';
import { ANSWER_COLOR, ANSWER_BTN_COLOR } from '@constants/index';
import Upload, { UploadTrigger } from '@components/upload';
import TooltipUi from '@components/tooltip';
import TextInput from '@components/fields/TextInput';
import { Toast } from '@components/toast';
import { getFileTypeFromMime } from '@lib/FileHelper';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import {
  CREATE_EX_DATA,
  FILL_IN_THE_BLANK,
  FORMAT_ANSWER_ID,
  INIT_FORM_DATA,
  MATCHING,
  MULTIPLE_CHOICE,
  ORDERING,
  REVERSE_WORD
} from '../constant';
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog';
import { cloneDeep } from 'lodash';
import Icon from '@components/Icon';
import { ChevronLeft, Info } from 'lucide-react';
import { containsVietnameseAccent } from '@lib/StringHelper';
import SelectImageModal from '@components/SelectImageModal';
import { generateSimpleId } from '@lib/JsHelper';
import CheckboxInput from '@components/fields/CheckboxInput';
import {
  AnswerDescriptionEditor,
  AnswerEditor,
  AnswerExplainEditor,
  ModalMoreAnswer,
  QuestionTitleEditor,
  ReverseWordEditor
} from './Editor';

interface Props {
  type: 'add' | 'edit';
  questionIndex: number;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  exerciseFormData: any;
  setExerciseFormData: any;
  onSuccess?: Function;
}

const EditQuestion = (props: Props) => {
  const { questionIndex, show, setShow, exerciseFormData, setExerciseFormData, onSuccess, type } = props;
  const [formData, setFormData] = useState<any>();
  const { t } = useT();

  const onUpdate = async () => {
    const {
      question_type,
      score,
      question_title,
      question_file,
      answer_explanation,
      matching,
      fill_in_the_blank,
      multiple_choice_answers,
      sort,
      reverse_word
    } = cloneDeep(formData);
    let result;
    switch (question_type) {
      case MULTIPLE_CHOICE:
        result = { question_type, score, question_title, question_file, answer_explanation, multiple_choice_answers };
        break;
      case FILL_IN_THE_BLANK:
        result = { question_type, score, question_title, question_file, answer_explanation, fill_in_the_blank };
        break;
      case MATCHING:
        result = { question_type, score, question_title, question_file, answer_explanation, matching };
        break;
      case ORDERING:
        result = {
          question_type,
          score,
          question_title,
          question_file,
          answer_explanation,
          sort: {
            ...sort,
            options: sort?.options?.map((otp: any) => ({ ...otp, answer_title: otp?.answer_title || '.' }))
          }
        };
        break;
      case REVERSE_WORD:
        result = {
          question_type,
          score,
          question_title,
          question_file,
          answer_explanation,
          reverse_word: {
            options: reverse_word?.options?.map((val: any, index: number) => ({ ...val, position: index + 1 }))
          }
        };
        break;
    }

    if (!question_title.trim()) {
      return Toast('warning', t('question_required'));
    }
    if (question_type == MULTIPLE_CHOICE) {
      if (
        !multiple_choice_answers?.options?.find(
          (opt: { is_correct_answer: number }) => opt?.is_correct_answer == MULTIPLE_CHOICE
        )
      ) {
        return Toast('warning', t('require_one_correct'));
      }

      if (
        multiple_choice_answers?.options?.find(
          (opt: {
            answer_title: string;
            file: {
              url: string;
            };
          }) => !opt?.answer_title && !opt?.file?.url
        )
      ) {
        return Toast('warning', t('fill_all_answers'));
      }
    }
    if (question_type == FILL_IN_THE_BLANK) {
      if (!fill_in_the_blank?.answer_title?.trim()) {
        return Toast('warning', t('fill_all_answers'));
      }
    }
    if (question_type == ORDERING) {
      if (sort?.descriptions?.find((opt: { answer_description: string }) => !opt?.answer_description)) {
        return Toast('warning', t('fill_all_answers'));
      }
    }
    if (question_type == MATCHING) {
      if (matching?.descriptions?.find((opt: { answer_description: string }) => !opt?.answer_description)) {
        return Toast('warning', t('fill_all_answers'));
      }
    }
    if (question_type == REVERSE_WORD) {
      if (
        reverse_word?.options?.find(
          (opt: {
            answer_title: string;
            file: {
              url: string;
            };
          }) => !opt?.answer_title && !opt?.file?.url
        )
      ) {
        return Toast('warning', t('fill_all_answers'));
      }
    }
    onSuccess?.(result, questionIndex);
    setShow(false);
  };

  useEffect(() => {
    if (show) {
      if (type === 'add') {
        setFormData(cloneDeep({ ...INIT_FORM_DATA, multiple_choice_answers: CREATE_EX_DATA(1) }));
      } else {
        setFormData(exerciseFormData?.questions[questionIndex]);
      }
    }
  }, [show]);

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent className='rounded-lg border-none gap-0 p-0 max-w-[1000px] mac14:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1500px] overflow-hidden bg-transparent min-h-[calc(100vh-200px)] items-start bg-white shadow-none'>
        <div className='flex flex-col h-full'>
          <div className='px-10 py-3 bg-white flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Button
                variant={'outline'}
                className='size-10 p-0'
                onClick={() => {
                  setShow(false);
                }}
              >
                <ChevronLeft width={36} height={36} />
              </Button>
              <div className='w-60'>
                <QuestionsTypeSelect
                  value={formData?.question_type}
                  onChange={(value) => {
                    let formQuestion = {};
                    switch (value?.value) {
                      case 1:
                        formQuestion = {
                          multiple_choice_answers: CREATE_EX_DATA(value?.value)
                        };
                        break;
                      case 2:
                        formQuestion = {
                          fill_in_the_blank: CREATE_EX_DATA(value?.value)
                        };
                        break;
                      case 3:
                        formQuestion = {
                          matching: CREATE_EX_DATA(value?.value)
                        };
                        break;
                      case 4:
                        formQuestion = {
                          sort: CREATE_EX_DATA(value?.value)
                        };
                        break;
                      case 5:
                        formQuestion = {
                          reverse_word: CREATE_EX_DATA(value?.value)
                        };
                        break;
                    }
                    setFormData({ ...formData, question_type: value?.value, ...formQuestion });
                  }}
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-32'>
                <ScoreSelect
                  value={formData?.score}
                  onChange={(value) => {
                    setFormData({ ...formData, score: value?.value });
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  onUpdate();
                }}
              >
                {t('save_question')}
              </Button>
            </div>
          </div>
          <div
            className='flex-1 bg-center bg-cover bg-image-home p-6 min-h-[calc(100vh-135px)] max-h-[calc(100vh-135px)] overflow-y-auto'
            key={'question'}
          >
            <div className='rounded-3xl bg-primary-blue-700 h-max p-4 '>
              {/* Editor */}
              <QuestionTitleEditor formData={formData} setFormData={setFormData} />
              {formData?.question_type === MULTIPLE_CHOICE ? (
                <>
                  <div className='flex items-center gap-3 mb-4' key={1}>
                    <div
                      className={`grid ${
                        formData?.multiple_choice_answers?.options?.length == 5
                          ? 'grid-cols-[repeat(5,1fr)]'
                          : formData?.multiple_choice_answers?.options?.length == 4
                            ? 'grid-cols-[repeat(4,1fr)]'
                            : formData?.multiple_choice_answers?.options?.length == 3
                              ? 'grid-cols-[repeat(3,1fr)]'
                              : 'grid-cols-[repeat(2,1fr)]'
                      } gap-3  h-[315px] flex-1`}
                    >
                      {formData?.multiple_choice_answers?.options?.map((answer: any, index: number) => {
                        return (
                          <div
                            className='rounded-xl h-full p-2'
                            style={{
                              backgroundColor: ANSWER_COLOR[index]
                            }}
                            key={index}
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <div className='flex items-center gap-2'>
                                {formData?.multiple_choice_answers?.options?.length > 2 && (
                                  <Button
                                    className='w-7 h-7 !p-0'
                                    style={{
                                      backgroundColor: ANSWER_BTN_COLOR[index]
                                    }}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        multiple_choice_answers: {
                                          ...formData?.multiple_choice_answers,
                                          options: formData?.multiple_choice_answers?.options.filter(
                                            (_: any, idx: number) => idx != index
                                          )
                                        }
                                      });
                                    }}
                                  >
                                    <img src={DELETE_03} />
                                  </Button>
                                )}
                                <SelectImageModal
                                  onSuccess={(url) => {
                                    answer.file = {
                                      url: url,
                                      type: 'image'
                                    };
                                    setFormData({
                                      ...formData
                                    });
                                  }}
                                >
                                  <Button
                                    className='w-7 h-7 !p-0'
                                    style={{
                                      backgroundColor: ANSWER_BTN_COLOR[index]
                                    }}
                                  >
                                    <img src={IMAGE_WHITE} />
                                  </Button>
                                </SelectImageModal>

                                <Upload
                                  value={[]}
                                  className='w-fit'
                                  isSingle
                                  maxFiles={1}
                                  onChange={(files) => {
                                    answer.file = {
                                      url: files?.[0]?.url,
                                      type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                                    };
                                    setFormData({
                                      ...formData
                                    });
                                  }}
                                  accept={{ 'audio/*': [] }}
                                >
                                  <UploadTrigger
                                    render={(loading) => {
                                      return (
                                        <Button
                                          className='w-7 h-7 !p-0'
                                          style={{
                                            backgroundColor: ANSWER_BTN_COLOR[index]
                                          }}
                                        >
                                          {loading ? (
                                            <svg
                                              aria-hidden='true'
                                              className='w-12 h-12 text-white animate-spin dark:text-gray-600 fill-primary-blue'
                                              viewBox='0 0 100 101'
                                              fill='none'
                                              xmlns='http://www.w3.org/2000/svg'
                                            >
                                              <path
                                                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                                fill='currentColor'
                                              />
                                              <path
                                                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                                fill='currentFill'
                                              />
                                            </svg>
                                          ) : (
                                            <img src={MIC_WHITE} />
                                          )}
                                        </Button>
                                      );
                                    }}
                                  />
                                </Upload>
                                <Upload
                                  value={[]}
                                  className='w-fit'
                                  isSingle
                                  maxFiles={1}
                                  onChange={(files) => {
                                    answer.file = {
                                      url: files?.[0]?.url,
                                      type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                                    };
                                    setFormData({
                                      ...formData
                                    });
                                  }}
                                  accept={{ 'video/*': [] }}
                                >
                                  <UploadTrigger
                                    render={(loading) => {
                                      return (
                                        <Button
                                          className='w-7 h-7 !p-0'
                                          style={{
                                            backgroundColor: ANSWER_BTN_COLOR[index]
                                          }}
                                        >
                                          {loading ? (
                                            <svg
                                              aria-hidden='true'
                                              className='w-12 h-12 text-white animate-spin dark:text-gray-600 fill-primary-blue'
                                              viewBox='0 0 100 101'
                                              fill='none'
                                              xmlns='http://www.w3.org/2000/svg'
                                            >
                                              <path
                                                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                                fill='currentColor'
                                              />
                                              <path
                                                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                                fill='currentFill'
                                              />
                                            </svg>
                                          ) : (
                                            <img src={VIDEO_WHITE} />
                                          )}
                                        </Button>
                                      );
                                    }}
                                  />
                                </Upload>
                              </div>
                              <div>
                                {answer?.is_correct_answer ? (
                                  formData?.multiple_choice_answers?.is_multiple_choice ? (
                                    <img
                                      src={ANSWER_CHECKBOX_CHECK}
                                      className='cursor-pointer shadow-sm'
                                      onClick={() => {
                                        if (
                                          answer.is_correct_answer == 1 &&
                                          formData?.multiple_choice_answers?.options?.filter(
                                            (otp: any) => otp?.is_correct_answer
                                          )?.length == 1
                                        )
                                          return Toast('warning', t('at_least_one_correct_answer'));
                                        answer.is_correct_answer = 0;
                                        setFormData({ ...formData });
                                      }}
                                    />
                                  ) : (
                                    <img src={ANSWER_RADIO_CHECK} className='cursor-pointer shadow-sm' />
                                  )
                                ) : formData?.multiple_choice_answers?.is_multiple_choice ? (
                                  <img
                                    src={ANSWER_CHECKBOX_UNCHECK}
                                    className='cursor-pointer shadow-sm'
                                    onClick={() => {
                                      answer.is_correct_answer = 1;
                                      setFormData({ ...formData });
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={ANSWER_RADIO_UNCHECK}
                                    className='cursor-pointer shadow-sm'
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        multiple_choice_answers: {
                                          ...formData?.multiple_choice_answers,
                                          options: formData?.multiple_choice_answers?.options.map(
                                            (otp: any, idx: number) => {
                                              if (index === idx) {
                                                return { ...otp, is_correct_answer: 1 };
                                              } else {
                                                return { ...otp, is_correct_answer: 0 };
                                              }
                                            }
                                          )
                                        }
                                      });
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            <AnswerEditor index={index} answer={answer} formData={formData} setFormData={setFormData} />
                          </div>
                        );
                      })}
                    </div>
                    {formData?.multiple_choice_answers?.options?.length < 5 && (
                      <Button
                        className='w-8 h-8 !p-0'
                        onClick={() => {
                          formData?.multiple_choice_answers?.options?.push({
                            is_correct_answer: 0,
                            id: generateSimpleId('answer'),
                            answer_title: '',
                            file: {
                              url: '',
                              type: null
                            }
                          });
                          setFormData({ ...formData });
                        }}
                      >
                        <img src={PLUS_WHITE} />
                      </Button>
                    )}
                  </div>

                  <div className='flex items-center gap-2 p-1 bg-primary-neutral-800 w-[380px] h-[40px] rounded-lg'>
                    <Button
                      className={`${!formData?.multiple_choice_answers?.is_multiple_choice ? 'bg-primary-blue-50 text-primary-blue-600 hover:bg-primary-blue-50/90' : ' text-primary-neutral-500 bg-transparent hover:bg-transparent'}  w-1/2 h-8 rounded-lg`}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          multiple_choice_answers: {
                            ...formData?.multiple_choice_answers,
                            is_multiple_choice: 0,
                            options: formData?.multiple_choice_answers?.options?.map((option: any, idx: number) => {
                              if (idx === 0) {
                                return { ...option, is_correct_answer: 1 };
                              } else {
                                return { ...option, is_correct_answer: 0 };
                              }
                            })
                          }
                        });
                      }}
                    >
                      {t('single_correct_answer')}
                    </Button>
                    <Button
                      className={`${formData?.multiple_choice_answers?.is_multiple_choice ? 'bg-primary-blue-50 text-primary-blue-600 hover:bg-primary-blue-50/90' : ' text-primary-neutral-500 bg-transparent hover:bg-transparent'}  w-1/2 h-8 rounded-lg`}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          multiple_choice_answers: { ...formData?.multiple_choice_answers, is_multiple_choice: 1 }
                        });
                      }}
                    >
                      {t('multiple_correct_answers')}
                    </Button>
                  </div>
                </>
              ) : formData?.question_type === FILL_IN_THE_BLANK ? (
                <>
                  <div className='mt-4 w-full py-6  bg-[#0A3760] rounded-2xl'>
                    <div className='flex items-center justify-center  gap-3'>
                      <div className='w-[550px]'>
                        <TextInput
                          value={formData?.fill_in_the_blank?.answer_title}
                          placeholder={t('enter_answer')}
                          className='focus-visible:border-primary-neutral-50 border-transparent text-primary-neutral-200 bg-[#134B7E] h-[60px] text-2xl md:text-2xl font-medium'
                          onChange={(value) => {
                            formData.fill_in_the_blank.answer_title = value;
                            if (containsVietnameseAccent(value)) {
                              formData.fill_in_the_blank.input_type = 1;
                            }
                            setFormData({ ...formData });
                          }}
                        />
                      </div>
                      <Dialog>
                        <TooltipUi description={t('display_settings')}>
                          <DialogTrigger asChild>
                            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#134B7E] rounded cursor-pointer'>
                              <img src={SETTING_WHITE} />
                            </div>
                          </DialogTrigger>
                        </TooltipUi>
                        <DialogContent className='p-6 rounded-lg bg-white max-w-max z-50'>
                          <RadioGroup
                            defaultValue={String(formData?.fill_in_the_blank?.input_type)}
                            onValueChange={(value) => {
                              formData.fill_in_the_blank.input_type = +value;
                              setFormData({ ...formData });
                            }}
                          >
                            <div className='flex items-center justify-center gap-12'>
                              <div className='w-1/2'>
                                <div
                                  className={`px-20 py-14 w-full bg-primary-neutral-100 rounded flex items-center justify-center gap-2 border-[1.5px] ${formData?.fill_in_the_blank?.input_type == 0 ? 'border-primary-blue-500' : 'border-transparent'}`}
                                  onClick={() => {
                                    formData.fill_in_the_blank.input_type = 0;
                                    setFormData({ ...formData });
                                  }}
                                >
                                  <div className='w-[60px] h-[60px] min-w-[60px] flex items-center justify-center rounded-lg bg-primary-neutral-800 border-[2px] border-primary-blue-500'>
                                    <p className='text-white text-2xl font-medium'>V</p>
                                  </div>
                                  <div className='w-[60px] h-[60px] min-w-[60px] flex items-center justify-center rounded-lg bg-primary-neutral-800 border-[2px] border-primary-blue-500'>
                                    <p className='text-white text-2xl font-medium'>H</p>
                                  </div>
                                  <div className='w-[60px] h-[60px] min-w-[60px] flex items-center justify-center rounded-lg bg-primary-neutral-800 border-[2px] border-primary-blue-500'>
                                    <p className='text-white text-2xl font-medium'>S</p>
                                  </div>
                                </div>

                                <div className='flex items-center space-x-2 mt-3'>
                                  <RadioGroupItem value='0' id='option-one' />
                                  <label htmlFor='option-one'>{t('separate_box')}</label>
                                </div>
                              </div>
                              <div className='w-1/2'>
                                <div
                                  className={`px-20 py-14 w-full bg-primary-neutral-100 rounded flex items-center justify-center gap-2 border-[1.5px] ${formData?.fill_in_the_blank?.input_type == 1 ? 'border-primary-blue-500' : 'border-transparent'}`}
                                  onClick={() => {
                                    formData.fill_in_the_blank.input_type = 1;
                                    setFormData({ ...formData });
                                  }}
                                >
                                  <div className='w-[120px] h-[60px] min-w-[120px] flex items-center justify-center rounded-lg bg-primary-neutral-800 border-[2px] border-primary-blue-500'>
                                    <p className='text-white text-2xl font-medium'>BeliTeachers</p>
                                  </div>
                                </div>

                                <div className='flex items-center space-x-2 mt-3'>
                                  <RadioGroupItem value='1' id='option-two' />
                                  <label htmlFor='option-two'>{t('single_input_field')}</label>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className='flex items-center justify-center gap-3 mt-4'>
                      <p className='text-primary-blue-200 text-xl font-semibold'>
                        {t('other_answer')}: {formData?.fill_in_the_blank?.other_correct_answer?.join(', ')}
                      </p>

                      <AlertDialog>
                        <TooltipUi description={t('edit')}>
                          <AlertDialogTrigger asChild>
                            <Icon icon={EDIT_ICON} className='size-4 text-white cursor-pointer' />
                          </AlertDialogTrigger>
                        </TooltipUi>
                        <AlertDialogContent className='p-6 rounded-lg bg-white max-w-max z-50'>
                          <ModalMoreAnswer data={formData} setData={setFormData} />
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className='pt-2 flex items-center justify-end gap-2'>
                    <CheckboxInput
                      label={t('ignore_case')}
                      labelClassName='text-lg font-semibold text-primary-blue-200 pl-2'
                      checked={formData?.fill_in_the_blank?.ignore_case == 1}
                      onCheckedChange={(checked) => {
                        formData.fill_in_the_blank.ignore_case = checked ? 1 : 0;
                        setFormData({ ...formData });
                      }}
                    />
                    <TooltipUi description={t('ignore_case_in_checking')}>
                      <Info className='text-primary-blue-200 size-5' />
                    </TooltipUi>
                  </div>
                  <div className='mt-4 w-full p-6 bg-[#0A3760] rounded-2xl'>
                    <p className='text-primary-blue-200 text-2xl font-semibold mb-3'>{t('student_view_mode')}</p>
                    <div className='mb-[34px] w-full'>
                      <p className='text-primary-blue-200 text-2xl font-semibold mb-6 text-center'>
                        {t('enter_answer_in_boxes')}
                      </p>
                      <div className='flex items-center justify-center'>
                        {formData?.fill_in_the_blank?.input_type == 0 ? (
                          <div className='flex items-center mx-auto gap-2 flex-wrap'>
                            {formData?.fill_in_the_blank?.answer_title
                              ?.split('')
                              ?.map((text: string, index: number) => {
                                if (text === ' ') {
                                  return <div className='w-5' />;
                                } else
                                  return (
                                    <div
                                      key={index}
                                      className=' size-[60px] bg-primary-blue-800 rounded-lg flex items-center justify-center'
                                    >
                                      <p className='text-primary-neutral-50 text-2xl font-medium'>{text}</p>
                                    </div>
                                  );
                              })}
                          </div>
                        ) : (
                          <div className=' h-[60px] min-w-[550px] w-max bg-primary-blue-800 rounded-lg flex items-center justify-start px-4'>
                            <p className='text-primary-neutral-50 text-2xl font-medium'>
                              {formData?.fill_in_the_blank?.answer_title}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : formData?.question_type === MATCHING ? (
                <>
                  <div className='flex items-center gap-3 mb-4' key={formData?.question_type}>
                    <div className='space-y-3 w-full'>
                      <div
                        className={`grid ${
                          formData?.matching?.options?.length == 5
                            ? 'grid-cols-[repeat(5,1fr)]'
                            : formData?.matching?.options?.length == 4
                              ? 'grid-cols-[repeat(4,1fr)]'
                              : formData?.matching?.options?.length == 3
                                ? 'grid-cols-[repeat(3,1fr)]'
                                : 'grid-cols-[repeat(2,1fr)]'
                        } gap-3 h-max flex-1`}
                      >
                        {formData?.matching?.options?.map((answer: any, index: number) => {
                          return (
                            <div
                              key={index}
                              className='rounded-xl h-full p-2'
                              style={{
                                backgroundColor: ANSWER_COLOR[index]
                              }}
                            >
                              <div className='flex items-center justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                  {formData?.matching?.options?.length > 2 && (
                                    <Button
                                      className='w-7 h-7 !p-0'
                                      style={{
                                        backgroundColor: ANSWER_BTN_COLOR[index]
                                      }}
                                      onClick={() => {
                                        const newAnswers = {
                                          options: formData?.matching?.options.filter(
                                            (_: any, idx: number) => idx != index
                                          ),

                                          descriptions: formData?.matching?.descriptions.filter(
                                            (_: any, idx: number) => idx != index
                                          )
                                        };

                                        setFormData({
                                          ...formData,
                                          matching: FORMAT_ANSWER_ID(1, newAnswers)
                                        });
                                      }}
                                    >
                                      <img src={DELETE_03} />
                                    </Button>
                                  )}

                                  <SelectImageModal
                                    onSuccess={(url) => {
                                      answer.file = {
                                        url: url,
                                        type: 'image'
                                      };
                                      setFormData({
                                        ...formData
                                      });
                                    }}
                                  >
                                    <Button
                                      className='w-7 h-7 !p-0'
                                      style={{
                                        backgroundColor: ANSWER_BTN_COLOR[index]
                                      }}
                                    >
                                      <img src={IMAGE_WHITE} />
                                    </Button>
                                  </SelectImageModal>

                                  <Upload
                                    value={[]}
                                    className='w-fit'
                                    isSingle
                                    maxFiles={1}
                                    onChange={(files) => {
                                      answer.file = {
                                        url: files?.[0]?.url,
                                        type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                                      };
                                      setFormData({
                                        ...formData
                                      });
                                    }}
                                    accept={{ 'audio/*': [] }}
                                  >
                                    <UploadTrigger>
                                      <Button
                                        className='w-7 h-7 !p-0'
                                        style={{
                                          backgroundColor: ANSWER_BTN_COLOR[index]
                                        }}
                                      >
                                        <img src={MIC_WHITE} />
                                      </Button>
                                    </UploadTrigger>
                                  </Upload>
                                  <Upload
                                    value={[]}
                                    className='w-fit'
                                    isSingle
                                    maxFiles={1}
                                    onChange={(files) => {
                                      answer.file = {
                                        url: files?.[0]?.url,
                                        type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                                      };
                                      setFormData({
                                        ...formData
                                      });
                                    }}
                                    accept={{ 'video/*': [] }}
                                  >
                                    <UploadTrigger>
                                      <Button
                                        className='w-7 h-7 !p-0'
                                        style={{
                                          backgroundColor: ANSWER_BTN_COLOR[index]
                                        }}
                                      >
                                        <img src={VIDEO_WHITE} />
                                      </Button>
                                    </UploadTrigger>
                                  </Upload>
                                </div>
                              </div>
                              <AnswerEditor
                                index={index}
                                answer={answer}
                                formData={formData}
                                setFormData={setFormData}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div
                        className={`grid ${
                          formData?.matching?.descriptions?.length == 5
                            ? 'grid-cols-[repeat(5,1fr)]'
                            : formData?.matching?.descriptions?.length == 4
                              ? 'grid-cols-[repeat(4,1fr)]'
                              : formData?.matching?.descriptions?.length == 3
                                ? 'grid-cols-[repeat(3,1fr)]'
                                : 'grid-cols-[repeat(2,1fr)]'
                        } gap-3 h-max flex-1`}
                      >
                        {formData?.matching?.descriptions?.map((answer: any, index: number) => {
                          return (
                            <div
                              key={index}
                              className='rounded-xl h-full p-2'
                              style={{
                                backgroundColor: ANSWER_COLOR[index]
                              }}
                            >
                              <AnswerDescriptionEditor
                                index={index}
                                answer={answer}
                                setFormData={setFormData}
                                formData={formData}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {formData?.matching?.options?.length < 5 && (
                      <Button
                        className='w-8 h-8 !p-0'
                        onClick={() => {
                          const random_id = generateSimpleId(`answer_${formData?.matching?.options?.length + 1}`);
                          formData?.matching?.options?.push({
                            id: random_id,
                            answer_title: '',
                            file: {
                              url: '',
                              type: null
                            }
                          });
                          formData?.matching?.descriptions?.push({
                            answer_id: random_id,
                            id: generateSimpleId(`desc_${formData?.matching?.options?.length}`),
                            answer_description: ''
                          });
                          setFormData({ ...formData });
                        }}
                      >
                        <img src={PLUS_WHITE} />
                      </Button>
                    )}
                  </div>
                </>
              ) : formData?.question_type === ORDERING ? (
                <>
                  <div className='flex items-center gap-3 mb-4' key={formData?.question_type}>
                    <div className='space-y-3 w-full'>
                      <div
                        className={`grid ${
                          formData?.sort?.options?.length == 5
                            ? 'grid-cols-[repeat(5,1fr)]'
                            : formData?.sort?.options?.length == 4
                              ? 'grid-cols-[repeat(4,1fr)]'
                              : formData?.sort?.options?.length == 3
                                ? 'grid-cols-[repeat(3,1fr)]'
                                : 'grid-cols-[repeat(2,1fr)]'
                        } gap-3 h-max flex-1`}
                      >
                        {formData?.sort?.options?.map((answer: any, index: number) => {
                          return (
                            <div
                              key={index}
                              className='rounded-xl h-full p-2'
                              style={{
                                backgroundColor: ANSWER_COLOR[index]
                              }}
                            >
                              <div className='flex items-center justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                  {formData?.sort?.options?.length > 2 && (
                                    <Button
                                      className='w-7 h-7 !p-0'
                                      style={{
                                        backgroundColor: ANSWER_BTN_COLOR[index]
                                      }}
                                      onClick={() => {
                                        const newAnswers = {
                                          options: formData?.sort?.options.filter(
                                            (_: any, idx: number) => idx != index
                                          ),

                                          descriptions: formData?.sort?.descriptions.filter(
                                            (_: any, idx: number) => idx != index
                                          )
                                        };

                                        setFormData({
                                          ...formData,
                                          sort: FORMAT_ANSWER_ID(2, newAnswers)
                                        });
                                      }}
                                    >
                                      <img src={DELETE_03} />
                                    </Button>
                                  )}
                                  <SelectImageModal
                                    onSuccess={(url) => {
                                      answer.file = {
                                        url: url,
                                        type: 'image'
                                      };
                                      setFormData({
                                        ...formData
                                      });
                                    }}
                                  >
                                    <Button
                                      className='w-7 h-7 !p-0'
                                      style={{
                                        backgroundColor: ANSWER_BTN_COLOR[index]
                                      }}
                                    >
                                      <img src={IMAGE_WHITE} />
                                    </Button>
                                  </SelectImageModal>

                                  <Upload
                                    value={[]}
                                    className='w-fit'
                                    isSingle
                                    maxFiles={1}
                                    onChange={(files) => {
                                      answer.file = {
                                        url: files?.[0]?.url,
                                        type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                                      };
                                      setFormData({
                                        ...formData
                                      });
                                    }}
                                    accept={{ 'audio/*': [] }}
                                  >
                                    <UploadTrigger>
                                      <Button
                                        className='w-7 h-7 !p-0'
                                        style={{
                                          backgroundColor: ANSWER_BTN_COLOR[index]
                                        }}
                                      >
                                        <img src={MIC_WHITE} />
                                      </Button>
                                    </UploadTrigger>
                                  </Upload>
                                  <Upload
                                    value={[]}
                                    className='w-fit'
                                    isSingle
                                    maxFiles={1}
                                    onChange={(files) => {
                                      answer.file = {
                                        url: files?.[0]?.url,
                                        type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                                      };
                                      setFormData({
                                        ...formData
                                      });
                                    }}
                                    accept={{ 'video/*': [] }}
                                  >
                                    <UploadTrigger>
                                      <Button
                                        className='w-7 h-7 !p-0'
                                        style={{
                                          backgroundColor: ANSWER_BTN_COLOR[index]
                                        }}
                                      >
                                        <img src={VIDEO_WHITE} />
                                      </Button>
                                    </UploadTrigger>
                                  </Upload>
                                </div>
                              </div>
                              <AnswerEditor
                                index={index}
                                answer={answer}
                                formData={formData}
                                setFormData={setFormData}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div
                        className={`grid ${
                          formData?.sort?.descriptions?.length == 5
                            ? 'grid-cols-[repeat(5,1fr)]'
                            : formData?.sort?.descriptions?.length == 4
                              ? 'grid-cols-[repeat(4,1fr)]'
                              : formData?.sort?.descriptions?.length == 3
                                ? 'grid-cols-[repeat(3,1fr)]'
                                : 'grid-cols-[repeat(2,1fr)]'
                        } gap-3 h-max flex-1`}
                      >
                        {formData?.sort?.descriptions?.map((answer: any, index: number) => {
                          return (
                            <div
                              key={index}
                              className='rounded-xl h-full p-2'
                              style={{
                                backgroundColor: ANSWER_COLOR[index]
                              }}
                            >
                              <AnswerDescriptionEditor
                                index={index}
                                answer={answer}
                                setFormData={setFormData}
                                formData={formData}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {formData?.sort?.options?.length < 5 && (
                      <Button
                        className='w-8 h-8 !p-0'
                        onClick={() => {
                          const random_id = generateSimpleId(`answer_${formData?.sort?.options?.length + 1}`);
                          formData?.sort?.options?.push({
                            id: random_id,
                            answer_title: '',
                            file: {
                              url: '',
                              type: null
                            }
                          });
                          formData?.sort?.descriptions?.push({
                            answer_id: random_id,
                            id: generateSimpleId(`desc_${formData?.matching?.options?.length}`),
                            answer_description: ''
                          });
                          setFormData({ ...formData });
                        }}
                      >
                        <img src={PLUS_WHITE} />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <ReverseWordEditor data={formData} setData={setFormData} />
                </>
              )}
              <div className='mt-4'>
                <p className='text-primary-neutral-50 text-base font-semibold mb-2'>{t('answer_explanation')}</p>
                <AnswerExplainEditor formData={formData} setFormData={setFormData} />
              </div>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditQuestion;
