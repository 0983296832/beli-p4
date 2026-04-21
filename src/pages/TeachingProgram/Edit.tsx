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

const TeachingProgramEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

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
    <div className='shadow-lg card bg-primary-neutral-50 '>
      <Loading loading={loading} />
      <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
        <h3 className='text-base font-semibold leading-[100%]'>
          {t(Number(id) ? 'edit_teaching_program_details' : 'add_new_teaching_program')}
        </h3>
      </div>

      <div className='p-6 card-body space-y-6'>
        <div className=' border border-primary-neutral-200 card flex-1'>
          <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
            <h3 className='text-base font-semibold leading-[100%]'>{t('teaching_program_info')}</h3>
          </div>
          <div className='p-6 card-body '>
            <div className='grid grid-cols-2 gap-x-9 gap-y-4'>
              <div className={`${!Number(id) && 'col-span-2'}`}>
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
                <TextInput label={t('program_code')} className='w-full' value={formData.program_code} disabled />
              )}

              <SubjectsSelect
                label={t('subject')}
                value={formData.subject_id}
                error={errors?.subject_id}
                className='w-full'
                onChange={(val) => handleChange('subject_id', val?.id)}
              />
              <NumberInput
                label={t('number_of_periods')}
                placeholder={t('number_of_periods')}
                value={formData?.lesson_count}
                onChange={(val) => handleChange('lesson_count', val)}
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
          {t(Number(id) ? 'update' : 'create')}
        </Button>
      </div>
    </div>
  );
};

export default TeachingProgramEdit;
