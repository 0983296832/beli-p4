import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { NO_IMAGE } from '@lib/ImageHelper';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import teachingLocationServices from '@services/teachingLocation';
import { Toast } from '@components/toast';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import { getUserInfo } from '@lib/GetInfoHelper';
import DrawerStatistic from '@components/DrawerStatistic/index';
import { RiArrowLeftLine, RiDeleteBin6Line, RiEdit2Line } from '@remixicon/react';

interface Props {}

const LocationDetail = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [statisticInfo, setStatisticInfo] = useState<any>({
    show: false,
    extraFilter: {},
    type: '',
    objectId: 0
  });

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'location_name,location_avatar,description,status,location_rep,phone,email,google_map_url,province_id,district_id,ward_id,address,ward_name,province_name,district_name,user_ability,statistic'
    };
    try {
      const res: any = await teachingLocationServices.getTeachingLocation(Number(id), params);
      setDetail(res?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await teachingLocationServices.deleteTeachingLocation(Number(id));
      Toast('success', response?.message);
      setIsShowConfirm(false);
      navigate('/locations/list');
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };

  useEffect(() => {
    id && getDetail();
  }, [id]);

  const statLinkClass =
    'w-min cursor-pointer font-medium text-violet-700 underline-offset-2 transition-colors hover:text-violet-900 hover:underline';

  return (
    <div className='pb-24'>
      <Loading loading={loading} />
      <Confirm
        show={isShowConfirm}
        type='warning'
        onCancel={() => {
          setIsShowConfirm(false);
        }}
        onSuccess={handleDelete}
        description={t('txt_confirm_delete')}
      />
      <div className='mx-auto max-w-6xl'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <h3 className='text-xl font-semibold tracking-wide text-slate-800'>{t('detailed_location_info')}</h3>
            <div className='flex flex-wrap items-center gap-2'>
              {detail?.user_ability?.can_delete == 1 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  title={t('delete')}
                  onClick={() => {
                    setIsShowConfirm(true);
                  }}
                >
                  <RiDeleteBin6Line className='size-5' />
                </Button>
              )}
              {detail?.user_ability?.can_edit == 1 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  title={t('edit')}
                  onClick={() => {
                    navigate('/locations/edit/' + id);
                  }}
                >
                  <RiEdit2Line className='size-5' />
                </Button>
              )}
            </div>
          </div>
          <div className='p-5 lg:p-6'>
            <div className='flex flex-col gap-8 lg:flex-row lg:gap-9'>
              <div className='mx-auto w-full max-w-[280px] shrink-0 lg:mx-0'>
                <div className='overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/40 p-4 shadow-sm'>
                  <div className='mb-3 overflow-hidden rounded-xl border border-violet-100 bg-white'>
                    <img
                      className='aspect-square w-full object-cover'
                      src={detail?.location_avatar || NO_IMAGE}
                      alt=''
                    />
                  </div>
                  <div className='space-y-2 text-center'>
                    <div className='text-sm font-semibold text-slate-800'>
                      {detail?.location_name} — {detail?.location_code}
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        detail.status == 1
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {detail.status == 1 ? t('active') : t('inactive')}
                    </span>
                  </div>
                </div>
              </div>
              <div className='min-w-0 flex-1 space-y-6'>
                <div className='flex flex-col gap-6 lg:flex-row'>
                  <div className='min-w-0 flex-1 lg:w-3/5'>
                    <div className='overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                      <div className='border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                        <h3 className='text-base font-semibold text-violet-900'>{t('location_info')}</h3>
                      </div>
                      <div className='p-5 lg:p-6'>
                        <div className='grid gap-y-4 text-sm'>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('location_name')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.location_name}</div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('code')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.location_code}</div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('address')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {detail?.address || detail?.ward_name || detail?.district_name || detail?.province_name
                                ? `${detail?.address || ''} ${detail?.ward_name || ''} ${detail?.district_name || ''} ${detail?.province_name || ''}`
                                : t('not_updated')}
                            </div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('google_map')}</div>
                            <div className='text-slate-400'>:</div>
                            <div>
                              {detail?.google_map_url ? (
                                <a
                                  className='font-medium text-violet-700 underline-offset-2 hover:text-violet-900 hover:underline'
                                  target='_blank'
                                  href={detail?.google_map_url}
                                  rel='noreferrer'
                                >
                                  link
                                </a>
                              ) : (
                                <span className='text-slate-600'>{t('not_updated')}</span>
                              )}
                            </div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('representative')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>
                              {getUserInfo(detail?.location_rep)?.display_name || t('not_updated')}
                            </div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('phone')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.phone || t('not_updated')}</div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('email')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.email || t('not_updated')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='min-w-0 lg:w-2/5'>
                    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                      <div className='border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                        <h3 className='text-base font-semibold text-violet-900'>{t('activity_info')}</h3>
                      </div>
                      <div className='flex-1 p-5 lg:p-6'>
                        <div className='grid gap-y-4 text-sm'>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('administrator')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: detail?.id,
                                  type: 'admin',
                                  extraFilter: {
                                    filterings: {
                                      ['location_id:eq']: detail?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {detail?.statistic?.admin}
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('teachers')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: detail?.id,
                                  type: 'teacher',
                                  extraFilter: {
                                    filterings: {
                                      ['location_id:eq']: detail?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {detail?.statistic?.teacher}
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('teaching_assistant')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: detail?.id,
                                  type: 'ta',
                                  extraFilter: {
                                    filterings: {
                                      ['location_id:eq']: detail?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {detail?.statistic?.ta}
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('students')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: detail?.id,
                                  type: 'student',
                                  extraFilter: {
                                    filterings: {
                                      ['location_id:eq']: detail?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {detail?.statistic?.student}
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('classroom')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: detail?.id,
                                  type: 'classroom',
                                  extraFilter: {
                                    filterings: {
                                      ['location_id:eq']: detail?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {detail?.statistic?.classroom}
                            </div>
                          </div>
                          <div className='grid grid-cols-[150px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('subject')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: detail?.id,
                                  type: 'subject',
                                  extraFilter: {
                                    filterings: {
                                      ['location_id:eq']: detail?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {detail?.statistic?.subject}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 shadow-sm'>
                  <div className='border-b border-rose-100 bg-rose-50/90 px-4 py-3'>
                    <h3 className='text-base font-semibold text-rose-900'>{t('description')}</h3>
                  </div>
                  <div className='min-h-[160px] p-5 lg:p-6'>
                    <div
                      className='rounded-xl border border-white/80 bg-white/70 p-4 text-sm text-slate-800'
                      dangerouslySetInnerHTML={{
                        __html: replaceNewlineWithBr(detail?.description || t('not_updated'))
                      }}
                    />
                  </div>
                </div>
                <div className='flex justify-end pt-1'>
                  <Button
                    className='rounded-xl bg-emerald-500 px-6 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/locations/list');
                    }}
                  >
                    <RiArrowLeftLine className='size-4' />
                    {t('close')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DrawerStatistic
        show={statisticInfo?.show}
        setShow={(show: boolean) => {
          setStatisticInfo({ ...statisticInfo, show });
        }}
        objectId={statisticInfo?.objectId}
        type={statisticInfo?.type}
        extraFilter={statisticInfo?.extraFilter}
      />
    </div>
  );
};

export default LocationDetail;
