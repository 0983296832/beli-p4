import { useEffect, useState } from 'react';
import { NO_IMAGE } from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import { Link, useNavigate } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import { Toast } from '@components/toast';
import { mergeObjects } from '@lib/JsHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import ModalDescription from '@components/modal/ModalDescription';
import subjectServices from '@services/subject';
import { useRootStore } from '@store/index';
import EmptyTable from '@components/empty/EmptyTable';
import WorkingStatusSelect from '@components/selects/StatusSelect';
import DrawerStatistic from '@components/DrawerStatistic/index';
import {
  RiAddLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFilter3Line,
  RiLayoutGridLine,
  RiTableLine
} from '@remixicon/react';

interface Props {}

const TABLE_SHELL =
  'w-full min-w-[1100px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

const SubjectsList = (props: Props) => {
  const { permissions } = useRootStore();
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
      const response: any = await subjectServices.deleteSubject(Number(selectedId));
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
      fields: 'subject_name,subject_avatar,subject_code,description,user_ability,status,statistic',
      limit,
      offset,
      filterings: {}
    };
    if (infoSearch?.search) {
      params.search = infoSearch?.search;
    }
    if (infoSearch?.status || infoSearch?.status == 0) {
      params.filterings['status:eq'] = infoSearch?.status;
    }

    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await subjectServices.getSubjects(params);
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

  const onUpdateDescription = async (id: number, description: string) => {
    setLoading(true);
    try {
      const res: any = await subjectServices.putSubject(Number(id), { description });
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
            <div className='flex items-center justify-between gap-3'>
              <h3 className='text-xl font-semibold tracking-wide'>{t('subject_list')}</h3>
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
                    <WorkingStatusSelect
                      isClearable
                      label={t('status')}
                      value={infoSearch?.status}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, status: val?.value });
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
                            'status:eq': undefined
                          },
                          offset: 0
                        });
                        setInfoSearch({
                          status: undefined
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
                {!!permissions.CREATE_SUBJECT && (
                  <Button
                    className='rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => navigate('/subjects/add')}
                  >
                    <RiAddLine className='size-4' />
                    {t('add_new')}
                  </Button>
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
                      <th scope='col' rowSpan={2} className='bg-slate-100'>
                        <div className='flex justify-center'>
                          <CheckboxInput
                            checked={data.every((subject: any) => ids?.includes(subject?.id))}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setIds([...ids, ...data.map((subject: any) => subject?.id)]);
                              } else {
                                setIds(ids.filter((id) => !data.map((subject: any) => subject?.id).includes(id)));
                              }
                            }}
                          />
                        </div>
                      </th>
                      <th scope='col' rowSpan={2} className='bg-violet-100/70 text-violet-900'>
                        {t('subject_code_name')}
                      </th>
                      <th scope='col' colSpan={6} className='bg-emerald-100/80 text-emerald-900'>
                        {t('activity_info')}
                      </th>
                      <th scope='col' rowSpan={2} className='w-[1%] whitespace-nowrap bg-rose-100/70 text-rose-900'>
                        {t('description')}
                      </th>
                      <th scope='col' rowSpan={2} className='w-[1%] whitespace-nowrap bg-rose-100/70 text-rose-900'>
                        {t('action')}
                      </th>
                    </tr>
                    <tr className='bg-emerald-100/60 text-emerald-900'>
                      <th scope='col'>{t('administrator')}</th>
                      <th scope='col'>{t('teachers')}</th>
                      <th scope='col'>{t('teaching_assistant')}</th>
                      <th scope='col'>{t('students')}</th>
                      <th scope='col'>{t('classroom')}</th>
                      <th scope='col'>{t('location')}</th>
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
                      data.map((subject: any, index: number) => (
                        <tr
                          key={index}
                          className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/70'
                        >
                          <td>
                            <div className='flex justify-center'>
                              <CheckboxInput
                                checked={ids?.includes(subject?.id)}
                                onCheckedChange={() => {
                                  if (ids?.includes(subject?.id)) {
                                    setIds(ids?.filter((id) => id !== subject?.id));
                                  } else {
                                    setIds([...ids, subject?.id]);
                                  }
                                }}
                              />
                            </div>
                          </td>
                          <td className='bg-violet-50/60'>
                            <div className='flex items-center gap-2'>
                              <img
                                className='size-10 min-h-10 min-w-10 rounded-full object-cover'
                                src={subject?.subject_avatar || NO_IMAGE}
                                alt=''
                              />
                              <div className='text-start'>
                                <div>{subject.subject_code}</div>
                                <Link
                                  to={`/subjects/detail/${subject.id}`}
                                  className='font-medium text-violet-700 hover:underline'
                                >
                                  {subject.subject_name}
                                </Link>
                                <div className='mt-1 w-fit rounded-15 bg-[#e4ffe9] px-2 py-1 text-xs text-primary-success'>
                                  {subject.status == 1 ? t('active') : t('inactive')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-700'>
                            <p
                              className='cursor-pointer font-medium underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: subject?.id,
                                  type: 'admin',
                                  extraFilter: {
                                    filterings: {
                                      ['subject_id:eq']: subject?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {subject?.statistic?.admin}
                            </p>
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-700'>
                            <p
                              className='cursor-pointer font-medium underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: subject?.id,
                                  type: 'teacher',
                                  extraFilter: {
                                    filterings: {
                                      ['subject_id:eq']: subject?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {subject?.statistic?.teacher}
                            </p>
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-700'>
                            <p
                              className='cursor-pointer font-medium underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: subject?.id,
                                  type: 'ta',
                                  extraFilter: {
                                    filterings: {
                                      ['subject_id:eq']: subject?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {subject?.statistic?.ta}
                            </p>
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-700'>
                            <p
                              className='cursor-pointer font-medium underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: subject?.id,
                                  type: 'student',
                                  extraFilter: {
                                    filterings: {
                                      ['subject_id:eq']: subject?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {subject?.statistic?.student}
                            </p>
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-700'>
                            <p
                              className='cursor-pointer font-medium underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: subject?.id,
                                  type: 'classroom',
                                  extraFilter: {
                                    filterings: {
                                      ['subject_id:eq']: subject?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {subject?.statistic?.classroom}
                            </p>
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-700'>
                            <p
                              className='cursor-pointer font-medium underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: subject?.id,
                                  type: 'location',
                                  extraFilter: {
                                    filterings: {
                                      ['subject_id:eq']: subject?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {subject?.statistic?.address}
                            </p>
                          </td>
                          <td className='w-[1%] whitespace-nowrap bg-rose-50/70'>
                            <div className='flex justify-center'>
                              <ModalDescription
                                defaultDescription={subject?.description}
                                onUpdateDescription={(desc: string) => {
                                  onUpdateDescription(subject?.id, desc);
                                }}
                              />
                            </div>
                          </td>
                          <td className='w-[1%] whitespace-nowrap bg-rose-50/70'>
                            <div className='flex items-center justify-center gap-1'>
                              {!!subject?.user_ability?.can_edit && (
                                <Link
                                  to={`/subjects/edit/${subject.id}`}
                                  className='rounded-md p-1.5 transition-colors hover:bg-violet-100'
                                >
                                  <RiEdit2Line className='size-4 text-violet-700' />
                                </Link>
                              )}
                              {!!subject?.user_ability?.can_delete && (
                                <button
                                  type='button'
                                  className='cursor-pointer rounded-md p-1.5 hover:bg-rose-100'
                                  onClick={() => {
                                    setIsShowConfirm(true);
                                    setSelectedId(subject.id);
                                  }}
                                >
                                  <RiDeleteBin6Line className='size-4 text-primary-error' />
                                </button>
                              )}
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
          ) : (
            <div>
              <div className='w-full overflow-hidden rounded-3xl border border-violet-200 bg-violet-50/30 shadow-sm'>
                <div className='border-b border-primary-neutral-200 bg-white p-3'>
                  <CheckboxInput
                    label={
                      data.every((user: any) => ids?.includes(user?.id)) ? t('unselect_all') : t('select_all')
                    }
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
                  {data.map((subject: any, idx: number) => (
                    <div
                      key={`subject-grid-${idx}`}
                      className='rounded-lg border border-slate-200 bg-white px-2.5 pb-2.5 pt-1.5 transition-all hover:-translate-y-[1px] hover:shadow-md'
                    >
                      <div className='mb-1'>
                        <CheckboxInput
                          checked={ids?.includes(subject?.id)}
                          onCheckedChange={() => {
                            if (ids?.includes(subject?.id)) {
                              setIds(ids?.filter((id) => id !== subject?.id));
                            } else {
                              setIds([...ids, subject?.id]);
                            }
                          }}
                        />
                      </div>
                      <div className='mb-2'>
                        <img
                          className='aspect-square w-full rounded-md object-cover'
                          src={subject?.subject_avatar || NO_IMAGE}
                          alt=''
                        />
                      </div>
                      <div className='space-y-1 text-xs'>
                        <Link
                          to={`/subjects/detail/${subject.id}`}
                          className='block truncate font-semibold text-violet-700 underline'
                        >
                          {subject.subject_name}
                        </Link>
                        <div className='truncate text-slate-600'>{subject.subject_code}</div>
                        <div className='w-fit rounded-15 bg-[#e4ffe9] px-2 py-1 text-xs text-primary-success'>
                          {subject.status == 1 ? t('active') : t('inactive')}
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

export default SubjectsList;
