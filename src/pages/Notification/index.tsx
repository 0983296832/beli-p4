import { NOTIFICATION } from '@lib/ImageHelper';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import Loading from '@components/loading/index';
import notiServices from '@services/notification';
import { mergeObjects } from '@lib/JsHelper';
import EmptyTable from '@components/empty/EmptyTable';
import { getTimeAgo } from '@lib/TimeHelper';
import { Check, CheckCheck } from 'lucide-react';
import Tooltip from '@components/tooltip';
import { Toast } from '@components/toast';
import Confirm from '../../components/confirm/index';
import i18n from '@i18n/index';
import { useRootStore } from '@store/index';
import { useNavigate } from 'react-router-dom';
import { emitter } from '@lib/SocketClient';
import { uniqBy } from 'lodash';

interface Props {}

const Notification = (props: Props) => {
  const { t } = useT();
  const { removeNotificationCount, removeAllNotification } = useRootStore();
  const [data, setData] = useState<any[]>([]);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const navigate = useNavigate();

  const getData = async (filters?: any) => {
    setLoading(true);
    try {
      let params: any = {
        fields:
          'identity,action_type,creator_id,creator,title,content,created_at,updated_at,is_read,url,object,priority,valid,pin',
        limit,
        offset,
        sort: 'is_read',
        direction: 'asc'
      };
      params = mergeObjects(params, filters);
      const res: any = await notiServices.getNotifications(params);
      setData(params?.offset > 0 ? [...data, ...res?.data] : [...res?.data]);
      setHasMore(res.has_more);
      setOffset(res.offset);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleReadNoti = async (id: number) => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await notiServices.putReadNotification(id);
      Toast('success', response?.message);
      removeNotificationCount();
      setData(
        data?.map((noti) => {
          if (noti?.id == id) {
            return { ...noti, is_read: 1 };
          }
          return noti;
        })
      );
    } catch (error) {
      setLoading(false);
    }
  };

  const handleAllReadNoti = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await notiServices.putReadAllNotifications();
      removeAllNotification();
      Toast('success', response?.message);
      setData(data?.map((noti) => ({ ...noti, is_read: 1 })));
      setIsShowConfirm(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onRealtimeNotification = (new_data: any) => {
    const newNoti = {
      id: new_data?.id,
      title: new_data?.title,
      content: new_data?.content,
      created_at: new_data?.created_at,
      is_read: 0,
      url: new_data?.url
    };
    setData(uniqBy([newNoti, ...data], 'id'));
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    emitter.on('NEW_NOTIFICATION', (data) => {
      onRealtimeNotification(data);
    });
    return () => {
      emitter.off('NEW_NOTIFICATION');
    };
  }, [data]);

  return (
    <div>
      <Confirm
        show={isShowConfirm}
        type='warning'
        onCancel={() => {
          setIsShowConfirm(false);
        }}
        onSuccess={handleAllReadNoti}
        description={t('confirm_read_all_notifications')}
      />
      <Loading loading={loading} />
      <div className='flex items-center justify-center border-b'>
        <div className='px-4 py-3 border-b border-primary-blue-500'>
          <p className='text-primary-blue-500 text-sm font-semibold'>{t('notification')}</p>
        </div>
      </div>
      <div className='divide-y h-[450px] overflow-y-auto'>
        {data?.length > 0 ? (
          data?.map((noti, index) => {
            return (
              <div
                className='p-2.5 hover:bg-primary-neutral-100 cursor-pointer'
                key={index}
                onClick={() => {
                  navigate(noti?.url);
                }}
              >
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-semibold mb-2 line-clamp-1'>{noti?.title}</p>
                  {noti?.is_read == 1 ? (
                    <CheckCheck className=' size-6' />
                  ) : (
                    <Tooltip description={t('read_notification')}>
                      <Check
                        className='hover:text-primary-blue-500 cursor-pointer size-6'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadNoti(noti?.id);
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
                <p className='line-clamp-2 text-primary-neutral-500 text-xs mb-4 break-words'>{noti?.content}</p>
                <p className='text-xs text-primary-neutral-400 italic text-right '>{getTimeAgo(noti?.created_at)}</p>
              </div>
            );
          })
        ) : (
          <EmptyTable className='mt-10 mx-auto' note={t('no_notifications')} />
        )}
      </div>
      <div className='py-4 flex items-center justify-center gap-3 border-t'>
        <p
          className='text-sm font-medium hover:underline cursor-pointer'
          onClick={() => {
            setIsShowConfirm(true);
          }}
        >
          {t('mark_as_read')}
        </p>

        {hasMore && (
          <p
            className='text-sm font-medium hover:underline cursor-pointer'
            onClick={() => {
              getData({ offset: offset + limit });
            }}
          >
            {t('load_more_notifications')}
          </p>
        )}
      </div>
    </div>
  );
};

export default Notification;
