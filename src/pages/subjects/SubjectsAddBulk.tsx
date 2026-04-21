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
import studentServices from '@services/student';
import { downloadFileFromBlob } from '@lib/FileHelper';
import { Toast } from '@components/toast';
import Loading from '@components/loading/index';
import { useNavigate } from 'react-router-dom';
import EmptyTable from '@components/empty/EmptyTable';

interface Props {}

const SubjectAddBulk = (props: Props) => {
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
      const response = await studentServices.getStudentImportForm();
      downloadFileFromBlob(response, 'import_hoc_sinh_vhs.xlsx');
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const onValidateFile = async () => {
    try {
      if (!file) {
        return Toast('error', t('file_not_empty'));
      }
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await studentServices.postStudentImportForm(formData);
      setUploadData(res?.parsed_data);
      Toast('success', res?.message);
      setIsValidateSuccess(true);
    } catch (error: any) {
      setErrors(error.response?.data?.errors);
      setIsShowUpload(false);
      setIsValidateSuccess(false);
    }
  };

  const onUploadFile = async () => {
    try {
      const res_upload: any = await studentServices.postStudentImport({ data: uploadData });
      Toast('success', res_upload?.message);
      setIsShowUpload(false);
      setIsUploadSuccess(true);
    } catch (error: any) {
      console.log(error);
      setIsShowUpload(false);
    }
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
      <div className='w-full overflow-hidden border rounded-lg shadow-lg border-neutral-300'>
        <div className='p-3 text-neutral-50 bg-primary-blue-500'>
          <h3 className='text-base font-semibold'>{t('bulk_add_student_accounts')}</h3>
        </div>
        <div className='p-4 bg-white'>
          <div className='flex justify-between'>
            <div className='flex items-center'></div>
            <div className='flex gap-3'>
              <Button className='bg-primary-success' onClick={getImportForm}>
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
                  <Button className='' variant={'default'}>
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
                      useService={false}
                      onChange={(files) => {
                        setFile(files[0]);
                        setErrors([]);
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
          </div>
        </div>
      </div>
      <div>
        {errors?.length > 0 && (
          <div className='flex items-center justify-end w-full pt-6'>
            <div className='bg-white rounded-md flex items-center gap-1 px-2 h-10'>
              <p className='text-primary-error text-sm font-semibold'>{t('total_error_lines')}</p>
              <div className='text-primary-error text-sm bg-[#FFE2E0] rounded-full min-w-6 h-6 flex items-center justify-center'>
                {errors?.length}
              </div>
            </div>
          </div>
        )}

        <table className='mt-6 table-rounded'>
          <thead>
            <tr className='bg-primary-blue-50'>
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
      </div>
    </div>
  );
};

export default SubjectAddBulk;
