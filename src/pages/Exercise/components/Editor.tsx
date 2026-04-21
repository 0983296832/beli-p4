import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogAction
} from '@components/ui/alert-dialog';
import CLOSE_CIRCLE_WHITE from '@assets/images/close-circle-white.svg';
import { Button } from '@components/ui/button';
import {
  CHEVRON_LEFT_ICON,
  DELETE_04,
  IMAGE_WHITE,
  MIC_WHITE,
  VIDEO_WHITE,
  EDIT_BLACK,
  DELETE_BLACK,
  ANSWER_RADIO_UNCHECK,
  ANSWER_RADIO_CHECK,
  ANSWER_CHECKBOX_UNCHECK,
  ANSWER_CHECKBOX_CHECK,
  DELETE_03,
  PLUS_WHITE,
  SETTING_WHITE,
  TRASH_ICON,
  EDIT_ICON
} from '@lib/ImageHelper';
import QuestionsTypeSelect from '@components/selects/QuestionsTypeSelect';
import ScoreSelect from '@components/selects/ScoreSelect';
import { useT } from '@hooks/useT';
import TiptapEditor, { TiptapEditorRef } from '@components/fields/Editor';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { TEXT_EDITOR_COLOR, ANSWER_COLOR, ANSWER_BTN_COLOR, ANSWER_BG_COLOR } from '@constants/index';
import Upload, { UploadTrigger } from '@components/upload';
import TooltipUi from '@components/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@components/ui/toggle-group';
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
import { Check, ChevronLeft, Info, X } from 'lucide-react';
import { containsVietnameseAccent } from '@lib/StringHelper';
import SelectImageModal from '@components/SelectImageModal';
import { generateSimpleId } from '@lib/JsHelper';
import { cn } from '@lib/utils';
import CheckboxInput from '@components/fields/CheckboxInput';

interface AnswerDescriptionEditorProps {
  index: number;
  answer: any;
  formData: any;
  setFormData: any;
}
interface AnswerEditorProps {
  index: number;
  answer: any;
  formData: any;
  setFormData: any;
  className?: string;
}

export const AnswerDescriptionEditor = (props: AnswerDescriptionEditorProps) => {
  const { t } = useT();
  const { answer, index, setFormData, formData } = props;
  const editorRef = useRef<any>(null);
  const [answerBg, setAnswerBg] = useState('transparent');
  return (
    <div
      className=' rounded-lg h-[calc(315px-55px)] w-full flex items-center justify-center group relative'
      onFocus={() => {
        setAnswerBg(ANSWER_BG_COLOR[index]);
      }}
      onBlur={() => {
        setAnswerBg('transparent');
      }}
      onClick={() => {
        editorRef.current?.focus();
      }}
      style={{
        backgroundColor: answerBg
      }}
    >
      <TiptapEditor
        key={index}
        ref={editorRef}
        color={'#ffffff'}
        placeholder={t('enter_answer')}
        value={answer?.answer_description}
        onChange={(value) => {
          answer.answer_description = value;
          setFormData({ ...formData });
        }}
        className={`outline-none text-2xl font-medium max-h-[280px] overflow-y-auto max-w-[calc(100%-24px)] min-w-24 hide-scroll placeholder:text-center answer`}
      />
    </div>
  );
};

