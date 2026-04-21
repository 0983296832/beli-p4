import { useEffect, useState } from 'react';
import { NO_AVATAR } from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import SelectInput from '@components/fields/SelectInput';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import { Toast } from '@components/toast';
import { mergeObjects } from '@lib/JsHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import classroomServices from '@services/classroom';
import { useRootStore } from '@store/index';
import { convertTimestampToString, convertToAmPm, getDayOfWeek } from '@lib/TimeHelper';
import { getSubjectInfo, getLocationInfo, getUserInfo } from '@lib/GetInfoHelper';
import StatusSelect from '@components/selects/StatusSelect';
import TeachingProgramsSelect from '@components/selects/TeachingProgramSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import WeekdaySelect from '@components/selects/WeekDaySelect';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@components/ui/sheet';
import EmptyTable from '@components/empty/EmptyTable';
import { USER_ROLE } from '@constants/index';
import {
  RiAddLine,
  RiArrowDownSLine,
  RiCalendarLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFilter3Line,
  RiLayoutGridLine,
  RiSettings3Line,
  RiTableLine,
  RiUserLine
} from '@remixicon/react';

interface Props {}

const TABLE_SHELL =
  'w-full min-w-[1280px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

const ClassroomList = (props: Props) => {
  const { permissions, currentUser } = useRootStore();
  const navigate = useNavigate();
  const { t } = useT();
  const [activeTab, setActiveTab] = useState('table_view');
  const [infoSearch, setInfoSearch] = useState<any>({});
  const [openFilter, setOpenFilter] = useState(false);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowConfirmBulk, setIsShowConfirmBulk] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [showDrawerStudents, setShowDrawerStudents] = useState(false);
  const [students, setStudents] = useState([]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await classroomServices.deleteClassroom(Number(selectedId));
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
        'identity,classroom_name,classroom_code,classroom_avatar,location_id,teacher_id,ta_id,admin_assigned_id,subject_id,lessons,start_date,end_date,status,schedules,students,user_ability,teaching_program,latest_attendance,updated_at,attended_count',
      limit,
      offset,
      filterings: {}
    };
    if (infoSearch?.search) {
      params.search = infoSearch?.search;
    }
    if (infoSearch?.subject_id) {
      params.filterings['subject_id:eq'] = infoSearch?.subject_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    if (infoSearch?.teaching_program_id) {
      params.filterings['teaching_program_id:eq'] = infoSearch?.teaching_program_id;
    }
    if (infoSearch?.week_day) {
      params.filterings['week_day:in'] = infoSearch?.week_day;
    }
    if (infoSearch?.status) {
      params.filterings['status:eq'] = infoSearch?.status;
    }

    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await classroomServices.getClassrooms(params);
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

  const getFormattedSchedule = (
    sessions: { day_of_week: number; start_time: string; end_time: string }[]
  ): {
    count: number;
    sessions: { day: number; time: string }[];
  } => {
    const formatToAmPm = (time: string): string => {
      const [hourStr, minuteStr] = time.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
    };

    const unique = sessions
      .filter(
        (s, i, arr) =>
          i ===
          arr.findIndex(
            (o) => o.day_of_week === s.day_of_week && o.start_time === s.start_time && o.end_time === s.end_time
          )
      )
      .sort((a, b) => a.day_of_week - b.day_of_week);

    const formatted = unique.map((s) => ({
      day: s.day_of_week,
      time: `${formatToAmPm(s.start_time)} - ${formatToAmPm(s.end_time)}`
    }));

    return {
      count: formatted.length,
      sessions: formatted
    };
  };

  useEffect(() => {
    getData();
  }, []);

  const isStudentRole = currentUser?.user_job_title === USER_ROLE.STUDENT;
  const tableFullColSpan = isStudentRole ? 7 : 11;

  return (
    <>
      <div className='pb-24 space-y-4'>
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
            <div className='flex items-center justify-between gap-3'>
              <h3 className='text-xl font-semibold tracking-wide'>{t('class_list')}</h3>
              <div className='hidden items-center gap-2 md:flex'>
                <span className='rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700'>
                  {t('total')}: {data?.length || 0}
                </span>
                {!isStudentRole && (
                  <span className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700'>
                    {t('selected_num').replace('${{num}}', String(ids?.length || 0))}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className='bg-white p-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <Popover open={openFilter} onOpenChange={setOpenFilter}>
                <PopoverAnchor asChild>
                  <div className='flex items-center gap-2 rounded-2xl border border-violet-200 bg-white p-2 shadow-sm'>
                    <SearchInput
                      placeholder={t('search')}
                      className='w-[320px] lg:w-[420px]'
                      value={infoSearch?.search}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          getData({ offset: 0 });
                        }
                      }}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, search: value });
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
                      {/* <ClassroomSelect
                        isClearable
                        label={t('classroom')}
                        value={infoSearch?.classroom_id}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, classroom_id: val?.id });
                        }}
                      /> */}
                      <SubjectsSelect
                        isClearable
                        label={t('subject')}
                        value={infoSearch?.subject_id}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, subject_id: val?.id });
                        }}
                      />
                      <TeachingLocationSelect
                        isClearable
                        label={t('teaching_location')}
                        value={infoSearch?.location_id}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, location_id: val?.id });
                        }}
                      />
                      <StatusSelect
                        isClearable
                        label={t('status')}
                        value={infoSearch?.status}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, status: val?.value });
                        }}
                      />
                      <TeachingProgramsSelect
                        isClearable
                        label={t('teaching_program')}
                        value={infoSearch?.teaching_program_id}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, teaching_program_id: val?.id });
                        }}
                      />
                      <WeekdaySelect
                        label={t('study_schedule')}
                        isClearable
                        isMulti
                        value={infoSearch?.week_day}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, week_day: val?.map((v) => v?.value) });
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
                              'status:eq': undefined,
                              'subject_id:eq': undefined,
                              'location_id:eq': undefined,
                              'teaching_program_id:eq': undefined,
                              'week_day:in': undefined
                            },
                            offset: 0
                          });
                          setInfoSearch({
                            status: undefined,
                            subject_id: undefined,
                            location_id: undefined,
                            teaching_program_id: undefined,
                            week_day: undefined
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

              <div className='flex flex-wrap items-center gap-2'>
                <div className='inline-flex gap-2 rounded-2xl border border-violet-200 bg-violet-50/60 p-1.5 shadow-sm'>
                  <Button
                    className={`rounded-lg ${
                      activeTab === 'grid_view'
                        ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                        : 'border-slate-200 bg-transparent text-slate-700 hover:bg-emerald-50'
                    }`}
                    variant={activeTab === 'grid_view' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('grid_view')}
                  >
                    <RiLayoutGridLine className='size-4' />
                    {t('grid_view')}
                  </Button>
                  <Button
                    className={`rounded-lg ${
                      activeTab === 'table_view'
                        ? 'bg-violet-500 text-white shadow-sm hover:bg-violet-600'
                        : 'border-slate-200 bg-transparent text-slate-700 hover:bg-violet-50'
                    }`}
                    variant={activeTab === 'table_view' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('table_view')}
                  >
                    <RiTableLine className='size-4' />
                    {t('table_view')}
                  </Button>
                </div>
                {!!permissions.CREATE_CLASSROOM && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className='rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'>
                        <RiAddLine className='size-4' />
                        {t('add_new')}
                        <RiArrowDownSLine className='size-4 opacity-90' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side='bottom' align='start' style={{ position: 'fixed' }}>
                      <Link to='/classroom/add'>
                        <DropdownMenuItem>{t('add_single')}</DropdownMenuItem>
                      </Link>
                      <Link to='/classroom/add_bulk'>
                        <DropdownMenuItem>{t('add_bulk')}</DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          {activeTab === 'table_view' ? (
            <div className='mt-1 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
              <div className='overflow-x-auto'>
                <table className={TABLE_SHELL}>
                  <thead>
                    <tr>
                      {!isStudentRole && (
                        <th scope='col' className='bg-slate-100'>
                          <div className='flex justify-center'>
                            <CheckboxInput
                              checked={data.every((user: any) => ids?.includes(user?.id))}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setIds([...ids, ...data.map((user: any) => user?.id)]);
                                } else {
                                  setIds(ids.filter((id) => !data.map((user: any) => user?.id).includes(id)));
                                }
                              }}
                            />
                          </div>
                        </th>
                      )}
                      <th scope='col' className='min-w-[185px] bg-violet-100/70 text-violet-900'>
                        {t('code')}, {t('class_name')}
                      </th>
                      <th scope='col' className='bg-sky-100/70 text-sky-900'>
                        {t('location')}
                      </th>
                      <th scope='col' className='bg-cyan-100/70 text-cyan-900'>
                        {t('subject')}
                      </th>
                      <th scope='col' className='max-w-64 w-64 bg-emerald-100/70 text-emerald-900'>
                        {t('class_hours_per_program')}
                      </th>
                      {!isStudentRole && (
                        <th scope='col' className='bg-amber-100/70 text-amber-900'>
                          {t('class_progress_by_program')}
                        </th>
                      )}
                      <th scope='col' className='bg-fuchsia-100/70 text-fuchsia-900'>
                        {t('fixed_schedule')}
                      </th>
                      <th scope='col' className='bg-rose-100/70 text-rose-900'>
                        {t('class_strength')}
                      </th>
                      <th scope='col' className='bg-violet-100/70 text-violet-900'>
                        {t('teachers')}/{t('teaching_assistant')}
                      </th>
                      {!isStudentRole && (
                        <th scope='col' className='bg-sky-100/70 text-sky-900'>
                          {t('administrator')}
                        </th>
                      )}
                      {!isStudentRole && (
                        <th scope='col' className='w-[6%] whitespace-nowrap bg-rose-100/70 text-rose-900'>
                          {t('action')}
                        </th>
                      )}
                    </tr>
                    {!isStudentRole && ids?.length > 0 && (
                      <tr>
                        <th colSpan={tableFullColSpan} className='bg-rose-500 p-2.5'>
                          <div className='flex justify-start'>
                            <Button
                              size={'sm'}
                              onClick={() => {
                                setIsShowConfirmBulk(true);
                              }}
                              variant='secondary'
                              className='rounded-lg bg-white text-rose-600'
                            >
                              <RiDeleteBin6Line className='size-4' />
                              {t('delete')}
                              <span className='rounded-3xl bg-[#FFE2E0] px-4 py-1 text-[10px]'>{ids.length}</span>
                            </Button>
                          </div>
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody className='bg-white'>
                    {data?.length > 0 ? (
                      data.map((classroom: any, index: number) => (
                        <tr
                          key={index}
                          className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/70'
                        >
                          {!isStudentRole && (
                            <td>
                              <div className='flex justify-center'>
                                <CheckboxInput
                                  checked={ids?.includes(classroom?.id)}
                                  onCheckedChange={() => {
                                    if (ids?.includes(classroom?.id)) {
                                      setIds(ids?.filter((id) => id !== classroom?.id));
                                    } else {
                                      setIds([...ids, classroom?.id]);
                                    }
                                  }}
                                />
                              </div>
                            </td>
                          )}
                          <td className='bg-violet-50/60'>
                            <div className='flex items-center gap-2'>
                              <img
                                className='size-10 rounded-full object-cover'
                                src={classroom?.classroom_avatar || NO_AVATAR}
                                alt=''
                              />
                              <div className='text-start'>
                                {!isStudentRole && <div>{classroom?.classroom_code}</div>}
                                <Link
                                  to={`/classroom/detail/${classroom?.id}`}
                                  className='font-medium text-violet-700 hover:underline'
                                >
                                  {classroom?.classroom_name}
                                </Link>
                                <div className='mt-1 break-words rounded-15 bg-[#e4ffe9] px-2 py-1 text-xs text-primary-success'>
                                  {classroom?.status == 1 ? t('active') : t('inactive')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='bg-sky-50/70'>
                            <p>{getLocationInfo(classroom?.location_id)?.location_name}</p>
                            {!isStudentRole && <p>{getLocationInfo(classroom?.location_id)?.location_code}</p>}
                          </td>
                          <td className='bg-cyan-50/70'>
                            <p>{getSubjectInfo(classroom?.subject_id)?.subject_name}</p>
                            {!isStudentRole && <p>{getSubjectInfo(classroom?.subject_id)?.subject_code}</p>}
                          </td>
                          <td className='bg-emerald-50/80'>
                            <p>
                              {classroom?.teaching_program?.lesson_count} {t('period').toLocaleLowerCase()}
                            </p>
                            {!isStudentRole ? (
                              <p>
                                {classroom?.teaching_program?.program_name} -{' '}
                                {classroom?.teaching_program?.program_code}
                              </p>
                            ) : (
                              <p>{classroom?.teaching_program?.program_name}</p>
                            )}
                          </td>
                          {!isStudentRole && (
                            <td className='space-y-1 bg-amber-50/70 text-start'>
                              <div className='font-medium text-violet-700'>
                                {classroom?.attended_count}/{classroom?.teaching_program?.lesson_count} (
                                {(
                                  (classroom?.attended_count / classroom?.teaching_program?.lesson_count) *
                                  100
                                ).toFixed(2)}
                                %)
                              </div>
                              <div className='text-emerald-700'>{t('latest_attendance')}:</div>
                              <div className='capitalize'>
                                {convertTimestampToString(
                                  classroom?.latest_attendance?.attendance_time,
                                  undefined,
                                  'dddd, DD/MM/YYYY'
                                ) || t('not_updated')}
                              </div>
                            </td>
                          )}
                          <td className='space-y-1 whitespace-nowrap bg-fuchsia-50/70 text-start'>
                            <p className='font-medium text-emerald-700'>
                              {
                                getFormattedSchedule(
                                  classroom?.schedules?.filter((schedule: any) => schedule?.valid === 1)
                                )?.count
                              }{' '}
                              {t('session_per_week')}
                            </p>
                            {getFormattedSchedule(
                              classroom?.schedules?.filter((schedule: any) => schedule?.valid === 1)
                            )?.sessions?.map((schedule: any, idx: number) => (
                              <div key={idx}>
                                {getDayOfWeek(schedule?.day)}: {schedule?.time}
                              </div>
                            ))}
                            <div className='text-rose-700'>{t('last_updated')}:</div>
                            <div className='flex items-center gap-1 text-xs text-primary-neutral-500'>
                              <RiCalendarLine className='size-4 shrink-0 text-fuchsia-600' />
                              {convertTimestampToString(classroom?.updated_at, 'right')}
                            </div>
                          </td>
                          <td className='bg-rose-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setShowDrawerStudents(true);
                                setStudents(classroom?.students);
                              }}
                            >
                              {classroom?.students?.length} {t('students').toLocaleLowerCase()}
                            </button>
                          </td>
                          <td className='bg-violet-50/60'>
                            {!!classroom?.teacher_id && (
                              <>
                                {!isStudentRole ? (
                                  <p className='flex items-center gap-2 text-left'>
                                    <RiUserLine className='size-4 text-violet-600' />
                                    {getUserInfo(classroom?.teacher_id)?.display_name} -{' '}
                                    {getUserInfo(classroom?.teacher_id)?.username}
                                  </p>
                                ) : (
                                  <p className='flex items-center gap-2 text-left'>
                                    <RiUserLine className='size-4 text-violet-600' />
                                    {getUserInfo(classroom?.teacher_id)?.display_name}
                                  </p>
                                )}
                              </>
                            )}
                            {!!classroom?.ta_id && (
                              <>
                                {!isStudentRole ? (
                                  <p className='flex items-center gap-2 text-left'>
                                    <RiUserLine className='size-4 text-violet-600' />
                                    {getUserInfo(classroom?.ta_id)?.display_name} -{' '}
                                    {getUserInfo(classroom?.ta_id)?.username}
                                  </p>
                                ) : (
                                  <p className='flex items-center gap-2 text-left'>
                                    <RiUserLine className='size-4 text-violet-600' />
                                    {getUserInfo(classroom?.ta_id)?.display_name}
                                  </p>
                                )}
                              </>
                            )}
                          </td>
                          {!isStudentRole && (
                            <td className='bg-sky-50/70'>
                              <p className='text-left'>{getUserInfo(classroom?.admin_assigned_id)?.display_name}</p>
                              <p className='text-left'>{getUserInfo(classroom?.admin_assigned_id)?.username}</p>
                            </td>
                          )}
                          {!isStudentRole && (
                            <td className='w-[1%] whitespace-nowrap bg-rose-50/70'>
                              <div className='flex items-center justify-center gap-1'>
                                {!!classroom?.user_ability?.can_edit && (
                                  <Link
                                    to={`/classroom/edit/${classroom?.id}`}
                                    className='rounded-md p-1.5 transition-colors hover:bg-violet-100'
                                  >
                                    <RiEdit2Line className='size-4 text-violet-700' />
                                  </Link>
                                )}
                                {!!classroom?.user_ability?.can_delete && (
                                  <button
                                    type='button'
                                    className='cursor-pointer rounded-md p-1.5 hover:bg-rose-100'
                                    onClick={() => {
                                      setIsShowConfirm(true);
                                      setSelectedId(classroom?.id);
                                    }}
                                  >
                                    <RiDeleteBin6Line className='size-4 text-primary-error' />
                                  </button>
                                )}
                                {!!classroom?.user_ability?.can_edit && (
                                  <Link
                                    to={`/classroom/setting/${classroom?.id}`}
                                    className='rounded-md p-1.5 transition-colors hover:bg-violet-100'
                                  >
                                    <RiSettings3Line className='size-4 text-violet-700' />
                                  </Link>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={tableFullColSpan}>
                          <EmptyTable />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div className='w-full overflow-hidden rounded-3xl border border-violet-200 bg-violet-50/30 shadow-sm'>
                {!isStudentRole && (
                  <div className='border-b border-primary-neutral-200 bg-white p-3'>
                    <CheckboxInput
                      label={
                        data.every((classroom: any) => ids?.includes(classroom?.id))
                          ? t('unselect_all')
                          : t('select_all')
                      }
                      checked={data.every((classroom: any) => ids?.includes(classroom?.id))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setIds([...ids, ...data.map((classroom: any) => classroom?.id)]);
                        } else {
                          setIds(ids.filter((id) => !data.map((classroom: any) => classroom?.id).includes(id)));
                        }
                      }}
                    />
                  </div>
                )}
                {!isStudentRole && ids?.length > 0 && (
                  <div className='w-full bg-rose-500 p-2.5'>
                    <div className='flex justify-start'>
                      <Button
                        size={'sm'}
                        onClick={() => {
                          setIsShowConfirmBulk(true);
                        }}
                        variant='secondary'
                        className='rounded-lg bg-white text-rose-600'
                      >
                        <RiDeleteBin6Line className='size-4' />
                        {t('delete')}
                        <span className='rounded-3xl bg-[#FFE2E0] px-4 py-1 text-[10px]'>{ids.length}</span>
                      </Button>
                    </div>
                  </div>
                )}
                <div className='grid grid-cols-2 gap-2 bg-slate-50 p-2.5 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-7'>
                  {data.map((classroom: any, idx: number) => (
                    <div
                      key={`user-grid-${idx}`}
                      className='rounded-lg border border-slate-200 bg-white px-2.5 pb-2.5 pt-1.5 transition-all hover:-translate-y-[1px] hover:shadow-md'
                    >
                      {!isStudentRole && (
                        <div className='mb-1'>
                          <CheckboxInput
                            checked={ids?.includes(classroom?.id)}
                            onCheckedChange={() => {
                              if (ids?.includes(classroom?.id)) {
                                setIds(ids?.filter((id) => id !== classroom?.id));
                              } else {
                                setIds([...ids, classroom?.id]);
                              }
                            }}
                          />
                        </div>
                      )}
                      <div className='mb-2'>
                        <img
                          className='aspect-square w-full rounded-md object-cover'
                          src={classroom?.classroom_avatar || NO_AVATAR}
                          alt=''
                        />
                      </div>
                      <div className='space-y-1 text-xs'>
                        <Link
                          to={`/classroom/detail/${classroom?.id}`}
                          className='block truncate font-semibold text-violet-700 underline'
                        >
                          {classroom?.classroom_name}
                        </Link>
                        {!isStudentRole && <div className='truncate text-slate-600'>{classroom?.classroom_code}</div>}
                        <div className='w-fit whitespace-nowrap rounded-15 bg-[#e4ffe9] px-2 py-1 text-xs text-primary-success'>
                          {classroom?.status == 1 ? t('active') : t('inactive')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-slate-200 bg-white px-4 py-2 shadow-[0_-6px_14px_-12px_rgba(15,23,42,0.25)]'>
        <Pagination
          limit={limit}
          offset={offset}
          options={[20, 50, 100, 500]}
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
      {/* Students */}
      <Sheet
        open={showDrawerStudents}
        onOpenChange={(open) => {
          setShowDrawerStudents(open);
        }}
      >
        <SheetContent className='!w-[628px] max-w-[628px] sm:max-w-[628px] bg-white px-10 py-0'>
          <SheetHeader className=' py-6 border-b'>
            <SheetTitle className='text-base font-semibold'>{t('student_list')}</SheetTitle>
          </SheetHeader>
          <div className='h-[calc(100vh-89px)] overflow-y-auto py-6'>
            <table className='w-full border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:bg-violet-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-2 [&_td:last-child]:border-r-0'>
              <thead>
                <tr>
                  <th scope='col'>{t('number_order')}</th>
                  <th scope='col'>{t('code_and_name')}</th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {students?.length > 0 ? (
                  students?.map((item: any, index: number) => (
                    <tr key={index} className='odd:bg-white even:bg-violet-50/40'>
                      <td>{index + 1}</td>
                      <td>
                        <div className='flex items-center gap-3'>
                          <img
                            className='h-10 min-w-10 w-10 rounded-full object-cover'
                            src={item?.student_avatar || NO_AVATAR}
                            alt=''
                          />
                          <div className='text-left'>
                            <p className='text-sm font-medium'>{item?.student_code}</p>
                            <Link
                              target='_blank'
                              rel='noreferrer'
                              to={`/user/student/detail/${item?.student_id}`}
                              className='text-sm font-medium text-violet-700 underline'
                            >
                              {item?.student_name}
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>
                      <EmptyTable />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ClassroomList;
