import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import CLOSE_CIRCLE_WHITE from '@assets/images/close-circle-white.svg';
import TextAreaInput from '@components/fields/TextAreaInput';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import Loading from '@components/loading';
import { TypeErrors } from '@/src/interface';
import TextInput from '@components/fields/TextInput';
import { cloneDeep } from 'lodash';
import teachingProgramServices from '@services/teachingProgram';
import { Toast } from '@components/toast';
import Upload, { UploadPreview, UploadTrigger } from '@components/upload';
import { UploadIcon } from 'lucide-react';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  id?: number;
  periodsNumber?: number;
  teachingProgramId?: number;
  getData: () => Promise<void>;
}

const EditPeriod = ({ show, setShow, id, periodsNumber: lesson_number, getData, teachingProgramId }: Props) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<TypeErrors>({});
  const [loading, setLoading] = useState(false);
  const { t } = useT();
  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'teaching_program_id,lesson_number,lesson_name,lesson_content,youtube_link,drive_link,tiktok_link,manual_code,english_lesson_content,images'
    };
    try {
      const { data }: any = await teachingProgramServices.getTeachingProgramDetail(Number(id), params);
      setFormData({ ...data, images: data?.images?.map((image: any) => ({ ...image, url: image?.image_url })) });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    if (formData.images?.length > 5) {
      return Toast('warning', t('max_upload_images', { num: 5 }));
    }
    setLoading(true);
    try {
      if (Number(id)) {
        const body = cloneDeep(formData);
        delete body.id;
        delete body.creator_id;
        delete body.teaching_program_detail_code;
        body.images = body?.images?.map(({ id, name, url }: any) => ({ id, name, image_url: url }));
        const res: any = await teachingProgramServices.putTeachingProgramDetail(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        setShow(false);
        getData();
        setFormData({});
      } else {
        const body = cloneDeep(formData);
        body.teaching_program_id = teachingProgramId;
        body.lesson_number = lesson_number;
        body.images = body?.images?.map(({ id, name, url }: any) => ({ id, name, image_url: url }));
        const res: any = await teachingProgramServices.postTeachingProgramDetail(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        setShow(false);
        getData();
        setFormData({});
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  useEffect(() => {
    id && show && getDetail();
  }, [show]);

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent className='rounded-lg border-none gap-0 p-0 max-w-[70%] overflow-hidden bg-transparent shadow-none'>
        <AlertDialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
          <div>{t(id ? 'add_lesson_content' : 'edit_lesson_content')}</div>
        </AlertDialogHeader>
        <Loading loading={loading} />
        <div className='p-6 bg-white'>
          <div className='border rounded-lg p-6'>
            <div className='grid grid-cols-2 gap-x-9 gap-y-4'>
              <TextInput
                label={t('lesson_title')}
                value={formData?.lesson_name}
                error={errors?.lesson_name}
                className='mb-4'
                onChange={(value) => {
                  setFormData({ ...formData, lesson_name: value });
                  setErrors({ ...errors, lesson_name: '' });
                }}
              />
              <TextInput
                label={t('lesson_code')}
                value={formData?.manual_code}
                error={errors?.manual_code}
                className='mb-4'
                onChange={(value) => {
                  setFormData({ ...formData, manual_code: value });
                  setErrors({ ...errors, manual_code: '' });
                }}
              />
            </div>
            <div className='grid grid-cols-2 gap-x-9 gap-y-4'>
              <TextAreaInput
                label={t('lesson_content')}
                value={formData?.lesson_content}
                error={errors?.lesson_content}
                rows={5}
                className='mb-4'
                onChange={(value) => {
                  setFormData({ ...formData, lesson_content: value });
                  setErrors({ ...errors, lesson_content: '' });
                }}
              />
              <TextAreaInput
                label={t('lesson_content_in_english')}
                value={formData?.english_lesson_content}
                error={errors?.english_lesson_content}
                rows={5}
                className='mb-4'
                onChange={(value) => {
                  setFormData({ ...formData, english_lesson_content: value });
                  setErrors({ ...errors, english_lesson_content: '' });
                }}
              />
            </div>
            <div className='grid grid-cols-2 gap-x-9 gap-y-4'>
              <TextInput
                label={t('lesson_content_youtube')}
                value={formData?.youtube_link}
                error={errors?.youtube_link}
                className='mb-4'
                onChange={(value) => {
                  formData.youtube_link = value;
                  setFormData({ ...formData });
                  setErrors({ ...errors, youtube_link: '' });
                }}
              />
              <TextInput
                label={t('lesson_content_drive')}
                value={formData?.drive_link}
                error={errors?.drive_link}
                className='mb-4'
                onChange={(value) => {
                  formData.drive_link = value;
                  setFormData({ ...formData });
                  setErrors({ ...errors, drive_link: '' });
                }}
              />
              <TextInput
                label={t('lesson_content_tiktok_link')}
                value={formData?.tiktok_link}
                error={errors?.tiktok_link}
                className='mb-4'
                onChange={(value) => {
                  formData.tiktok_link = value;
                  setFormData({ ...formData });
                  setErrors({ ...errors, tiktok_link: '' });
                }}
              />
              <div>
                <Upload
                  accept={{ 'image/*': [] }}
                  maxFiles={5}
                  useService
                  disabled={formData?.images?.length >= 5}
                  value={formData?.images || []}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      images: value?.map(({ id, name, url }) => ({ id, name, url }))
                    });
                  }}
                >
                  <UploadTrigger>
                    <div className='flex items-center justify-between gap-2'>
                      <h3 className='truncate text-sm font-medium'>
                        {t('lesson_photo')} ({formData?.images?.length || 0})
                      </h3>
                      <Button variant='outline' size='sm' disabled={formData?.images?.length >= 5}>
                        <UploadIcon className='-ms-0.5 size-3.5 opacity-60' aria-hidden='true' />
                        {t('select_photo')}
                      </Button>
                    </div>
                  </UploadTrigger>
                  <UploadPreview
                    className='flex items-center gap-2 mt-4 justify-start flex-row'
                    fileClassName='size-24 min-w-24'
                  />
                  <p className='text-sm text-center text-primary-neutral-500 mt-2'>
                    {t('max_upload_images', { num: 5 })}
                  </p>
                </Upload>
              </div>
            </div>
          </div>
          <div className='mt-6 flex items-center justify-center gap-3'>
            <Button
              variant='default'
              className='w-[140px] bg-primary-error hover:bg-primary-error/80'
              onClick={() => {
                setShow(false);
                setFormData({});
                setErrors({});
              }}
            >
              {t('cancel')}
            </Button>

            <Button variant='default' className='w-[140px]' onClick={onUpdate} disabled={loading}>
              {t(id ? 'update' : 'create')}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditPeriod;
