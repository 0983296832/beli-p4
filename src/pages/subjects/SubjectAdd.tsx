import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import TextInput from '@components/fields/TextInput';
import { Button } from '@components/ui/button';
import { NO_IMAGE } from '@lib/ImageHelper';
import { useNavigate, useParams } from 'react-router-dom';
import TextAreaInput from '@components/fields/TextAreaInput';

import subjectServices from '@services/subject';
import { Toast } from '@components/toast';
import Upload, { UploadTrigger } from '@components/upload';
import Loading from '@components/loading';
import _ from 'lodash';
import { useRootStore } from '@store/index';
import { RiArrowLeftLine, RiBookOpenLine, RiCameraLine } from '@remixicon/react';

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
  const isEdit = !!id;

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
      <div className='mx-auto w-full max-w-6xl pb-24'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>
                  {isEdit ? t('edit_subject_info') : t('add_new_subject')}
                </p>
                <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                  {formData?.subject_name || t('subject_name')}
                </h3>
                <p className='mt-0.5 text-sm text-slate-600'>{isEdit ? formData?.subject_code : t('subject_info')}</p>
              </div>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-100'
                onClick={() => {
                  navigate('/subjects/list');
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
                      src={formData?.subject_avatar || NO_IMAGE}
                      alt='No Image'
                      className={`aspect-square w-full object-cover ${!formData?.subject_avatar ? 'opacity-50' : ''}`}
                    />
                    <Upload
                      value={[]}
                      isSingle
                      maxFiles={1}
                      onChange={(files) => {
                        setFormData({ ...formData, subject_avatar: files?.[0].url });
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
                    <h2 className='text-sm font-semibold text-violet-900'>{t('subject_info')}</h2>
                  </div>
                  <div className='p-4 lg:p-5'>
                    <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
                      <div className={`rounded-xl border border-violet-100 bg-violet-50/40 p-3 ${!isEdit ? 'lg:col-span-2' : ''}`}>
                        <TextInput
                          label={t('subject_name')}
                          required
                          value={formData.subject_name}
                          error={errors?.subject_name}
                          className='w-full'
                          onChange={(value) => {
                            handleChange('subject_name', value);
                          }}
                        />
                      </div>
                      {isEdit && (
                        <div className='rounded-xl border border-slate-200 bg-slate-50/70 p-3'>
                          <TextInput label={t('code')} className='w-full' disabled value={formData?.subject_code} />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className='rounded-2xl border border-rose-200 bg-rose-50/30'>
                  <div className='flex items-center gap-2 border-b border-rose-100 bg-rose-50/80 px-4 py-3'>
                    <h2 className='text-sm font-semibold text-rose-900'>{t('description')}</h2>
                  </div>
                  <div className='p-4 lg:p-5'>
                    <TextAreaInput
                      placeholder={t('enter_description')}
                      rows={6}
                      value={formData.description}
                      error={errors?.description}
                      onChange={(val) => handleChange('description', val)}
                    />
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
                navigate('/subjects/list');
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
              {isEdit ? t('update') : t('create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectAdd;
