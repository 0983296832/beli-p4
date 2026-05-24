import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@components/ui/button';
import TextInput from '@components/fields/TextInput';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import NumberInput from '@components/fields/NumberInput';
import teachingProgramServices from '@services/teachingProgram';
import { Toast } from '@components/toast';
import Loading from '@components/loading';
import { cloneDeep } from 'lodash';
import { RiArrowLeftLine, RiBook2Line } from '@remixicon/react';

const TeachingProgramEdit = () => {
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
      fields: 'program_name,program_code,subject_id,lesson_count'
    };
    try {
      const { data }: any = await teachingProgramServices.getTeachingProgram(Number(id), params);
      setFormData({
        program_name: data?.program_name,
        program_code: data?.program_code,
        subject_id: data?.subject_id,
        lesson_count: data?.lesson_count
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number(id)) {
      getDetail();
    }
  }, [Number(id)]);

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
        delete body.program_code;

        const res: any = await teachingProgramServices.putTeachingProgram(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/teaching-program/list');
      } else {
        const body = cloneDeep(formData);

        const res: any = await teachingProgramServices.postTeachingProgram(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/teaching-program/list');
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
                  {isEdit ? t('edit_teaching_program_details') : t('add_new_teaching_program')}
                </p>
                <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                  {formData?.program_name || t('program_name')}
                </h3>
              </div>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-100'
                onClick={() => {
                  navigate('/teaching-program/list');
                }}
              >
                <RiArrowLeftLine className='size-4' />
                {t('back')}
              </Button>
            </div>
          </div>

          <div className='p-5 lg:p-6'>
            <section className='rounded-2xl border border-violet-200 bg-white'>
              <div className='flex items-center gap-2 border-b border-violet-100 bg-violet-50/80 px-4 py-3'>
                <RiBook2Line className='size-5 text-violet-600' />
                <h2 className='text-sm font-semibold text-violet-900'>{t('teaching_program_info')}</h2>
              </div>
              <div className='space-y-4 p-4 lg:p-5'>
                <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
                  <div className={`rounded-xl border border-violet-100 bg-violet-50/40 p-3 ${!Number(id) ? 'lg:col-span-2' : ''}`}>
                    <TextInput
                      label={t('program_name')}
                      placeholder={t('enter_teaching_program')}
                      value={formData.program_name}
                      error={errors?.program_name}
                      className='w-full'
                      onChange={(val) => handleChange('program_name', val)}
                    />
                  </div>

                  {!!Number(id) && (
                    <div className='rounded-xl border border-slate-200 bg-slate-50/70 p-3'>
                      <TextInput label={t('program_code')} className='w-full' value={formData.program_code} disabled />
                    </div>
                  )}

                  <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
                    <SubjectsSelect
                      label={t('subject')}
                      value={formData.subject_id}
                      error={errors?.subject_id}
                      className='w-full'
                      onChange={(val) => handleChange('subject_id', val?.id)}
                    />
                  </div>
                  <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3'>
                    <NumberInput
                      label={t('number_of_periods')}
                      placeholder={t('number_of_periods')}
                      value={formData?.lesson_count}
                      onChange={(val) => handleChange('lesson_count', val)}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/95 px-4 py-2 shadow-[0_-6px_14px_-12px_rgba(15,23,42,0.25)]'>
          <div className='mx-auto flex w-full max-w-6xl justify-center gap-4'>
            <Button
              variant='outline'
              type='button'
              className='min-w-[140px] rounded-xl border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
              onClick={() => {
                navigate('/teaching-program/list');
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
              {Number(id) ? t('update') : t('create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingProgramEdit;
