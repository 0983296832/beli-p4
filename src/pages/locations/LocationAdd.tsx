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
import SelectInput from '@components/fields/SelectInput';
import _ from 'lodash';
import teachingLocationServices from '@services/teachingLocation';
import { Toast } from '@components/toast';
import Upload, { UploadTrigger } from '@components/upload/index';
import UsersSelect from '@components/selects/UsersSelect';
import { useRootStore } from '@store/index';

interface Props {}

const LocationAdd = (props: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const { syncLocationsStore } = useRootStore();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'location_name,location_avatar,description,status,location_rep,phone,email,google_map_url,province_id,district_id,ward_id,address'
    };
    try {
      const { data }: any = await teachingLocationServices.getTeachingLocation(Number(id), params);
      setFormData({
        location_name: data?.location_name,
        location_code: data?.location_code,
        location_avatar: data?.location_avatar,
        description: data?.description,
        location_rep: Number(data?.location_rep),
        phone: data?.phone,
        email: data?.email,
        google_map_url: data?.google_map_url,
        province_id: data?.province_id,
        district_id: data?.district_id,
        ward_id: data?.ward_id,
        address: data?.address
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
        body.location_rep = String(body.location_rep);
        delete body?.location_code;
        const res: any = await teachingLocationServices.putTeachingLocation(Number(id), body);
        Toast('success', res?.message);
        setErrors({});
        setLoading(false);
        navigate('/locations/list');
      } else {
        const body = _.cloneDeep(formData);
        body.location_rep = String(body.location_rep);
        delete body?.location_code;
        delete body.age;
        const res: any = await teachingLocationServices.postTeachingLocation(body);
        Toast('success', res?.message);
        setFormData({});
        setErrors({});
        setLoading(false);
        navigate('/locations/list');
        syncLocationsStore();
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='w-full shadow-lg card bg-primary-neutral-50'>
        <div className=' text-neutral-50 bg-primary-blue-500 card-header'>
          <h3 className='text-base font-semibold leading-[100%]'>{id ? t('edit_profile') : t('add_new_locations')}</h3>
        </div>
        <div className='p-6 card-body'>
          <div className='flex gap-9'>
            <div className='relative w-[254px] h-[270px] border border-primary-neutral-300 rounded-lg flex justify-center items-center'>
              <img
                src={formData?.location_avatar || NO_IMAGE}
                alt='No Image'
                className={`absolute object-cover w-full h-full p-3 ${!formData?.location_avatar && 'opacity-50'} `}
              />
              <Upload
                className='mb-5'
                value={[]}
                isSingle
                maxFiles={1}
                onChange={(files) => {
                  setFormData({ ...formData, location_avatar: files?.[0].url });
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
                  <h3 className='text-base font-semibold leading-[100%]'>{t('location_info')}</h3>
                </div>
                <div className='p-6 card-body'>
                  <div className='grid grid-cols-2 mb-4 gap-x-9 gap-y-4'>
                    <div className={`${!Number(id) && 'col-span-2'}`}>
                      <TextInput
                        label={t('location_name')}
                        required
                        className='w-full'
                        value={formData?.location_name}
                        error={errors?.location_name}
                        onChange={(value) => {
                          handleChange('location_name', value);
                        }}
                      />
                    </div>

                    {id && (
                      <div>
                        <TextInput label={t('code')} className='w-full' disabled value={formData?.location_code} />
                      </div>
                    )}
                    <UsersSelect
                      label={t('representative_name')}
                      role='ADMIN'
                      value={formData?.location_rep}
                      error={errors?.location_rep}
                      onChange={(val) => {
                        setFormData({ ...formData, location_rep: val?.id });
                        setErrors({ ...errors, location_rep: '' });
                      }}
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-x-9 gap-y-4'>
                    <TextInput
                      label={t('location_phone')}
                      placeholder={t('enter_phone')}
                      value={formData.phone}
                      error={errors?.phone}
                      className='w-full'
                      onChange={(val) => handleChange('phone', val)}
                    />
                    <TextInput
                      label={t('location_email')}
                      placeholder={t('enter_email')}
                      className='w-full'
                      value={formData.email}
                      error={errors?.email}
                      onChange={(val) => handleChange('email', val)}
                    />
                    <div className='col-span-2'>
                      <TextInput
                        label={t('google_map')}
                        className='w-full'
                        value={formData?.google_map_url}
                        error={errors?.google_map_url}
                        onChange={(val) => {
                          handleChange('google_map_url', val);
                        }}
                      />
                    </div>
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
                    value={formData?.description}
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
                  navigate('/locations/list');
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
              navigate('/locations/list');
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

export default LocationAdd;
