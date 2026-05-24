import { useState } from 'react';
import { useT } from '@hooks/useT';
import TextInput from '@components/fields/TextInput';
import DateInput from '@components/fields/DateInput';
import SelectInput from '@components/fields/SelectInput';
import { Button } from '@components/ui/button';
import {
  AVATAR,
  CLOSE_CIRCLE_BLACK,
  FILE_DOWNLOAD,
  FILE_UPLOAD,
  FILTER_HORIZONTAL,
  PLUS_SIGN,
  UPLOAD_EXCEL,
  UPLOAD_SUCCESS
} from '@lib/ImageHelper';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import SearchInput from '@components/fields/SearchInput';
import Upload, { UploadTrigger } from '@components/upload';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from '@remixicon/react';
import Loading from '@components/loading/index';
import EmptyTable from '@components/empty/EmptyTable';

interface Props {}

const TeacherAssistantAddBulk = (props: Props) => {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<any>();
  const [errors, setErrors] = useState([]);
  const [isShowUpload, setIsShowUpload] = useState(false);
  const [isValidateSuccess, setIsValidateSuccess] = useState(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [uploadData, setUploadData] = useState([]);
  const navigate = useNavigate();

  const getImportForm = async () => {
    setLoading(true);
    try {
      // const response = await studentServices.getStudentImportForm();
      // downloadFileFromBlob(response, 'import_hoc_sinh_vhs.xlsx');
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const onValidateFile = async () => {
    // try {
    //   if (!file) {
    //     return Toast('error', t('file_not_empty'));
    //   }
    //   const formData = new FormData();
    //   formData.append('file', file);
    //   const res: any = await studentServices.postStudentImportForm(formData);
    //   setUploadData(res?.parsed_data);
    //   Toast('success', res?.message);
    //   setIsValidateSuccess(true);
    // } catch (error: any) {
    //   setErrors(error.response?.data?.errors);
    //   setIsShowUpload(false);
    //   setIsValidateSuccess(false);
    // }
  };

  const onUploadFile = async () => {
    // try {
    //   const res_upload: any = await studentServices.postStudentImport({ data: uploadData });
    //   Toast('success', res_upload?.message);
    //   setIsShowUpload(false);
    //   setIsUploadSuccess(true);
    // } catch (error: any) {
    //   console.log(error);
    //   setIsShowUpload(false);
    // }
  };

  return (
    <div>
      <Loading loading={loading} />
      <AlertDialog open={isUploadSuccess}>
        <AlertDialogContent className='rounded-[32px] p-2 max-w-[500px]'>
          <div className='p-4 border rounded-[32px] flex items-center justify-center flex-col gap-6'>
            <img src={UPLOAD_SUCCESS} />
            <p className='text-baste font-semibold'>{t('upload_success')}</p>
          </div>
          <Button
            className='text-center mx-auto mt-4'
            onClick={() => {
              navigate('/user/student/list');
            }}
          >
            {' '}
            {t('back_to_list')}
          </Button>
        </AlertDialogContent>
      </AlertDialog>
      <div className='mx-auto w-full max-w-6xl pb-24'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>
                  {t('add_teaching_assistant_account')}
                </p>
                <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                  {t('bulk_add_teaching_assistant_accounts')}
                </h3>
              </div>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl border-violet-200 bg-white text-violet-700 hover:bg-violet-100'
                onClick={() => {
                  navigate('/user/teacher_assistant/list');
                }}
              >
                <RiArrowLeftLine className='size-4' />
                {t('back')}
              </Button>
            </div>
          </div>

          <div className='space-y-4 p-5 lg:p-6'>
            <section className='rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4'>
              <div className='flex flex-wrap items-center justify-end gap-3'>
                <Button className='rounded-xl bg-emerald-500 text-white hover:bg-emerald-600' onClick={getImportForm}>
                  <img src={FILE_DOWNLOAD} alt='' />
                  {t('download_template')}
                </Button>
                <AlertDialog
                  open={isShowUpload}
                  onOpenChange={(open) => {
                    setIsShowUpload(open);

                    setIsValidateSuccess(false);
                  }}
                >
                  <AlertDialogTrigger className='btn btn-danger'>
                    <Button className='rounded-xl' variant={'default'}>
                      <img src={FILE_UPLOAD} alt='' />
                      {t('upload_data')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className='rounded-[32px] p-2 max-w-[700px]'>
                    <div className='p-4 border rounded-[32px]'>
                      <AlertDialogHeader className='pl-2.5 py-1 border-b mb-6 flex flex-row justify-between space-y-0'>
                        <div className='text-lg'>{t('upload_file')}</div>
                        <AlertDialogCancel className='h-auto gap-0 p-0 mt-0 border-0 shadow-none'>
                          <img src={CLOSE_CIRCLE_BLACK} />
                        </AlertDialogCancel>
                      </AlertDialogHeader>
                      <Upload
                        className='mb-5 w-full'
                        isSingle
                        maxFiles={1}
                        onChange={(files) => {
                          setFile(files[0]);
                        }}
                        accept={{ '.xls': [], '.xlsx': [] }}
                      >
                        <UploadTrigger>
                          <div className='flex flex-col items-center justify-center gap-6 border-2 border-dashed border-primary-neutral-300 p-9 rounded-[16px]'>
                            <img src={UPLOAD_EXCEL} width={52} height={72} alt='' />

                            <div className='leading-[100%]'> {file?.name ? file?.name : t('drag_and_drop_excel')}</div>
                            <div>
                              <Button className='shadow-none' variant={'outline'}>
                                <img src={PLUS_SIGN} alt='' />
                                {t('select_file')}
                              </Button>
                            </div>
                          </div>
                        </UploadTrigger>
                      </Upload>
                      <div className='flex items-center justify-between mt-4 pl-2.5'>
                        <div className='text-sm underline text-primary-success cursor-pointer' onClick={getImportForm}>
                          {t('download_template')}
                        </div>
                        <Button
                          className=''
                          variant={'default'}
                          onClick={isValidateSuccess ? onUploadFile : onValidateFile}
                        >
                          <img src={FILE_UPLOAD} alt='' />
                          {isValidateSuccess ? t('upload_data') : t('check_data')}
                        </Button>
                      </div>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </section>

            <section className='overflow-hidden rounded-2xl border border-violet-200 bg-white'>
              {errors?.length > 0 && (
                <div className='flex items-center justify-end border-b border-violet-100 bg-rose-50/40 px-4 py-3'>
                  <div className='flex items-center gap-1 rounded-md bg-white px-2 h-10'>
                    <p className='text-primary-error text-sm font-semibold'>{t('total_error_lines')}</p>
                    <div className='text-primary-error text-sm bg-[#FFE2E0] rounded-full min-w-6 h-6 flex items-center justify-center'>
                      {errors?.length}
                    </div>
                  </div>
                </div>
              )}
              <table className='table-rounded w-full'>
                <thead>
                  <tr className='bg-violet-50'>
                    <th scope='col' className='w-16'>
                      <div className='flex justify-center'>{t('number_order')}</div>
                    </th>
                    <th scope='col' className='w-36'>
                      {t('line_error')}
                    </th>
                    <th scope='col'>{t('error_description')}</th>
                  </tr>
                </thead>
                <tbody className='bg-white'>
                  {errors?.length > 0 ? (
                    errors?.map((error: any, index) => (
                      <tr key={index}>
                        <td>
                          <div className='flex justify-center'>1</div>
                        </td>
                        <td>{error?.row}</td>
                        <td className='text-left'>
                          {Object.values(error?.errors)?.map((error_des: any) => {
                            return <li className='text-primary-error'>{error_des}</li>;
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <EmptyTable />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </div>

        <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/95 px-4 py-2 shadow-[0_-6px_14px_-12px_rgba(15,23,42,0.25)]'>
          <div className='mx-auto flex w-full max-w-6xl justify-center gap-4'>
            <Button
              variant='outline'
              type='button'
              className='min-w-[140px] rounded-xl border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
              onClick={() => {
                navigate('/user/teacher_assistant/list');
              }}
            >
              {t('back')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssistantAddBulk;
