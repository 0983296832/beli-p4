import { useEffect, useState } from 'react';
import {
  BG_VHS_01_1,
  CALENDER_GRAY,
  CALL,
  CLOSE_CIRCLE_WHITE,
  DELETE_04,
  EDIT_02,
  FILTER_HORIZONTAL,
  GRID_VIEW_BLACK,
  GRID_VIEW_WHITE,
  LAYOUT_TABLE_01_BLACK,
  LAYOUT_TABLE_01_WHITE,
  LOCATION_05,
  MAIL_02,
  NO_IMAGE
} from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import DateInput from '@components/fields/DateInput';
import { Link, useNavigate } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import { mergeObjects } from '@lib/JsHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import { Toast } from '@components/toast';
import studentServices from '@services/student';
import { convertTimestampToString } from '@lib/TimeHelper';
import EmptyTable from '@components/empty/EmptyTable';
import { useRootStore } from '@store/index';
import GenderSelect from '@components/selects/GenderSelect';
import NumberInput from '@components/fields/NumberInput';
import WorkingStatusSelect from '@components/selects/StatusSelect';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogHeader } from '@components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@components/ui/sheet';
import exerciseServices from '@services/exercise';
import { getSubjectInfo } from '@lib/GetInfoHelper';
import { USER_ROLE } from '@constants/index';
import SelectInput from '@components/fields/SelectInput';
import { ChevronDown } from 'lucide-react';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import StudentsGroupSelect from '@components/selects/GroupStudentSelect';
import { isEmpty, uniq } from 'lodash';
import StudentsGroupSelectVirtualized from '../../components/selects/GroupStudentSelectVirtualized';
import { useDevice } from '@hooks/useDevice';
import dayjs from 'dayjs';

interface Props {}

