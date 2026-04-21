import React, { useState, useCallback, createContext, useContext, isValidElement, cloneElement } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { getFileTypeFromMime, isImageFile, isVideoFile } from '@lib/FileHelper';
// import { DELETE_RED, FILE_ORANGE, X_ORANGE } from '@src/lib/ImageHelper';
import { cn } from '@lib/utils';
// import mainServices from '@services/';
import TooltipUi from '../tooltip/index';
import { useT } from '@hooks/useT';
import axios from 'axios';
import { DELETE_04 } from '@lib/ImageHelper';
import mainServices from '@services/main';
import { XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Toast } from '../toast';

// TYPES
export interface FileType {
  id?: number;
  extension?: string;
  mimeType?: string;
  name?: string;
  size?: number;
  url: string;
}

interface UploadContextProps {
  value: FileType[];
  loading: boolean;
  onChange: (files: FileType[]) => void;
  onDelete?: (id: number | undefined, index: number) => void;
  setLoading: (loading: boolean) => void;
  onUploadFile: (files: File[]) => Promise<void>;
  /**Example: { 'image/*': [] } */
  accept?: Accept;
  maxFiles?: number;
  disabled?: boolean;
  isSingle?: boolean;
  useService?: boolean;
}

// CONTEXT
const UploadContext = createContext<UploadContextProps | null>(null);

const useUploadContext = () => {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('Upload components must be used within <UploadInput>');
  return ctx;
};

// ROOT COMPONENT
interface Props {
  children: React.ReactNode;
  maxFiles?: number;
  value?: FileType[] | undefined;
  onChange: (value: FileType[]) => void;
  onDelete?: (id: number | undefined, index: number) => void;
  className?: string;
  /**Example: { 'image/*': [] } */
  accept?: Accept;
  disabled?: boolean;
  isSingle?: boolean;
  useService?: boolean;
}

const Upload = ({
  children,
  maxFiles,
  onChange,
  value = [],
  onDelete,
  className,
  accept,
  disabled,
  isSingle,
  useService = true
}: Props) => {
  const [loading, setLoading] = useState(false);

  const onUploadFile = useCallback(
    async (files: File[]) => {
      try {
        if (!useService) {
          onChange?.(files as any);
        } else {
          setLoading(true);
          const uploadedUrls: FileType[] = [];
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            const response: any = await mainServices.onTempUploadFile(formData);
            uploadedUrls.push(response?.data);
          }

          onChange?.(
            isSingle
              ? uploadedUrls.map((file: any) => ({
                  id: 0,
                  url: file.fileUrl,
                  name: file.originalName,
                  mimeType: file?.mimeType
                }))
              : [
                  ...(value?.map((f) => ({ id: f?.id, url: f?.url, name: f?.name, mimeType: f?.mimeType })) || []),
                  ...uploadedUrls.map((file: any) => ({
                    id: 0,
                    url: file.fileUrl,
                    name: file.originalName,
                    mimeType: file?.mimeType
                  }))
                ]
          );
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setLoading(false);
      }
    },
    [onChange, value]
  );

  return (
    <UploadContext.Provider
      value={{
        value,
        onChange,
        onDelete,
        loading,
        setLoading,
        onUploadFile,
        accept,
        maxFiles,
        disabled
      }}
    >
      <div className={cn('w-full', className)}>{children}</div>
    </UploadContext.Provider>
  );
};

// PREVIEW COMPONENT
export const UploadPreview = ({ className, fileClassName }: { className?: string; fileClassName?: string }) => {
  const { value, onChange, onDelete } = useUploadContext();
  const { t } = useT();

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='flex items-center gap-[10px] flex-wrap'>
        {value?.map((file, index) => {
          if (isImageFile(file?.url)) {
            return (
              <div key={index} className='relative group'>
                <img
                  src={file?.url}
                  alt=''
                  className={cn('w-[295px] h-[180px] rounded-[10px] object-cover', fileClassName)}
                />

                <Button
                  onClick={() => {
                    onChange?.([...value?.filter((_, i) => i !== index)]);
                    onDelete?.(file?.id, index);
                  }}
                  size='icon'
                  className='border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none'
                  aria-label='Remove image'
                >
                  <XIcon className='size-3.5' />
                </Button>

               
              </div>
            );
          }
        })}
      </div>
      <div className='flex items-center gap-[10px] flex-wrap'>
        {value?.map((file, index) => {
          if (isVideoFile(file?.url)) {
            return (
              <div key={index} className='relative group'>
                <video
                  width={'100%'}
                  height={'100%'}
                  src={file?.url}
                  className={cn('w-[295px] h-[180px] rounded-[10px] object-cover', fileClassName)}
                />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-full h-full p-[15px] bg-[#0000004D] hidden flex-col rounded-[10px] group-hover:flex'>
                    <div className='flex items-center justify-end gap-2'>
                      <TooltipUi description={t('delete')}>
                        <img
                          src={DELETE_04}
                          className='w-7 h-7 mb-1 cursor-pointer'
                          onClick={() => {
                            onChange?.([...value?.filter((_, i) => i !== index)]);
                            onDelete?.(file?.id, index);
                          }}
                        />
                      </TooltipUi>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
      <div className='flex items-center gap-[10px] flex-wrap'>
        {value?.map((file, index) => {
          if (!isImageFile(file?.url) && !isVideoFile(file?.url)) {
            return (
              <div key={index} className={`flex items-center gap-[15px]`}>
                <div className='flex items-center gap-[10px]'>
                  <img src={DELETE_04} />
                  <a className='text-primary-orange font-medium text-13 w-full line-clamp-1' href={file?.url}>
                    {file?.name || file?.url}
                  </a>
                </div>
                <TooltipUi description={t('delete')}>
                  <img
                    src={DELETE_04}
                    onClick={() => {
                      onChange?.([...value?.filter((_, i) => i !== index)]);
                      onDelete?.(file?.id, index);
                    }}
                  />
                </TooltipUi>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

// TRIGGER COMPONENT (gắn dropzone tại đây)
export const UploadTrigger = ({
  children,
  render
}: {
  children?: React.ReactNode;
  render?: (loading: boolean) => React.ReactNode;
}) => {
  const { loading, onUploadFile, accept, maxFiles, disabled } = useUploadContext();
  const { t } = useT();

  const { getRootProps, getInputProps } = useDropzone({
    accept: accept || undefined,
    maxFiles: maxFiles || 1,
    disabled,
    onDrop: async (files) => {
      if (files.length > 0) {
        await onUploadFile(files);
      }
    },
    onDropRejected: (rejections) => {
      // Nếu bị lỗi do quá số lượng file
      if (rejections.some((rej) => rej.errors.some((err) => err.code === 'too-many-files'))) {
        Toast('warning', t('max_upload_files', { maxFiles: maxFiles || '' }));
        return;
      }

      // Nếu có lỗi khác (chỉ lấy lỗi đầu tiên để báo)
      const firstRejection = rejections[0];
      const firstError = firstRejection?.errors[0];
      if (firstError) {
        Toast(
          'warning',
          t('file_rejected', { file_name: firstRejection.file.name || '', message: firstError.message })
        );
      }
    }
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {render ? (
        render(loading)
      ) : (
        <>
          {isValidElement(children)
            ? cloneElement(children as React.ReactElement<{ loading: boolean }>, { loading })
            : children}
        </>
      )}
    </div>
  );
};

export default Upload;