export const AnswerEditor = (props: AnswerEditorProps) => {
  const { t } = useT();
  const { answer, index, setFormData, formData, className } = props;
  const editorRef = useRef<any>(null);
  const [answerBg, setAnswerBg] = useState('transparent');
  return (
    <div
      className={cn(
        'rounded-lg h-[calc(315px-55px)] w-full flex items-center justify-center group relative',
        className
      )}
      onFocus={() => {
        setAnswerBg(ANSWER_BG_COLOR[index]);
      }}
      onBlur={() => {
        setAnswerBg('transparent');
      }}
      onClick={() => {
        if (!answer?.file?.url && editorRef.current) {
          editorRef.current.focus?.();
        }
      }}
      style={{
        backgroundColor: answerBg
      }}
    >
      {answer?.file?.url ? (
        answer?.file?.type === 'image' ? (
          <>
            <img src={answer?.file?.url} className='w-full h-full object-contain rounded-lg' />
            <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
              <TooltipUi description={t('delete')}>
                <div
                  className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center pt-0.5'
                  onClick={() => {
                    answer.file = {
                      url: '',
                      type: null
                    };
                    setFormData({
                      ...formData
                    });
                  }}
                >
                  <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                </div>
              </TooltipUi>
            </div>
          </>
        ) : answer?.file?.type === 'audio' ? (
          <>
            <audio controls className='w-full mx-2'>
              <source src={answer?.file?.url} type='audio/mpeg' />
              Trình duyệt không hỗ trợ audio.
            </audio>
            <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
              <TooltipUi description={t('delete')}>
                <div
                  className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center pt-0.5'
                  onClick={() => {
                    answer.file = {
                      url: '',
                      type: null
                    };
                    setFormData({
                      ...formData
                    });
                  }}
                >
                  <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                </div>
              </TooltipUi>
            </div>
          </>
        ) : (
          <>
            <video controls className=' w-full h-full object-contain rounded-lg'>
              <source src={answer?.file?.url} type='video/mp4' />
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
            <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
              <TooltipUi description={t('delete')}>
                <div
                  className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center pt-0.5'
                  onClick={() => {
                    answer.file = {
                      url: '',
                      type: null
                    };
                    setFormData({
                      ...formData
                    });
                  }}
                >
                  <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                </div>
              </TooltipUi>
            </div>
          </>
        )
      ) : (
        <div className='w-full flex items-center justify-center'>
          <TiptapEditor
            key={index}
            ref={editorRef}
            color={'#ffffff'}
            placeholder={t('enter_answer')}
            value={answer?.answer_title}
            onChange={(value) => {
              answer.answer_title = value;
              setFormData({ ...formData });
            }}
            className={`outline-none text-2xl font-medium max-h-[280px] overflow-y-auto max-w-[calc(100%-24px)] min-w-24 hide-scroll placeholder:text-center answer`}
          />
        </div>
      )}
    </div>
  );
};

