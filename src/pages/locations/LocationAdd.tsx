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
import dayjs from 'dayjs';
import SelectInput from '@components/fields/SelectInput';
import _ from 'lodash';
import teachingLocationServices from '@services/teachingLocation';
import { Toast } from '@components/toast';
import Upload, { UploadTrigger } from '@components/upload';
import UsersSelect from '@components/selects/UsersSelect';
import { useRootStore } from '@store/index';
import Loading from '@components/loading';
import { RiArrowLeftLine, RiCameraLine, RiMapPin2Line } from '@remixicon/react';

interface Props {}

const LocationAdd = (props: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const { syncLocationsStore } = useRootStore();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

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
      <Loading loading={loading} />
      <div className='mx-auto w-full max-w-6xl pb-24'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>
                  {isEdit ? t('edit_profile') : t('add_new_locations')}
                </p>
                <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                  {formData?.location_name || t('location_name')}
                </h3>
                <p className='mt-0.5 text-sm text-slate-600'>{isEdit ? formData?.location_code : t('location_info')}</p>
              </div>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-100'
                onClick={() => {
                  navigate('/locations/list');
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
                      src={formData?.location_avatar || NO_IMAGE}
                      alt='No Image'
                      className={`aspect-square w-full object-cover ${!formData?.location_avatar ? 'opacity-50' : ''}`}
                    />
                    <Upload
                      value={[]}
                      isSingle
                      maxFiles={1}
                      onChange={(files) => {
                        setFormData({ ...formData, location_avatar: files?.[0].url });
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
                    <RiMapPin2Line className='size-5 text-violet-600' />
                    <h2 className='text-sm font-semibold text-violet-900'>{t('location_info')}</h2>
                  </div>
                  <div className='space-y-6 p-4 lg:p-5'>
                    <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
                      <div className={`rounded-xl border border-violet-100 bg-violet-50/40 p-3 ${!isEdit ? 'lg:col-span-2' : ''}`}>
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
                      {isEdit && (
                        <div className='rounded-xl border border-slate-200 bg-slate-50/70 p-3'>
                          <TextInput label={t('code')} className='w-full' disabled value={formData?.location_code} />
                        </div>
                      )}
                      <div className='rounded-xl border border-violet-100 bg-violet-50/40 p-3 lg:col-span-2'>
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
                    </div>

                    <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3'>
                        <TextInput
                          label={t('location_phone')}
                          placeholder={t('enter_phone')}
                          value={formData.phone}
                          error={errors?.phone}
                          className='w-full'
                          onChange={(val) => handleChange('phone', val)}
                        />
                      </div>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3'>
                        <TextInput
                          label={t('location_email')}
                          placeholder={t('enter_email')}
                          className='w-full'
                          value={formData.email}
                          error={errors?.email}
                          onChange={(val) => handleChange('email', val)}
                        />
                      </div>
                      <div className='rounded-xl border border-amber-100 bg-amber-50/40 p-3 lg:col-span-2'>
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
                    </div>

                    <div className='grid gap-4 lg:grid-cols-2 lg:gap-x-7'>
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
                      value={formData?.description}
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
                navigate('/locations/list');
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

export default LocationAdd;
