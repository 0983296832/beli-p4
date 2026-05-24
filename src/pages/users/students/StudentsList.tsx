import { useEffect, useState } from 'react';
import {
  AVATAR,
  CALL,
  CHEVRON_UP,
  DELETE_04,
  DOWNLOAD_ICON,
  EDIT_02,
  FILTER_HORIZONTAL,
  GRID_VIEW_BLACK,
  GRID_VIEW_WHITE,
  LAYOUT_TABLE_01_BLACK,
  LAYOUT_TABLE_01_WHITE,
  LOCATION_05,
  MAIL_02,
  NO_AVATAR,
  USER_ADD_02
} from '@lib/ImageHelper';
import TextInput from '@components/fields/TextInput';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import SelectInput from '@components/fields/SelectInput';
import DateInput from '@components/fields/DateInput';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import { mergeObjects } from '@lib/JsHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import ModalDescription from '@components/modal/ModalDescription';
import { Toast } from '@components/toast';
import studentServices from '@services/student';
import { convertTimestampToString } from '@lib/TimeHelper';
import EmptyTable from '@components/empty/EmptyTable';
import { useRootStore } from '@store/index';
import GenderSelect from '@components/selects/GenderSelect';
import NumberInput from '@components/fields/NumberInput';
import WorkingStatusSelect from '@components/selects/WorkingStatusSelect';
import Icon from '@components/Icon/index';
import { downloadFileFromBlob } from '@lib/FileHelper';
import { getClassroomInfo } from '@lib/GetInfoHelper';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import DrawerStatistic from '../../../components/DrawerStatistic/index';

interface Props {}

