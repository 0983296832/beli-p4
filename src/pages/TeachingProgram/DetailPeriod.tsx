import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import Loading from '@components/loading';
import teachingProgramServices from '@services/teachingProgram';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog';
import { CustomModal } from '@components/modal/CustomModal';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  id: number;
}

const DetailPeriod = ({ show, setShow, id }: Props) => {
  const { permissions, currentUser } = useRootStore();
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'vi');
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { t } = useT();
  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'teaching_program_id,lesson_number,lesson_name,lesson_content,youtube_link,drive_link,tiktok_link,english_lesson_content,manual_code,images'
    };
    try {
      const { data }: any = await teachingProgramServices.getTeachingProgramDetail(Number(id), params);
      setDetail(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    id && show && getDetail();
  }, [show]);

  useEffect(() => {
    setCurrentLanguage(localStorage.getItem('language') || 'vi');
  }, [localStorage.getItem('language')]);

  return (
    <CustomModal
      isOpen={show}
      title={t('detailed_info')}
      onClose={() => setShow(false)}
      className='rounded-lg border-none gap-0 p-0 max-w-[70%] overflow-hidden bg-white'
      headerClassName='border-b text-neutral-50 bg-primary-blue-500 mb-6 text-white'
    >
      <Loading loading={loading} />
      <div className=' bg-white max-h-[calc(100vh-200px)] overflow-y-auto'>
        <div className='border rounded-lg p-6'>
          <div className='grid grid-cols-[300px_30px_1fr] mb-3'>
            <div className='text-primary-neutral-600'>{t('lesson_title')}</div>
            <div className='text-primary-neutral-600'>:</div>
            <div className=''>{detail?.lesson_name}</div>
          </div>
          {currentUser?.user_job_title != USER_ROLE.STUDENT && (
            <div className='grid grid-cols-[300px_30px_1fr] mb-3'>
              <div className='text-primary-neutral-600'>{t('lesson_content_google_driver_link')}</div>
              <div className='text-primary-neutral-600'>:</div>

              <a href={detail?.drive_link} target='_blank' className='underline text-primary-blue-500 break-all'>
                {detail?.drive_link}
              </a>
            </div>
          )}

          <div className='grid grid-cols-[300px_30px_1fr] mb-3'>
            <div className='text-primary-neutral-600'>{t('lesson_content_youtube_link')}</div>
            <div className='text-primary-neutral-600'>:</div>
            <a href={detail?.youtube_link} target='_blank' className='underline text-primary-blue-500 break-all'>
              {detail?.youtube_link}
            </a>
          </div>
          <div className='grid grid-cols-[300px_30px_1fr] mb-3'>
            <div className='text-primary-neutral-600'>{t('lesson_content_tiktok_link')}</div>
            <div className='text-primary-neutral-600'>:</div>
            <a href={detail?.tiktok_link} target='_blank' className='underline text-primary-blue-500 break-all'>
              {detail?.tiktok_link}
            </a>
          </div>
          <div className='grid grid-cols-[300px_30px_1fr] mb-3'>
            <div className='text-primary-neutral-600'>{t('lesson_content')}</div>
            <div className='text-primary-neutral-600'>:</div>
            <div
              className=''
              dangerouslySetInnerHTML={{
                __html: replaceNewlineWithBr(
                  currentLanguage == 'en' ? detail?.english_lesson_content : detail?.lesson_content
                )
              }}
            />
          </div>
          <div className='grid grid-cols-[300px_30px_1fr]'>
            <div className='text-primary-neutral-600'>{t('lesson_photo')}</div>
            <div className='text-primary-neutral-600'>:</div>

            <div className='flex items-center gap-[10px] flex-wrap'>
              {detail?.images?.map((file: any, index: any) => {
                return (
                  <div key={index} className=''>
                    <PhotoProvider className='z-[999999]' portalContainer={document.body}>
                      <PhotoView src={file?.image_url}>
                        <img src={file?.image_url} alt='' className={'size-24 min-w-24 rounded-[10px] object-cover'} />
                      </PhotoView>
                    </PhotoProvider>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='mt-6 flex items-center justify-end'>
          <Button onClick={() => setShow(false)}>{t('close')}</Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default DetailPeriod;
