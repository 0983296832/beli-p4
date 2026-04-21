import { useEffect, useState } from 'react';
import { CLOSE_CIRCLE_WHITE, NO_IMAGE } from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
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
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogHeader } from '@components/ui/alert-dialog';
import curriculumServices from '@services/curriculum';
import { getSubjectInfo } from '@lib/GetInfoHelper';
import { USER_ROLE } from '@constants/index';
import { ExamAccess, ExamComplete, ExamRate } from '../Exercise';
import {
  RiAddLine,
  RiCalendarLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFilter3Line,
  RiLayoutGridLine,
  RiTableLine
} from '@remixicon/react';

const TABLE_SHELL =
  'w-full min-w-[1100px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

interface Props {}

const CurriculumList = (props: Props) => {
  const { permissions, currentUser } = useRootStore();
  const { t } = useT();
  const [activeTab, setActiveTab] = useState(
    currentUser?.user_job_title !== USER_ROLE.STUDENT ? 'table_view' : 'grid_view'
  );
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
  const navigate = useNavigate();
  const [showModalDescription, setShowModalDescription] = useState(false);
  const [showDrawerAccess, setShowDrawerAccess] = useState(false);
  const [showDrawerCompleteExercise, setShowDrawerCompleteExercise] = useState(false);
  const [showDrawerVote, setShowDrawerVote] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await curriculumServices.deleteCurriculum(Number(selectedId));
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
        'identity,learning_program_name,learning_program_code,description,subject_id,avatar,last_updated_by,last_updated_user,user_ability,created_at,updated_at,statistic',
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
      const response: any = await curriculumServices.getCurriculums(params);
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
      //   const res: any = await studentServices.putStudent(Number(id), { description });
      //   getData();
      //   Toast('success', res?.message);
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
              <h3 className='text-xl font-semibold tracking-wide'>{t('curriculum_list')}</h3>
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
                      placeholder={t('select_subject')}
                      isClearable
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
                {!!permissions.CREATE_STUDY_PROGRAM && (
                  <Button
                    className='rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/curriculum/edit/0');
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

        <div>
          {activeTab === 'table_view' ? (
            <div className='mt-1 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
              <div className='overflow-x-auto'>
                <table className={TABLE_SHELL}>
                  <thead>
                    <tr>
                      <th scope='col' rowSpan={2} className='bg-violet-100/70 text-violet-900'>
                        {t('learning_program_code_name')}
                      </th>
                      <th scope='col' rowSpan={2} className='bg-violet-100/70 text-violet-900'>
                        {t('learning_program_description')}
                      </th>
                      <th scope='col' rowSpan={2} className='bg-sky-100/70 text-sky-900'>
                        {t('subject')}
                      </th>
                      <th scope='col' colSpan={2} className='bg-emerald-100/80 text-emerald-900'>
                        {t('number_of_exercises_questions')}
                      </th>
                      <th scope='col' rowSpan={2} className='bg-amber-100/70 text-amber-900'>
                        {t('access_count')}
                      </th>
                      <th scope='col' rowSpan={2} className='bg-amber-100/70 text-amber-900'>
                        {t('exercise_completion_count')}
                      </th>
                      <th scope='col' rowSpan={2} className='bg-amber-100/70 text-amber-900'>
                        {t('rating_count_and_avg_score')}
                      </th>
                      <th scope='col' rowSpan={2} className='w-56 bg-cyan-100/70 text-cyan-900'>
                        {t('update_time')}
                      </th>
                      <th scope='col' rowSpan={2} className='w-28 bg-rose-100/70 text-rose-900'>
                        {t('action')}
                      </th>
                    </tr>
                    <tr className='bg-emerald-100/60 text-emerald-900'>
                      <th scope='col' className='w-24'>
                        {t('exercise')}
                      </th>
                      <th scope='col' className='w-24'>
                        {t('question')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white'>
                    {data?.length > 0 ? (
                      data.map((item: any, index: number) => (
                        <tr
                          key={index}
                          className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/70'
                        >
                          <td className='bg-violet-50/60 text-left'>
                            <div className='flex items-center gap-2'>
                              <img
                                className='size-10 min-h-10 min-w-10 rounded-full object-cover'
                                src={item?.avatar || NO_IMAGE}
                                alt=''
                              />
                              <div className='text-start'>
                                {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                                  <p>{item?.learning_program_code}</p>
                                )}
                                <Link
                                  to={`/curriculum/detail/${item?.id}`}
                                  className='font-medium text-violet-700 hover:underline'
                                >
                                  {item?.learning_program_name}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className='bg-violet-50/60'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setShowModalDescription(true);
                                setSelectedId(item?.id);
                              }}
                            >
                              {t('detail')}
                            </button>
                          </td>
                          <td className='bg-sky-50/70'>
                            <p>{getSubjectInfo(item?.subject_id)?.subject_name}</p>
                            <p>{getSubjectInfo(item?.subject_id)?.subject_code}</p>
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-800'>
                            {currentUser?.user_job_title === USER_ROLE.STUDENT ? (
                              <span className='font-medium'>{item?.statistic?.exercise_count || 0}</span>
                            ) : (
                              <Link
                                to={'/exercise/list'}
                                onClick={() => {
                                  sessionStorage.setItem('curriculum_id', item?.id);
                                }}
                                className='font-medium text-violet-700 underline'
                              >
                                {item?.statistic?.exercise_count || 0}
                              </Link>
                            )}
                          </td>
                          <td className='bg-emerald-50/80 text-emerald-800'>{item?.statistic?.question_count || 0}</td>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setShowDrawerAccess(true);
                                setSelectedId(item?.id);
                              }}
                            >
                              {item?.statistic?.access_count || 0}
                            </button>
                          </td>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setShowDrawerCompleteExercise(true);
                                setSelectedId(item?.id);
                              }}
                            >
                              {item?.statistic?.submission_count || 0}
                            </button>
                          </td>
                          <td className='bg-amber-50/70'>
                            <button
                              type='button'
                              className='cursor-pointer text-left'
                              onClick={() => {
                                setShowDrawerVote(true);
                                setSelectedId(item?.id);
                              }}
                            >
                              <p className='font-medium text-violet-700 underline'>
                                {t('number_of_views')}: {item?.statistic?.rating_count || 0}
                              </p>
                              <p>
                                {t('average_score')}:{item?.statistic?.avg_point_value || 0}
                              </p>
                            </button>
                          </td>
                          <td className='bg-cyan-50/60 text-left'>
                            {item?.last_updated_user?.display_name} - {item?.last_updated_user?.username}
                            <br />
                            <div className='flex items-center gap-2'>
                              <RiCalendarLine className='size-4 text-cyan-600' />
                              <p className='text-sm font-medium text-primary-neutral-500'>
                                {convertTimestampToString(item?.updated_at, 'right')}
                              </p>
                            </div>
                          </td>
                          <td className='w-28 whitespace-nowrap bg-rose-50/70'>
                            <div className='flex items-center justify-center gap-1'>
                              {!!item?.user_ability?.can_edit && (
                                <Link
                                  to={`/curriculum/edit/${item?.id}`}
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
                <div className='grid grid-cols-2 gap-2 bg-slate-50 p-2.5 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-7'>
                  {data.map((item: any, uIdx: number) => (
                    <div
                      key={`curriculum-grid-${uIdx}`}
                      className='rounded-lg border border-slate-200 bg-white px-2.5 pb-2.5 pt-1.5 transition-all hover:-translate-y-[1px] hover:shadow-md'
                    >
                      <div className='mb-2'>
                        <img
                          className='aspect-square w-full rounded-md object-cover'
                          src={item?.avatar || NO_IMAGE}
                          alt=''
                        />
                      </div>
                      <div className='space-y-1 text-xs'>
                        <Link
                          to={`/curriculum/detail/${item?.id}`}
                          className='block truncate font-semibold text-violet-700 underline'
                        >
                          {item?.learning_program_name}
                        </Link>
                        {currentUser?.user_job_title != USER_ROLE.STUDENT && (
                          <div className='truncate text-slate-600'>{item?.learning_program_code}</div>
                        )}
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

      {/* Description */}
      <AlertDialog open={showModalDescription} onOpenChange={setShowModalDescription}>
        <AlertDialogContent className='rounded-lg border-none gap-0 p-0 max-w-[700px] overflow-hidden bg-transparent'>
          <AlertDialogHeader className='flex flex-row justify-between px-6 py-3 space-y-0 border-b text-neutral-50 bg-primary-blue-500'>
            <div>
              {t('description')}: {data?.find((item: any) => item?.id == selectedId)?.program_name}
            </div>
            <AlertDialogCancel className='h-auto gap-0 p-0 mt-0 bg-transparent border-0 shadow-none hover:bg-transparent'>
              <img src={CLOSE_CIRCLE_WHITE} alt='' />
            </AlertDialogCancel>
          </AlertDialogHeader>
          <div className='p-4 bg-white '>
            <div className='border p-6 rounded-lg'>
              <p
                className='text-sm font-medium'
                dangerouslySetInnerHTML={{
                  __html: data?.find((item: any) => item?.id == selectedId)?.description
                }}
              />
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Access */}
      <ExamAccess
        show={showDrawerAccess}
        setShow={setShowDrawerAccess}
        learningProgramId={selectedId}
        title={`${data?.find((item: any) => item?.id == selectedId)?.learning_program_code} - 
                  ${data?.find((item: any) => item?.id == selectedId)?.learning_program_name}`}
      />
      {/* Complete exercise */}
      <ExamComplete
        show={showDrawerCompleteExercise}
        setShow={setShowDrawerCompleteExercise}
        learningProgramId={selectedId}
        title={`${data?.find((item: any) => item?.id == selectedId)?.learning_program_code} - 
                  ${data?.find((item: any) => item?.id == selectedId)?.learning_program_name}`}
      />

      {/* Rate count */}
      <ExamRate
        show={showDrawerVote}
        setShow={setShowDrawerVote}
        learningProgramId={selectedId}
        title={`${data?.find((item: any) => item?.id == selectedId)?.learning_program_code} - 
                  ${data?.find((item: any) => item?.id == selectedId)?.learning_program_name}`}
      />
    </>
  );
};

export default CurriculumList;
