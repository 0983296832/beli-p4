import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import TextInput from '@components/fields/TextInput';
import DateInput from '@components/fields/DateInput';
import { Button } from '@components/ui/button';
import { NO_IMAGE } from '@lib/ImageHelper';
import { useNavigate, useParams } from 'react-router-dom';
import TextAreaInput from '@components/fields/TextAreaInput';
import GenderSelect from '@components/selects/GenderSelect';
import ProvinceSelect from '@components/selects/ProvinceSelect';
import DistrictSelect from '@components/selects/DistrictSelect';
import WardSelect from '@components/selects/WardSelect';
import Upload, { UploadTrigger } from '@components/upload';
import _ from 'lodash';
import adminServices from '@services/admin';
import { Toast } from '@components/toast';
import Loading from '@components/loading';
import { getDayMonthYearOfTimestamp, getCurrentTimestamp } from '@lib/TimeHelper';
import { useRootStore } from '@store/index';
import {
  RiArrowLeftLine,
  RiCameraLine,
  RiLockPasswordLine,
  RiShieldUserLine
} from '@remixicon/react';

interface Props {}

const AdministratorAdd = (props: Props) => {
  const { syncUsersStore } = useRootStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'user_id,age,username,user_job_title,description,email,phone,display_name,avatar,birthday,gender,verify_code,verify_status,status,valid,role_id,created_at,updated_at,address,working_status,province_id,district_id,ward_id'
    };
    try {
      const res: any = await adminServices.getAdmin(Number(id), params);
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
      if (isEdit) {
        const body = _.cloneDeep(formData);
        delete body.username;
        delete body.age;
        const res: any = await adminServices.putAdmin(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/user/administrator/list');
      } else {
        const body = _.cloneDeep(formData);
        delete body.username;
        delete body.age;
        const res: any = await adminServices.postAdmin(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/user/administrator/list');
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
      <div className='mx-auto w-full max-w-6xl pb-24'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>
                  {isEdit ? t('edit_admin') : t('add_admin_account')}
                </p>
                <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                  {formData?.display_name || t('admin_name')}
                </h3>
                <p className='mt-0.5 text-sm text-slate-600'>{isEdit ? formData?.username : t('personal_info')}</p>
              </div>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-100'
                onClick={() => {
                  navigate('/user/administrator/list');
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
                    <RiShieldUserLine className='size-5 text-violet-600' />
                    <h2 className='text-sm font-semibold text-violet-900'>{t('personal_info')}</h2>
                  </div>
                  <div className='space-y-6 p-4 lg:p-5'>
                    <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
                      <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-3'>
                        <TextInput
                          label={t('admin_name')}
                          required
                          value={formData.display_name}
                          className='w-full'
                          error={errors?.display_name}
                          onChange={(value) => {
                            handleChange('display_name', value);
                          }}
                        />
                      </div>
                      <div className='rounded-xl border border-slate-200 bg-slate-50/70 p-3'>
                        <TextInput label={t('code')} className='w-full' disabled value={formData.username} />
                      </div>
                      <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-3'>
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
                      </div>
                      <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-3'>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className={!isEdit ? 'col-span-2' : ''}>
                            <GenderSelect
                              placeholder={t('select_gender')}
                              value={formData.gender}
                              error={errors?.gender}
                              onChange={(val) => handleChange('gender', val?.value)}
                            />
                          </div>
                          {isEdit ? <TextInput label={t('age')} disabled value={formData.age} className='w-full' /> : null}
                        </div>
                      </div>
                    </div>

                    <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3'>
                        <TextInput
                          label={t('phone')}
                          placeholder={t('enter_phone')}
                          value={formData.phone}
                          error={errors?.phone}
                          className='w-full'
                          onChange={(val) => handleChange('phone', val)}
                        />
                      </div>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3'>
                        <TextInput
                          label={t('email')}
                          placeholder={t('enter_email')}
                          className='w-full'
                          value={formData.email}
                          error={errors?.email}
                          onChange={(val) => handleChange('email', val)}
                        />
                      </div>
                      <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
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
                      </div>
                      <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
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
                      </div>
                      <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
                        <WardSelect
                          label={t('ward')}
                          districtId={formData.district_id}
                          value={formData.ward_id}
                          error={errors?.ward_id}
                          onChange={(val) => handleChange('ward_id', val?.value)}
                        />
                      </div>
                      <div className='rounded-xl border border-emerald-100 bg-emerald-50/40 p-3'>
                        <TextInput
                          label={t('specific_address')}
                          placeholder={t('enter_address')}
                          value={formData.address}
                          error={errors?.address}
                          className='w-full'
                          onChange={(val) => handleChange('address', val)}
                        />
                      </div>
                    </div>

                    <div className='rounded-2xl border border-fuchsia-200 bg-fuchsia-50/40 p-4'>
                      <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-fuchsia-900'>
                        <RiLockPasswordLine className='size-4' />
                        {t('password')}
                      </div>
                      <div className='grid gap-4 lg:grid-cols-2'>
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

                    <div className='rounded-2xl border border-rose-200 bg-rose-50/30 p-4'>
                      <TextAreaInput
                        label={t('description')}
                        placeholder={t('description')}
                        value={formData?.description}
                        error={errors?.description}
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
                navigate('/user/administrator/list');
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
              {isEdit ? t('update') : t('add_new')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministratorAdd;
