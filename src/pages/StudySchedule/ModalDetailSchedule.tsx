import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import { convertTimestampToString, getCurrentTimestamp } from '@lib/TimeHelper';
import Loading from '@components/loading';
import scheduleServices from '@services/schedule';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { useRootStore } from '@store/index';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import { USER_ROLE } from '@constants/index';
import { CustomModal } from '@components/modal/CustomModal';
import { PhotoProvider, PhotoView } from 'react-photo-view';

interface Props {
  id: number;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalDetailSchedule = ({ id, show, setShow }: Props) => {
  const { currentUser } = useRootStore();
  const { t } = useT();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'vi');

  const getData = async () => {
    setLoading(true);
    let params = {
      fields:
        'identity,teaching_program_id,r_classroom,students,count_total_lessons,day_of_week,classroom_id,type,classroom_schedule_id,cover_schedule_id,teaching_program_detail_number,teaching_program_detail,date,start_time,end_time,status,user_ability,created_at,updated_at'
    };
    try {
      const { data }: any = await scheduleServices.getSchedule(id, params);
      setDetail(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && id) {
      getData();
    }
  }, [show]);

  useEffect(() => {
    setCurrentLanguage(localStorage.getItem('language') || 'vi');
  }, [localStorage.getItem('language')]);

