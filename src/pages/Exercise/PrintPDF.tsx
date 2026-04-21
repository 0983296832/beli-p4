import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@components/ui/button';
import Icon from '@components/Icon';
import { useT } from '@hooks/useT';
import { DOWNLOAD_ICON, LOGO } from '@lib/ImageHelper';
import { Switch } from '@components/ui/switch';
import TextInput from '@components/fields/TextInput';
import { QuestionsTypeOptions } from '@components/selects/QuestionsTypeSelect';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { removeInlineStyles } from '@lib/DomHelper';
import { getLetterByIndex } from '@lib/StringHelper';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronLeft } from 'lucide-react';
import exerciseServices from '../../services/exercise';
import { convertTimestampToString, getCurrentTimestamp } from '@lib/TimeHelper';
import { getSubjectInfo } from '@lib/GetInfoHelper';

interface Props {
  data: any;
  setState: React.Dispatch<React.SetStateAction<'default' | 'assign_task' | 'print'>>;
}

const PrintPDF = (props: Props) => {
  const { t } = useT();
  const { data, setState } = props;
  const divRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [htmlContent, setHtmlContent] = useState('');

  const getExercisePrint = async () => {
    setLoading(false);
    try {
      const response: any = await exerciseServices.getExercisePrint(Number(data?.id), {
        classroom_name: '.........................',
        exam_name: data?.exercise_name,
        date: convertTimestampToString(getCurrentTimestamp())
      });
      setHtmlContent(response);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!htmlContent) return;

    // tạo div tạm ẩn để html2pdf render
    const tempDiv = document.createElement('div');

    tempDiv.innerHTML = htmlContent;

    document.body.appendChild(tempDiv);

    // cấu hình html2pdf
    const opt = {
      margin: 10,
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // xuất PDF
    html2pdf()
      .set(opt)
      .from(tempDiv)
      .save()
      .finally(() => {
        document.body.removeChild(tempDiv); // xóa div tạm
      });
  };

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent); // ghi HTML + CSS vào iframe
        doc.close();
      }
    }
  }, [htmlContent]);

  useEffect(() => {
    getExercisePrint();
  }, []);

  return (
    <div className='no-padding-container'>
      <div className='px-10 py-6 bg-white border-y flex items-center'>
        <Button
          variant={'outline'}
          className='size-10 p-0 mr-5'
          onClick={() => {
            setState('default');
          }}
        >
          <ChevronLeft width={36} height={36} />
        </Button>
        <div className='flex-1 pl-5 border-l'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-5  '>
              <div className=''>
                <p className='text-lg font-semibold mb-2'>
                  {' '}
                  {data?.exercise_code} - {data?.exercise_name}
                </p>
                <div className='flex items-center gap-4 text-sm'>
                  <p className={`text-primary-neutral-700 custom_marker`}>
                    {' '}
                    {getSubjectInfo(data?.subject_id)?.subject_code} - {getSubjectInfo(data?.subject_id)?.subject_name}
                  </p>
                  <p className='text-primary-neutral-700 custom_marker'>
                    {' '}
                    {data?.learning_program?.learning_program_code} - {data?.learning_program?.learning_program_name}
                  </p>
                </div>
              </div>
            </div>
            <Button
              className='px-6'
              onClick={() => {
                handleDownload();
              }}
            >
              <Icon icon={DOWNLOAD_ICON} className='size-4 text-primary-neutral-50' />
              <p>
                {t('print')} - {t('download')}
              </p>
            </Button>
          </div>
          {/* <div className='flex items-center gap-4 mt-5'>
            <div className='flex items-center gap-3'>
              <p className='text-sm font-semibold'>{t('shuffle_answers')}</p>
              <Switch />
            </div>
            <div className='flex items-center gap-3'>
              <p className='text-sm font-semibold'>{t('shuffle_questions')}</p>
              <Switch />
            </div>
            <div className='flex items-center gap-3'>
              <p className='text-sm font-semibold'>{t('show_answers_at_end')}</p>
              <Switch />
            </div>
          </div> */}
        </div>
      </div>
      <div className='w-[1070px] mx-auto my-6 h-max rounded-lg'>
        <iframe
          ref={iframeRef}
          style={{
            width: '100%',
            height: '1000px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '8px',
            backgroundColor: 'white'
          }}
          title='HTML Renderer'
        />
      </div>
    </div>
  );
};

export default PrintPDF;
