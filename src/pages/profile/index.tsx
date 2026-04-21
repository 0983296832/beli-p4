import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import Upload, { UploadTrigger } from '@components/upload';
import { TypeErrors } from '@/src/interface';
import TextInput from '@components/fields/TextInput';
import DateInput from '@components/fields/DateInput';
import GenderSelect from '@components/selects/GenderSelect';
import ProvinceSelect from '@components/selects/ProvinceSelect';
import DistrictSelect from '@components/selects/DistrictSelect';
import WardSelect from '@components/selects/WardSelect';
import Loading from '@components/loading';
import { useRootStore } from '@store/index';
import { Button } from '@components/ui/button';
import ReactPasswordChecklist from '@components/utils/PasswordCheckList';
import {
  AVATAR,
  CAMERA_WHITE,
  EDIT_BLUE_500,
  LOCK_BLACK,
  LOCK_BLUE,
  LOGOUT_ICON,
  PASSWORD_ICON,
  SETTING_ICON,
  SIGNOUT_BLACK,
  SIGNOUT_BLUE,
  USER,
  USER_BLUE,
  USER_ICON
} from '@lib/ImageHelper';
import profileServices from '@services/profile';
import { Toast } from '@components/toast';
import { convertTimestampToString, getCurrentTimestamp, getDayMonthYearOfTimestamp } from '@lib/TimeHelper';
import _, { map } from 'lodash';
import { useParams } from 'react-router-dom';
import Icon from '@components/Icon';
import TablePermission from '../permission/TablePermission';
import { USER_ROLE } from '@constants/index';