const StudentExam = (props: Props) => {
  const { permissions, currentUser } = useRootStore();
  const { t } = useT();
  const { isMobile } = useDevice();
  const [activeTab, setActiveTab] = useState('grid_view');
  const [infoSearch, setInfoSearch] = useState<any>({ public_exam: 0, has_not_static: 1 });
  const [openFilter, setOpenFilter] = useState(false);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [limitComplete, setLimitComplete] = useState(20);
  const [offsetComplete, setOffsetComplete] = useState(0);
  const [hasMoreComplete, setHasMoreComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [dataComplete, setDataComplete] = useState<any>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [isShowConfirmBulk, setIsShowConfirmBulk] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const navigate = useNavigate();
  const [showModalDescription, setShowModalDescription] = useState(false);
  const [showDrawerAccess, setShowDrawerAccess] = useState(false);
  const [showDrawerCompleteExercise, setShowDrawerCompleteExercise] = useState(false);
  const [showDrawerVote, setShowDrawerVote] = useState(false);
  const [showExamCompleted, setShowExamCompleted] = useState(true);
  const [showExamInComplete, setShowExamInComplete] = useState(true);
  const exerciseMode = [
    { value: 1, label: t('practice_exercise') },
    { value: 2, label: t('training_test') },
    { value: 3, label: t('exam') }
  ];

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
        'exam_code,exam_name,identity,exercise_id,exercise,exam_code,filters,created_by_type,creator,valid,start_time,end_time,mode,try_number,try_number_per_question,target_percentage,show_answer_during_exam,show_answer_after_exam,is_shuffle_questions,is_shuffle_answer,time_for_each_question,time_for_exam,ranking,students,user_ability',
      limit,
      offset,
      search: '',
      filterings: {
        has_submission: 0
      },
      sort: 'end_time',
      direction: 'asc'
    };
    if (infoSearch?.exam_name) {
      params.filterings['exam_name:contain'] = infoSearch?.exam_name;
    }

    if (infoSearch?.start_time) {
      params.filterings['start_time:gte'] = infoSearch?.start_time;
    }
    if (infoSearch?.end_time) {
      params.filterings['end_time:lte'] = infoSearch?.end_time;
    }
    if (infoSearch?.subject_id) {
      params.filterings['subject_id:eq'] = infoSearch?.subject_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:in'] = infoSearch?.classroom_id;
    }
    if (infoSearch?.students) {
      params.filterings['students:in'] = infoSearch?.students;
    }
    if (infoSearch?.mode) {
      params.filterings['mode:eq'] = infoSearch?.mode;
    }
    if (infoSearch?.has_not_static != 0) {
      params.filterings['has_not_static'] = infoSearch?.has_not_static;
    }
    params = mergeObjects(params, filters);
    if (params?.filterings?.public_exam == 1) {
      delete params.filterings['mode:eq'];
    }
    setLoading(true);
    try {
      const response: any = await exerciseServices.getStudentExercise(params);
      setData(response?.data?.map((item: any) => ({ ...item?.exercise, setting: item })));
      setHasMore(response.has_more);
      setLimit(response?.limit);
      setOffset(response?.offset);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDataComplete = async (filters?: any) => {
    let params: any = {
      fields:
        'exam_code,exam_name,identity,exercise_id,exercise,exam_code,filters,created_by_type,creator,valid,start_time,end_time,mode,try_number,try_number_per_question,target_percentage,show_answer_during_exam,show_answer_after_exam,is_shuffle_questions,is_shuffle_answer,time_for_each_question,time_for_exam,ranking,students,user_ability',
      limit: limitComplete,
      offset: offsetComplete,
      search: '',
      filterings: {
        has_submission: 1,
        public_exam: 0
      },
      sort: 'end_time',
      direction: 'asc'
    };
    if (infoSearch?.exam_name) {
      params.filterings['exam_name:contain'] = infoSearch?.exam_name;
    }
    if (infoSearch?.start_time) {
      params.filterings['start_time:gte'] = infoSearch?.start_time;
    }
    if (infoSearch?.end_time) {
      params.filterings['end_time:lte'] = infoSearch?.end_time;
    }
    if (infoSearch?.subject_id) {
      params.filterings['subject_id:eq'] = infoSearch?.subject_id;
    }
    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:in'] = infoSearch?.classroom_id;
    }
    if (infoSearch?.students) {
      params.filterings['students:in'] = infoSearch?.students;
    }
    if (infoSearch?.mode) {
      params.filterings['mode:eq'] = infoSearch?.mode;
    }
    if (infoSearch?.public_exam != undefined) {
      params.filterings['public_exam'] = infoSearch?.public_exam;
    }
    if (infoSearch?.has_not_static != 0) {
      params.filterings['has_not_static'] = infoSearch?.has_not_static;
    }
    params = mergeObjects(params, filters);
    if (params?.filterings?.public_exam == 1) {
      delete params.filterings['mode:eq'];
    }
    setLoading(true);
    try {
      const response: any = await exerciseServices.getStudentExercise(params);
      setDataComplete(response?.data?.map((item: any) => ({ ...item?.exercise, setting: item })));
      setHasMoreComplete(response.has_more);
      setLimitComplete(response?.limit);
      setOffsetComplete(response?.offset);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
    getDataComplete();
  }, []);

  return (
    <>
      <div className={`pb-20 space-y-6 `}>
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
        <div className='w-full overflow-hidden border rounded-lg shadow-lg border-neutral-300'>
          <div className='p-3 text-neutral-50 bg-primary-blue-500'>
            <h3 className='text-base font-semibold'>{t('exercise_list')}</h3>
          </div>
          <div className='p-4 bg-white'>
            <div className='flex justify-between flex-wrap gap-2'>
              <Popover open={openFilter} onOpenChange={setOpenFilter}>
                <PopoverAnchor asChild>
                  <div className='flex items-center'>
                    <SearchInput
                      placeholder={t('search')}
                      className='w-[230px] sm:w-[400px]'
                      value={infoSearch?.exam_name}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          getData({ offset: 0 });
                          getDataComplete({ offset: 0 });
                        }
                      }}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, exam_name: value });
                      }}
                    />

                    <Button
                      className='border bg-primary-neutral-50 border-primary-neutral-200'
                      variant={'ghost'}
                      onClick={() => {
                        setOpenFilter(!openFilter);
                      }}
                    >
                      <img src={FILTER_HORIZONTAL} alt='' />
                      {t('filter')}
                    </Button>
                  </div>
                </PopoverAnchor>

                <PopoverContent
                  className='w-[calc(100vw-50px)] sm:w-[730px]'
                  align='start'
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <div className='grid grid-cols-2 gap-2'>
                    <DateInput
                      label={t('start_time')}
                      value={infoSearch?.start_time}
                      onChange={(e) => {
                        setInfoSearch({ ...infoSearch, start_time: e });
                      }}
                    />
                    <DateInput
                      label={t('end_time')}
                      value={infoSearch?.end_time}
                      onChange={(e) => {
                        setInfoSearch({ ...infoSearch, end_time: e });
                      }}
                    />
                    <SubjectsSelect
                      label={t('subject')}
                      isClearable
                      placeholder={t('select_subject')}
                      value={infoSearch?.subject_id}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, subject_id: val?.id });
                      }}
                    />
                    <TeachingLocationSelect
                      label={t('location')}
                      isClearable
                      placeholder={t('select_teaching_location')}
                      value={infoSearch?.location_id}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, location_id: val?.id });
                      }}
                    />

                    <ClassroomSelect
                      isClearable
                      label={t('classroom')}
                      value={infoSearch?.classroom_id}
                      locationId={infoSearch?.location_id}
                      isMulti
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, classroom_id: val?.map((v) => v?.id) || undefined });
                      }}
                    />
                    <StudentsGroupSelectVirtualized
                      label={t('students')}
                      role='STUDENT'
                      isMulti
                      classroomIds={
                        infoSearch?.classroom_id && !isEmpty(infoSearch?.classroom_id)
                          ? infoSearch?.classroom_id
                          : undefined
                      }
                      isClearable
                      value={infoSearch?.students || []}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, students: uniq(val?.map((u) => u?.id)) });
                      }}
                    />
                    <div className='flex items-center'>
                      <CheckboxInput
                        label={t('show_old_version_of_assignment')}
                        checked={infoSearch?.has_not_static == 0}
                        onCheckedChange={(checked) => {
                          setInfoSearch({ ...infoSearch, has_not_static: checked ? 0 : 1 });
                        }}
                      />
                    </div>
                    {infoSearch?.public_exam == 0 && (
                      <SelectInput
                        label={t('exercise_type')}
                        options={exerciseMode}
                        isClearable
                        value={exerciseMode.find((v) => v?.value == infoSearch?.mode) ?? null}
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, mode: val?.value });
                        }}
                      />
                    )}
                  </div>
                  <div className='flex justify-end gap-3 mt-4'>
                    <Button
                      className='border bg-primary-neutral-100 border-primary-neutral-300'
                      variant={'ghost'}
                      onClick={() => {
                        setInfoSearch({
                          ...infoSearch,
                          start_time: undefined,
                          end_time: undefined,
                          subject_id: undefined,
                          location_id: undefined,
                          mode: undefined,
                          has_not_static: 0
                        });
                        getData({
                          offset: 0,
                          filterings: {
                            'start_time:gte': undefined,
                            'end_time:lte': undefined,
                            'subject_id:eq': undefined,
                            'location_id:eq': undefined,
                            'mode:eq': undefined,
                            has_not_static: undefined
                          }
                        });
                        getDataComplete({
                          offset: 0,
                          filterings: {
                            'start_time:gte': undefined,
                            'end_time:lte': undefined,
                            'subject_id:eq': undefined,
                            'location_id:eq': undefined,
                            'mode:eq': undefined,
                            has_not_static: undefined
                          }
                        });
                        setOpenFilter(false);
                      }}
                    >
                      {t('restore_default')}
                    </Button>
                    <Button
                      className='bg-primary-success hover:bg-primary-success/80'
                      onClick={() => {
                        getData({ offset: 0 });
                        getDataComplete({ offset: 0 });
                        setOpenFilter(false);
                      }}
                    >
                      {t('apply')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <div className='flex items-center '>
                <Button
                  className='border-r-0 rounded-e-[0px]'
                  variant={infoSearch?.public_exam == 0 ? 'default' : 'outline'}
                  onClick={() => {
                    setInfoSearch({ ...infoSearch, public_exam: 0 });
                    getData({
                      offset: 0,
                      filterings: {
                        public_exam: 0
                      }
                    });
                    getDataComplete({
                      offset: 0,
                      filterings: {
                        public_exam: 0
                      }
                    });
                  }}
                >
                  {t('assigned_exercise')}
                </Button>
                <Button
                  className='rounded-s-[0px]'
                  variant={infoSearch?.public_exam == 1 ? 'default' : 'outline'}
                  onClick={() => {
                    setInfoSearch({ ...infoSearch, public_exam: 1 });
                    getData({
                      offset: 0,
                      filterings: {
                        public_exam: 1
                      }
                    });
                    getDataComplete({
                      offset: 0,
                      filterings: {
                        public_exam: 1
                      }
                    });
                  }}
                >
                  {t('public_exercise')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex gap-3'>
            <Button
              className={`${activeTab === 'grid_view' ? '' : 'bg-primary-neutral-100 border-primary-neutral-200'} `}
              variant={activeTab === 'grid_view' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('grid_view')}
            >
              <img src={activeTab === 'grid_view' ? GRID_VIEW_WHITE : GRID_VIEW_BLACK} alt='' />
              {t('grid_view')}
            </Button>
            <Button
              className={`${activeTab === 'table_view' ? '' : 'bg-primary-neutral-100 border-primary-neutral-200'} hidden sm:flex`}
              variant={activeTab === 'table_view' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('table_view')}
            >
              <img src={activeTab === 'table_view' ? LAYOUT_TABLE_01_WHITE : LAYOUT_TABLE_01_BLACK} alt='' />
              {t('table_view')}
            </Button>
          </div>
          <Button
            variant={'outline'}
            className='text-primary-blue-500 border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 hover:text-primary-blue-500'
            onClick={() => {
              navigate('/curriculum/report-session');
            }}
          >
            {t('academic_result')}
          </Button>
        </div>
        <div>
          <div
            className='rounded-t-lg bg-primary-blue-500 p-3 flex items-center gap-3 border border-b-0 cursor-pointer'
            onClick={() => {
              setShowExamInComplete(!showExamInComplete);
            }}
          >
            <p className='text-white font-semibold text-lg'>{t('incomplete_exercise')}</p>
            <ChevronDown className={`size-7 text-white ${showExamInComplete && 'rotate-180'} transition-all`} />
          </div>
          {showExamInComplete && (
            <>
              {activeTab === 'table_view' ? (
                <div>
                  <table className='table-rounded '>
                    <thead>
                      <tr className='bg-primary-blue-50'>
                        <th scope='col'>{t('exam_name')}</th>
                        <th scope='col'>{t('exercise_code_name')}</th>
                        <th scope='col'>{t('exercise_description')}</th>
                        <th scope='col'>{t('program_code_name_have_exercise')}</th>
                        <th scope='col'>{t('subject')}</th>

                        <th scope='col' className='w-56'>
                          {t('start_end_time_of_exercise')}
                        </th>
                        <th scope='col' className='w-56'>
                          {t('action')}
                        </th>
                      </tr>

                      {ids?.length > 0 && (
                        <tr className='tr-sub-form tr-sub'>
                          <th colSpan={14} className='p-2.5 bg-primary-blue-500'>
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
                          </th>
                        </tr>
                      )}
                    </thead>
                    <tbody className='bg-white'>
                      {data?.length > 0 ? (
                        data.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className='text-left'>
                              <p>{item?.setting?.exam_name || t('no_name')}</p>
                              {item?.view_mode == 2 && (
                                <div
                                  className={`px-2 py-1 ${item?.setting?.mode == 1 ? 'text-primary-success bg-[#e4ffe9]' : item?.setting?.mode == 2 ? 'bg-secondary-neutral-50 text-secondary-neutral-500' : 'bg-red-50 text-red-500'} 
                          rounded-15 w-fit text-xs mt-1`}
                                >
                                  {item?.setting?.mode == 1
                                    ? t('practice_exercise')
                                    : item?.setting?.mode == 2
                                      ? t('training_test')
                                      : t('exam')}
                                </div>
                              )}
                            </td>
                            <td className='text-left'>{item?.exercise_name}</td>
                            <td>
                              <p
                                className='underline text-primary-blue-500 cursor-pointer'
                                onClick={() => {
                                  setShowModalDescription(true);
                                  setSelectedId(item?.id);
                                }}
                              >
                                {t('detail')}
                              </p>
                            </td>
                            <td className='text-left'>
                              <p>{item?.learning_program?.learning_program_name}</p>
                            </td>
                            <td>
                              <p>{getSubjectInfo(item?.subject_id)?.subject_name}</p>
                            </td>

                            <td className='text-left'>
                              <p className='text-sm font-medium text-primary-neutral-500'>
                                {t('start')}: {convertTimestampToString(item?.setting?.start_time, 'right')}
                              </p>
                              <p className='text-sm font-medium text-primary-neutral-500'>
                                {t('finish')}: {convertTimestampToString(item?.setting?.end_time, 'right')}
                              </p>
                            </td>
                            <td className='whitespace-nowrap w-28'>
                              <div className='flex items-center gap-2 w-full mt-2'>
                                {currentUser?.user_job_title == USER_ROLE?.STUDENT ? (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 &&
                                      (!item?.setting?.try_number ||
                                        item?.setting?.try_number > item?.setting?.user_ability?.has_submitted) && (
                                        <div
                                          className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                          onClick={() => {
                                            navigate('/practice/' + item?.setting?.id);
                                          }}
                                        >
                                          <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                        </div>
                                      )}
                                  </>
                                ) : (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 && (
                                      <div
                                        className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                        onClick={() => {
                                          navigate('/practice/' + item?.setting?.id);
                                        }}
                                      >
                                        <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                                {item?.setting?.user_ability?.has_submitted > 0 && (
                                  <div
                                    className='py-1.5 flex items-center justify-center rounded bg-[#E8FFEC] cursor-pointer w-1/2 hover:opacity-85'
                                    onClick={() => {
                                      navigate(
                                        `/curriculum/report/detail-exercise/${item?.setting?.id}/${currentUser?.user_id}`
                                      );
                                    }}
                                  >
                                    <p className='text-primary-success text-sm font-medium'>{t('view_results')}</p>
                                  </div>
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
                  <div className='w-full overflow-hidden border rounded-b-lg border-primary-neutral-300 bg-primary-neutral-50'>
                    <div className='grid grid-cols-2 sm:grid-cols-6 '>
                      {data.map((item: any, uIdx: number) => {
                        const now = dayjs();
                        const start = dayjs.unix(item?.setting?.start_time);
                        const end = dayjs.unix(item?.setting?.end_time);
                        return (
                          <div
                            key={`user-grid-${uIdx}`}
                            className='px-3 pt-1 pb-3 border border-primary-neutral-300 flex flex-col'
                          >
                            <div className='mb-2 relative'>
                              <img
                                className='object-cover w-full rounded-lg max-h-[200px] min-h-[200px] 2xl:max-h-[300px] 2xl:min-h-[300px]'
                                src={item?.avatar || NO_IMAGE}
                                alt=''
                              />
                              {/* <div className='px-2 py-1 bg-primary-blue-500 rounded-md text-white text-center text-sm font-medium w-max absolute top-2 left-2'>
                        {t('free')}
                      </div> */}
                              {item?.view_mode == 2 && (
                                <div
                                  className={`absolute top-2 right-2 px-2 py-1 ${item?.setting?.mode == 1 ? 'text-primary-success bg-[#e4ffe9]' : item?.setting?.mode == 2 ? 'bg-secondary-neutral-50 text-secondary-neutral-500' : 'bg-red-50 text-red-500'} 
                          rounded-15 w-fit text-xs mt-1`}
                                >
                                  {item?.setting?.mode == 1
                                    ? t('practice_exercise')
                                    : item?.setting?.mode == 2
                                      ? t('training_test')
                                      : t('exam')}
                                </div>
                              )}
                              <div
                                className={`absolute bottom-2 left-1 px-2 py-1 ${
                                  start.isAfter(now)
                                    ? 'text-blue-500 bg-blue-50'
                                    : end.isAfter(now)
                                      ? 'bg-green-50 text-green-500'
                                      : 'bg-red-50 text-red-500'
                                } 
                          rounded-15 w-fit text-xs mt-1`}
                              >
                                {start.isAfter(now) ? (
                                  // Bắt đầu chưa đến
                                  <p>
                                    {t('start_at')}: {convertTimestampToString(item?.setting?.start_time, 'right')}
                                  </p>
                                ) : end.isAfter(now) ? (
                                  // Đang diễn ra (đã bắt đầu nhưng chưa kết thúc)
                                  <p>{t('_running')}</p>
                                ) : (
                                  // Kết thúc rồi
                                  <p>
                                    {t('finish_at')}: {convertTimestampToString(item?.setting?.end_time, 'right')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className='flex flex-col flex-1'>
                              <div className='space-y-1 flex-1'>
                                <div className='break-words'>{item?.setting?.exam_name || t('no_name')}</div>
                              </div>

                              <div className='flex items-center gap-2 w-full mt-2'>
                                {currentUser?.user_job_title == USER_ROLE?.STUDENT ? (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 &&
                                      (!item?.setting?.try_number ||
                                        item?.setting?.try_number > item?.setting?.user_ability?.has_submitted) && (
                                        <div
                                          className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                          onClick={() => {
                                            navigate('/practice/' + item?.setting?.id);
                                          }}
                                        >
                                          <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                        </div>
                                      )}
                                  </>
                                ) : (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 && (
                                      <div
                                        className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                        onClick={() => {
                                          navigate('/practice/' + item?.setting?.id);
                                        }}
                                      >
                                        <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                                {item?.setting?.user_ability?.has_submitted > 0 && (
                                  <div
                                    className='py-1.5 flex items-center justify-center rounded bg-[#E8FFEC] cursor-pointer w-1/2 hover:opacity-85'
                                    onClick={() => {
                                      navigate(
                                        `/curriculum/report/detail-exercise/${item?.setting?.id}/${currentUser?.user_id}`
                                      );
                                    }}
                                  >
                                    <p className='text-primary-success text-sm font-medium'>{t('view_results')}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className='px-4 py-2 bg-primary-neutral-100 border border-primary-neutral-300'>
                <Pagination
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
            </>
          )}
        </div>
        <div>
          {' '}
          <div
            className='rounded-t-lg bg-primary-blue-500 p-3 flex items-center gap-3 border border-b-0 cursor-pointer'
            onClick={() => {
              setShowExamCompleted(!showExamCompleted);
            }}
          >
            <p className='text-white font-semibold text-lg'>{t('completed_exercise')}</p>
            <ChevronDown className={`size-7 text-white ${showExamCompleted && 'rotate-180'} transition-all`} />
          </div>
          {showExamCompleted && (
            <>
              {activeTab === 'table_view' ? (
                <div>
                  <table className='table-rounded '>
                    <thead>
                      <tr className='bg-primary-blue-50'>
                        <th scope='col'>{t('exam_name')}</th>
                        <th scope='col'>{t('exercise_code_name')}</th>
                        <th scope='col'>{t('exercise_description')}</th>
                        <th scope='col'>{t('program_code_name_have_exercise')}</th>
                        <th scope='col'>{t('subject')}</th>

                        <th scope='col' className='w-56'>
                          {t('start_end_time_of_exercise')}
                        </th>
                        <th scope='col' className='w-56'>
                          {t('action')}
                        </th>
                      </tr>

                      {ids?.length > 0 && (
                        <tr className='tr-sub-form tr-sub'>
                          <th colSpan={14} className='p-2.5 bg-primary-blue-500'>
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
                          </th>
                        </tr>
                      )}
                    </thead>
                    <tbody className='bg-white'>
                      {dataComplete?.length > 0 ? (
                        dataComplete.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className='text-left'>
                              <p>{item?.setting?.exam_name || t('no_name')}</p>
                              {item?.view_mode == 2 && (
                                <div
                                  className={`px-2 py-1 ${item?.setting?.mode == 1 ? 'text-primary-success bg-[#e4ffe9]' : item?.setting?.mode == 2 ? 'bg-secondary-neutral-50 text-secondary-neutral-500' : 'bg-red-50 text-red-500'} 
                          rounded-15 w-fit text-xs mt-1`}
                                >
                                  {item?.setting?.mode == 1
                                    ? t('practice_exercise')
                                    : item?.setting?.mode == 2
                                      ? t('training_test')
                                      : t('exam')}
                                </div>
                              )}
                            </td>
                            <td className='text-left'>{item?.exercise_name}</td>
                            <td>
                              <p
                                className='underline text-primary-blue-500 cursor-pointer'
                                onClick={() => {
                                  setShowModalDescription(true);
                                  setSelectedId(item?.id);
                                }}
                              >
                                {t('detail')}
                              </p>
                            </td>
                            <td className='text-left'>
                              <p>{item?.learning_program?.learning_program_name}</p>
                            </td>
                            <td>
                              <p>{getSubjectInfo(item?.subject_id)?.subject_name}</p>
                            </td>

                            <td className='text-left'>
                              <p className='text-sm font-medium text-primary-neutral-500'>
                                {t('start')}: {convertTimestampToString(item?.setting?.start_time, 'right')}
                              </p>
                              <p className='text-sm font-medium text-primary-neutral-500'>
                                {t('finish')}: {convertTimestampToString(item?.setting?.end_time, 'right')}
                              </p>
                            </td>
                            <td className='whitespace-nowrap w-28'>
                              <div className='flex items-center gap-2 w-full mt-2'>
                                {currentUser?.user_job_title == USER_ROLE?.STUDENT ? (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 &&
                                      (!item?.setting?.try_number ||
                                        item?.setting?.try_number > item?.setting?.user_ability?.has_submitted) && (
                                        <div
                                          className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                          onClick={() => {
                                            navigate('/practice/' + item?.setting?.id);
                                          }}
                                        >
                                          <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                        </div>
                                      )}
                                  </>
                                ) : (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 && (
                                      <div
                                        className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                        onClick={() => {
                                          navigate('/practice/' + item?.setting?.id);
                                        }}
                                      >
                                        <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                                {item?.setting?.user_ability?.has_submitted > 0 && (
                                  <div
                                    className='py-1.5 flex items-center justify-center rounded bg-[#E8FFEC] cursor-pointer w-1/2 hover:opacity-85'
                                    onClick={() => {
                                      navigate(
                                        `/curriculum/report/detail-exercise/${item?.setting?.id}/${currentUser?.user_id}`
                                      );
                                    }}
                                  >
                                    <p className='text-primary-success text-sm font-medium'>{t('view_results')}</p>
                                  </div>
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
                  <div className='w-full overflow-hidden border border-primary-neutral-300 bg-primary-neutral-50'>
                    <div className='grid grid-cols-2 sm:grid-cols-6 '>
                      {dataComplete.map((item: any, uIdx: number) => {
                        const now = dayjs();
                        const start = dayjs.unix(item?.setting?.start_time);
                        const end = dayjs.unix(item?.setting?.end_time);
                        return (
                          <div
                            key={`user-grid-${uIdx}`}
                            className='px-3 pt-1 pb-3 border border-primary-neutral-300 flex flex-col'
                          >
                            <div className='mb-2 relative'>
                              <img
                                className='object-cover w-full rounded-lg max-h-[200px] min-h-[200px] 2xl:max-h-[300px] 2xl:min-h-[300px]'
                                src={item?.avatar || NO_IMAGE}
                                alt=''
                              />
                              {/* <div className='px-2 py-1 bg-primary-blue-500 rounded-md text-white text-center text-sm font-medium w-max absolute top-2 left-2'>
                        {t('free')}
                      </div> */}
                              {item?.view_mode == 2 && (
                                <div
                                  className={`absolute top-2 right-2 px-2 py-1 ${item?.setting?.mode == 1 ? 'text-primary-success bg-[#e4ffe9]' : item?.setting?.mode == 2 ? 'bg-secondary-neutral-50 text-secondary-neutral-500' : 'bg-red-50 text-red-500'} 
                          rounded-15 w-fit text-xs mt-1`}
                                >
                                  {item?.setting?.mode == 1
                                    ? t('practice_exercise')
                                    : item?.setting?.mode == 2
                                      ? t('training_test')
                                      : t('exam')}
                                </div>
                              )}
                              <div
                                className={`absolute bottom-2 left-1 px-2 py-1 ${
                                  start.isAfter(now)
                                    ? 'text-blue-500 bg-blue-50'
                                    : end.isAfter(now)
                                      ? 'bg-green-50 text-green-500'
                                      : 'bg-red-50 text-red-500'
                                } 
                          rounded-15 w-fit text-xs mt-1`}
                              >
                                {start.isAfter(now) ? (
                                  // Bắt đầu chưa đến
                                  <p>
                                    {t('start_at')}: {convertTimestampToString(item?.setting?.start_time, 'right')}
                                  </p>
                                ) : end.isAfter(now) ? (
                                  // Đang diễn ra (đã bắt đầu nhưng chưa kết thúc)
                                  <p>{t('_running')}</p>
                                ) : (
                                  // Kết thúc rồi
                                  <p>
                                    {t('finish_at')}: {convertTimestampToString(item?.setting?.end_time, 'right')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className='flex flex-col flex-1'>
                              <div className='space-y-1 flex-1'>
                                <div className='break-words'>{item?.setting?.exam_name || t('no_name')}</div>
                              </div>
                              <div className='flex items-center gap-2 w-full mt-2'>
                                {currentUser?.user_job_title == USER_ROLE?.STUDENT ? (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 &&
                                      (!item?.setting?.try_number ||
                                        item?.setting?.try_number > item?.setting?.user_ability?.has_submitted) && (
                                        <div
                                          className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                          onClick={() => {
                                            navigate('/practice/' + item?.setting?.id);
                                          }}
                                        >
                                          <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                        </div>
                                      )}
                                  </>
                                ) : (
                                  <>
                                    {item?.setting?.user_ability?.can_submit == 1 && (
                                      <div
                                        className='py-1.5 flex items-center justify-center rounded bg-primary-blue-50 cursor-pointer w-1/2 hover:opacity-85'
                                        onClick={() => {
                                          navigate('/practice/' + item?.setting?.id);
                                        }}
                                      >
                                        <p className='text-primary-blue-500 text-sm font-medium'>{t('do_test')}</p>
                                      </div>
                                    )}
                                  </>
                                )}

                                {item?.setting?.user_ability?.has_submitted > 0 && (
                                  <div
                                    className='py-1.5 flex items-center justify-center rounded bg-[#E8FFEC] cursor-pointer w-1/2 hover:opacity-85'
                                    onClick={() => {
                                      navigate(
                                        `/curriculum/report/detail-exercise/${item?.setting?.id}/${currentUser?.user_id}`
                                      );
                                    }}
                                  >
                                    <p className='text-primary-success text-sm font-medium'>{t('view_results')}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className='px-4 py-2 bg-primary-neutral-100 border border-primary-neutral-300'>
                <Pagination
                  limit={limitComplete}
                  offset={offsetComplete}
                  hasMore={hasMoreComplete}
                  onNext={(newOffset) => {
                    getDataComplete({ offset: newOffset });
                  }}
                  onPrevious={(newOffset) => {
                    getDataComplete({ offset: newOffset });
                  }}
                  onChangeLimit={(newLimit) => getDataComplete({ limit: newLimit, offset: 0 })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentExam;