const StudentsList = (props: Props) => {
  const { permissions } = useRootStore();
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
  const [statisticInfo, setStatisticInfo] = useState<any>({
    show: false,
    extraFilter: {},
    type: '',
    objectId: 0
  });

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await studentServices.deleteStudent(Number(selectedId));
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
        'latest_working_time,province_name,district_name,ward_name,user_id,username,user_job_title,description,email,phone,display_name,avatar,birthday,age,gender,verify_code,verify_status,status,valid,role_id,created_at,updated_at,address,working_status,province_id,district_id,ward_id,manager_statistic,user_ability,latest_attendance_time',
      limit,
      offset,
      filterings: {}
    };
    if (infoSearch?.search) {
      params.search = infoSearch?.search;
    }
    if (infoSearch?.gender || infoSearch?.gender == 0) {
      params.filterings['gender:eq'] = infoSearch?.gender;
    }
    if (infoSearch?.age) {
      params.filterings['age:eq'] = infoSearch?.age;
    }
    if (infoSearch?.birthday) {
      params.filterings['birthday:eq'] = infoSearch?.birthday;
    }
    if (infoSearch?.working_status || infoSearch?.working_status == 0) {
      params.filterings['working_status:eq'] = infoSearch?.working_status;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:eq'] = infoSearch?.classroom_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await studentServices.getStudents(params);
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
      filterings: {},
      params: {
        has_password: 1
      }
    };
    if (infoSearch?.search) {
      params.search = infoSearch?.search;
    }
    if (infoSearch?.gender || infoSearch?.gender == 0) {
      params.filterings['gender:eq'] = infoSearch?.gender;
    }
    if (infoSearch?.age) {
      params.filterings['age:eq'] = infoSearch?.age;
    }
    if (infoSearch?.birthday) {
      params.filterings['birthday:eq'] = infoSearch?.birthday;
    }
    if (infoSearch?.working_status || infoSearch?.working_status == 0) {
      params.filterings['working_status:eq'] = infoSearch?.working_status;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:eq'] = infoSearch?.classroom_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    setLoading(true);
    try {
      const response: any = await studentServices.getStudentExport(params);
      downloadFileFromBlob(response, 'danh_sach_hoc_sinh_beli.xlsx');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateDescription = async (id: number, description: string) => {
    setLoading(true);
    try {
      const res: any = await studentServices.putStudent(Number(id), { description });
      getData();
      Toast('success', res?.message);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

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
            <h3 className='text-xl font-semibold tracking-wide'>{t('student_list')}</h3>
          </div>
          <div className='p-4 bg-white'>
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
                      <img src={FILTER_HORIZONTAL} alt='' className='size-4' />
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
                    <GenderSelect
                      placeholder={t('select_gender')}
                      isClearable
                      value={infoSearch?.gender}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, gender: val?.value });
                      }}
                    />
                    <DateInput
                      label={t('date_of_birth')}
                      value={infoSearch?.birthday}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, birthday: value });
                      }}
                    />
                    <NumberInput
                      label={t('age')}
                      value={infoSearch?.age}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, age: value });
                      }}
                    />
                    <WorkingStatusSelect
                      label={t('status')}
                      type='student'
                      isClearable
                      value={infoSearch?.working_status}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, working_status: value?.value });
                      }}
                    />
                    <TeachingLocationSelect
                      label={t('teaching_location')}
                      isClearable
                      value={infoSearch?.location_id}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, location_id: value?.id, classroom_id: undefined });
                      }}
                    />
                    <ClassroomSelect
                      label={t('classroom')}
                      disabled={!infoSearch?.location_id}
                      isClearable
                      locationId={infoSearch?.location_id}
                      value={infoSearch?.classroom_id}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, classroom_id: value?.id });
                      }}
                    />
                  </div>
                  <div className='flex justify-end gap-3 mt-4'>
                    <Button
                      className='rounded-xl border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      variant={'ghost'}
                      onClick={() => {
                        getData({
                          filterings: {
                            'working_status:eq': undefined,
                            'age:eq': undefined,
                            'birthday:eq': undefined,
                            'gender:eq': undefined,
                            'location_id:eq': undefined,
                            'classroom_id:in': undefined
                          },
                          offset: 0
                        });
                        setInfoSearch({
                          working_status: undefined,
                          age: undefined,
                          birthday: undefined,
                          gender: undefined,
                          location_id: undefined,
                          classroom_id: undefined
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
                <Button className='rounded-xl bg-sky-500 text-white hover:bg-sky-600' onClick={exportData}>
                  <Icon icon={DOWNLOAD_ICON} className='text-primary-neutral-50' />
                  {t('download')}
                </Button>
                {!!permissions.CREATE_STUDENT && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button className='rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'>
                        <img src={USER_ADD_02} alt='' />
                        {t('add_new')}
                        <img src={CHEVRON_UP} alt='' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side='bottom' align='start' style={{ position: 'fixed' }}>
                      <Link to='/user/student/add'>
                        <DropdownMenuItem>{t('add_single')}</DropdownMenuItem>
                      </Link>
                      <Link to='/user/student/add_bulk'>
                        <DropdownMenuItem>{t('add_bulk')}</DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
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
            <img src={activeTab === 'grid_view' ? GRID_VIEW_WHITE : GRID_VIEW_BLACK} alt='' />
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
            <img src={activeTab === 'table_view' ? LAYOUT_TABLE_01_WHITE : LAYOUT_TABLE_01_BLACK} alt='' />
            {t('table_view')}
          </Button>
        </div>
        <div>
          {activeTab === 'table_view' ? (
            <div className='mt-1 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
              <table className='w-full min-w-[1240px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0'>
                <thead>
                  <tr>
                    <th scope='col' rowSpan={2} className='bg-slate-100'>
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
                    <th scope='col' rowSpan={2} className='bg-violet-100/70 text-violet-900'>
                      {t('student_code_name')}
                    </th>
                    <th scope='col' rowSpan={2} className='bg-violet-100/70 text-violet-900'>
                      {t('date_of_birth')}
                      <br />
                      {t('age')}
                      <br />
                      {t('gender')}
                    </th>
                    <th scope='col' rowSpan={2} className='bg-amber-100/70 text-amber-900'>
                      {t('address')} / {t('short_phone')} / {t('email')}
                    </th>
                    <th scope='col' colSpan={3} className='bg-emerald-100/80 text-emerald-900'>
                      {t('student_participation_info')}
                    </th>
                    <th scope='col' rowSpan={2} className='w-[150px] bg-sky-100/70 text-sky-900'>
                      {t('last_student_attendance_date')}
                    </th>
                    <th scope='col' rowSpan={2} className='whitespace-nowrap w-[1%] bg-rose-100/70 text-rose-900'>
                      {t('description')}
                    </th>
                    <th scope='col' rowSpan={2} className='whitespace-nowrap w-[1%] bg-rose-100/70 text-rose-900'>
                      {t('action')}
                    </th>
                  </tr>
                  <tr className='tr-sub bg-emerald-100/60 text-emerald-900'>
                    <th scope='col'>{t('classroom')}</th>
                    <th scope='col'>{t('subject')}</th>
                    <th scope='col'>{t('location')}</th>
                  </tr>
                  {ids?.length > 0 && (
                    <tr className='tr-sub-form tr-sub'>
                      <th colSpan={12} className='p-2.5 bg-rose-500'>
                        <div className='flex justify-start '>
                          <Button
                            size={'sm'}
                            onClick={() => {
                              setIsShowConfirmBulk(true);
                            }}
                            variant='secondary'
                            className='text-rose-600 bg-primary-neutral-50'
                          >
                            <img src={DELETE_04} alt='' />
                            {t('delete')}
                            <span className='bg-[#FFE2E0] rounded-3xl py-1 px-4 text-[10px]'>{ids.length}</span>
                          </Button>
                        </div>
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody className='bg-white'>
                  {data?.length > 0 ? (
                    data.map((user: any, index: number) => (
                      <tr
                        key={index}
                        className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/70'
                      >
                        <td className='bg-violet-50/60'>
                          <div className='flex justify-center'>
                            <CheckboxInput
                              checked={ids?.includes(user?.id)}
                              onCheckedChange={(checked) => {
                                if (ids?.includes(user?.id)) {
                                  setIds(ids?.filter((id) => id !== user?.id));
                                } else {
                                  setIds([...ids, user?.id]);
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className='bg-violet-50/60'>
                          <div className='flex items-center gap-2'>
                            <img
                              className='object-cover rounded-full size-10 min-w-10 min-h-10'
                              src={user.avatar || NO_AVATAR}
                              alt=''
                            />
                            <div className='text-start'>
                              <div>{user.username}</div>
                              <Link to={`/user/student/detail/${user.id}`} className='text-primary-blue-500'>
                                {user.display_name}
                              </Link>
                              <div className='px-2 py-1 text-primary-success bg-[#e4ffe9] rounded-15 w-fit text-xs mt-1'>
                                {user.working_status == 1
                                  ? t('learning_now')
                                  : user.working_status == 2
                                    ? t('inactive')
                                    : t('temporary_break')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='bg-amber-50/70'>
                          <div>{convertTimestampToString(user.birthday)}</div>
                          <div>
                            {user.age || 0} {t('age')}
                          </div>
                          <div>{user?.gender === 1 ? t('male') : user?.gender === 0 ? t('female') : t('other')}</div>
                        </td>
                        <td className='bg-amber-50/70'>
                          <div className='flex flex-col items-center'>
                            <div className='flex items-center gap-1'>
                              <img src={LOCATION_05} alt='' />{' '}
                              {user.address || user?.ward_name || user?.district_name || user?.province_name
                                ? `${user.address} ${user?.ward_name} ${user?.district_name} ${user?.province_name}`
                                : t('not_updated')}
                            </div>
                            <div className='flex items-center gap-2'>
                              <div className='flex items-center gap-1'>
                                <img src={CALL} alt='' /> {user?.phone || t('not_updated')}
                              </div>
                              <div className='flex items-center gap-1'>
                                <img src={MAIL_02} alt='' /> {user?.email || t('not_updated')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='underline text-emerald-700 bg-emerald-50/80'>
                          <p
                            className='cursor-pointer'
                            onClick={() => {
                              setStatisticInfo({
                                show: true,
                                objectId: user?.id,
                                type: 'classroom',
                                extraFilter: {
                                  filterings: {
                                    ['student_id:eq']: user?.id
                                  }
                                }
                              });
                            }}
                          >
                            {user?.manager_statistic?.classrooms}
                          </p>
                        </td>
                        <td className='underline text-emerald-700 bg-emerald-50/80'>
                          <p
                            className='cursor-pointer'
                            onClick={() => {
                              setStatisticInfo({
                                show: true,
                                objectId: user?.id,
                                type: 'subject',
                                extraFilter: {
                                  filterings: {
                                    ['student_id:eq']: user?.id
                                  }
                                }
                              });
                            }}
                          >
                            {user?.manager_statistic?.subjects}
                          </p>
                        </td>
                        <td className='underline text-emerald-700 bg-emerald-50/80'>
                          <p
                            className='cursor-pointer'
                            onClick={() => {
                              setStatisticInfo({
                                show: true,
                                objectId: user?.id,
                                type: 'location',
                                extraFilter: {
                                  filterings: {
                                    ['student_id:eq']: user?.id
                                  }
                                }
                              });
                            }}
                          >
                            {user?.manager_statistic?.teaching_locations}
                          </p>
                        </td>
                        <td className='bg-sky-50/70'>
                          <p>{convertTimestampToString(user?.latest_attendance_time?.attendance_time)}</p>
                          <p>{getClassroomInfo(user?.latest_attendance_time?.classroom_id)?.classroom_name}</p>
                        </td>
                        <td className='whitespace-nowrap w-[1%]'>
                          <div className='flex justify-center'>
                            <ModalDescription
                              defaultDescription={user?.description}
                              onUpdateDescription={(desc: string) => {
                                onUpdateDescription(user?.id, desc);
                              }}
                            />
                          </div>
                        </td>
                        <td className='whitespace-nowrap w-[1%]'>
                          <div className='flex items-center justify-center gap-1'>
                            {!!user?.user_ability?.can_edit && (
                              <Link to={`/user/student/edit/${user.id}`}>
                                <img src={EDIT_02} alt='' />
                              </Link>
                            )}
                            {!!user?.user_ability?.can_delete && (
                              <img
                                src={DELETE_04}
                                className='cursor-pointer'
                                alt=''
                                onClick={() => {
                                  setIsShowConfirm(true);
                                  setSelectedId(user.id);
                                }}
                              />
                            )}
                          </div>
                        </td>
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
          ) : (
            <div>
              <div className='w-full overflow-hidden rounded-3xl border border-violet-200 bg-violet-50/30 shadow-sm'>
                <div className='p-3 border-b border-primary-neutral-300'>
                  <CheckboxInput
                    label={data.every((user: any) => ids?.includes(user?.id)) ? t('unselect_all') : t('select_all')}
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
                {ids?.length > 0 && (
                  <div className='w-full bg-primary-blue-500 p-2.5'>
                    <div className='flex justify-start '>
                      <Button
                        size={'sm'}
                        onClick={() => {
                          setIsShowConfirmBulk(true);
                        }}
                        variant='secondary'
                        className='text-primary-error bg-primary-neutral-50'
                      >
                        <img src={DELETE_04} alt='' />
                        {t('delete')}
                        <span className='bg-[#FFE2E0] rounded-3xl py-1 px-4 text-[10px]'>{ids.length}</span>
                      </Button>
                    </div>
                  </div>
                )}
                <div className='grid grid-cols-2 gap-2 bg-violet-50/30 p-2.5 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-7'>
                  {data.map((user: any, uIdx: number) => (
                    <div
                      key={`user-grid-${uIdx}`}
                      className='rounded-lg border border-violet-200 bg-white px-2.5 pb-2.5 pt-1.5 transition-all hover:-translate-y-[1px] hover:shadow-md'
                    >
                      <div className='mb-1'>
                        <CheckboxInput
                          checked={ids?.includes(user?.id)}
                          onCheckedChange={(checked) => {
                            if (ids?.includes(user?.id)) {
                              setIds(ids?.filter((id) => id !== user?.id));
                            } else {
                              setIds([...ids, user?.id]);
                            }
                          }}
                        />
                      </div>
                      <div className='mb-2'>
                        <img className='aspect-square w-full object-cover rounded-md' src={user.avatar} alt='' />
                      </div>
                      <div className='space-y-1 text-xs'>
                        <div className='truncate font-semibold underline text-violet-700'>{user.display_name}</div>
                        <div className='truncate text-primary-neutral-700'>{user.username}</div>
                        <div className='rounded-full bg-[#e4ffe9] px-2 py-0.5 text-[10px] text-primary-success w-fit'>
                          {user.working_status == 1 ? t('active') : t('inactive')}
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
      <DrawerStatistic
        show={statisticInfo?.show}
        setShow={(show: boolean) => {
          setStatisticInfo({ ...statisticInfo, show });
        }}
        objectId={statisticInfo?.objectId}
        type={statisticInfo?.type}
        extraFilter={statisticInfo?.extraFilter}
      />
    </>
  );
};

export default StudentsList;
