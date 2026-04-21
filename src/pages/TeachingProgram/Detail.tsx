import React, { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CALENDER_GRAY,
  CLOSE_CIRCLE_BLACK,
  DELETE_04,
  DOWNLOAD_ICON,
  EDIT_02,
  FILE_DOWNLOAD,
  FILE_UPLOAD,
  PLUS_SIGN,
  PLUS_WHITE,
  UPLOAD_EXCEL,
  UPLOAD_ICON
} from '@lib/ImageHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import EmptyTable from '@components/empty/EmptyTable';
import DetailPeriod from './DetailPeriod';
import EditPeriod from './EditPeriod';
import teachingProgramServices from '@services/teachingProgram';
import { convertTimestampToString } from '@lib/TimeHelper';
import { Toast } from '@components/toast';
import { downloadFileFromBlob } from '@lib/FileHelper';
import Icon from '@components/Icon/index';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import Upload, { UploadTrigger } from '@components/upload';
import { getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { ChevronLeft } from 'lucide-react';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';
import DrawerStatistic from '@components/DrawerStatistic/index';

const TeachingProgramDetail = () => {
  const { t } = useT();
  const navigate = useNavigate();
  const { permissions, currentUser } = useRootStore();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [periods, setPeriods] = useState<any[]>([]);
  const [isShowConfirmDeletePeriod, setIsShowConfirmDeletePeriod] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [showModalDetail, setShowModalDetail] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [periodsNumber, setPeriodsNumber] = useState(1);
  const [isShowUpload, setIsShowUpload] = useState(false);
  const [file, setFile] = useState<any>();
  const [isValidateSuccess, setIsValidateSuccess] = useState(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [uploadData, setUploadData] = useState([]);
  const [uploadTab, setUploadTab] = useState<'upload' | 'error'>('upload');
  const [errors, setErrors] = useState([]);
  const [statisticInfo, setStatisticInfo] = useState<any>({
    show: false,
    extraFilter: {},
    type: '',
    objectId: 0
  });
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'vi');

  const getImportForm = async () => {
    setLoading(true);
    try {
      const response = await teachingProgramServices.getTeachingProgramDetailImportForm();
      downloadFileFromBlob(response, 'import_tiet_day_vhs.xlsx');
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
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('teaching_program_id', String(id));
      const res: any = await teachingProgramServices.postTeachingProgramDetailImportForm(formData);
      setUploadData(res?.parsed_data);
      Toast('success', res?.message);
      setIsValidateSuccess(true);
      setUploadTab('upload');
      setLoading(false);
    } catch (error: any) {
      setErrors(error.response?.data?.errors);
      setIsValidateSuccess(false);
      setUploadTab('error');
      setLoading(false);
    }
  };

  const onUploadFile = async () => {
    try {
      setLoading(true);

      const res_upload: any = await teachingProgramServices.postTeachingProgramDetailImport({ data: uploadData });
      Toast('success', res_upload?.message);
      setIsShowUpload(false);
      setIsUploadSuccess(true);
      getPeriods();
      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);

      setIsShowUpload(false);
    }
  };

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'program_name,program_code,subject_id,lesson_count,last_updated_by,created_at,updated_at,updated_lesson_count,last_updated_by_user,statistic,user_ability'
    };
    try {
      const { data }: any = await teachingProgramServices.getTeachingProgram(Number(id), params);
      setDetail(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getPeriods = async () => {
    setLoading(true);
    let params = {
      fields:
        'identity,teaching_program_id,lesson_number,lesson_name,lesson_content,youtube_link,drive_link,tiktok_link,valid,created_at,updated_at,user_ability,manual_code,english_lesson_content',
      filterings: {
        'teaching_program_id:eq': Number(id)
      },
      limit: 100000,
      offset: 0,
      sort: 'lesson_number',
      direction: 'asc'
    };
    try {
      const res: any = await teachingProgramServices.getTeachingProgramDetails(params);
      setPeriods(res?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await teachingProgramServices.deleteTeachingProgram(Number(id));
      Toast('success', response?.message);
      setIsShowConfirm(false);
      navigate('/teaching-program/list');
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };
  const handleDeletePeriod = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await teachingProgramServices.deleteTeachingProgramDetail(selectedId);
      Toast('success', response?.message);
      setIsShowConfirm(false);
      getPeriods();
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };

  useEffect(() => {
    if (id) {
      getDetail();
      getPeriods();
    }
  }, [id]);

  useEffect(() => {
    setCurrentLanguage(localStorage.getItem('language') || 'vi');
  }, [localStorage.getItem('language')]);

  return (
    <div className='pb-20'>
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
      <Confirm
        show={isShowConfirmDeletePeriod}
        type='warning'
        onCancel={() => {
          setIsShowConfirmDeletePeriod(false);
        }}
        onSuccess={handleDeletePeriod}
        description={t('txt_confirm_delete')}
      />
      <div className='shadow-lg card bg-primary-neutral-50 '>
        <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
          <h3 className='text-base font-semibold leading-[100%]'>
            {t(currentUser?.user_job_title == USER_ROLE.STUDENT ? 'lesson_detail' : 'teaching_program_details')}:{' '}
            {detail?.program_name}
          </h3>
          <div className='flex gap-2'>
            {!!permissions?.DELETE_TEACHING_PROGRAM && (
              <Button
                variant='secondary'
                className=''
                title={t('delete')}
                size={'icon'}
                onClick={() => {
                  setIsShowConfirm(true);
                }}
              >
                <img src={DELETE_04} alt='' />
              </Button>
            )}
            {!!permissions?.UPDATE_TEACHING_PROGRAM && (
              <Button
                variant='secondary'
                title={t('edit')}
                size={'icon'}
                onClick={() => {
                  navigate('/teaching-program/edit/' + id);
                }}
              >
                <img src={EDIT_02} alt='' />
              </Button>
            )}
          </div>
        </div>

        <div className='p-6 card-body flex gap-6 items-stretch'>
          <div className=' border border-primary-neutral-200 card flex-1'>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>
                {t(currentUser?.user_job_title == USER_ROLE.STUDENT ? '_lesson_info' : 'teaching_program_info')}
              </h3>
            </div>
            <div className='p-6 card-body '>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('program_name')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.program_name}</div>
                </div>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('number_of_periods')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.lesson_count}</div>
                </div>
                {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                  <div className='grid grid-cols-[160px_30px_1fr]'>
                    <div className='text-primary-neutral-600'>{t('code')}</div>
                    <div className='text-primary-neutral-600'>:</div>
                    <div className=''>{detail?.program_code}</div>
                  </div>
                )}

                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('subject')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {currentUser?.user_job_title != USER_ROLE.STUDENT ? (
                      <p>
                        {getSubjectInfo(detail?.subject_id)?.subject_name} -{' '}
                        {getSubjectInfo(detail?.subject_id)?.subject_code}
                      </p>
                    ) : (
                      <p>{getSubjectInfo(detail?.subject_id)?.subject_name}</p>
                    )}
                  </div>
                </div>
                {/* <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('updated_periods')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {' '}
                    {detail?.updated_content}/{detail?.lesson_count} (
                    {((detail?.updated_content / detail?.lesson_count) * 100).toFixed(2)}%)
                  </div>
                </div> */}

                {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                  <>
                    <div className='grid grid-cols-[160px_30px_1fr]'>
                      <div className='text-primary-neutral-600'>{t('updated_by')}</div>
                      <div className='text-primary-neutral-600'>:</div>
                      <div className=''>
                        {detail?.last_updated_by_user?.username} - {detail?.last_updated_by_user?.display_name}
                      </div>
                    </div>
                    <div className='grid grid-cols-[160px_30px_1fr]'>
                      <div className='text-primary-neutral-600'>{t('update_time')}</div>
                      <div className='text-primary-neutral-600'>:</div>
                      <div className=''>{convertTimestampToString(detail?.updated_at, 'right')}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {currentUser?.user_job_title == USER_ROLE.STUDENT ? null : (
            <div className=' border border-primary-neutral-200 card flex-1'>
              <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
                <h3 className='text-base font-semibold leading-[100%]'>{t('program_allocation_info')}</h3>
              </div>
              <div className='p-6 card-body'>
                <div className='grid text-sm gap-y-4'>
                  <div className='grid grid-cols-[100px_30px_1fr]'>
                    <div className='text-primary-neutral-600'>{t('classroom')}</div>
                    <div className='text-primary-neutral-600'>:</div>
                    <div
                      className='underline text-primary-blue-500 cursor-pointer w-min'
                      onClick={() => {
                        setStatisticInfo({
                          show: true,
                          objectId: detail?.id,
                          type: 'classroom',
                          extraFilter: {
                            filterings: {
                              ['teaching_program_id:eq']: detail?.id
                            }
                          }
                        });
                      }}
                    >
                      {detail?.statistic?.classrooms}
                    </div>
                  </div>
                  <div className='grid grid-cols-[100px_30px_1fr]'>
                    <div className='text-primary-neutral-600'>{t('students')}</div>
                    <div className='text-primary-neutral-600'>:</div>
                    <div
                      className='underline text-primary-blue-500 cursor-pointer w-min'
                      onClick={() => {
                        setStatisticInfo({
                          show: true,
                          objectId: detail?.id,
                          type: 'student',
                          extraFilter: {
                            filterings: {
                              ['teaching_program_id:eq']: detail?.id
                            }
                          }
                        });
                      }}
                    >
                      {detail?.statistic?.students}
                    </div>
                  </div>
                  <div className='grid grid-cols-[100px_30px_1fr]'>
                    <div className='text-primary-neutral-600'>{t('teachers')}</div>
                    <div className='text-primary-neutral-600'>:</div>
                    <div
                      className='underline text-primary-blue-500 cursor-pointer w-min'
                      onClick={() => {
                        setStatisticInfo({
                          show: true,
                          objectId: detail?.id,
                          type: 'teacher',
                          extraFilter: {
                            filterings: {
                              ['teaching_program_id:eq']: detail?.id
                            }
                          }
                        });
                      }}
                    >
                      {detail?.statistic?.teachers}
                    </div>
                  </div>
                  <div className='grid grid-cols-[100px_30px_1fr]'>
                    <div className='text-primary-neutral-600'>{t('teaching_assistant')}</div>
                    <div className='text-primary-neutral-600'>:</div>
                    <div
                      className='underline text-primary-blue-500 cursor-pointer w-min'
                      onClick={() => {
                        setStatisticInfo({
                          show: true,
                          objectId: detail?.id,
                          type: 'ta',
                          extraFilter: {
                            filterings: {
                              ['teaching_program_id:eq']: detail?.id
                            }
                          }
                        });
                      }}
                    >
                      {detail?.statistic?.tas}
                    </div>
                  </div>
                  <div className='grid grid-cols-[100px_30px_1fr]'>
                    <div className='text-primary-neutral-600'>{t('location')}</div>
                    <div className='text-primary-neutral-600'>:</div>
                    <div
                      className='underline text-primary-blue-500 cursor-pointer w-min'
                      onClick={() => {
                        setStatisticInfo({
                          show: true,
                          objectId: detail?.id,
                          type: 'location',
                          extraFilter: {
                            filterings: {
                              ['teaching_program_id:eq']: detail?.id
                            }
                          }
                        });
                      }}
                    >
                      {detail?.statistic?.teaching_locations}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='shadow-lg card bg-primary-neutral-50 mt-6 px-6 py-3'>
        <div className='border-b flex items-center justify-between py-5'>
          <p className='text-lg font-semibold'>{t('teaching_period_list')}</p>
          <div className='flex items-center gap-2'>
            {!!permissions?.CREATE_TEACHING_PROGRAM && (
              <Button variant={'outline'} onClick={getImportForm} disabled={loading}>
                <Icon icon={DOWNLOAD_ICON} className='text-primary-neutral-900' />
                {t('download_template')}
              </Button>
            )}
            {!!permissions?.CREATE_TEACHING_PROGRAM && (
              <AlertDialog
                open={isShowUpload}
                onOpenChange={(open) => {
                  setIsShowUpload(open);
                  setIsValidateSuccess(false);
                  if (!open) {
                    setUploadTab('upload');
                    setFile(null);
                  }
                }}
              >
                <AlertDialogTrigger className='btn btn-danger'>
                  <Button
                    variant={'outline'}
                    className='text-primary-blue-500 border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 hover:text-primary-blue-500'
                  >
                    <Icon icon={UPLOAD_ICON} className='text-primary-blue-500' />
                    {t('upload_data')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className={`rounded-[32px] p-2 ${uploadTab == 'error' ? 'max-w-[1200px]' : 'max-w-[700px]'} `}
                >
                  <div className='p-4 border rounded-[32px]'>
                    <AlertDialogHeader className='pl-2.5 py-1 border-b mb-6 flex flex-row justify-between space-y-0'>
                      <div className='flex items-center gap-3'>
                        {uploadTab == 'error' && (
                          <Button
                            variant={'outline'}
                            className='size-9 p-0'
                            onClick={() => {
                              setUploadTab('upload');
                            }}
                          >
                            <ChevronLeft width={36} height={36} />
                          </Button>
                        )}{' '}
                        <div
                          className={`text-lg ${uploadTab == 'error' ? 'text-primary-error' : 'text-primary-neutral-900'}`}
                        >
                          {t(uploadTab == 'error' ? 'file_upload_error' : 'upload_file')}{' '}
                          {uploadTab == 'error' && (
                            <>
                              {' '}
                              ({errors?.length || 0} {t('errors').toLocaleLowerCase()})
                            </>
                          )}
                        </div>
                      </div>

                      <AlertDialogCancel className='h-auto gap-0 p-0 mt-0 border-0 shadow-none'>
                        <img src={CLOSE_CIRCLE_BLACK} />
                      </AlertDialogCancel>
                    </AlertDialogHeader>
                    {uploadTab == 'upload' ? (
                      <>
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

                              <div className='leading-[100%]'>
                                {' '}
                                {file?.name ? file?.name : t('drag_and_drop_excel')}
                              </div>
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
                          <div
                            className='text-sm underline text-primary-success cursor-pointer'
                            onClick={getImportForm}
                          >
                            {t('download_template')}
                          </div>
                          <Button
                            className=''
                            variant={'default'}
                            onClick={isValidateSuccess ? onUploadFile : onValidateFile}
                            disabled={loading}
                          >
                            <img src={FILE_UPLOAD} alt='' />
                            {isValidateSuccess ? t('upload_data') : t('check_data')}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className='h-[calc(100vh-400px)] overflow-y-auto'>
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
                    )}
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {!!permissions?.CREATE_TEACHING_PROGRAM && (
              <Button
                className='bg-primary-success hover:bg-primary-success/80'
                onClick={() => {
                  setShowModalEdit(true);
                  setSelectedId(0);
                  setPeriodsNumber(periods?.length + 1);
                }}
              >
                <img src={PLUS_WHITE} alt='' /> {t('add_new')}
              </Button>
            )}
          </div>
        </div>
        <table className='mt-5 table-rounded w-full'>
          <thead>
            <tr className='bg-primary-blue-50'>
              <th className='w-32 min-w-32 '>
                {t(currentUser?.user_job_title != USER_ROLE.STUDENT ? 'lesson_code_and_period' : 'lesson_period')}
              </th>
              <th className='min-w-96 w-96'>
                {t(currentUser?.user_job_title != USER_ROLE.STUDENT ? 'lesson_title_and_content' : '_lesson_content')}
              </th>
              {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                <th className='w-56 max-w-56'>{t('driver_link')}</th>
              )}

              <th className='w-56 max-w-56'>{t('youtube_link')}</th>
              <th className='w-56 max-w-56'>{t('tiktok_link')}</th>
              {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                <>
                  <th className='min-w-56 w-56 '>{t('update_time')}</th>
                  <th className='w-24'>{t('action')}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className='bg-white'>
            {periods?.length > 0 ? (
              periods.map((item: any, index: number) => (
                <tr key={index}>
                  <td className='text-left'>
                    {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                      <p>{item?.manual_code || item?.teaching_program_detail_code}</p>
                    )}

                    <p
                      className='text-primary-blue-500 cursor-pointer'
                      onClick={() => {
                        setShowModalDetail(true);
                        setSelectedId(item?.id);
                      }}
                    >
                      {t('period')} {item?.lesson_number}
                    </p>
                  </td>
                  <td className='text-left break-words'>
                    <p className='text-sm font-semibold mb-2'>{item?.lesson_name}</p>
                    <p className='text-sm font-medium text-primary-neutral-500 line-clamp-2'>
                      {currentLanguage == 'en' ? item?.english_lesson_content : item?.lesson_content}
                    </p>
                  </td>
                  {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                    <td className='underline text-primary-blue-600 break-words max-w-56'>
                      <a
                        href={item?.drive_link}
                        target='_blank'
                        className='break-words'
                        style={{ wordBreak: 'break-word' }}
                      >
                        {item?.drive_link}
                      </a>
                    </td>
                  )}

                  <td className='underline text-primary-blue-600 break-words max-w-56'>
                    <a
                      href={item?.youtube_link}
                      target='_blank'
                      className='break-words'
                      style={{ wordBreak: 'break-word' }}
                    >
                      {item?.youtube_link}
                    </a>
                  </td>
                  <td className='underline text-primary-blue-600 max-w-56'>
                    <a
                      href={item?.tiktok_link}
                      target='_blank'
                      className='break-words'
                      style={{ wordBreak: 'break-word' }}
                    >
                      {item?.tiktok_link}
                    </a>
                  </td>
                  {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                    <>
                      <td className='text-left'>
                        <p>
                          {getUserInfo(item?.creator_id)?.username} - {getUserInfo(item?.creator_id)?.display_name}
                        </p>

                        <div className='flex items-center gap-2 mt-1'>
                          <img src={CALENDER_GRAY} />
                          <p className='text-sm font-medium text-primary-neutral-500'>
                            {convertTimestampToString(item?.updated_at, 'right')}
                          </p>
                        </div>
                      </td>
                      <td className='whitespace-nowrap'>
                        <div className='flex items-center justify-center gap-1'>
                          {!!item?.user_ability?.can_edit && (
                            <img
                              src={EDIT_02}
                              className='cursor-pointer'
                              alt=''
                              onClick={() => {
                                setShowModalEdit(true);
                                setSelectedId(item?.id);
                              }}
                            />
                          )}
                          {!!item?.user_ability?.can_delete && (
                            <img
                              src={DELETE_04}
                              className='cursor-pointer'
                              alt=''
                              onClick={() => {
                                setIsShowConfirmDeletePeriod(true);
                                setSelectedId(item?.id);
                              }}
                            />
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12}>
                  <EmptyTable />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DetailPeriod show={showModalDetail} setShow={setShowModalDetail} id={selectedId} />
      <EditPeriod
        show={showModalEdit}
        setShow={setShowModalEdit}
        id={selectedId}
        periodsNumber={periodsNumber}
        getData={getPeriods}
        teachingProgramId={Number(id)}
      />
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

export default TeachingProgramDetail;
