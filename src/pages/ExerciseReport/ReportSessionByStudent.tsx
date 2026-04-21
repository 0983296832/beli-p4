import { useEffect, useState } from 'react';
import {
  CALENDER_GRAY,
  CALL,
  DELETE_04,
  DOWNLOAD_ICON,
  EDIT_02,
  FILTER_HORIZONTAL,
  LOCATION_05,
  MAIL_02
} from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import DateInput from '@components/fields/DateInput';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SearchInput from '@components/fields/SearchInput';
import Pagination from '@components/pagination';
import { mergeObjects } from '@lib/JsHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import ModalDescription from '@components/modal/ModalDescription';
import { Toast } from '@components/toast';
import studentServices from '@services/student';
import { convertTimestampToString, getCurrentTimestamp } from '@lib/TimeHelper';
import EmptyTable from '@components/empty/EmptyTable';
import { useRootStore } from '@store/index';
import { ChartConfig, ChartContainer } from '@components/ui/chart';
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import SelectInput from '@components/fields/SelectInput';
import Icon from '@components/Icon';
import reportExamServices from '@services/reportExam';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import StudentsGroupSelect from '@components/selects/GroupStudentSelect';
import { isEmpty, uniq } from 'lodash';
import exerciseServices from '../../services/exercise';
import { USER_ROLE } from '@constants/index';
import { downloadFileFromBlob } from '@lib/FileHelper';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import StudentsGroupSelectVirtualized from '../../components/selects/GroupStudentSelectVirtualized';

interface Props {}

