import React, { memo, useRef, useState } from 'react';
import { cn } from '@lib/utils';
import { MIC_NEUTRAL900, VIDEO_NEUTRAL900 } from '@lib/ImageHelper';
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog';
import { Fullscreen, X } from 'lucide-react';
import TooltipUi from '../tooltip';
import { useT } from '@hooks/useT';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '../ui/alert-dialog';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { appendQuery, generateSimpleId } from '@lib/JsHelper';
import ImageWithRetry from '../image/ImageWithRetry';
import AutoRetryAudio from '../Audio/AudioWithRetry';
import AutoRetryVideo from '../Video/VideoWithRetry';

interface Props {
  file: {
    url?: string;
    type?: string | null;
  };
  className?: string;
  imageClassName?: string;
  audioClassName?: string;
  videoClassName?: string;
  isIcon?: boolean;
  isViewImage?: boolean;
}

const PreviewExerciseFile = ({
  file,
  className,
  imageClassName,
  audioClassName,
  videoClassName,
  isIcon,
  isViewImage
}: Props) => {
  const { t } = useT();

  return (
    <div className={cn('h-full w-full rounded-lg relative group', className)}>
      {file?.type === 'image' ? (
        <>
          {isIcon ? (
            <Dialog>
              <DialogTrigger>
                <ImageWithRetry
                  src={appendQuery(file?.url as string, `?v=${generateSimpleId('image')}`)}
                  className={cn('w-full h-full object-contain rounded-lg', imageClassName)}
                />
              </DialogTrigger>
              <DialogContent className='w-[calc(100vw-16px)] sm:w-[700px] max-w-[calc(100vw-16px)] sm:max-w-[700px] h-[500px] max-h-[500px] flex items-center justify-center p-8'>
                <ImageWithRetry
                  src={appendQuery(file?.url as string, `?v=${generateSimpleId('image')}`)}
                  className={'w-full h-full object-contain rounded-lg'}
                  key={generateSimpleId('image')}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <>
              {isViewImage && (
                <PhotoProvider className='z-[999999]'>
                  <PhotoView src={appendQuery(file?.url as string, `?v=${generateSimpleId('image')}`)}>
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      className='p-1 rounded-md bg-white cursor-pointer absolute top-2 right-2 h-[32px]  items-center justify-center hidden group-hover:flex z-10'
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <TooltipUi description={t('zoom')}>
                        <Fullscreen className='size-6 text-neutral-900' />
                      </TooltipUi>
                    </div>
                  </PhotoView>
                </PhotoProvider>
              )}
              <ImageWithRetry
                src={appendQuery(file?.url as string, `?v=${generateSimpleId('image')}`)}
                className={cn('h-full w-auto object-contain rounded-lg', imageClassName)}
                key={generateSimpleId('image')}
              />
            </>
          )}
        </>
      ) : file?.type === 'audio' ? (
        <>
          {isIcon ? (
            <Dialog>
              <DialogTrigger>
                <div className='size-7 border rounded cursor-pointer flex items-center justify-center bg-primary-blue-50'>
                  <img src={MIC_NEUTRAL900} />
                </div>
              </DialogTrigger>
              <DialogContent className='w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] sm:w-[500px] sm:max-w-[500px] h-[300px] max-h-[300px] flex items-center justify-center'>
                <AutoRetryAudio
                  className={'w-full mx-2'}
                  key={generateSimpleId('audio')}
                  src={appendQuery(file?.url as string, `?v=${generateSimpleId('audio')}`)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <AutoRetryAudio
              className={cn('w-full mx-2', audioClassName)}
              key={generateSimpleId('audio')}
              src={appendQuery(file?.url as string, `?v=${generateSimpleId('audio')}`)}
            />
          )}
        </>
      ) : (
        <>
          {isIcon ? (
            <Dialog>
              <DialogTrigger>
                <div className='size-7 border rounded cursor-pointer flex items-center justify-center bg-primary-blue-50'>
                  <img src={VIDEO_NEUTRAL900} />
                </div>
              </DialogTrigger>
              <DialogContent className='w-[calc(100vw-32px)] sm:w-[700px] max-w-[calc(100vw-32px)] sm:max-w-[700px] h-[500px] max-h-[500px] flex items-center justify-center p-8'>
                <AutoRetryVideo
                  controls
                  className={cn('w-full h-full object-cover rounded-lg mx-2', videoClassName)}
                  key={generateSimpleId('video')}
                  src={appendQuery(file?.url as string, `?v=${generateSimpleId('video')}`)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <AutoRetryVideo
              controls
              playsInline={false}
              className={cn('w-full h-full object-cover rounded-lg', videoClassName)}
              key={generateSimpleId('video')}
              src={appendQuery(file?.url as string, `?v=${generateSimpleId('video')}`)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default memo(PreviewExerciseFile);
