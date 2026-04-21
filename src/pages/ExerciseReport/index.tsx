import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DOWNLOAD_ICON, STATISTIC } from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import DateInput from '@components/fields/DateInput';
import { Link } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import { mergeObjects } from '@lib/JsHelper';
import Loading from '@components/loading';
import { Toast } from '@components/toast';
import { getDayRangeFromUnix } from '@lib/TimeHelper';
import EmptyTable from '@components/empty/EmptyTable';
import { useRootStore } from '@store/index';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import reportExamServices from '@services/reportExam';
import { USER_ROLE } from '@constants/index';
import LearningProgramsSelect from '@components/selects/LearningProgramSelect';
import Icon from '@components/Icon';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { CustomModal } from '@components/modal/CustomModal';
import { downloadFileFromBlob } from '@lib/FileHelper';
import { RiBarChart2Line, RiFilter3Line } from '@remixicon/react';

interface Props {}

const TABLE_SHELL =
  'w-full min-w-[900px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

const StatisticsModal = ({ show, setShow }: { show: boolean; setShow: Dispatch<SetStateAction<boolean>> }) => {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [infoSearch, setInfoSearch] = useState<any>({});

  const onDownload = async () => {
    if (!infoSearch?.location_id) return Toast('warning', t('teach_location_required'));
    if (!infoSearch?.start_from || !infoSearch?.start_to) return Toast('warning', t('assign_time_range_required'));
    // if (!infoSearch?.submit_from || !infoSearch?.submit_to) return Toast('warning', t('submit_time_range_required'));
    let params: any = {
      location_id: infoSearch?.location_id,
      classroom_id: infoSearch?.classroom_id,
      start_from: infoSearch?.start_from ? getDayRangeFromUnix(infoSearch?.start_from)?.start : undefined,
      start_to: infoSearch?.start_to ? getDayRangeFromUnix(infoSearch?.start_to)?.end : undefined,
      submit_from: infoSearch?.submit_from ? getDayRangeFromUnix(infoSearch?.submit_from)?.start : undefined,
      submit_to: infoSearch?.submit_to ? getDayRangeFromUnix(infoSearch?.submit_to)?.end : undefined,
      limit: 1000,
      offset: 0
    };

    setLoading(true);
    try {
      const response: any = await reportExamServices.getStatSubmitFromStudent(params);
      downloadFileFromBlob(response, 'thong_ke_nop_bai.xlsx');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={show}
      title={t('download_student_data_statistics')}
      onClose={() => setShow(false)}
      className='rounded-lg border-none gap-0 p-0 max-w-[50%] overflow-hidden bg-white'
      headerClassName='border-b text-neutral-50 bg-primary-blue-500 mb-6 text-white'
    >
      <div className='space-y-4 py-4'>
        <Loading loading={loading} />
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <TeachingLocationSelect
              required
              label={t('teaching_location')}
              isClearable
              value={infoSearch?.location_id}
              onChange={(val) => {
                setInfoSearch({ ...infoSearch, location_id: val?.id, classroom_id: undefined });
              }}
            />
          </div>
          <div>
            <ClassroomSelect
              locationId={infoSearch?.location_id}
              isClearable
              label={t('classroom')}
              value={infoSearch?.classroom_id}
              onChange={(value) => {
                setInfoSearch({ ...infoSearch, classroom_id: value?.id });
              }}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div>
            <DateInput
              required
              label={t('assign_time_from')}
              value={infoSearch?.start_from}
              onChange={(e) => {
                setInfoSearch({ ...infoSearch, start_from: e });
              }}
            />
          </div>
          <div>
            <DateInput
              required
              label={t('to')}
              value={infoSearch?.start_to}
              onChange={(e) => {
                setInfoSearch({ ...infoSearch, start_to: e });
              }}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div>
            <DateInput
              label={t('submit_time_from')}
              value={infoSearch?.submit_from}
              onChange={(e) => {
                setInfoSearch({ ...infoSearch, submit_from: e });
              }}
            />
          </div>
          <div>
            <DateInput
              label={t('to')}
              value={infoSearch?.submit_to}
              onChange={(e) => {
                setInfoSearch({ ...infoSearch, submit_to: e });
              }}
            />
          </div>
        </div>

        <Button onClick={onDownload} className='w-full mt-2 gap-2'>
          <Download className='w-4 h-4' /> {t('download_excel')}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col items-center mt-6'
        >
          <img src={STATISTIC} alt='Export Illustration' className='h-72 2xl:h-96 w-auto mb-2' />
          <p className='text-center text-sm text-muted-foreground'>{t('download_by_filters_hint')}</p>
        </motion.div>
      </div>
    </CustomModal>
  );
};

const Report = (props: Props) => {
  const { currentUser } = useRootStore();
  const { t } = useT();
  const [infoSearch, setInfoSearch] = useState<any>({});
  const [openFilter, setOpenFilter] = useState(false);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [showDownload, setShowDownload] = useState(false);

  const getData = async (filters?: any) => {
    let params: any = {
      params: {},
      filterings: {},
      offset,
      limit
    };
    if (infoSearch?.exercise_name) {
      params.filterings['exercise_name:contain'] = infoSearch?.exercise_name;
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
      const response: any = await reportExamServices.getExerciseReport(params);
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

        <div className='w-full overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='border-b border-violet-200 bg-violet-50 px-5 py-5 text-slate-800'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <RiBarChart2Line className='size-7 text-violet-600' />
                <h3 className='text-xl font-semibold tracking-wide'>{t('assigned_tasks')}</h3>
              </div>
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
                      value={infoSearch?.exercise_name}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          getData({ offset: 0 });
                        }
                      }}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, exercise_name: value });
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
                          offset: 0,
                          params: {
                            'subject_id:eq': undefined,
                            'learning_program_id:eq': undefined
                          }
                        });
                        setInfoSearch({
                          ...infoSearch,
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
              {(currentUser?.user_job_title == USER_ROLE.ADMIN || currentUser?.user_job_title == USER_ROLE.OWNER) && (
                <>
                  <Button
                    className='rounded-xl border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100'
                    onClick={() => {
                      setShowDownload(true);
                    }}
                  >
                    <Icon icon={DOWNLOAD_ICON} className='text-sky-700' />
                    {t('download_student_data_statistics')}
                  </Button>
                  <StatisticsModal show={showDownload} setShow={setShowDownload} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className='mt-1 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className={TABLE_SHELL}>
              <thead>
                <tr>
                  <th scope='col' rowSpan={2} className='bg-violet-100/70 text-violet-900'>
                    {t('exercise_name')}
                  </th>
                  <th scope='col' rowSpan={2} className='bg-sky-100/70 text-sky-900'>
                    {t('version_count')}
                  </th>
                  <th scope='col' colSpan={3} className='bg-emerald-100/80 text-emerald-900'>
                    {t('statistics')}
                  </th>
                </tr>
                <tr className='bg-emerald-100/60 text-emerald-900'>
                  <th scope='col'>{t('total_attempts')}</th>
                  <th scope='col'>{t('total_students_attempted')}</th>
                  <th scope='col'>{t('total_classes_attempted')}</th>
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
                        <p className='text-sm font-medium'>
                          {item?.exercise_code} - {item?.exercise_name}
                        </p>
                      </td>
                      <td className='bg-sky-50/70'>
                        <Link
                          to={`/curriculum/report-session/${item?.id}`}
                          className='text-sm font-medium text-violet-700 underline'
                        >
                          {item?.statistic?.total_exam}
                        </Link>
                      </td>
                      <td className='bg-emerald-50/80'>{item?.statistic?.total_submission}</td>
                      <td className='bg-emerald-50/80'>{item?.statistic?.total_student_submission}</td>
                      <td className='bg-emerald-50/80'>{item?.statistic?.total_classroom_submission}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
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
    </>
  );
};

export default Report;
