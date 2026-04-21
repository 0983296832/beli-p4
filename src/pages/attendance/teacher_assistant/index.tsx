import { useEffect, useState } from 'react';
import { CALENDER_GRAY, CLOCK_05, CLOSE_CIRCLE_WHITE, DELETE_04, EDIT_02 } from '@lib/ImageHelper';
import TextInput from '@components/fields/TextInput';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import SelectInput from '@components/fields/SelectInput';
import { Link, useNavigate } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import DateInput from '@components/fields/DateInput';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import StudentSelect from '@components/selects/StudentSelect';
import { mergeObjects, roundNumber } from '@lib/JsHelper';
import { Toast } from '@components/toast';
import Confirm from '@components/confirm';
import Loading from '@components/loading';
import EmptyTable from '@components/empty/EmptyTable';
import attendanceServices from '@services/attendance';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { calculateTimeDifference, convertTimestampToString, convertTo12HourFormat } from '@lib/TimeHelper';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@components/ui/sheet';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogHeader } from '@components/ui/alert-dialog';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import UsersSelect from '@components/selects/UsersSelect';
import { useRootStore } from '@store/index';
import { downloadFileFromBlob } from '@lib/FileHelper';
import { RiAddLine, RiDeleteBin6Line, RiDownloadLine, RiFilter3Line } from '@remixicon/react';

const TABLE_SHELL =
  'w-full min-w-[1280px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

interface Props {}

