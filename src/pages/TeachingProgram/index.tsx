import { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import { Link, useNavigate } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import { mergeObjects } from '@lib/JsHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import { Toast } from '@components/toast';
import { convertTimestampToString } from '@lib/TimeHelper';
import EmptyTable from '@components/empty/EmptyTable';
import { useRootStore } from '@store/index';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import teachingProgramServices from '@services/teachingProgram';
import { getSubjectInfo } from '@lib/GetInfoHelper';
import { USER_ROLE } from '@constants/index';
import { isEmpty } from 'lodash';
import DrawerStatistic from '@components/DrawerStatistic/index';
import {
  RiAddLine,
  RiCalendarLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFilter3Line
} from '@remixicon/react';

interface Props {}

const TABLE_SHELL =
  'w-full min-w-[1100px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

const TeachingProgramList = (props: Props) => {
  const { permissions, currentUser } = useRootStore();
  const { t } = useT();
  const [infoSearch, setInfoSearch] = useState<any>({});
  const [openFilter, setOpenFilter] = useState(false);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isShowConfirmBulk, setIsShowConfirmBulk] = useState(false);
  const navigate = useNavigate();
  const isStudent = currentUser?.user_job_title === USER_ROLE.STUDENT;
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
      const response: any = await teachingProgramServices.deleteTeachingProgram(Number(selectedId));
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
        'program_name,program_code,subject_id,lesson_count,last_updated_by,updated_at,updated_lesson_count,last_updated_by_user,statistic,user_ability,statistic',
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

    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await teachingProgramServices.getTeachingPrograms(params);
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
              <h3 className='text-xl font-semibold tracking-wide'>{t('teaching_program_list')}</h3>
              <span className='hidden rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 md:inline'>
                {t('total')}: {data?.length || 0}
              </span>
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
                    <SubjectsSelect
                      label={t('subject')}
                      isClearable
                      placeholder={t('select_subject')}
                      value={infoSearch?.subject_id}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, subject_id: val?.id });
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
                            'subject_id:eq': undefined
                          },
                          offset: 0
                        });
                        setInfoSearch({
                          subject_id: undefined
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

              {!!permissions.CREATE_TEACHING_PROGRAM && (
                <Button
                  className='rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                  onClick={() => {
                    navigate('/teaching-program/edit/0');
                  }}
                >
                  <RiAddLine className='size-4' />
                  {t('add_new')}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className='mt-1 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className={TABLE_SHELL}>
              <thead>
                <tr>
                  {!isStudent && (
                    <th scope='col' rowSpan={2} className='bg-slate-100'>
                      <div className='flex justify-center'>
                        <CheckboxInput
                          checked={data?.every((item: any) => ids?.includes(item?.id))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setIds([...ids, ...data.map((item: any) => item?.id)]);
                            } else {
                              setIds(ids.filter((id) => !data.map((item: any) => item?.id).includes(id)));
                            }
                          }}
                        />
                      </div>
                    </th>
                  )}
                  <th scope='col' rowSpan={2} className='bg-violet-100/70 text-violet-900'>
                    {t(isStudent ? 'lesson_code_name' : 'program_code_name')}
                  </th>
                  <th scope='col' rowSpan={2} className='bg-sky-100/70 text-sky-900'>
                    {t('subject')}
                  </th>
                  <th scope='col' rowSpan={2} className='bg-emerald-100/70 text-emerald-900'>
                    {t('hours_per_program')}
                  </th>
                  <th scope='col' rowSpan={2} className='bg-emerald-100/70 text-emerald-900'>
                    {t('hours_with_content')}
                  </th>
                  {!isStudent && (
                    <th scope='col' colSpan={5} className='bg-amber-100/80 text-amber-900'>
                      {t('program_allocation_info')}
                    </th>
                  )}
                  {!isStudent && (
                    <th scope='col' rowSpan={2} className='w-56 bg-cyan-100/70 text-cyan-900'>
                      {t('update_time')}
                    </th>
                  )}
                  {!isStudent && (
                    <th scope='col' rowSpan={2} className='w-[1%] whitespace-nowrap bg-rose-100/70 text-rose-900'>
                      {t('action')}
                    </th>
                  )}
                </tr>
                {!isStudent && (
                  <tr className='bg-amber-100/60 text-amber-900'>
                    <th scope='col' className='w-24'>
                      {t('classroom')}
                    </th>
                    <th scope='col' className='w-24'>
                      {t('students')}
                    </th>
                    <th scope='col' className='w-24'>
                      {t('teachers')}
                    </th>
                    <th scope='col' className='w-24'>
                      {t('teaching_assistant')}
                    </th>
                    <th scope='col' className='w-24'>
                      {t('location')}
                    </th>
                  </tr>
                )}

                {!isStudent && ids?.length > 0 && (
                  <tr>
                    <th colSpan={12} className='bg-rose-500 p-2.5'>
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
                  data.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/70'
                    >
                      {!isStudent && (
                        <td>
                          <div className='flex justify-center'>
                            <CheckboxInput
                              checked={ids?.includes(item?.id)}
                              onCheckedChange={() => {
                                if (ids?.includes(item?.id)) {
                                  setIds(ids?.filter((id) => id !== item?.id));
                                } else {
                                  setIds([...ids, item?.id]);
                                }
                              }}
                            />
                          </div>
                        </td>
                      )}
                      <td className='bg-violet-50/60 text-left'>
                        {!isStudent && <p>{item?.program_code}</p>}
                        <Link
                          to={`/teaching-program/detail/${item?.id}`}
                          className='font-medium text-violet-700 hover:underline'
                        >
                          {item?.program_name} - {item?.lesson_count} {t('period').toLocaleLowerCase()}
                        </Link>
                      </td>
                      <td className='bg-sky-50/70'>
                        <p>{getSubjectInfo(item?.subject_id)?.subject_name}</p>
                        {!isStudent && <p>{getSubjectInfo(item?.subject_id)?.subject_code}</p>}
                      </td>
                      <td className='bg-emerald-50/80'>{item?.lesson_count}</td>
                      <td className='bg-emerald-50/80 font-medium text-violet-700'>
                        {item?.updated_lesson_count}/{item?.lesson_count} (
                        {((item?.updated_lesson_count / item?.lesson_count) * 100).toFixed(2)}%)
                      </td>
                      {!isStudent && (
                        <>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: item?.id,
                                  type: 'classroom',
                                  extraFilter: {
                                    filterings: {
                                      ['teaching_program_id:eq']: item?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {item?.statistic?.classrooms}
                            </button>
                          </td>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: item?.id,
                                  type: 'student',
                                  extraFilter: {
                                    filterings: {
                                      ['teaching_program_id:eq']: item?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {item?.statistic?.students}
                            </button>
                          </td>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: item?.id,
                                  type: 'teacher',
                                  extraFilter: {
                                    filterings: {
                                      ['teaching_program_id:eq']: item?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {item?.statistic?.teachers}
                            </button>
                          </td>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: item?.id,
                                  type: 'ta',
                                  extraFilter: {
                                    filterings: {
                                      ['teaching_program_id:eq']: item?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {item?.statistic?.tas}
                            </button>
                          </td>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setStatisticInfo({
                                  show: true,
                                  objectId: item?.id,
                                  type: 'location',
                                  extraFilter: {
                                    filterings: {
                                      ['teaching_program_id:eq']: item?.id
                                    }
                                  }
                                });
                              }}
                            >
                              {item?.statistic?.teaching_locations}
                            </button>
                          </td>
                        </>
                      )}
                      {!isStudent && (
                        <td className='bg-cyan-50/60 text-left'>
                          {!isEmpty(item?.last_updated_by_user) && (
                            <>
                              {item?.last_updated_by_user?.username} - {item?.last_updated_by_user?.display_name}
                              <br />
                              <div className='flex items-center gap-2'>
                                <RiCalendarLine className='size-4 text-cyan-600' />
                                <p className='text-sm font-medium text-primary-neutral-500'>
                                  {convertTimestampToString(item?.updated_at, 'right')}
                                </p>
                              </div>
                            </>
                          )}
                        </td>
                      )}
                      {!isStudent && (
                        <td className='w-[1%] whitespace-nowrap bg-rose-50/70'>
                          <div className='flex items-center justify-center gap-1'>
                            {!!item?.user_ability?.can_edit && (
                              <Link
                                to={`/teaching-program/edit/${item?.id}`}
                                className='rounded-md p-1.5 transition-colors hover:bg-violet-100'
                              >
                                <RiEdit2Line className='size-4 text-violet-700' />
                              </Link>
                            )}
                            {!!item?.user_ability?.can_delete && (
                              <button
                                type='button'
                                className='cursor-pointer rounded-md p-1.5 hover:bg-rose-100'
                                onClick={() => {
                                  setIsShowConfirm(true);
                                  setSelectedId(item?.id);
                                }}
                              >
                                <RiDeleteBin6Line className='size-4 text-primary-error' />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isStudent ? 4 : 12}>
                      <EmptyTable />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

export default TeachingProgramList;
