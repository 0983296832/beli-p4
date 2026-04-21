import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import TextInput from '@components/fields/TextInput';
import DateInput from '@components/fields/DateInput';
import { Button } from '@components/ui/button';
import { CAMERA, NO_IMAGE } from '@lib/ImageHelper';
import { useNavigate, useParams } from 'react-router-dom';
import TextAreaInput from '@components/fields/TextAreaInput';
import GenderSelect from '@components/selects/GenderSelect';
import ProvinceSelect from '@components/selects/ProvinceSelect';
import DistrictSelect from '@components/selects/DistrictSelect';
import WardSelect from '@components/selects/WardSelect';
import dayjs from 'dayjs';
import Upload, { UploadTrigger } from '@components/upload';
import studentServices from '@services/student';
import { Toast } from '@components/toast';
import _ from 'lodash';
import Loading from '@components/loading';
import { getDayMonthYearOfTimestamp, getCurrentTimestamp } from '@lib/TimeHelper';
import { useRootStore } from '@store/index';

interface Props {}

const StudentAdd = (props: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const { syncUsersStore } = useRootStore();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'user_id,username,age,user_job_title,description,email,phone,display_name,avatar,birthday,gender,verify_code,verify_status,status,valid,role_id,created_at,updated_at,address,working_status,province_id,district_id,ward_id'
    };
    try {
      const res: any = await studentServices.getStudent(Number(id), params);
      setFormData({
        username: res?.username,
        email: res?.email,
        phone: res?.phone,
        display_name: res?.display_name,
        avatar: res?.avatar,
        birthday: res?.birthday,
        gender: res?.gender,
        address: res?.address,
        province_id: res?.province_id,
        district_id: res?.district_id,
        ward_id: res?.ward_id,
        age: res?.age,
        description: res?.description
      });
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
        delete body.username;
        delete body.age;
        const res: any = await studentServices.putStudent(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/user/student/list');
      } else {
        const body = _.cloneDeep(formData);
        delete body.username;
        delete body.age;
        const res: any = await studentServices.postStudent(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/user/student/list');
        syncUsersStore();
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
        <div className='card-header text-neutral-50 bg-primary-blue-500'>
          <h3 className='text-base font-semibold leading-[100%]'>
            {id ? t('edit_student') : t('add_student_account')}
          </h3>
        </div>
        <div className='p-6 card-body'>
          <div className='flex gap-9'>
            <div className='relative w-[254px] h-[270px] border border-primary-neutral-300 rounded-lg flex justify-center items-center'>
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
            <div className='flex-1 space-y-6'>
              <div className='w-full border rounded-lg border-primary-neutral-300 card'>
                <div className='px-6 py-4 border-b card-header text-primary-blue-600 border-primary-neutral-300'>
                  <h3 className='text-base font-semibold leading-[100%]'>{t('personal_info')}</h3>
                </div>
                <div className='p-6 card-body'>
                  <div className='grid grid-cols-2 mb-4 gap-x-9 gap-y-4'>
                    <TextInput
                      label={t('student_name')}
                      required
                      value={formData.display_name}
                      className='w-full'
                      error={errors?.display_name}
                      onChange={(value) => {
                        handleChange('display_name', value);
                      }}
                    />
                    <TextInput label={t('code')} className='w-full' disabled value={formData.username} />
                    <DateInput
                      label={t('date_of_birth')}
                      placeholder={'dd/mm/yyyy'}
                      value={formData.birthday}
                      onChange={(e) => {
                        handleChange('birthday', e);
                        handleChange(
                          'age',
                          e
                            ? getDayMonthYearOfTimestamp(getCurrentTimestamp()).year -
                                getDayMonthYearOfTimestamp(e).year
                            : 0
                        );
                      }}
                    />
                    <div className='grid grid-cols-2 gap-2'>
                      <div className={!id ? 'col-span-2' : ''}>
                        <GenderSelect
                          placeholder={t('select_gender')}
                          value={formData.gender}
                          error={errors?.gender}
                          onChange={(val) => handleChange('gender', val?.value)}
                        />{' '}
                      </div>
                      {id ? <TextInput label={t('age')} disabled value={formData.age} className='w-full' /> : null}
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-x-9 gap-y-4'>
                    <TextInput
                      label={t('phone')}
                      placeholder={t('enter_phone')}
                      value={formData.phone}
                      error={errors?.phone}
                      className='w-full'
                      onChange={(val) => handleChange('phone', val)}
                    />
                    <TextInput
                      label={t('email')}
                      placeholder={t('enter_email')}
                      className='w-full'
                      value={formData.email}
                      error={errors?.email}
                      onChange={(val) => handleChange('email', val)}
                    />
                    <ProvinceSelect
                      label={t('province')}
                      value={formData.province_id}
                      error={errors?.province_id}
                      onChange={(val) => {
                        handleChange('province_id', val?.value);
                        handleChange('district_id', null);
                        handleChange('ward_id', null);
                      }}
                    />
                    <DistrictSelect
                      label={t('district')}
                      provinceId={formData.province_id}
                      value={formData.district_id}
                      error={errors?.district_id}
                      onChange={(val) => {
                        handleChange('district_id', val?.value);
                        handleChange('ward_id', null);
                      }}
                    />
                    <WardSelect
                      label={t('ward')}
                      districtId={formData.district_id}
                      value={formData.ward_id}
                      error={errors?.ward_id}
                      onChange={(val) => handleChange('ward_id', val?.value)}
                    />
                    <TextInput
                      label={t('specific_address')}
                      placeholder={t('enter_address')}
                      value={formData.address}
                      error={errors?.address}
                      className='w-full'
                      onChange={(val) => handleChange('address', val)}
                    />
                    <TextInput
                      label={t('password')}
                      placeholder={t('password')}
                      value={formData?.password}
                      error={errors?.password}
                      type='password'
                      onChange={(val) => handleChange('password', val)}
                    />
                    <TextInput
                      label={t('confirm_password')}
                      placeholder={t('confirm_password')}
                      value={formData?.password_confirmation}
                      error={errors?.password_confirmation}
                      type='password'
                      onChange={(val) => handleChange('password_confirmation', val)}
                    />
                  </div>
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
                  navigate('/user/student/list');
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
              navigate('/user/student/list');
            }}
          >
            {t('cancel')}
          </Button>
          <Button variant='default' type='submit' className='px-14' onClick={onUpdate} disabled={loading}>
            {t('add_new')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentAdd;