export const AnswerExplainEditor = (props: { formData: any; setFormData: any }) => {
  const { formData, setFormData } = props;
  const { t } = useT();
  const editorRef = useRef<any>(null);
  const [bgEditor, setBgEditor] = useState('transparent');
  return (
    <div
      className={`border border-primary-blue-300  rounded-2xl h-[297px] flex ${formData?.answer_explanation?.explain_file?.url ? 'items-center p-4' : 'items-start'} gap-4 w-full`}
      onFocus={() => {
        setBgEditor('#072A48');
      }}
      onBlur={() => {
        setBgEditor('transparent');
      }}
      onClick={() => {
        editorRef.current?.focus();
      }}
    >
      {formData?.answer_explanation?.explain_file?.url && (
        <div>
          {formData?.answer_explanation?.explain_file?.type === 'image' ? (
            <div className='w-[365px] h-[267px] rounded-xl relative group border border-primary-blue-300'>
              <img
                src={formData?.answer_explanation?.explain_file?.url}
                className='w-full h-full object-contain rounded-xl'
              />
              <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
                <TooltipUi description={t('delete')}>
                  <div
                    className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center'
                    onClick={() => {
                      setFormData({
                        ...formData,
                        answer_explanation: {
                          ...formData?.answer_explanation,
                          explain_file: {
                            url: '',
                            type: null
                          }
                        }
                      });
                    }}
                  >
                    <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                  </div>
                </TooltipUi>
              </div>
            </div>
          ) : formData?.answer_explanation?.explain_file?.type === 'audio' ? (
            <div className='w-[365px] h-[267px] rounded-xl relative group flex items-center justify-center border border-primary-blue-300 px-2'>
              <audio controls className='w-full'>
                <source src={formData?.answer_explanation?.explain_file?.url} type='audio/mpeg' />
                Trình duyệt không hỗ trợ audio.
              </audio>
              <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
                <TooltipUi description={t('delete')}>
                  <div
                    className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center pt-0.5'
                    onClick={() => {
                      setFormData({
                        ...formData,
                        answer_explanation: {
                          ...formData?.answer_explanation,
                          explain_file: {
                            url: '',
                            type: null
                          }
                        }
                      });
                    }}
                  >
                    <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                  </div>
                </TooltipUi>
              </div>
            </div>
          ) : (
            <div className='w-[365px] h-[267px] rounded-xl relative group border border-primary-blue-300'>
              {/* <img src={formData?.explain_file?.url} className='w-full h-full object-contain rounded-xl' /> */}
              <video controls className=' w-full h-full object-contain rounded-xl'>
                <source src={formData?.answer_explanation?.explain_file?.url} type='video/mp4' />
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>

              <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
                <TooltipUi description={t('delete')}>
                  <div
                    className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center pt-0.5'
                    onClick={() => {
                      setFormData({
                        ...formData,
                        answer_explanation: {
                          ...formData?.answer_explanation,
                          explain_file: {
                            url: '',
                            type: null
                          }
                        }
                      });
                    }}
                  >
                    <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                  </div>
                </TooltipUi>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        className={`flex items-center justify-center relative flex-1 border border-primary-blue-300  ${formData?.answer_explanation?.explain_file?.url ? 'h-[267px] rounded-xl' : 'h-[297px] rounded-2xl'}  `}
        style={{
          backgroundColor: bgEditor
        }}
      >
        <TiptapEditor
          color={'#ffffff'}
          ref={editorRef}
          placeholder={t('enter_content')}
          value={formData?.answer_explanation?.explain_description}
          onChange={(value) => {
            setFormData({
              ...formData,
              answer_explanation: { ...formData?.answer_explanation, explain_description: value }
            });
          }}
          className={`outline-none text-2xl font-medium max-h-[280px] overflow-y-auto ${formData?.answer_explanation?.explain_file?.url ? 'max-w-[700px]' : 'max-w-[1000px]'}  min-w-24 hide-scroll answer`}
        />
        {!formData?.answer_explanation?.explain_file?.url && (
          <div className='flex items-center gap-2 absolute top-3 left-3'>
            <SelectImageModal
              onSuccess={(url) => {
                setFormData({
                  ...formData,
                  answer_explanation: {
                    ...formData?.answer_explanation,
                    explain_file: {
                      url: url,
                      type: 'image'
                    }
                  }
                });
              }}
            >
              <Button className='w-7 h-7 !p-0'>
                <img src={IMAGE_WHITE} />
              </Button>
            </SelectImageModal>

            <Upload
              value={[]}
              className='w-fit'
              isSingle
              maxFiles={1}
              onChange={(files) => {
                setFormData({
                  ...formData,
                  answer_explanation: {
                    ...formData?.answer_explanation,
                    explain_file: {
                      url: files?.[0]?.url,
                      type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                    }
                  }
                });
              }}
              accept={{ 'audio/*': [] }}
            >
              <UploadTrigger
                render={(loading) => {
                  return (
                    <Button className='w-7 h-7 !p-0'>
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
                setFormData({
                  ...formData,
                  answer_explanation: {
                    ...formData?.answer_explanation,
                    explain_file: {
                      url: files?.[0]?.url,
                      type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                    }
                  }
                });
              }}
              accept={{ 'video/*': [] }}
            >
              <UploadTrigger
                render={(loading) => {
                  return (
                    <Button className='w-7 h-7 !p-0'>
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
        )}
      </div>
    </div>
  );
};

export const QuestionTitleEditor = (props: { formData: any; setFormData: any }) => {
  const { formData, setFormData } = props;
  const { t } = useT();
  const editorRef = useRef<any>(null);
  const [bgEditor, setBgEditor] = useState('transparent');

  return (
    <div
      className={`border border-primary-blue-300 rounded-2xl h-[297px] flex ${formData?.question_file?.url ? 'items-center p-4' : 'items-start'} gap-4 w-full mb-4`}
      onFocus={() => {
        setBgEditor('#072A48');
      }}
      onBlur={() => {
        setBgEditor('transparent');
      }}
      onClick={() => {
        editorRef.current?.focus();
      }}
    >
      {formData?.question_file?.url && (
        <div>
          {formData?.question_file?.type === 'image' ? (
            <div className='w-[365px] h-[267px] rounded-xl relative group border border-primary-blue-300'>
              <img src={formData?.question_file?.url} className='w-full h-full object-contain rounded-xl' />
              <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
                <TooltipUi description={t('delete')}>
                  <div
                    className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center'
                    onClick={() => {
                      setFormData({
                        ...formData,
                        question_file: {
                          url: '',
                          type: null
                        }
                      });
                    }}
                  >
                    <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                  </div>
                </TooltipUi>
              </div>
            </div>
          ) : formData?.question_file?.type === 'audio' ? (
            <div className='w-[365px] h-[267px] rounded-xl relative group flex items-center justify-center border border-primary-blue-300 px-2'>
              <audio controls className='w-full'>
                <source src={formData?.question_file?.url} type='audio/mpeg' />
                Trình duyệt không hỗ trợ audio.
              </audio>
              <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
                <TooltipUi description={t('delete')}>
                  <div
                    className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center pt-0.5'
                    onClick={() => {
                      setFormData({
                        ...formData,
                        question_file: {
                          url: '',
                          type: null
                        }
                      });
                    }}
                  >
                    <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                  </div>
                </TooltipUi>
              </div>
            </div>
          ) : (
            <div className='w-[365px] h-[267px] rounded-xl relative group border border-primary-blue-300'>
              <video controls className=' w-full h-full object-contain rounded-xl'>
                <source src={formData?.question_file?.url} type='video/mp4' />
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>

              <div className='hidden items-center justify-end gap-2  group-hover:flex absolute top-2 right-2'>
                <TooltipUi description={t('delete')}>
                  <div
                    className='size-9 bg-neutral-50 rounded-sm flex items-center justify-center pt-0.5'
                    onClick={() => {
                      setFormData({
                        ...formData,
                        question_file: {
                          url: '',
                          type: null
                        }
                      });
                    }}
                  >
                    <img src={DELETE_BLACK} className='w-7 h-7 mb-1 cursor-pointer' />
                  </div>
                </TooltipUi>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        className={`flex items-center justify-center relative flex-1 border border-primary-blue-300  ${formData?.question_file?.url ? 'h-[267px] rounded-xl' : 'h-[297px] rounded-2xl'}  `}
        style={{
          backgroundColor: bgEditor
        }}
      >
        <TiptapEditor
          ref={editorRef}
          color={'#ffffff'}
          placeholder={t('enter_question')}
          value={formData?.question_title}
          onChange={(value) => {
            setFormData({ ...formData, question_title: value });
          }}
          className={`outline-none text-2xl font-medium max-h-[280px] overflow-y-auto ${formData?.question_file?.url ? 'max-w-[700px]' : 'max-w-[1000px]'}  min-w-24 hide-scroll answer`}
        />
        {!formData?.question_file?.url && (
          <div className='flex items-center gap-2 absolute top-3 left-3'>
            <SelectImageModal
              onSuccess={(url) => {
                setFormData({
                  ...formData,
                  question_file: {
                    url: url,
                    type: 'image'
                  }
                });
              }}
            >
              <Button className='w-7 h-7 !p-0'>
                <img src={IMAGE_WHITE} />
              </Button>
            </SelectImageModal>
            <Upload
              value={[]}
              className='w-fit'
              isSingle
              maxFiles={1}
              onChange={(files) => {
                setFormData({
                  ...formData,
                  question_file: {
                    url: files?.[0]?.url,
                    type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                  }
                });
              }}
              accept={{ 'audio/*': [] }}
            >
              <UploadTrigger
                render={(loading) => {
                  return (
                    <Button className='w-7 h-7 !p-0'>
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
                setFormData({
                  ...formData,
                  question_file: {
                    url: files?.[0]?.url,
                    type: getFileTypeFromMime(files?.[0]?.mimeType || '')
                  }
                });
              }}
              accept={{ 'video/*': [] }}
            >
              <UploadTrigger
                render={(loading) => {
                  return (
                    <Button className='w-7 h-7 !p-0'>
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
        )}
      </div>
    </div>
  );
};

export const ModalMoreAnswer = (props: any) => {
  const { data, setData } = props;
  const { t } = useT();
  const [arrAnswer, setArrAnswer] = useState<string[]>([]);
  useEffect(() => {
    setArrAnswer(data?.fill_in_the_blank?.other_correct_answer);
  }, []);
  return (
    <div className=' w-[700px] min-h-[500px]'>
      <div className='flex items-center justify-between mb-6 border-b pb-4'>
        <p className='text-xl font-semibold'>{t('other_answer')}</p>
        <AlertDialogCancel className='border-0 bg-white shadow-none hover:bg-white p-0'>
          <X className='cursor-pointer !size-6' />
        </AlertDialogCancel>
      </div>
      <div className='h-[calc(500px-40px)] space-y-3 pb-3 overflow-y-auto'>
        {arrAnswer?.map((val: string, index: number) => {
          return (
            <div className='flex items-center gap-3' key={index}>
              <div className='flex items-center gap-2 flex-1'>
                <p className='w-[100px]'>{t('answer_num', { num: index + 1 })}: </p>
                <div className='w-[550px]'>
                  <TextInput
                    value={val}
                    onChange={(e) => {
                      arrAnswer[index] = e;
                      setArrAnswer([...arrAnswer]);
                    }}
                  />
                </div>
              </div>
              <TooltipUi description={t('delete')}>
                <Icon
                  icon={TRASH_ICON}
                  className='size-6 text-red-500'
                  onClick={() => {
                    setArrAnswer(arrAnswer.filter((_, idx) => idx != index));
                  }}
                />
              </TooltipUi>
            </div>
          );
        })}
      </div>

      <div className='border-t pt-4 flex items-center justify-between'>
        <p
          className='text-sm font-medium text-primary-blue-500 hover:text-orange-500 cursor-pointer'
          onClick={() => {
            arrAnswer.push('');
            setArrAnswer([...arrAnswer]);
          }}
        >
          + {t('add_correct_answer')}
        </p>
        <AlertDialogAction
          onClick={() => {
            data.fill_in_the_blank.other_correct_answer = arrAnswer?.map((v) => v?.trim());
            if (arrAnswer?.map((v) => v?.trim())?.length > 0) {
              data.fill_in_the_blank.input_type = 1;
            }
            setData({ ...data });
          }}
        >
          {t('save')}
        </AlertDialogAction>
      </div>
    </div>
  );
};

export const ReverseWordEditor = (props: any) => {
  const { data, setData } = props;
  const { t } = useT();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<any>(null);
  const [idSelected, setIdSelected] = useState<string>('');

  return (
    <>
      <div className='mt-4 w-full py-6  bg-[#0A3760] rounded-2xl'>
        <div className='flex items-center justify-center  gap-3'>
          <div className='w-[550px]'>
            <TextInput
              ref={inputRef}
              value={inputValue}
              placeholder={t('enter_answer')}
              className='focus-visible:border-primary-neutral-50 border-transparent text-primary-neutral-200 bg-[#134B7E] h-[60px] text-2xl md:text-2xl font-medium'
              onChange={(value) => {
                setInputValue(value);
              }}
              onKeyDown={(e) => {
                if (e.key == 'Enter') {
                  if (idSelected) {
                    data.reverse_word.options = data.reverse_word.options?.map((opt: any) => ({
                      ...opt,
                      answer_title: opt?.id == idSelected ? inputValue : opt?.answer_title
                    }));
                  } else {
                    data?.reverse_word?.options?.push({
                      id: generateSimpleId(`answer_${data?.reverse_word?.options?.length + 1}`),
                      answer_title: inputValue
                      // position: data?.reverse_word?.options?.length
                    });
                  }

                  setData({ ...data });
                  setIdSelected('');
                  setInputValue('');
                  inputRef?.current?.focus();
                }
              }}
            />
          </div>
          <TooltipUi description={t(idSelected ? 'save' : 'add_new')}>
            {idSelected ? (
              <div
                className='h-[60px] w-[60px] flex items-center justify-center bg-[#134B7E] rounded cursor-pointer'
                onClick={() => {
                  data.reverse_word.options = data.reverse_word.options?.map((opt: any) => ({
                    ...opt,
                    answer_title: opt?.id == idSelected ? inputValue : opt?.answer_title
                  }));
                  setData({ ...data });
                  setIdSelected('');
                  setInputValue('');
                }}
              >
                <Check className='size-6 text-white' />
              </div>
            ) : (
              <div
                className='h-[60px] w-[60px] flex items-center justify-center bg-[#134B7E] rounded cursor-pointer'
                onClick={() => {
                  data?.reverse_word?.options?.push({
                    id: generateSimpleId(`answer_${data?.reverse_word?.options?.length + 1}`),
                    answer_title: inputValue
                    //   position: data?.reverse_word?.options?.length
                  });
                  setData({ ...data });
                  setInputValue('');
                }}
              >
                <img src={PLUS_WHITE} />
              </div>
            )}
          </TooltipUi>
        </div>
      </div>
      <div className='mt-4 w-full p-6 bg-[#0A3760] rounded-2xl'>
        <p className='text-primary-blue-200 text-2xl font-semibold mb-3'>{t('student_view_mode')}</p>
        <div className='mb-[34px] w-full'>
          <p className='text-primary-blue-200 text-2xl font-semibold mb-6 text-center'>{t('enter_answer_in_boxes')}</p>
          <div className='flex items-center justify-center'>
            <div className='flex items-center mx-auto gap-2 flex-wrap'>
              {data?.reverse_word?.options?.map((option: { id: string; answer_title: string }, index: number) => {
                if (option?.answer_title === ' ') {
                  return <div className='w-5' />;
                } else
                  return (
                    <div
                      key={index}
                      className={`h-[60px] w-max min-w-[60px] bg-primary-blue-800 rounded-lg flex items-center justify-center px-3 relative group ${idSelected == option?.id && 'border border-white'}`}
                    >
                      <p className='text-primary-neutral-50 text-2xl font-medium'>{option?.answer_title}</p>
                      <div
                        className='absolute -top-3 -right-3 hidden rounded-md items-center justify-center cursor-pointer p-1 bg-[#134B7E] group-hover:flex'
                        onClick={() => {
                          const newValues = data?.reverse_word?.options?.filter(
                            (val: { id: string }) => val?.id != option?.id
                          );

                          setData({
                            ...data,
                            reverse_word: FORMAT_ANSWER_ID(3, newValues)
                          });
                        }}
                      >
                        <TooltipUi description={t('delete')}>
                          <Icon icon={TRASH_ICON} className='size-4 text-red-500' />
                        </TooltipUi>
                      </div>
                      <div
                        className='absolute -top-3 -left-3 hidden rounded-md items-center justify-center cursor-pointer p-1 bg-[#134B7E] group-hover:flex'
                        onClick={() => {
                          setIdSelected(option?.id);
                          setInputValue(option?.answer_title);
                          inputRef?.current?.focus();
                        }}
                      >
                        <TooltipUi description={t('edit')}>
                          <Icon icon={EDIT_ICON} className='size-4 text-white' />
                        </TooltipUi>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
