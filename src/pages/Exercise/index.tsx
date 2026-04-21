import { useEffect, useState } from 'react';
import { CALENDER_GRAY, CLOSE_CIRCLE_WHITE, NO_IMAGE, STAR_ICON } from '@lib/ImageHelper';
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
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogHeader } from '@components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@components/ui/sheet';
import exerciseServices from '@services/exercise';
import { getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import Icon from '@components/Icon/index';
import LearningProgramsSelect from '@components/selects/LearningProgramSelect';
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFilter3Line,
  RiLayoutGridLine,
  RiTableLine
} from '@remixicon/react';

const TABLE_SHELL =
  'w-full min-w-[1280px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

const SHEET_TABLE_SHELL =
  'w-full border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

export const ExamAccess = (props: any) => {
  const { t } = useT();
  const { show, setShow, title, examId, learningProgramId, exerciseId } = props;
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const getData = async (filters?: any) => {
    setLoading(true);
    let params: any = {
      fields: 'identity,exercise_id,exam_id,student_id,student_name,avatar,ip_address,created_at',
      limit,
      offset,
      filterings: {
        exam_id: examId,
        learning_program_id: learningProgramId,
        exercise_id: exerciseId
      }
    };
    params = mergeObjects(params, filters);
    try {
      setLoading(false);
      const res: any = await exerciseServices.getExamAccess(params);
      setData(res?.data);
      setHasMore(res?.has_more);
      setOffset(res?.offset);
      setLimit(res?.limit);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    (learningProgramId || examId || exerciseId) && show && getData();
  }, [show]);

  return (
    <Sheet
      open={show}
      onOpenChange={(open) => {
        setShow(open);
      }}
    >
      <SheetContent className='flex !w-[min(100%,628px)] max-w-[628px] flex-col border-l border-violet-200 bg-white px-6 py-0 sm:max-w-[628px]'>
        <SheetHeader className='border-b border-violet-100 py-6'>
          <SheetTitle className='text-lg font-semibold text-violet-950'>
            {t('access_count')}: {title}
          </SheetTitle>
        </SheetHeader>
        <Loading loading={loading} />
        <div className='flex-1 overflow-y-auto py-6'>
          <div className='overflow-hidden rounded-2xl border border-violet-100'>
            <table className={SHEET_TABLE_SHELL}>
            <thead>
              <tr>
                <th scope='col' className='w-12 bg-violet-100/80 text-violet-900'>
                  {t('number_order')}
                </th>
                <th scope='col' className='bg-violet-100/80 text-violet-900'>{t('code_and_name')}</th>
                <th scope='col' className='w-48 bg-violet-100/80 text-violet-900'>
                  {t('_time')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {data?.length > 0 ? (
                data?.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/60'
                  >
                    <td className=''>{index + 1}</td>
                    <td className=''>
                      <div className='flex items-center gap-3'>
                        <img className='w-10 h-10 min-w-10 rounded-full object-cover' src={item?.avatar} />
                        <div className='text-left'>
                          <p className='text-sm font-medium'>{getUserInfo(item?.student_id)?.username}</p>
                          <p className='text-sm font-medium '>{item?.student_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className=''>
                      <div className='flex items-center justify-center gap-2'>
                        <img src={CALENDER_GRAY} />
                        <p className='text-sm font-medium text-primary-neutral-500 text-center'>
                          {convertTimestampToString(item?.created_at, 'right')}
                        </p>
                      </div>
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
        <div className='w-full border-t border-violet-200 bg-violet-50/80'>
          <Pagination
            className='border-t border-violet-200'
            limit={limit}
            offset={offset}
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
      </SheetContent>
    </Sheet>
  );
};

export const ExamComplete = (props: any) => {
  const { t } = useT();
  const { show, setShow, title, examId, learningProgramId, exerciseId } = props;
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const getData = async (filters?: any) => {
    setLoading(true);
    let params: any = {
      fields: 'identity,student_id,student_name,student_avatar,student_username,created_at',
      limit,
      offset,
      filterings: {
        exam_id: examId,
        learning_program_id: learningProgramId,
        exercise_id: exerciseId
      }
    };
    params = mergeObjects(params, filters);
    try {
      setLoading(false);
      const res: any = await exerciseServices.getExamSubmit(params);
      setData(res?.data);
      setHasMore(res?.has_more);
      setOffset(res?.offset);
      setLimit(res?.limit);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    (learningProgramId || examId || exerciseId) && show && getData();
  }, [show]);

  return (
    <Sheet
      open={show}
      onOpenChange={(open) => {
        setShow(open);
      }}
    >
      <SheetContent className='flex !w-[min(100%,628px)] max-w-[628px] flex-col border-l border-violet-200 bg-white px-6 py-0 sm:max-w-[628px]'>
        <SheetHeader className='border-b border-violet-100 py-6'>
          <SheetTitle className='text-lg font-semibold text-violet-950'>
            {t('exercise_completion_count')}: {title}
          </SheetTitle>
        </SheetHeader>
        <Loading loading={loading} />
        <div className='flex-1 overflow-y-auto py-6'>
          <div className='overflow-hidden rounded-2xl border border-violet-100'>
            <table className={SHEET_TABLE_SHELL}>
            <thead>
              <tr>
                <th scope='col' className='w-12 bg-violet-100/80 text-violet-900'>
                  {t('number_order')}
                </th>
                <th scope='col' className='bg-violet-100/80 text-violet-900'>{t('code_and_name')}</th>
                <th scope='col' className='w-48 bg-violet-100/80 text-violet-900'>
                  {t('_time')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {data?.length > 0 ? (
                data?.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/60'
                  >
                    <td className=''>{index + 1}</td>
                    <td className=''>
                      <div className='flex items-center gap-3'>
                        <img className='w-10 h-10 min-w-10 rounded-full object-cover' src={item?.student_avatar} />
                        <div className='text-left'>
                          <p className='text-sm font-medium'>{getUserInfo(item?.student_id)?.username}</p>
                          <p className='text-sm font-medium '>{item?.student_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className=''>
                      <div className='flex items-center justify-center gap-2'>
                        <img src={CALENDER_GRAY} />
                        <p className='text-sm font-medium text-primary-neutral-500 text-center'>
                          {convertTimestampToString(item?.created_at, 'right')}
                        </p>
                      </div>
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
        <div className='w-full border-t border-violet-200 bg-violet-50/80'>
          <Pagination
            className='border-t border-violet-200'
            limit={limit}
            offset={offset}
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
      </SheetContent>
    </Sheet>
  );
};
export const ExamRate = (props: any) => {
  const { t } = useT();
  const { show, setShow, title, examId, learningProgramId, exerciseId } = props;
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const getData = async (filters?: any) => {
    setLoading(true);
    let params: any = {
      fields: 'identity,exercise_id,exam_id,student_id,student_name,student_avatar,rate,comment,created_at',
      limit,
      offset,
      filterings: {
        exam_id: examId,
        learning_program_id: learningProgramId,
        exercise_id: exerciseId
      }
    };
    params = mergeObjects(params, filters);
    try {
      setLoading(false);
      const res: any = await exerciseServices.getExamRate(params);
      setData(res?.data);
      setHasMore(res?.has_more);
      setOffset(res?.offset);
      setLimit(res?.limit);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    (learningProgramId || examId || exerciseId) && show && getData();
  }, [show]);

  return (
    <Sheet
      open={show}
      onOpenChange={(open) => {
        setShow(open);
      }}
    >
      <SheetContent className='flex !w-[min(100%,628px)] max-w-[628px] flex-col border-l border-violet-200 bg-white px-6 py-0 sm:max-w-[628px]'>
        <SheetHeader className='border-b border-violet-100 py-6'>
          <SheetTitle className='text-lg font-semibold text-violet-950'>
            {t('rating_count')}: {title}
          </SheetTitle>
        </SheetHeader>
        <Loading loading={loading} />
        <div className='flex-1 overflow-y-auto py-6'>
          <div className='overflow-hidden rounded-2xl border border-violet-100'>
            <table className={SHEET_TABLE_SHELL}>
            <thead>
              <tr>
                <th scope='col' className='w-12 bg-violet-100/80 text-violet-900'>
                  {t('number_order')}
                </th>
                <th scope='col' className='bg-violet-100/80 text-violet-900'>{t('code_and_name')}</th>
                <th scope='col' className='w-48 bg-violet-100/80 text-violet-900'>
                  {t('_time')}
                </th>
                <th scope='col' className='w-20 bg-violet-100/80 text-violet-900'>
                  {t('evaluation_score')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {data?.length > 0 ? (
                data?.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className='transition-colors odd:bg-white even:bg-violet-50/40 hover:bg-cyan-50/60'
                  >
                    <td className=''>{index + 1}</td>
                    <td className=''>
                      <div className='flex items-center gap-3'>
                        <img className='w-10 h-10 min-w-10 rounded-full object-cover' src={item?.student_avatar} />
                        <div className='text-left'>
                          <p className='text-sm font-medium'>{getUserInfo(item?.student_id)?.username}</p>
                          <p className='text-sm font-medium '>{item?.student_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className=''>
                      <div className='flex items-center justify-center gap-2'>
                        <img src={CALENDER_GRAY} />
                        <p className='text-sm font-medium text-primary-neutral-500 text-center'>
                          {convertTimestampToString(item?.created_at, 'right')}
                        </p>
                      </div>
                    </td>
                    <td className='text-center'>{item?.rate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyTable />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        <div className='w-full border-t border-violet-200 bg-violet-50/80'>
          <Pagination
            className='border-t border-violet-200'
            limit={limit}
            offset={offset}
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
      </SheetContent>
    </Sheet>
  );
};

interface Props {}

const ExerciseList = (props: Props) => {
  const { permissions, currentUser } = useRootStore();
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
  const navigate = useNavigate();
  const [showModalDescription, setShowModalDescription] = useState(false);
  const [showDrawerAccess, setShowDrawerAccess] = useState(false);
  const [showDrawerCompleteExercise, setShowDrawerCompleteExercise] = useState(false);
  const [showDrawerVote, setShowDrawerVote] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await exerciseServices.deleteExercise(Number(selectedId));
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
        'identity,exercise_name,exercise_code,description,learning_program_id,subject_id,payment_type,retail_price,last_updated_by,last_updated_user,valid,created_at,updated_at,questions,user_ability,learning_program,avatar,statistic',
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
    if (infoSearch?.learning_program_id) {
      params.filterings['learning_program_id:eq'] = infoSearch?.learning_program_id;
    }
    params = mergeObjects(params, filters);

    setLoading(true);
    try {
      const response: any = await exerciseServices.getExercises(params);
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
    const curriculum_id = sessionStorage.getItem('curriculum_id');
    if (Number(curriculum_id)) {
      getData({ filterings: { 'learning_program_id:eq': curriculum_id } });
      setInfoSearch({ ...infoSearch, learning_program_id: Number(curriculum_id) });
      sessionStorage.removeItem('curriculum_id');
    } else {
      getData();
    }
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
              <h3 className='text-xl font-semibold tracking-wide'>{t('exercise_list')}</h3>
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
                    <SubjectsSelect
                      label={t('subject')}
                      placeholder={t('select_subject')}
                      isClearable
                      value={infoSearch?.subject_id}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, subject_id: val?.id });
                      }}
                    />

                    <LearningProgramsSelect
                      label={t('curriculum')}
                      isClearable
                      placeholder={t('select_teaching_location')}
                      value={infoSearch?.learning_program_id}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, learning_program_id: val?.id });
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
                            'subject_id:eq': undefined,
                            'learning_program_id:eq': undefined
                          },
                          offset: 0
                        });
                        setInfoSearch({
                          subject_id: undefined,
                          learning_program_id: undefined
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
                <Button
                  variant='outline'
                  className='rounded-xl border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100'
                  onClick={() => {
                    navigate('/curriculum/report');
                  }}
                >
                  <RiBarChartBoxLine className='size-4' />
                  {t('exercise_report')}
                </Button>
                {!!permissions.CREATE_STUDY_PROGRAM && (
                  <Button
                    className='rounded-xl bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/exercise/edit/0');
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
                      <th scope='col' className='w-12 bg-slate-100'>
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
                      <th scope='col' className='bg-violet-100/70 text-violet-900'>
                        {t('exercise_code_name')}
                      </th>
                      <th scope='col' className='bg-rose-100/70 text-rose-900'>{t('exercise_description')}</th>
                      <th scope='col' className='bg-amber-100/70 text-amber-900'>
                        {t('program_code_name_have_exercise')}
                      </th>
                      <th scope='col' className='bg-emerald-100/70 text-emerald-900'>{t('subject')}</th>
                      <th scope='col' className='bg-sky-100/70 text-sky-900'>{t('number_of_questions')}</th>
                      <th scope='col' className='bg-cyan-100/70 text-cyan-900'>{t('access_count')}</th>
                      <th scope='col' className='bg-cyan-100/75 text-cyan-900'>
                        {t('exercise_completion_count')}
                      </th>
                      <th scope='col' className='bg-violet-100/75 text-violet-900'>
                        {t('rating_count_and_avg_score')}
                      </th>
                      <th scope='col' className='w-56 bg-slate-100 text-slate-800'>
                        {t('update_time')}
                      </th>
                      <th scope='col' className='w-28 bg-rose-100/70 text-rose-900'>
                        {t('action')}
                      </th>
                    </tr>

                    {ids?.length > 0 && (
                      <tr>
                        <th colSpan={11} className='bg-rose-500 p-2.5'>
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
                          <td>
                            <div className='flex justify-center'>
                              <CheckboxInput
                                checked={ids?.includes(item?.id)}
                                onCheckedChange={(checked) => {
                                  if (ids?.includes(item?.id)) {
                                    setIds(ids?.filter((id) => id !== item?.id));
                                  } else {
                                    setIds([...ids, item?.id]);
                                  }
                                }}
                              />
                            </div>
                          </td>
                          <td className='bg-violet-50/50 text-left'>
                            <Link
                              to={`/exercise/detail/${item?.id}`}
                              className='font-medium text-violet-700 hover:underline'
                            >
                              {item?.exercise_code}
                            </Link>
                            <br />
                            <p className='text-slate-800'>{item?.exercise_name}</p>
                          </td>
                          <td className='bg-rose-50/40'>
                            <p
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setShowModalDescription(true);
                                setSelectedId(item?.id);
                              }}
                            >
                              {t('detail')}
                            </p>
                          </td>
                          <td className='bg-amber-50/40 text-left'>
                            <Link
                              to={`/curriculum/detail/${item?.learning_program?.id}`}
                              className='font-medium text-violet-700 hover:underline'
                            >
                              {item?.learning_program?.learning_program_code} -{' '}
                              {item?.learning_program?.learning_program_name}
                            </Link>
                          </td>
                          <td className='bg-emerald-50/40'>
                            <p>{getSubjectInfo(item?.subject_id)?.subject_name}</p>
                            <p className='text-slate-600'>{getSubjectInfo(item?.subject_id)?.subject_code}</p>
                          </td>

                          <td className='bg-sky-50/40'>{item?.statistic?.total_questions}</td>

                          <td
                            className='cursor-pointer bg-cyan-50/40 font-medium text-violet-700 underline'
                            onClick={() => {
                              setShowDrawerAccess(true);
                              setSelectedId(item?.id);
                            }}
                          >
                            {item?.statistic?.total_exam_access}
                          </td>
                          <td
                            className='cursor-pointer bg-cyan-50/45 font-medium text-violet-700 underline'
                            onClick={() => {
                              setShowDrawerCompleteExercise(true);
                              setSelectedId(item?.id);
                            }}
                          >
                            {item?.statistic?.total_submission || 0}
                          </td>
                          <td className='bg-violet-50/40'>
                            <p
                              className='cursor-pointer font-medium text-violet-700 underline'
                              onClick={() => {
                                setShowDrawerVote(true);
                                setSelectedId(item?.id);
                              }}
                            >
                              {t('number_of_views')}: {item?.statistic?.total_rates || 0}
                            </p>
                            <p className='text-slate-700'>
                              {t('average_score')}: {item?.statistic?.avg_score || 0}
                            </p>
                          </td>
                          <td className='text-left'>
                            {item?.last_updated_user?.display_name} - {item?.last_updated_user?.username}
                            <br />
                            <div className='flex items-center gap-2'>
                              <img src={CALENDER_GRAY} alt='' />
                              <p className='text-sm font-medium text-slate-500'>
                                {convertTimestampToString(item?.updated_at, 'right')}
                              </p>
                            </div>
                          </td>
                          <td className='w-28 whitespace-nowrap'>
                            <div className='flex items-center justify-center gap-1'>
                              {!!item?.user_ability?.can_edit && (
                                <Link
                                  to={`/exercise/edit/${item?.id}`}
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
                        <td colSpan={11}>
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
                <div className='border-b border-violet-200 bg-white p-3'>
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
                <div className='grid grid-cols-2 gap-2 bg-slate-50 p-2.5 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6'>
                  {data.map((item: any, uIdx: number) => (
                    <div
                      key={`user-grid-${uIdx}`}
                      className='rounded-lg border border-slate-200 bg-white px-2.5 pb-2.5 pt-1.5 transition-all hover:-translate-y-[1px] hover:shadow-md'
                    >
                      <div className='mb-1'>
                        <CheckboxInput
                          checked={ids?.includes(item?.id)}
                          onCheckedChange={(checked) => {
                            if (ids?.includes(item?.id)) {
                              setIds(ids?.filter((id) => id !== item?.id));
                            } else {
                              setIds([...ids, item?.id]);
                            }
                          }}
                        />
                      </div>
                      <div className='relative mb-2'>
                        <img
                          className='max-h-[200px] min-h-[200px] w-full rounded-lg object-cover 2xl:max-h-[300px] 2xl:min-h-[300px]'
                          src={item?.avatar || NO_IMAGE}
                          alt=''
                        />
                        <div className='absolute left-2 top-2 w-max rounded-md bg-violet-600 px-2 py-1 text-center text-sm font-medium text-white'>
                          {t('free')}
                        </div>
                      </div>
                      <div className='space-y-1 text-xs'>
                        <div className='truncate text-slate-600'>{item?.exercise_code}</div>
                        <Link
                          to={`/exercise/detail/${item?.id}`}
                          className='block truncate font-semibold text-violet-700 underline'
                        >
                          {item?.exercise_name}
                        </Link>
                      </div>
                      <div className='mt-2 flex w-full items-center gap-5'>
                        <div className='flex items-center justify-center gap-1'>
                          <Icon icon={STAR_ICON} className='size-4 text-primary-warning' />
                          <p className='text-sm font-medium text-violet-700'>{item?.statistic?.total_rates}</p>
                        </div>
                        <p className='custom_marker text-sm font-medium text-slate-600'>
                          {item?.statistic?.total_submission} {t('completed')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/90 px-4 py-2 shadow-[0_-6px_14px_-12px_rgba(15,23,42,0.2)]'>
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
                dangerouslySetInnerHTML={{ __html: data?.find((item: any) => item?.id == selectedId)?.description }}
              />
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Access */}
      <ExamAccess
        show={showDrawerAccess}
        setShow={setShowDrawerAccess}
        exerciseId={selectedId}
        title={`${data?.find((item: any) => item?.id == selectedId)?.exercise_code} - 
            ${data?.find((item: any) => item?.id == selectedId)?.exercise_name}`}
      />
      {/* Complete exercise */}
      <ExamComplete
        show={showDrawerCompleteExercise}
        setShow={setShowDrawerCompleteExercise}
        exerciseId={selectedId}
        title={`${data?.find((item: any) => item?.id == selectedId)?.exercise_code} - 
            ${data?.find((item: any) => item?.id == selectedId)?.exercise_name}`}
      />

      {/* Rate count */}
      <ExamRate
        show={showDrawerVote}
        setShow={setShowDrawerVote}
        exerciseId={selectedId}
        title={`${data?.find((item: any) => item?.id == selectedId)?.exercise_code} - 
            ${data?.find((item: any) => item?.id == selectedId)?.exercise_name}`}
      />
    </>
  );
};

export default ExerciseList;