const ReportSessionByStudent = (props: Props) => {
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

  const chartConfig = {
    visitors: {
      label: 'Visitors'
    }
  } satisfies ChartConfig;

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      //   const response: any = await studentServices.deleteStudent(Number(selectedId));
      //   Toast('success', response?.message);
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
        'exam_code,exam_name,identity,exercise_id,exercise,exam_code,filters,created_by_type,creator,valid,start_time,end_time,mode',
      limit,
      offset,
      filterings: {
        [`students:in`]: [Number(currentUser?.user_id)]
      },
      params: {}
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

    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:in'] = infoSearch?.classroom_id;
    }
    // if (infoSearch?.students) {
    //   params.filterings['students:in'] = infoSearch?.students;
    // }
    if (infoSearch?.mode) {
      params.filterings['mode:eq'] = infoSearch?.mode;
    }
    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await reportExamServices.getExamSessionsReport(Number(0), params);
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

  const exportData = async (filters?: any) => {
    let params: any = {
      filterings: {}
    };
    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await reportExamServices.getExamExport(Number(0), params);
      downloadFileFromBlob(response, 'phien_lam_bai.xlsx');
      setLoading(false);
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
        <div className='w-full overflow-hidden border rounded-lg shadow-lg border-neutral-300'>
          <div className='p-3 text-neutral-50 bg-primary-blue-500'>
            <h3 className='text-base font-semibold'>{t('exercise_version_list')}</h3>
          </div>
          <div className='p-4 bg-white'>
            <div className='flex justify-between flex-wrap space-y-2 sm:space-y-0'>
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
                          mode: undefined
                        });
                        getData({
                          offset: 0,
                          filterings: {
                            'start_time:gte': undefined,
                            'end_time:lte': undefined,
                            'subject_id:eq': undefined,
                            'location_id:eq': undefined,
                            'mode:eq': undefined
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

                        setOpenFilter(false);
                      }}
                    >
                      {t('apply')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                className='border-primary-blue-400 bg-primary-blue-50 hover:bg-primary-blue-50 text-primary-blue-500 hover:text-primary-blue-500'
                variant={'outline'}
                onClick={() => {
                  exportData();
                }}
              >
                <Icon icon={DOWNLOAD_ICON} className='text-primary-blue-500 size-4' />
                {t('download')}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <table className='mt-5 table-rounded hidden sm:table'>
            <thead>
              <tr className='bg-primary-blue-50'>
                <th scope='col' rowSpan={2}>
                  {t('exercise_name')}
                </th>
                <th scope='col' rowSpan={2}>
                  {t('exercise_version_info')}
                </th>
                <th scope='col' rowSpan={3}>
                  {t('type')}
                </th>
                <th scope='col' rowSpan={3} className='min-w-[213px] max-w-[213px] w-[213px]'>
                  {t('average_result')}
                </th>
                <th scope='col' colSpan={3}>
                  {t('statistics')}
                </th>

                <th scope='col' rowSpan={3}>
                  {t('action')}
                </th>
              </tr>
              <tr className='bg-primary-blue-50'>
                <th scope='col' style={{ borderTopLeftRadius: 0 }}>
                  {t('attempt_count')}
                </th>
                <th scope='col'>{t('students_attempted')}</th>
                <th scope='col' style={{ borderTopRightRadius: 0 }}>
                  {t('classes_attempted')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {data?.length > 0 ? (
                data.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className='text-left'>
                      {currentUser?.user_job_title !== USER_ROLE?.STUDENT && (
                        <p className='text-sm font-medium '>{item?.exercise?.exercise_code}</p>
                      )}
                      <p className='text-sm font-medium'>{item?.exercise?.exercise_name}</p>
                    </td>
                    <td className='text-left'>
                      {currentUser?.user_job_title !== USER_ROLE?.STUDENT && (
                        <p className='text-sm font-medium '>{item?.exam_code}</p>
                      )}
                      <Link
                        to={
                          currentUser?.user_job_title == USER_ROLE?.STUDENT
                            ? `/curriculum/report/detail-exercise/${item?.id}/${currentUser?.user_id}`
                            : `/curriculum/report/detail/${item?.id}`
                        }
                        className='text-sm font-medium text-primary-blue-500'
                      >
                        {item?.exam_name || t('no_name')}
                      </Link>
                      <p className='text-sm font-medium'>{item?.subject}</p>
                      <p className='text-xs font-medium'>
                        {convertTimestampToString(item?.start_time)} -{' '}
                        {item?.start_time > getCurrentTimestamp() ? (
                          <span className='text-primary-warning'>{t('not_started')}</span>
                        ) : item?.start_time <= getCurrentTimestamp() && getCurrentTimestamp() <= item?.end_time ? (
                          <span className='text-primary-success'>{t('running')}</span>
                        ) : (
                          <span className='text-primary-error'>{t('ended')}</span>
                        )}
                      </p>
                    </td>
                    <td className=''>
                      {item?.exercise?.view_mode == 2 && (
                        <div
                          className={`py-1 px-2 rounded bg-[#E4FFE9] w-max mx-auto ${item?.mode == 1 ? 'text-primary-success bg-[#e4ffe9]' : item?.mode == 2 ? 'bg-secondary-neutral-50 text-secondary-neutral-500' : 'bg-red-50 text-red-500'} `}
                        >
                          <p className='text-xs font-medium'>
                            {item?.mode == 1
                              ? t('practice_exercise')
                              : item?.mode == 2
                                ? t('training_test')
                                : t('exam')}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className=''>
                      <div className='flex items-center justify-center'>
                        <ChartContainer
                          config={chartConfig}
                          className={`aspect-square max-h-[76px]  w-full -mr-32 ${
                            item?.statistic?.avg_process_score < 50
                              ? 'fill-[#F7493E]'
                              : item?.statistic?.avg_process_score < 80
                                ? 'fill-[#EC8C56]'
                                : 'fill-[#2775FF]'
                          }`}
                        >
                          <RadialBarChart
                            data={[{ visitors: item?.statistic?.avg_process_score }]}
                            startAngle={0}
                            endAngle={3.6 * item?.statistic?.avg_process_score}
                            innerRadius={80}
                            outerRadius={110}
                            style={{ maxWidth: 80, maxHeight: 80 }}
                          >
                            <PolarGrid
                              gridType='circle'
                              radialLines={false}
                              stroke='none'
                              className={` ${
                                item?.statistic?.avg_process_score < 50
                                  ? 'first:fill-[#FDC8C5]'
                                  : item?.statistic?.avg_process_score < 80
                                    ? 'first:fill-[#F9DCCC]'
                                    : 'first:fill-[#91B9FF]'
                              } last:fill-background`}
                              polarRadius={[86, 74]}
                            />
                            <RadialBar dataKey='visitors' background cornerRadius={10} />
                            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                              <Label
                                content={({ viewBox }) => {
                                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                    return (
                                      <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                                        <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-4xl'>
                                          {item?.statistic?.avg_process_score.toLocaleString()}%
                                        </tspan>
                                      </text>
                                    );
                                  }
                                }}
                              />
                            </PolarRadiusAxis>
                          </RadialBarChart>
                        </ChartContainer>
                      </div>
                    </td>
                    <td className=''>{item?.statistic?.total_submissions}</td>
                    <td className=''>{item?.statistic?.total_student_submissions}</td>
                    <td className=''>{item?.statistic?.total_classroom_submissions}</td>
                    <td className=''>
                      <div className='flex items-start justify-center'>
                        <Button
                          variant='secondary'
                          className='bg-primary-blue-50 hover:bg-primary-blue-50'
                          onClick={() => {
                            exportData({ filterings: { exam_id: item?.id } });
                          }}
                        >
                          <Icon icon={DOWNLOAD_ICON} className='text-primary-blue-500 size-4' />
                        </Button>
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
          <div className='sm:hidden mt-5 space-y-3'>
            {data?.length > 0 ? (
              data.map((item: any, index: number) => (
                <div key={index} className='rounded-lg border p-3 shadow-sm bg-white'>
                  <Link
                    className='text-base font-medium text-primary-blue-500'
                    to={
                      currentUser?.user_job_title == USER_ROLE?.STUDENT
                        ? `/curriculum/report/detail-exercise/${item?.id}/${currentUser?.user_id}`
                        : `/curriculum/report/detail/${item?.id}`
                    }
                  >
                    {t('exercise_name')}: {item?.exam_name || t('no_name')}
                  </Link>

                  <p className='text-xs text-neutral-500'>
                    {t('time')}: {convertTimestampToString(item?.start_time)} -{' '}
                    {convertTimestampToString(item?.end_time)}
                  </p>
                  <div className='flex items-center justify-between mt-2'>
                    <div>
                      <p className='text-xs font-medium'>
                        {t('attempt_count')}: {item?.statistic?.total_submissions}
                      </p>
                      <p className='text-xs font-medium'>
                        {t('students_attempted')}: {item?.statistic?.total_student_submissions}
                      </p>
                      <p className='text-xs font-medium'>
                        {t('classes_attempted')}: {item?.statistic?.total_classroom_submissions}
                      </p>
                    </div>
                    <Button variant='secondary' className='bg-primary-blue-50 hover:bg-primary-blue-50'>
                      <Icon icon={DOWNLOAD_ICON} className='text-primary-blue-500 size-4' />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyTable />
            )}
          </div>
        </div>
      </div>
      <div className='fixed bottom-0 left-0 sm:left-[70px] right-0 z-[49] px-4 py-2 bg-primary-neutral-100 border-t border-primary-neutral-300'>
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

export default ReportSessionByStudent;