export const HistorySheet = ({ show, setShow, selectedId }: any) => {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  const getData = async () => {
    setLoading(true);
    try {
      const response: any = await attendanceServices.getTAAttendancesLog(selectedId);
      setData(response);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && selectedId) {
      getData();
    }
  }, [show]);

  return (
    <>
      <Sheet
        open={show}
        onOpenChange={(open) => {
          setShow(open);
        }}
      >
        <SheetContent
          className='!w-[500px] max-w-[500px] bg-white px-6 py-0'
          onInteractOutside={(e) => {
            showReason && e.preventDefault();
          }}
        >
          <SheetHeader className=' py-6'>
            <SheetTitle className='text-base font-semibold'>{t('diary')}</SheetTitle>
          </SheetHeader>
          <SearchInput
            placeholder={t('search')}
            className='w-full'
            value={search}
            onChange={(value) => {
              setSearch(value);
            }}
          />
          <div className='h-[calc(100vh-120px)] overflow-y-auto py-6 space-y-2'>
            <Loading loading={loading} />
            {data
              ?.filter((vl: { action_name: string }) =>
                vl?.action_name?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase())
              )
              ?.map((log: any, index) => {
                return (
                  <div className='p-3 border rounded' key={index}>
                    <div className='flex items-center gap-3'>
                      <img className='w-10 h-10 min-w-10 rounded-full object-cover' src={log?.avatar} />
                      <div className='text-left space-y-1 flex-1'>
                        <div className='flex items-center justify-between w-full'>
                          {' '}
                          <p className='text-sm font-medium'>{log?.display_name}</p>
                          <p
                            className='text-xs font-medium text-primary-blue-500 cursor-pointer'
                            onClick={() => {
                              if (log?.action == 4) {
                                setShowReason(true);
                                setReason(log?.current_version?.refuse_note);
                              } else {
                                navigate(`/attendance/teachers_assistant/detail-compare/${selectedId}/log/${log?.id}`);
                              }
                            }}
                          >
                            {t(log?.action == 4 ? 'view_reason' : 'view_version')}
                          </p>
                        </div>

                        <p className={`${log?.action == 4 ? 'text-primary-error' : ''} text-xs font-medium`}>
                          {log?.action_name}
                        </p>
                        <div className='flex items-center gap-2'>
                          <img src={CALENDER_GRAY} />
                          <p className='text-sm font-medium text-primary-neutral-500'>
                            {convertTimestampToString(log?.created_at, 'right')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={showReason}
        onOpenChange={(open) => {
          setShowReason(open);
          setShow(true);
        }}
      >
        <AlertDialogContent className='rounded-lg border-none gap-0 p-0 max-w-[700px]  overflow-hidden bg-transparent'>
          <AlertDialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
            <div>{t('reason_for_rejecting_attendance_approval')}</div>
            <AlertDialogCancel className='h-auto gap-0 p-0 mt-0 bg-transparent border-0 shadow-none hover:bg-transparent'>
              <img src={CLOSE_CIRCLE_WHITE} alt='' />
            </AlertDialogCancel>
          </AlertDialogHeader>
          <div className='p-4 space-y-6 bg-white min-h-[300px]'>
            <div className='p-6 rounded-lg border h-full'>
              <div dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(reason) }} />
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const AttendanceTeachersAssistantList = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { permissions } = useRootStore();
  const [infoSearch, setInfoSearch] = useState<any>({});
  const [openFilter, setOpenFilter] = useState(false);
  const [value, setValue] = useState<any>();
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowConfirmBulk, setIsShowConfirmBulk] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await attendanceServices.deleteTAAttendance(Number(selectedId));
      Toast('success', response?.message);
      setIsShowConfirm(false);
      getData();
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      Toast('warning', t('feature_under_development'));
      setIsShowConfirmBulk(false);
      getData();
    } catch (error) {
      setLoading(false);
      setIsShowConfirmBulk(false);
    }
  };

  const getData = async (filters?: any) => {
    let params: any = {
      fields:
        'identity,timeline_id,ta_id,attendance_code,classroom_id,status,teaching_program_id,teaching_program_detail_number,admin_assigned_id,subject_id,location_id,start_time,end_time,checkin_timestamp,checkout_timestamp,note,valid,created_at,updated_at,teaching_program_detail,teaching_program,attendance_time,user_ability',
      limit,
      offset,
      filterings: {}
    };
    if (infoSearch?.ta_attendance_code) {
      params.filterings['ta_attendance_code:contain'] = infoSearch?.ta_attendance_code;
    }
    if (infoSearch?.subject_id) {
      params.filterings['subject_id:in'] = infoSearch?.subject_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:in'] = infoSearch?.location_id;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:in'] = infoSearch?.classroom_id;
    }
    if (infoSearch?.attendance_start_time && infoSearch?.attendance_end_time) {
      if (infoSearch?.attendance_start_time > infoSearch?.attendance_end_time) {
        return Toast('warning', t('start_date_cannot_be_later_than_end_date'));
      }
      params.filterings['attendance_time:gte'] = infoSearch?.attendance_start_time;
      params.filterings['attendance_time:lte'] = infoSearch?.attendance_end_time;
    } else if (infoSearch?.attendance_start_time) {
      params.filterings['attendance_time:eq'] = infoSearch?.attendance_start_time;
    } else if (infoSearch?.attendance_end_time) {
      params.filterings['attendance_time:eq'] = infoSearch?.attendance_end_time;
    }
    if (infoSearch?.ta_id) {
      params.filterings['ta_id:in'] = infoSearch?.ta_id;
    }

    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await attendanceServices.getTAAttendances(params);
      setData(response?.data);
      setHasMore(response.has_more);
      setLimit(response?.limit);
      setOffset(response?.offset);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    let params: any = {
      filterings: {}
    };
    if (infoSearch?.ta_attendance_code) {
      params.filterings['ta_attendance_code:contain'] = infoSearch?.ta_attendance_code;
    }
    if (infoSearch?.subject_id) {
      params.filterings['subject_id:in'] = infoSearch?.subject_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:in'] = infoSearch?.location_id;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:in'] = infoSearch?.classroom_id;
    }
    if (infoSearch?.attendance_start_time && infoSearch?.attendance_end_time) {
      if (infoSearch?.attendance_start_time > infoSearch?.attendance_end_time) {
        return Toast('warning', t('start_date_cannot_be_later_than_end_date'));
      }
      params.filterings['attendance_time:gte'] = infoSearch?.attendance_start_time;
      params.filterings['attendance_time:lte'] = infoSearch?.attendance_end_time;
    } else if (infoSearch?.attendance_start_time) {
      params.filterings['attendance_time:eq'] = infoSearch?.attendance_start_time;
    } else if (infoSearch?.attendance_end_time) {
      params.filterings['attendance_time:eq'] = infoSearch?.attendance_end_time;
    }
    if (infoSearch?.ta_id) {
      params.filterings['ta_id:in'] = infoSearch?.ta_id;
    }
    setLoading(true);
    try {
      const response: any = await attendanceServices.getTAAttendanceExport(params);
      downloadFileFromBlob(response, 'danh_sach_diem_danh_tro_giang_vhs.xlsx');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className='pb-20 space-y-6'>
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
          show={isShowConfirmBulk}
          type='warning'
          onCancel={() => {
            setIsShowConfirmBulk(false);
          }}
          onSuccess={handleBulkDelete}
          description={t('txt_confirm_delete')}
        />
        <div className='w-full overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-5 text-slate-800'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h3 className='text-xl font-semibold tracking-wide'>{t('teacher_assistant_attendance_list')}</h3>
              <div className='hidden md:flex items-center gap-2'>
                <span className='rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700'>
                  {t('total')}: {data?.length || 0}
                </span>
                <span className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700'>
                  {t('selected_num').replace('${{num}}', String(ids?.length || 0))}
                </span>
              </div>
            </div>
          </div>
          <div className='bg-white p-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex items-center'>
                <Popover open={openFilter} onOpenChange={setOpenFilter}>
                  <PopoverAnchor asChild>
                    <div className='flex items-center gap-2 rounded-2xl border border-violet-200 bg-white p-2 shadow-sm'>
                      <SearchInput
                        placeholder={t('search')}
                        className='w-[320px] lg:w-[420px]'
                        value={infoSearch?.ta_attendance_code}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            getData({ offset: 0 });
                          }
                        }}
                        onChange={(value) => {
                          setInfoSearch({ ...infoSearch, ta_attendance_code: value });
                        }}
                      />

                      <Button
                        className='rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        variant={'ghost'}
                        onClick={() => {
                          setOpenFilter(!openFilter);
                        }}
                      >
                        <RiFilter3Line className='size-4' />
                        {t('filter')}
                      </Button>
                    </div>
                  </PopoverAnchor>

                  <PopoverContent
                    className='w-[730px] rounded-2xl border-violet-200 bg-white'
                    align='start'
                    onInteractOutside={(e) => e.preventDefault()}
                  >
                    <div className='grid grid-cols-2 gap-2'>
                      {/* <div className='col-span-2'>
                        <DateInput
                          label={t('attendance_date')}
                          value={infoSearch?.attendance_time}
                          onChange={(e) => {
                            setInfoSearch({ ...infoSearch, attendance_time: e });
                          }}
                        />
                      </div> */}
                      <DateInput
                        label={t('attendance_start_date')}
                        value={infoSearch?.attendance_start_time}
                        onChange={(e) => {
                          setInfoSearch({ ...infoSearch, attendance_start_time: e });
                        }}
                      />
                      <DateInput
                        label={t('attendance_end_date')}
                        value={infoSearch?.attendance_end_time}
                        onChange={(e) => {
                          setInfoSearch({ ...infoSearch, attendance_end_time: e });
                        }}
                      />
                      <SubjectsSelect
                        isClearable
                        label={t('subject')}
                        placeholder={t('select_subject')}
                        value={infoSearch?.subject_id}
                        isMulti
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, subject_id: val?.map((v) => v?.id) || undefined });
                        }}
                      />
                      <TeachingLocationSelect
                        placeholder={t('select_teaching_location')}
                        isClearable
                        label={t('teaching_location')}
                        value={infoSearch?.location_id}
                        isMulti
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, location_id: val?.map((v) => v?.id) || undefined });
                        }}
                      />
                      <ClassroomSelect
                        isClearable
                        label={t('classroom')}
                        value={infoSearch?.classroom_id}
                        isMulti
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, classroom_id: val?.map((v) => v?.id) || undefined });
                        }}
                      />
                      <UsersSelect
                        label={t('teaching_assistant')}
                        role='TA'
                        isMulti
                        isClearable
                        value={infoSearch?.ta_id}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, ta_id: val?.map((v) => v?.id) || undefined });
                        }}
                      />
                    </div>
                    <div className='mt-4 flex justify-end gap-3'>
                      <Button
                        className='rounded-xl border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                        variant={'ghost'}
                        onClick={() => {
                          getData({
                            filterings: {
                              'ta_id:in': undefined,
                              'subject_id:in': undefined,
                              'location_id:in': undefined,
                              'classroom_id:in': undefined,
                              'attendance_time:eq': undefined,
                              'attendance_time:lte': undefined,
                              'attendance_time:gte': undefined
                            },
                            offset: 0
                          });
                          setInfoSearch({
                            ta_id: undefined,
                            subject_id: undefined,
                            location_id: undefined,
                            classroom_id: undefined,
                            attendance_start_time: undefined,
                            attendance_end_time: undefined
                          });
                          setOpenFilter(false);
                        }}
                      >
                        {t('restore_default')}
                      </Button>
                      <Button
                        className='rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-600'
                        onClick={() => {
                          getData({ offset: 0 });
                          setOpenFilter(false);
                        }}
                      >
                        {t('apply')}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  className='rounded-xl border border-violet-200 bg-white text-violet-800 shadow-sm hover:bg-violet-50'
                  variant='outline'
                  onClick={exportData}
                >
                  <RiDownloadLine className='size-4' />
                  {t('download')}
                </Button>
                {!!permissions.CREATE_TA_ATTENDANCE && (
                  <Button
                    className='rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/attendance/teachers_assistant/edit/0');
                    }}
                  >
                    <RiAddLine className='size-4' />
                    {t('add_new')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-1 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className={TABLE_SHELL}>
            <thead>
              <tr>
                <th scope='col' className='!w-14 bg-slate-100'>
                  <div className='flex justify-center'>
                    <CheckboxInput
                      checked={data.every((attendant: any) => ids?.includes(attendant?.id))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setIds([...ids, ...data.map((attendant: any) => attendant?.id)]);
                        } else {
                          setIds(ids.filter((id) => !data.map((attendant: any) => attendant?.id).includes(id)));
                        }
                      }}
                    />
                  </div>
                </th>
                <th scope='col' className='!w-48 bg-violet-100/70 text-violet-900'>
                  {t('attendance_session_code')}-{t('teaching_assistant')}
                </th>
                <th scope='col' className='!w-56 bg-sky-100/70 text-sky-900'>
                  {t('attendance_date')}
                  <br />
                  {t('teaching_time')}
                </th>
                <th scope='col' className='w-32 bg-amber-100/70 text-amber-900'>
                  {t('code')}, {t('class_name')}
                </th>
                <th scope='col' className='w-48 bg-amber-100/70 text-amber-900'>
                  {t('code')}, {t('administrator')}
                </th>
                <th scope='col' className='w-48 bg-amber-100/70 text-amber-900'>
                  {t('code')}, {t('teaching_assistant')}
                </th>
                <th scope='col' className='w-56 bg-emerald-100/70 text-emerald-900'>
                  {t('period_order_in_program')}
                </th>

                <th scope='col' className='w-48 bg-violet-50 text-violet-900'>
                  {t('subject')}
                </th>
                <th scope='col' className='bg-amber-50 text-amber-900'>{t('location')}</th>
                <th scope='col' className='w-[6%] whitespace-nowrap bg-rose-100/70 text-rose-900'>
                  {t('action')}
                </th>
              </tr>
              {ids?.length > 0 && (
                <tr>
                  <th colSpan={10} className='bg-rose-500 p-2.5'>
                    <div className='flex justify-start'>
                      <Button
                        size={'sm'}
                        onClick={() => {
                          setIsShowConfirmBulk(true);
                        }}
                        variant='secondary'
                        className='rounded-lg bg-white text-rose-600 hover:bg-rose-50'
                      >
                        <RiDeleteBin6Line className='size-4' />
                        {t('delete')}
                        <span className='rounded-full bg-rose-100 px-3 py-0.5 text-[10px] font-semibold text-rose-700'>
                          {ids.length}
                        </span>
                      </Button>
                    </div>
                  </th>
                </tr>
              )}
            </thead>
            <tbody className='bg-white'>
              {data?.length > 0 ? (
                data.map((attendant: any, index: number) => (
                  <tr
                    key={index}
                    className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/70'
                  >
                    <td>
                      <div className='flex justify-center'>
                        <CheckboxInput
                          checked={ids?.includes(attendant?.id)}
                          onCheckedChange={(checked) => {
                            if (ids?.includes(attendant?.id)) {
                              setIds(ids?.filter((id) => id !== attendant?.id));
                            } else {
                              setIds([...ids, attendant?.id]);
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className='flex items-center gap-2'>
                        <div className='text-start'>
                          <Link
                            to={`/attendance/teachers_assistant/detail/${attendant?.id}`}
                            className='font-medium text-violet-700 hover:underline'
                          >
                            {attendant?.attendance_code}
                          </Link>
                          <div
                            className={`px-2 py-1 ${attendant?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : attendant?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                          >
                            {t(
                              attendant?.status == 0
                                ? 'submitted_not_approved'
                                : attendant?.status == 1
                                  ? 'approved'
                                  : 'canceled_not_approved'
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='text-start'>
                      <div>{convertTimestampToString(attendant?.attendance_time)}</div>
                      <div>
                        {convertTo12HourFormat(attendant?.start_time)} - {convertTo12HourFormat(attendant?.end_time)}{' '}
                        {calculateTimeDifference(attendant?.start_time, attendant?.end_time)?.minutes}{' '}
                        {t('minute').toLocaleLowerCase()}
                      </div>
                    </td>
                    <td>
                      <div>{getClassroomInfo(attendant?.classroom_id)?.classroom_name}</div>
                      <div>{getClassroomInfo(attendant?.classroom_id)?.classroom_code}</div>
                    </td>
                    <td>
                      <div>{getUserInfo(attendant?.admin_assigned_id)?.display_name}</div>
                      <div>{getUserInfo(attendant?.admin_assigned_id)?.username}</div>
                    </td>
                    <td>
                      <div>{getUserInfo(attendant?.ta_id)?.display_name}</div>
                      <div>{getUserInfo(attendant?.ta_id)?.username}</div>
                    </td>

                    <td className='space-y-1 text-start whitespace-nowrap'>
                      <p>
                        {`${attendant?.teaching_program_detail_number}/${attendant?.teaching_program?.lesson_count} (${roundNumber((attendant?.teaching_program_detail_number / attendant?.teaching_program?.lesson_count) * 100)}%)`}
                      </p>
                      <p>
                        {attendant?.teaching_program_detail?.lesson_name} -{' '}
                        {attendant?.teaching_program_detail?.teaching_program_detail_code}
                      </p>
                    </td>
                    <td>
                      <p>{getSubjectInfo(attendant?.subject_id)?.subject_name}</p>
                      <p>{getSubjectInfo(attendant?.subject_id)?.subject_code}</p>
                    </td>
                    <td>
                      <p>{getLocationInfo(attendant?.location_id)?.location_name}</p>
                      <p>{getLocationInfo(attendant?.location_id)?.location_code}</p>
                    </td>
                    <td className='whitespace-nowrap w-[1%]'>
                      <div className='flex items-center justify-center gap-1'>
                        {attendant?.user_ability?.can_edit === 1 && (
                          <Link to={`/attendance/teachers_assistant/edit/${attendant?.id}`}>
                            <img src={EDIT_02} alt='' />
                          </Link>
                        )}
                        {attendant?.user_ability?.can_delete === 1 && (
                          <img
                            src={DELETE_04}
                            className='cursor-pointer'
                            alt=''
                            onClick={() => {
                              setIsShowConfirm(true);
                              setSelectedId(attendant?.id);
                            }}
                          />
                        )}

                        <img
                          src={CLOCK_05}
                          alt=''
                          className='cursor-pointer'
                          onClick={() => {
                            setShowHistory(true);
                            setSelectedId(attendant?.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <EmptyTable />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/90 px-4 py-2 backdrop-blur-sm'>
        <Pagination
          limit={limit}
          offset={offset}
          options={[20, 100, 200, 500]}
          hasMore={hasMore}
          onNext={(newOffset) => {
            getData({ offset: newOffset });
          }}
          onPrevious={(newOffset) => {
            getData({ offset: newOffset });
          }}
          onChangeLimit={(newLimit) => getData({ limit: newLimit, offset: 0 })}
        />
      </div>
      <HistorySheet show={showHistory} setShow={setShowHistory} selectedId={selectedId} />
    </>
  );
};

export default AttendanceTeachersAssistantList;
