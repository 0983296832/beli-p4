import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Search, Upload as UploadIcon, ImageIcon, X } from 'lucide-react';
import TextInput from '../fields/TextInput';
import { useT } from '@hooks/useT';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import Upload, { UploadTrigger } from '../upload';
import mainServices from '../../services/main';
import Loading from '../loading';

interface Props {
  onSuccess: (url: string) => void;
  children: React.ReactNode;
}

export default function SelectImageModal(props: Props) {
  const { onSuccess, children } = props;
  const [open, setOpen] = useState(false);
  const { t } = useT();
  const [tabValue, setTabValue] = useState('google');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [urlImage, setUrlImage] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [isFailImg, setIsFailImg] = useState(false);

  const handleConfirm = () => {
    if (tabValue == 'google') {
      if (!isFailImg && urlImage) onSuccess(urlImage);
    } else {
      if (uploadedFile) onSuccess(uploadedFile);
    }
    setImageUrl('');
    setUrlImage('');
    setUploadedFile('');
    setOpen(false);
  };

  function dataUrlToFile(input: string, filename = 'upload') {
    const hasComma = input.includes(',');
    const header = hasComma ? input.split(',')[0] : '';
    const b64 = hasComma ? input.split(',')[1] : input;

    const mimeMatch = header.match(/data:(.*?);base64/);
    const mimeType = mimeMatch?.[1] || 'application/octet-stream';

    const binary = atob(b64.replace(/\s/g, ''));
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

    // đoán ext cơ bản từ mime
    const extMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'video/mp4': 'mp4'
    };
    const ext = extMap[mimeType] || 'bin';

    const blob = new Blob([bytes], { type: mimeType });
    // File API có sẵn trong browser
    return new File([blob], `${filename}.${ext}`, { type: mimeType });
  }

  function isBase64(str: string): boolean {
    if (!str || typeof str !== 'string') return false;

    // Nếu là data URL có base64
    if (/^data:([a-zA-Z0-9.+/-]+);base64,/.test(str)) {
      return true;
    }

    // Nếu là base64 thuần (chỉ chứa ký tự hợp lệ và chiều dài bội số 4)
    const notBase64 = /[^A-Z0-9+/=]/i;
    if (notBase64.test(str)) return false;
    return str.length % 4 === 0;
  }

  const handleAddImageUrl = async () => {
    if (!imageUrl.trim()) return;

    setLoadingUrl(true);
    try {
      // If successful, set as the single URL image
      if (isBase64(imageUrl)) {
        const file = dataUrlToFile(imageUrl);
        const formData = new FormData();
        formData.append('file', file);
        const response: any = await mainServices.onTempUploadFile(formData);
        setUrlImage(response?.data?.fileUrl);
        setIsFailImg(false);
        setLoadingUrl(false);
      } else {
        setUrlImage(imageUrl);
        setIsFailImg(false);
        setImageUrl(imageUrl);
        setLoadingUrl(false);
      }
    } catch (error) {
      setIsFailImg(true);
      setLoadingUrl(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className=' flex flex-col max-w-4xl h-[700px] z-[9999]'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('select_image')}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className='flex flex-1 h-full'>
          <Loading loading={loadingUrl} />
          <Tabs
            defaultValue='google'
            className='flex flex-col h-full w-full'
            value={tabValue}
            onValueChange={(val) => setTabValue(val)}
          >
            <TabsList className='grid w-full grid-cols-2 mb-4'>
              <TabsTrigger value='google' className='flex items-center'>
                <Search className='mr-2 h-4 w-4' />
                {t('use_online_image_url')}
              </TabsTrigger>
              <TabsTrigger value='upload' className='flex items-center'>
                <UploadIcon className='mr-2 h-4 w-4' />
                {t('upload_from_computer')}
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 flex flex-col'>
              <TabsContent value='google' className='flex-1 mt-0'>
                <div className='space-y-4 h-full'>
                  <div className='flex gap-2'>
                    <Input
                      placeholder={t('paste_image_url_one_image')}
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                      }}
                      className='flex-1 z-[9999]'
                      onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                    />
                    <Button onClick={handleAddImageUrl} disabled={loadingUrl || !imageUrl.trim()}>
                      {t(loadingUrl ? 'loading' : 'check')}
                    </Button>
                  </div>

                  {urlImage ? (
                    <div className='flex justify-center'>
                      <div
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all max-w-md border-gray-200 hover:border-gray-300`}
                      >
                        <img
                          src={urlImage || '/placeholder.svg'}
                          alt='URL image'
                          className='max-w-full max-h-80 object-cover'
                          onError={(e) => {
                            e.currentTarget.src =
                              '/placeholder.svg?height=200&width=200&text=' + t('image_upload_error');
                          }}
                        />
                        {selectedImage === urlImage && (
                          <div className='absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center'>
                            <div className='bg-blue-500 text-white rounded-full p-1'>✓</div>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUrlImage(null);
                            if (selectedImage === urlImage) {
                              setSelectedImage(null);
                            }
                          }}
                          className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'
                        >
                          <X className='size-4 text-white' />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='flex-1 flex items-center justify-center text-gray-500'>
                      <div className='text-center'>
                        <Search className='mx-auto h-12 w-12 mb-4 opacity-50' />
                        <p>{t('paste_image_url_to_display')}</p>
                        <p className='text-sm mt-2'>{t('example')}: https://example.com/image.jpg</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='upload' className='flex-1 mt-0'>
                <div className='space-y-4 h-full'>
                  <Upload
                    value={[]}
                    className='w-full'
                    isSingle
                    maxFiles={1}
                    onChange={(files) => {
                      setUploadedFile(files[0].url);
                    }}
                    accept={{ 'image/*': [] }}
                  >
                    <UploadTrigger
                      render={(loading) => (
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-2 text-center w-full'>
                          {loading ? (
                            <svg
                              aria-hidden='true'
                              className='w-12 h-12 text-white animate-spin dark:text-gray-600 fill-primary-blue mx-auto'
                              viewBox='0 0 100 101'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                fill='currentColor'
                              />
                              <path
                                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                fill='currentFill'
                              />
                            </svg>
                          ) : (
                            <UploadIcon className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                          )}

                          <div className='space-y-2'>
                            <p className='text-lg font-medium'>{t('upload_image')}</p>
                            <p className='text-sm text-gray-500'>{t('drag_and_drop_image_or_click_to_select')}</p>
                          </div>
                        </div>
                      )}
                    />
                  </Upload>

                  {uploadedFile && (
                    <div className='mt-4 mx-auto flex items-center justify-center'>
                      <img
                        src={uploadedFile || '/placeholder.svg'}
                        alt='Uploaded preview'
                        className='max-w-full max-h-64 rounded-lg border'
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <div className='flex justify-end gap-2 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setOpen(false);
                    setImageUrl('');
                    setUrlImage('');
                    setUploadedFile('');
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={tabValue == 'google' ? isFailImg || !urlImage : !uploadedFile}
                >
                  {t('confirm')}
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
