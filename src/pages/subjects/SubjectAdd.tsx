import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import TextInput from '@components/fields/TextInput';
import { Button } from '@components/ui/button';
import { CAMERA, NO_IMAGE } from '@lib/ImageHelper';
import { useNavigate, useParams } from 'react-router-dom';
import TextAreaInput from '@components/fields/TextAreaInput';

import subjectServices from '@services/subject';
import { Toast } from '@components/toast';
import Upload, { UploadTrigger } from '@components/upload/index';
import Loading from '@components/loading';
import _ from 'lodash';
import { useRootStore } from '@store/index';

interface Props {}

const SubjectAdd = (props: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const { syncSubjectStore } = useRootStore();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [managerStatistic, setManagerStatistic] = useState<any>({});

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields: 'subject_name,subject_avatar,subject_code,description'
    };
    try {
      const { data }: any = await subjectServices.getSubject(Number(id), params);
      setFormData({
        subject_avatar: data?.subject_avatar,
        subject_code: data?.subject_code,
        subject_name: data?.subject_name,
        description: data?.description
      });
      setManagerStatistic(data?.manager_statistic);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getDetail();
    }
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    setErrors({ ...errors, [field]: '' });
  };

  const onUpdate = async () => {
    setLoading(true);
    try {
      if (id) {
        const body = _.cloneDeep(formData);
        delete body.subject_code;
        const res: any = await subjectServices.putSubject(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/subjects/list');
      } else {
        const body = _.cloneDeep(formData);
        delete body.subject_code;
        const res: any = await subjectServices.postSubject(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/subjects/list');
        syncSubjectStore();
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };
  return (
    <div>
      <Loading loading={loading} />
      <div className='w-full shadow-lg card bg-primary-neutral-50'>
        <div className=' text-neutral-50 bg-primary-blue-500 card-header'>
          <h3 className='text-base font-semibold leading-[100%]'>
            {id ? t('edit_subject_info') : t('add_new_subject')}
          </h3>
        </div>
        <div className='p-6 card-body'>
          <div className='flex gap-9'>
            <div className='relative w-[254px] h-[270px] border border-primary-neutral-300 rounded-lg flex justify-center items-center'>
              <img
                src={formData?.subject_avatar || NO_IMAGE}
                alt='No Image'
                className={`absolute object-cover w-full h-full p-3 ${!formData?.subject_avatar && 'opacity-50'} `}
              />
              <Upload
                className='mb-5'
                value={[]}
                isSingle
                maxFiles={1}
                onChange={(files) => {
                  setFormData({ ...formData, subject_avatar: files?.[0].url });
                }}
                accept={{ 'image/*': [] }}
              >
                <UploadTrigger>
                  <div className='absolute flex items-center justify-center p-1 rounded-full bg-primary-neutral-50 bottom-1 right-1 size-12'>
                    <img src={CAMERA} alt='No Image' className='absolute object-cover opacity-50 size-5' />
                  </div>
                </UploadTrigger>
              </Upload>
            </div>
            <div className='flex-1 space-y-6'>
              <div className='w-full border rounded-lg border-primary-neutral-300 card'>
                <div className='border-b text-primary-blue-600 border-primary-neutral-300 card-header'>
                  <h3 className='text-base font-semibold leading-[100%]'>{t('subject_info')}</h3>
                </div>
                <div className='p-6 card-body'>
                  <div className='grid grid-cols-2 mb-4 gap-x-9 gap-y-4'>
                    <div className={`${!Number(id) && 'col-span-2'}`}>
                      <TextInput
                        label={t('subject_name')}
                        required
                        value={formData.subject_name}
                        error={errors?.subject_name}
                        className={`w-full`}
                        onChange={(value) => {
                          handleChange('subject_name', value);
                        }}
                      />
                    </div>

                    {id && (
                      <div>
                        <TextInput label={t('code')} className='w-full' disabled value={formData?.subject_code} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='w-full border rounded-lg border-primary-neutral-300 card'>
                <div className='border-b text-primary-blue-600 border-primary-neutral-300 card-header'>
                  <h3 className='text-base font-semibold leading-[100%]'>{t('description')}</h3>
                </div>
                <div className='p-6 card-body'>
                  <TextAreaInput
                    className='border-primary-neutral-200'
                    placeholder={t('enter_description')}
                    rows={6}
                    value={formData.description}
                    error={errors?.description}
                    onChange={(val) => handleChange('description', val)}
                  />
                </div>
              </div>
            </div>
          </div>
          {id && (
            <div className='flex justify-center gap-6 mt-6'>
              <Button
                variant='default'
                type='submit'
                className='px-14 bg-primary-error'
                onClick={() => {
                  navigate('/subjects/list');
                }}
              >
                {t('cancel')}
              </Button>
              <Button variant='default' type='submit' className='px-14' onClick={onUpdate} disabled={loading}>
                {t('update')}
              </Button>
            </div>
          )}
        </div>
      </div>
      {!id && (
        <div className='flex justify-center gap-6 mt-12'>
          <Button
            variant='default'
            type='submit'
            className='px-14 bg-primary-error'
            onClick={() => {
              navigate('/subjects/list');
            }}
          >
            {t('cancel')}
          </Button>
          <Button variant='default' type='submit' className='px-14' onClick={onUpdate} disabled={loading}>
            {t('create')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubjectAdd;
