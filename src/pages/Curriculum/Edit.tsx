import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@components/ui/button';
import TextInput from '@components/fields/TextInput';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TextAreaInput from '@components/fields/TextAreaInput';
import { NO_IMAGE } from '@lib/ImageHelper';
import Upload, { UploadTrigger } from '@components/upload';
import { Toast } from '@components/toast';
import curriculumServices from '@services/curriculum';
import { cloneDeep } from 'lodash';
import Loading from '@components/loading';
import { RiArrowLeftLine, RiBookOpenLine, RiCameraLine, RiFileTextLine } from '@remixicon/react';

const CurriculumEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!Number(id);

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
    <div>
      <Loading loading={loading} />
      <div className='mx-auto w-full max-w-6xl pb-24'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>
                  {isEdit ? t('edit_curriculum') : t('add_new_curriculum')}
                </p>
                <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                  {formData?.learning_program_name || t('curriculum_name')}
                </h3>
              </div>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-100'
                onClick={() => {
                  navigate('/curriculum/list');
                }}
              >
                <RiArrowLeftLine className='size-4' />
                {t('back')}
              </Button>
            </div>
          </div>

          <div className='p-5 lg:p-6'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
              <aside className='w-full shrink-0 lg:w-72'>
                <div className='rounded-2xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm'>
                  <div className='relative overflow-hidden rounded-xl border border-white bg-white shadow-inner'>
                    <img
                      src={formData?.avatar || NO_IMAGE}
                      alt='No Image'
                      className={`aspect-square w-full object-cover ${!formData?.avatar ? 'opacity-50' : ''}`}
                    />
                    <Upload
                      value={[]}
                      isSingle
                      maxFiles={1}
                      onChange={(files) => {
                        setFormData({ ...formData, avatar: files?.[0].url });
                      }}
                      accept={{ 'image/*': [] }}
                    >
                      <UploadTrigger>
                        <div className='absolute bottom-3 right-3 inline-flex size-10 items-center justify-center rounded-full border border-violet-200 bg-white/95 text-violet-700 shadow-sm transition-colors hover:bg-violet-50'>
                          <RiCameraLine className='size-4' />
                        </div>
                      </UploadTrigger>
                    </Upload>
                  </div>
                  <p className='mt-3 text-center text-xs text-slate-500'>{t('avatar')}</p>
                </div>
              </aside>

              <div className='min-w-0 flex-1 space-y-4'>
                <section className='rounded-2xl border border-violet-200 bg-white'>
                  <div className='flex items-center gap-2 border-b border-violet-100 bg-violet-50/80 px-4 py-3'>
                    <RiBookOpenLine className='size-5 text-violet-600' />
                    <h2 className='text-sm font-semibold text-violet-900'>{t('curriculum_info')}</h2>
                  </div>
                  <div className='space-y-4 p-4 lg:p-5'>
                    <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
                      <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-3'>
                        <TextInput
                          required
                          label={t('curriculum_name')}
                          placeholder={t('enter_curriculum_name')}
                          value={formData.learning_program_name}
                          error={errors?.learning_program_name}
                          className='w-full'
                          onChange={(val) => handleChange('learning_program_name', val)}
                        />
                      </div>
                      <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
                        <SubjectsSelect
                          required
                          label={t('subject')}
                          value={formData.subject_id}
                          error={errors?.subject_id}
                          className='w-full'
                          onChange={(val) => handleChange('subject_id', val?.id)}
                        />
                      </div>
                    </div>
                    <div className='rounded-2xl border border-rose-200 bg-rose-50/30 p-4'>
                      <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-rose-900'>
                        <RiFileTextLine className='size-4' />
                        {t('introduce_curriculum')}
                      </div>
                      <TextAreaInput
                        rows={7}
                        value={formData.description}
                        error={errors?.description}
                        className='w-full'
                        onChange={(val) => handleChange('description', val)}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/95 px-4 py-2 shadow-[0_-6px_14px_-12px_rgba(15,23,42,0.25)]'>
          <div className='mx-auto flex w-full max-w-6xl justify-center gap-4'>
            <Button
              variant='outline'
              type='button'
              className='min-w-[140px] rounded-xl border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
              onClick={() => {
                navigate('/curriculum/list');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant='default'
              type='button'
              className='min-w-[160px] rounded-xl bg-emerald-500 text-white hover:bg-emerald-600'
              onClick={onUpdate}
              disabled={loading}
            >
              {id ? t('update') : t('create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumEdit;