  return (
    // <Dialog open={show} onOpenChange={setShow}>
    //   <DialogContent
    //     className='rounded-lg border-none gap-0 p-0 max-w-[1200px] overflow-hidden bg-white'
    //     showCloseButton={false}
    //   >
    //     <DialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
    //       <div>{t('detail_schedule')}</div>
    //     </DialogHeader>
    //     <Loading loading={loading} />
    //     <div className='p-6 space-y-4 bg-white max-h-[calc(100vh-250px)] overflow-y-auto'>
    //       <div className='grid grid-cols-[320px_30px_1fr]'>
    //         <div className='text-primary-neutral-600'>{t('subject_name')}</div>
    //         <div className='text-primary-neutral-600'>:</div>
    //         <div className=''>{getSubjectInfo(detail?.r_classroom?.subject_id)?.subject_name}</div>
    //       </div>
    //       {currentUser?.user_job_title !== USER_ROLE?.STUDENT && (
    //         <>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('period_order')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <div className=''>
    //               {' '}
    //               {detail?.teaching_program_detail_number}/{detail?.count_total_lessons}
    //             </div>
    //           </div>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('start_time')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <div className=''>
    //               {detail?.start_time} {convertTimestampToString(detail?.date)}
    //             </div>
    //           </div>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('end_time')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <div className=''>
    //               {detail?.end_time} {convertTimestampToString(detail?.date)}
    //             </div>
    //           </div>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('location')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <div className=''>{getLocationInfo(detail?.r_classroom?.location_id)?.location_name}</div>
    //           </div>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('classroom')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <div className=''>{getClassroomInfo(detail?.classroom_id)?.classroom_name}</div>
    //           </div>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('teachers')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <div className=''>
    //               {getUserInfo(detail?.r_classroom?.teacher_id)?.display_name} -{' '}
    //               {getUserInfo(detail?.r_classroom?.teacher_id)?.username}
    //             </div>
    //           </div>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('teaching_assistant')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <div className=''>
    //               {getUserInfo(detail?.r_classroom?.ta_id)?.display_name} -{' '}
    //               {getUserInfo(detail?.r_classroom?.ta_id)?.username}
    //             </div>
    //           </div>
    //         </>
    //       )}

    //       <div className='grid grid-cols-[320px_30px_1fr]'>
    //         <div className='text-primary-neutral-600'>{t('lesson_title')}</div>
    //         <div className='text-primary-neutral-600'>:</div>
    //         <div className=''>{detail?.teaching_program_detail?.lesson_name}</div>
    //       </div>
    //       <div className='grid grid-cols-[320px_30px_1fr]'>
    //         <div className='text-primary-neutral-600'>{t('lesson_content_youtube')}</div>
    //         <div className='text-primary-neutral-600'>:</div>
    //         <a
    //           className='underline text-primary-blue-600'
    //           href={detail?.teaching_program_detail?.youtube_link}
    //           target='_blank'
    //         >
    //           {detail?.teaching_program_detail?.youtube_link}
    //         </a>
    //       </div>
    //       {currentUser?.user_job_title !== USER_ROLE?.ADMIN && (
    //         <>
    //           <div className='grid grid-cols-[320px_30px_1fr]'>
    //             <div className='text-primary-neutral-600'>{t('lesson_content_drive')}</div>
    //             <div className='text-primary-neutral-600'>:</div>
    //             <a
    //               className='underline text-primary-blue-600'
    //               href={detail?.teaching_program_detail?.drive_link}
    //               target='_blank'
    //             >
    //               {detail?.teaching_program_detail?.drive_link}
    //             </a>
    //           </div>
    //         </>
    //       )}

    //       <div className='grid grid-cols-[320px_30px_1fr]'>
    //         <div className='text-primary-neutral-600'>{t('lesson_content_tiktok')}</div>
    //         <div className='text-primary-neutral-600'>:</div>
    //         <a
    //           className='underline text-primary-blue-600'
    //           href={detail?.teaching_program_detail?.tiktok_link}
    //           target='_blank'
    //         >
    //           {detail?.teaching_program_detail?.tiktok_link}
    //         </a>
    //       </div>

    //       <div className='grid grid-cols-[320px_30px_1fr]'>
    //         <div className='text-primary-neutral-600'>{t('lesson_content')}</div>
    //         <div className='text-primary-neutral-600'>:</div>
    //         <div
    //           className=''
    //           dangerouslySetInnerHTML={{
    //             __html: replaceNewlineWithBr(
    //               currentLanguage == 'en'
    //                 ? detail?.teaching_program_detail?.english_lesson_content
    //                 : detail?.teaching_program_detail?.lesson_content
    //             )
    //           }}
    //         />
    //       </div>
    //     </div>
    //     <div className='flex items-center justify-end p-3'>
    //       <Button
    //         variant='default'
    //         className='px-8'
    //         onClick={() => {
    //           setShow(false);
    //         }}
    //       >
    //         {t('close')}
    //       </Button>
    //     </div>
    //   </DialogContent>
    // </Dialog>
    <CustomModal
      isOpen={show}
      title={t('detailed_info')}
      onClose={() => setShow(false)}
      className='rounded-lg border-none gap-0 p-0 max-w-[70%] overflow-hidden bg-white'
      headerClassName='border-b text-neutral-50 bg-primary-blue-500 mb-6 text-white'
    >
      <Loading loading={loading} />
      <div className='p-6 space-y-4 bg-white max-h-[calc(100vh-250px)] overflow-y-auto'>
        <div className='grid grid-cols-[320px_30px_1fr]'>
          <div className='text-primary-neutral-600'>{t('subject_name')}</div>
          <div className='text-primary-neutral-600'>:</div>
          <div className=''>{getSubjectInfo(detail?.r_classroom?.subject_id)?.subject_name}</div>
        </div>
        {currentUser?.user_job_title !== USER_ROLE?.STUDENT && (
          <>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('period_order')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {' '}
                {detail?.teaching_program_detail_number}/{detail?.count_total_lessons}
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('start_time')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {detail?.start_time} {convertTimestampToString(detail?.date)}
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('end_time')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {detail?.end_time} {convertTimestampToString(detail?.date)}
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('location')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>{getLocationInfo(detail?.r_classroom?.location_id)?.location_name}</div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('classroom')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>{getClassroomInfo(detail?.classroom_id)?.classroom_name}</div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('teachers')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {getUserInfo(detail?.r_classroom?.teacher_id)?.display_name} -{' '}
                {getUserInfo(detail?.r_classroom?.teacher_id)?.username}
              </div>
            </div>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('teaching_assistant')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <div className=''>
                {getUserInfo(detail?.r_classroom?.ta_id)?.display_name} -{' '}
                {getUserInfo(detail?.r_classroom?.ta_id)?.username}
              </div>
            </div>
          </>
        )}

        <div className='grid grid-cols-[320px_30px_1fr]'>
          <div className='text-primary-neutral-600'>{t('lesson_title')}</div>
          <div className='text-primary-neutral-600'>:</div>
          <div className=''>{detail?.teaching_program_detail?.lesson_name}</div>
        </div>
        <div className='grid grid-cols-[320px_30px_1fr]'>
          <div className='text-primary-neutral-600'>{t('lesson_content_youtube')}</div>
          <div className='text-primary-neutral-600'>:</div>
          <a
            className='underline text-primary-blue-600'
            href={detail?.teaching_program_detail?.youtube_link}
            target='_blank'
          >
            {detail?.teaching_program_detail?.youtube_link}
          </a>
        </div>
        {currentUser?.user_job_title !== USER_ROLE?.ADMIN && (
          <>
            <div className='grid grid-cols-[320px_30px_1fr]'>
              <div className='text-primary-neutral-600'>{t('lesson_content_drive')}</div>
              <div className='text-primary-neutral-600'>:</div>
              <a
                className='underline text-primary-blue-600'
                href={detail?.teaching_program_detail?.drive_link}
                target='_blank'
              >
                {detail?.teaching_program_detail?.drive_link}
              </a>
            </div>
          </>
        )}

        <div className='grid grid-cols-[320px_30px_1fr]'>
          <div className='text-primary-neutral-600'>{t('lesson_content_tiktok')}</div>
          <div className='text-primary-neutral-600'>:</div>
          <a
            className='underline text-primary-blue-600'
            href={detail?.teaching_program_detail?.tiktok_link}
            target='_blank'
          >
            {detail?.teaching_program_detail?.tiktok_link}
          </a>
        </div>

        <div className='grid grid-cols-[320px_30px_1fr]'>
          <div className='text-primary-neutral-600'>{t('lesson_content')}</div>
          <div className='text-primary-neutral-600'>:</div>
          <div
            className=''
            dangerouslySetInnerHTML={{
              __html: replaceNewlineWithBr(
                currentLanguage == 'en'
                  ? detail?.teaching_program_detail?.english_lesson_content
                  : detail?.teaching_program_detail?.lesson_content
              )
            }}
          />
        </div>
        <div className='grid grid-cols-[320px_30px_1fr]'>
          <div className='text-primary-neutral-600'>{t('lesson_photo')}</div>
          <div className='text-primary-neutral-600'>:</div>

          <div className='flex items-center gap-[10px] flex-wrap'>
            {detail?.teaching_program_detail?.images?.map((file: any, index: any) => {
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
      <div className='flex items-center justify-end p-3'>
        <Button
          variant='default'
          className='px-8'
          onClick={() => {
            setShow(false);
          }}
        >
          {t('close')}
        </Button>
      </div>
    </CustomModal>
  );
};

export default ModalDetailSchedule;