const Profile = () => {
  const { t } = useT();
  const { id } = useParams();
  const { currentUser, onLogout, permissions } = useRootStore();
  const [tabs, setTabs] = useState([
    {
      value: 1,
      label: t('personal_info'),
      icon: USER_ICON
    },
    {
      value: 2,
      label: t('change_password'),
      icon: PASSWORD_ICON
    },
    {
      value: 3,
      label: t('permission'),
      icon: SETTING_ICON
    },
    {
      value: 4,
      label: t('sign_out'),
      icon: LOGOUT_ICON
    }
  ]);

  const [activeTab, setActiveTab] = useState(1);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [profileDetail, setProfileDetail] = useState<any>({});
  const [errors, setErrors] = useState<TypeErrors>({});
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getProfile = async () => {
    setLoading(false);
    try {
      const params = {
        fields:
          'user_id,username,user_job_title,description,email,phone,display_name,avatar,birthday,age,gender,verify_code,verify_status,status,valid,role_id,age,district_name,ward_name,province_name,address,district_id,ward_id,province_id'
      };
      const res: any = await profileServices.getProfile(params);
      setFormData({
        username: res?.data?.username,
        email: res?.data?.email,
        phone: res?.data?.phone,
        display_name: res?.data?.display_name,
        avatar: res?.data?.avatar,
        birthday: res?.data?.birthday,
        age: res?.data?.age,
        gender: res?.data?.gender,
        district_id: res?.data?.district_id,
        ward_id: res?.data?.ward_id,
        province_id: res?.data?.province_id,
        address: res?.data?.address
      });
      setProfileDetail(res.data);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    setLoading(false);
    try {
      const body = _.cloneDeep(formData);
      delete body.age;
      delete body.username;
      const res: any = await profileServices.putProfile(body);
      getProfile();
      Toast('success', res?.message);
      setIsEdit(false);
      setLoading(false);
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  const getAgeFromUnix = (unixTimestamp: number): number => {
    const birthDate = new Date(unixTimestamp * 1000); // chuyển sang milliseconds
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    setErrors({ ...errors, [field]: '' });
  };

  const onUpdatePassword = async () => {
    try {
      const body = _.cloneDeep({
        old_password: oldPassword,
        password: password,
        password_confirmation: confirmPassword
      });
      setLoading(false);
      try {
        const res: any = await profileServices.putProfile(body);
        setPassword('');
        setOldPassword('');
        setConfirmPassword('');
        Toast('success', res?.message);
      } catch (error: any) {
        setErrors(error?.response?.data?.errors);
        setLoading(false);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className='flex gap-9'>
      <Loading loading={loading} />
      <div className='w-[360px] rounded-lg bg-white shadow-lg p-9'>
        <div className='relative mx-auto w-full flex items-center justify-center flex-col mb-9'>
          <img
            src={isEdit ? formData?.avatar : profileDetail?.avatar}
            className='w-[231px] h-[231px] min-w-[231px] min-h-[231px] rounded-full object-cover'
          />
          {isEdit && (
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
                <div className='rounded-full w-12 h-12 min-w-12 min-h-12 bg-primary-blue-500 flex items-center justify-center absolute bottom-2 right-11'>
                  <img src={CAMERA_WHITE} />
                </div>
              </UploadTrigger>
            </Upload>
          )}
        </div>

        <p className='text-center text-2xl font-semibold mb-3'>{profileDetail?.display_name}</p>
        <p className='text-lg font-medium text-center mb-9'>
          {t(profileDetail?.user_job_title)} - {profileDetail?.username}
        </p>
        {!id && (
          <div className='space-y-4'>
            {tabs.map((tab) => {
              return (
                <div
                  key={tab.value}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg ${activeTab === tab.value ? 'bg-[#DAEEFF]' : 'bg-white'} cursor-pointer hover:bg-[#DAEEFF]`}
                  onClick={() => {
                    if (tab.value === 4) {
                      onLogout?.(true);
                    } else {
                      setPassword('');
                      setOldPassword('');
                      setConfirmPassword('');
                      setErrors({});
                      setActiveTab(tab.value);
                    }
                  }}
                >
                  <Icon
                    icon={tab.icon}
                    size={20}
                    className={`${activeTab === tab.value ? 'text-primary-blue-500' : 'text-primary-neutral-900'}`}
                  />
                  <p className='text-base font-semibold'>{tab.label}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className='flex-1 rounded-lg bg-white shadow-lg'>
        <div className='px-6 py-4 border-b flex items-center justify-between'>
          <p className='text-primary-blue-600 text-base font-semibold'>
            {tabs.find((tab) => tab.value === activeTab)?.label}
          </p>
          {activeTab === 1 && !isEdit && !id && (
            <div className='p-[7px] rounded-sm bg-primary-blue-50 cursor-pointer' onClick={() => setIsEdit(true)}>
              <img src={EDIT_BLUE_500} className='size-4' />
            </div>
          )}
        </div>
        {activeTab === 1 ? (
          <div className='p-8'>
            {isEdit ? (
              <div>
                <div className='grid grid-cols-2 mb-4 gap-x-9 gap-y-4'>
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
                  <TextInput label={t('code')} className='w-full' disabled value={formData.username} />
                  <DateInput
                    label={t('date_of_birth')}
                    placeholder={'dd/mm/yyyy'}
                    value={formData.birthday}
                    onChange={(e) => {
                      handleChange('birthday', e);
                      handleChange('age', e ? getAgeFromUnix(e) : 0);
                    }}
                  />
                  <div className='grid grid-cols-2 gap-2'>
                    <GenderSelect
                      placeholder={t('select_gender')}
                      value={formData.gender}
                      error={errors?.gender}
                      onChange={(val) => handleChange('gender', val?.value)}
                    />{' '}
                    <TextInput label={t('age')} disabled value={formData.age} className='w-full' />
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
                </div>
                <div className='flex items-center justify-center gap-8 mt-20'>
                  <Button
                    variant='destructive'
                    type='submit'
                    className='px-14 bg-primary-error hover:bg-primary-error/80 w-1/2'
                    onClick={() => {
                      setIsEdit(false);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    variant='default'
                    type='submit'
                    className='px-14 w-1/2'
                    onClick={() => {
                      onUpdate();
                    }}
                  >
                    {t('update')}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className='grid grid-cols-[130px_30px_1fr] mb-4'>
                  <div className='text-primary-neutral-600'>{t('full_name')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{profileDetail?.display_name}</div>
                </div>
                <div className='grid grid-cols-[130px_30px_1fr] mb-4'>
                  <div className='text-primary-neutral-600'>{t('date_of_birth')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{convertTimestampToString(profileDetail?.birthday)}</div>
                </div>
                <div className='grid grid-cols-[130px_30px_1fr] mb-4'>
                  <div className='text-primary-neutral-600'>{t('gender')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{profileDetail?.gender === 1 ? t('male') : t('female')}</div>
                </div>
                <div className='grid grid-cols-[130px_30px_1fr] mb-4'>
                  <div className='text-primary-neutral-600'>{t('age')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{profileDetail?.age}</div>
                </div>
                <div className='grid grid-cols-[130px_30px_1fr] mb-4'>
                  <div className='text-primary-neutral-600'>{t('phone')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{profileDetail?.phone}</div>
                </div>
                <div className='grid grid-cols-[130px_30px_1fr] mb-4'>
                  <div className='text-primary-neutral-600'>{t('email')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{profileDetail?.email}</div>
                </div>
                <div className='grid grid-cols-[130px_30px_1fr] mb-4'>
                  <div className='text-primary-neutral-600'>{t('address')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {profileDetail?.address} {profileDetail?.ward_name} {profileDetail?.district_name}{' '}
                    {profileDetail?.province_name}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 2 ? (
          <div className='p-8 flex items-center justify-center'>
            <div className='w-[410px] space-y-4'>
              <TextInput
                label={t('old_password')}
                placeholder={t('old_password')}
                value={oldPassword}
                error={errors?.old_password}
                type='password'
                onChange={(value) => {
                  setOldPassword(value);
                  setErrors({ ...errors, old_password: '' });
                }}
              />
              <div className='space-y-3'>
                <TextInput
                  label={t('new_password')}
                  placeholder={t('new_password')}
                  className='border-primary-neutral-300'
                  value={password}
                  type='password'
                  onChange={(value) => {
                    setPassword(value);
                  }}
                />
                <div>
                  <ReactPasswordChecklist
                    className='pl-5 text-sm list-disc text-primary-neutral-500'
                    rules={['notEmpty', 'minLength', 'specialCharAndNumber', 'capitalAndLowercase']}
                    minLength={8}
                    maxLength={50}
                    value={password}
                    valueAgain={confirmPassword}
                  />
                </div>
                <TextInput
                  label={t('confirm_password')}
                  placeholder={t('confirm_password')}
                  className='border-primary-neutral-300'
                  value={confirmPassword}
                  type='password'
                  onChange={(value) => {
                    setConfirmPassword(value);
                  }}
                />
                <div className='flex items-center justify-center gap-8 !mt-8'>
                  <Button variant='default' type='submit' className='px-14 w-full' onClick={onUpdatePassword}>
                    {t('update')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='p-2'>
            <TablePermission
              type='view'
              permissionDetail={{
                permissions: map(Object.keys(permissions), (key) => ({ permission_name: key }))
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
