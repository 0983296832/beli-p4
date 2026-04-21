import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@components/ui/button';
import TextInput from '@components/fields/TextInput';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import NumberInput from '@components/fields/NumberInput';
import TextAreaInput from '@components/fields/TextAreaInput';
import { CAMERA, NO_IMAGE } from '@lib/ImageHelper';
import Upload, { UploadTrigger } from '@components/upload';
import { Toast } from '@components/toast';
import curriculumServices from '@services/curriculum';
import { cloneDeep } from 'lodash';
import Loading from '@components/loading';

const CurriculumEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields: 'identity,learning_program_name,description,subject_id,avatar'
    };
    try {
      const res: any = await curriculumServices.getCurriculum(Number(id), params);
      setFormData(res?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number(id)) {
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
      if (Number(id)) {
        const body = cloneDeep(formData);
        delete body.id;
        delete body.valid;
        const res: any = await curriculumServices.putCurriculum(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/curriculum/list');
      } else {
        const body = cloneDeep(formData);

        const res: any = await curriculumServices.postCurriculum(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/curriculum/list');
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };
  return (
    <div className='shadow-lg card bg-primary-neutral-50 '>
      <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
        <h3 className='text-base font-semibold leading-[100%]'>
          {t(Number(id) ? 'edit_curriculum' : 'add_new_curriculum')}
        </h3>
      </div>
      <Loading loading={loading} />
      <div className='p-6 card-body space-y-6'>
        <div className=' border border-primary-neutral-200 card flex-1'>
          <div className='relative w-[206px] h-[186px] border border-primary-neutral-300 rounded-lg flex justify-center items-center m-6 mb-0'>
            <img
              src={formData?.avatar || NO_IMAGE}
              alt='No Image'
              className={`absolute object-cover w-full h-full p-3 ${!formData?.avatar && 'opacity-50'} `}
            />
            <Upload
              className='mb-5'
              value={[]}
              isSingle
              maxFiles={1}
              onChange={(files) => {
                setFormData({ ...formData, avatar: files?.[0].url });
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
          <div className='p-6 card-body '>
            <div className='grid grid-cols-2 gap-x-9 gap-y-4'>
              <TextInput
                required
                label={t('curriculum_name')}
                placeholder={t('enter_curriculum_name')}
                value={formData.learning_program_name}
                error={errors?.learning_program_name}
                className='w-full'
                onChange={(val) => handleChange('learning_program_name', val)}
              />

              <SubjectsSelect
                required
                label={t('subject')}
                value={formData.subject_id}
                error={errors?.subject_id}
                className='w-full'
                onChange={(val) => handleChange('subject_id', val?.id)}
              />
            </div>
            <div className='mt-4'>
              <TextAreaInput
                label={t('introduce_curriculum')}
                rows={7}
                value={formData.description}
                error={errors?.description}
                className='w-full'
                onChange={(val) => handleChange('description', val)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-center gap-6 mb-6'>
        <Button
          variant='default'
          className='w-[140px] bg-primary-error hover:bg-primary-error/80'
          onClick={() => {
            navigate('/teaching-program/list');
          }}
        >
          {t('cancel')}
        </Button>

        <Button variant='default' className='w-[140px]' onClick={onUpdate} disabled={loading}>
          {t(id ? 'update' : 'create')}
        </Button>
      </div>
    </div>
  );
};

export default CurriculumEdit;
