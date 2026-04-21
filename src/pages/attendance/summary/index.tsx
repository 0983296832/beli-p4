import { useEffect, useState } from 'react';
import { CALENDER_GRAY, DELETE_04 } from '@lib/ImageHelper';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import CheckboxInput from '@components/fields/CheckboxInput';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
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
import { convertTimestampToString } from '@lib/TimeHelper';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { isEmpty, uniq } from 'lodash';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import UsersSelect from '@components/selects/UsersSelect';
import StudentsGroupSelect from '@components/selects/GroupStudentSelect';
import { User } from 'lucide-react';
import DateRangeInput from '@components/fields/DateRangeInput';
import StudentsGroupSelectVirtualized from '@components/selects/GroupStudentSelectVirtualized';
import { RiDeleteBin6Line, RiFilter3Line } from '@remixicon/react';

const TABLE_SHELL =
  'w-full min-w-[1600px] border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-r [&_th]:border-violet-200 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-violet-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:last-child]:border-r-0';

const AttendanceSummary = () => {
  const { t } = useT();
  const navigate = useNavigate();
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

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      Toast('success', t('delete_success'));
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
        'identity,attendance_code,timeline_id,classroom_id,subject_id,location_id,teaching_program_id,teaching_program,teaching_program_detail_number,teaching_program_detail,student_attendance,teacher_attendance,ta_attendance,admin_assigned_id,attendance_time,status,valid,created_at,updated_at',
      limit,
      offset,
      filterings: {}
    };
    if (infoSearch?.attendance_code) {
      params.filterings['attendance_code:contain'] = infoSearch?.attendance_code;
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
    if (infoSearch?.teacher_id) {
      params.filterings['teacher_id:in'] = infoSearch?.teacher_id;
    }
    if (infoSearch?.ta_id) {
      params.filterings['ta_id:in'] = infoSearch?.ta_id;
    }
    if (infoSearch?.students) {
      params.filterings['students:in'] = infoSearch?.students;
    }

    params = mergeObjects(params, filters);
    setLoading(true);
    try {
      const response: any = await attendanceServices.getAttendances(params);
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
              <h3 className='text-xl font-semibold tracking-wide'>{t('summary_attendance_list')}</h3>
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
                        value={infoSearch?.attendance_code}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            getData({ offset: 0 });
                          }
                        }}
                        onChange={(value) => {
                          setInfoSearch({ ...infoSearch, attendance_code: value });
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
                      {/* <DateRangeInput /> */}
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
                      <UsersSelect
                        label={t('teachers')}
                        role='TEACHER'
                        value={infoSearch?.teacher_id}
                        isClearable
                        isMulti
                        onChange={(val) => {
                          setInfoSearch({ ...infoSearch, teacher_id: val?.map((v) => v?.id) || undefined });
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
                              'students:in': undefined,
                              'ta_id:in': undefined,
                              'teacher_id:in': undefined,
                              'subject_id:eq': undefined,
                              'location_id:eq': undefined,
                              'classroom_id:eq': undefined,
                              'attendance_time:eq': undefined,
                              'attendance_time:lte': undefined,
                              'attendance_time:gte': undefined
                            },
                            offset: 0
                          });
                          setInfoSearch({
                            students: undefined,
                            ta_id: undefined,
                            teacher_id: undefined,
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
            </div>
          </div>
        </div>

        <div className='mt-1 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className={TABLE_SHELL}>
            <thead>
              <tr>
                <th scope='col' className='bg-slate-100'>
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
                <th scope='col' className='bg-violet-100/70 text-violet-900'>
                  {t('attendance_session_code')}-{t('summary')}
                </th>
                <th scope='col' className='w-32 bg-violet-50 text-violet-900'>
                  {t('subject')}
                </th>
                <th scope='col' className='w-32 bg-amber-100/70 text-amber-900'>
                  {t('teaching_location')}
                </th>
                <th scope='col' className='w-24 bg-sky-100/70 text-sky-900'>
                  {t('date')}
                </th>
                <th scope='col' className='w-32 bg-amber-50 text-amber-900'>
                  {t('classroom')}
                </th>

                <th scope='col' className='w-52 bg-emerald-100/70 text-emerald-900'>
                  {t('teaching_session')} - <br />
                  {t('teaching_program')}
                </th>
                <th scope='col' className='w-52 bg-cyan-100/70 text-cyan-900'>
                  {t('teacher_attendance')}
                </th>
                <th scope='col' className='w-52 bg-teal-100/70 text-teal-900'>
                  {t('assistant_attendance')}
                </th>
                <th scope='col' className='w-52 bg-indigo-100/70 text-indigo-900'>
                  {t('student_attendance')}
                </th>
                <th scope='col' className='w-24 bg-rose-100/70 text-rose-900'>
                  {t('attendance')}
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
                    <td className=''>
                      <div className='flex items-start flex-col'>
                        <Link
                          to={`/attendance/summary/detail/${attendant.id}`}
                          className='text-left font-medium text-violet-700 hover:underline'
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
                    </td>
                    <td className='text-center'>
                      {' '}
                      <p>{getSubjectInfo(attendant?.subject_id)?.subject_name}</p>
                      <p>{getSubjectInfo(attendant?.subject_id)?.subject_code}</p>
                    </td>
                    <td>
                      {' '}
                      <p>{getLocationInfo(attendant?.location_id)?.location_name}</p>
                      <p>{getLocationInfo(attendant?.location_id)?.location_code}</p>
                    </td>
                    <td className='text-center'>{convertTimestampToString(attendant?.attendance_time)}</td>

                    <td className='text-center'>
                      <div>{getClassroomInfo(attendant?.classroom_id)?.classroom_name}</div>
                      <div>{getClassroomInfo(attendant?.classroom_id)?.classroom_code}</div>
                    </td>
                    <td className='text-center'>
                      <p>
                        {`${attendant?.teaching_program_detail_number}/${attendant?.teaching_program?.lesson_count} (${roundNumber((attendant?.teaching_program_detail_number / attendant?.teaching_program?.lesson_count) * 100)}%)`}
                      </p>
                      <p>
                        {attendant?.teaching_program_detail?.lesson_name} -{' '}
                        {attendant?.teaching_program_detail?.teaching_program_detail_code}
                      </p>
                    </td>
                    <td className='text-left'>
                      {isEmpty(attendant?.teacher_attendance) ? (
                        <div className='w-full h-full '>
                          <p className='text-[#FF4B3F] text-center text-sm font-medium'>{t('not_marked_attendance')}</p>
                        </div>
                      ) : (
                        <>
                          <Link
                            to={`/attendance/teachers/detail/${attendant?.teacher_attendance?.id}`}
                            className='font-medium text-violet-700 hover:underline'
                          >
                            {attendant?.teacher_attendance?.attendance_code}
                          </Link>
                          <div
                            className={`px-2 py-1 ${attendant?.teacher_attendance?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : attendant?.teacher_attendance?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                          >
                            {t(
                              attendant?.teacher_attendance?.status == 0
                                ? 'submitted_not_approved'
                                : attendant?.teacher_attendance?.status == 1
                                  ? 'approved'
                                  : 'canceled_not_approved'
                            )}
                          </div>
                          <div className='flex items-center gap-2 my-1'>
                            <User className='text-primary-neutral-500 size-4 min-w-4' />
                            <p className='text-sm font-medium text-primary-neutral-500'>
                              {getUserInfo(attendant?.teacher_attendance?.teacher_id)?.username} -{' '}
                              {getUserInfo(attendant?.teacher_attendance?.teacher_id)?.display_name}
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <img src={CALENDER_GRAY} />
                            <p className='text-sm font-medium text-primary-neutral-500'>
                              {convertTimestampToString(attendant?.teacher_attendance?.created_at, 'right')}
                            </p>
                          </div>
                        </>
                      )}
                    </td>
                    <td className='text-left'>
                      {isEmpty(attendant?.ta_attendance) ? (
                        <div className='w-full h-full '>
                          <p className='text-[#FF4B3F] text-center text-sm font-medium'>{t('not_marked_attendance')}</p>
                        </div>
                      ) : (
                        <>
                          <Link
                            to={`/attendance/teachers_assistant/detail/${attendant?.ta_attendance?.id}`}
                            className='font-medium text-violet-700 hover:underline'
                          >
                            {attendant?.ta_attendance?.attendance_code}
                          </Link>
                          <div
                            className={`px-2 py-1 ${attendant?.ta_attendance?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : attendant?.ta_attendance?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                          >
                            {t(
                              attendant?.ta_attendance?.status == 0
                                ? 'submitted_not_approved'
                                : attendant?.ta_attendance?.status == 1
                                  ? 'approved'
                                  : 'canceled_not_approved'
                            )}
                          </div>
                          <div className='flex items-center gap-2 my-1'>
                            <User className='text-primary-neutral-500 size-4 min-w-4' />
                            <p className='text-sm font-medium text-primary-neutral-500'>
                              {getUserInfo(attendant?.ta_attendance?.ta_id)?.username} -{' '}
                              {getUserInfo(attendant?.ta_attendance?.ta_id)?.display_name}
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <img src={CALENDER_GRAY} />
                            <p className='text-sm font-medium text-primary-neutral-500'>
                              {convertTimestampToString(attendant?.ta_attendance?.created_at, 'right')}
                            </p>
                          </div>
                        </>
                      )}
                    </td>
                    <td className='text-left'>
                      {isEmpty(attendant?.student_attendance) ? (
                        <div className='w-full h-full '>
                          <p className='text-[#FF4B3F] text-center text-sm font-medium'>{t('not_marked_attendance')}</p>
                        </div>
                      ) : (
                        <>
                          <Link
                            to={`/attendance/students/detail/${attendant?.student_attendance?.id}`}
                            className='font-medium text-violet-700 hover:underline'
                          >
                            {attendant?.student_attendance?.student_attendance_code}
                          </Link>
                          <div
                            className={`px-2 py-1 ${attendant?.student_attendance?.status == 0 ? 'text-secondary-neutral-500 bg-secondary-neutral-50' : attendant?.student_attendance?.status == 1 ? 'text-primary-success bg-[#e4ffe9]' : 'text-primary-neutral-500 bg-primary-neutral-100'} rounded-15 w-fit text-xs whitespace-nowrap`}
                          >
                            {t(
                              attendant?.student_attendance?.status == 0
                                ? 'submitted_not_approved'
                                : attendant?.student_attendance?.status == 1
                                  ? 'approved'
                                  : 'canceled_not_approved'
                            )}
                          </div>
                          <div className='flex items-center gap-2 mt-0.5'>
                            <img src={CALENDER_GRAY} />
                            <p className='text-sm font-medium text-primary-neutral-500'>
                              {convertTimestampToString(attendant?.student_attendance?.created_at, 'right')}
                            </p>
                          </div>
                        </>
                      )}
                    </td>
                    <td>
                      {(isEmpty(attendant?.teacher_attendance) ? 0 : 1) +
                        (isEmpty(attendant?.ta_attendance) ? 0 : 1) +
                        (isEmpty(attendant?.student_attendance) ? 0 : 1)}
                      /3 (
                      {(
                        (((isEmpty(attendant?.teacher_attendance) ? 0 : 1) +
                          (isEmpty(attendant?.ta_attendance) ? 0 : 1) +
                          (isEmpty(attendant?.student_attendance) ? 0 : 1)) /
                          3) *
                        100
                      ).toFixed(2)}
                      %)
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
      </div>
      <div className='fixed bottom-0 left-[70px] right-0 z-[49] border-t border-violet-200 bg-violet-50/90 px-4 py-2 backdrop-blur-sm'>
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
    </>
  );
};

export default AttendanceSummary;
