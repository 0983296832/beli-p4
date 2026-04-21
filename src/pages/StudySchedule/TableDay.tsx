import React, { useState } from 'react';
import { useT } from '@hooks/useT';
import EmptyTable from '@components/empty/EmptyTable';
import { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo } from '@lib/GetInfoHelper';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@components/ui/sheet';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';
import { reverse, sortBy } from 'lodash';

interface Props {
  data: any;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
}

const TableDay = (props: Props) => {
  const { data, setShowDetail, setSelectedId } = props;
  const { t } = useT();
  const [userList, setUserList] = useState([]);
  const [show, setShow] = useState(false);
  const { currentUser } = useRootStore();

  console.log(
    sortBy(data, (event) => parseInt(event.start_time.split(':')[0]) * 60 + parseInt(event.start_time.split(':')[1]))
  );

  return (
    <div>
      <table className='mt-5 table-rounded !border-neutral-100'>
        <thead>
          <tr className='bg-primary-blue-50'>
            <th className='w-32'>{t('time')}</th>
            <th className='w-24'>{t('classroom')}</th>
            <th>{t('subject')}</th>
            <th className='w-64'>{t('location')}</th>
            <th>{t('content')}</th>
            {currentUser?.user_job_title != USER_ROLE?.STUDENT && (
              <>
                <th className='w-24'>{t('period')}</th>
                <th>{t('teachers')}</th>
                <th>{t('teaching_assistant')}</th>
                <th>{t('student_list')}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className='bg-white'>
          {data?.length > 0 ? (
            sortBy(
              data,
              (event) => parseInt(event.start_time.split(':')[0]) * 60 + parseInt(event.start_time.split(':')[1])
            ).map((schedule: any, index: number) => (
              <tr key={index}>
                <td
                  className='text-center cursor-pointer hover:text-primary-blue-500'
                  onClick={() => {
                    setShowDetail(true);
                    setSelectedId(schedule?.id);
                  }}
                >
                  {schedule?.start_time} - {schedule?.end_time}
                </td>
                <td className='text-center'>{getClassroomInfo(schedule?.classroom_id)?.classroom_name}</td>
                <td className='text-center'> {getSubjectInfo(schedule?.r_classroom?.subject_id)?.subject_name}</td>
                <td className='text-center'> {getLocationInfo(schedule?.r_classroom?.location_id)?.location_name}</td>
                <td className='text-center'>{schedule?.teaching_program_detail?.lesson_name}</td>
                {currentUser?.user_job_title != USER_ROLE?.STUDENT && (
                  <>
                    <td className='text-center'>
                      <a
                        href={schedule?.teaching_program_detail?.drive_link}
                        target='_blank'
                        className='text-primary-blue-500 underline'
                      >
                        {schedule?.teaching_program_detail?.manual_code ||
                          schedule?.teaching_program_detail?.teaching_program_detail_code}
                      </a>
                    </td>
                    <td className='text-center'>{getUserInfo(schedule?.r_classroom?.teacher_id)?.display_name}</td>
                    <td className='text-center'>{getUserInfo(schedule?.r_classroom?.ta_id)?.display_name}</td>
                    <td className='text-center'>
                      <p
                        className='text-primary-blue-500 underline cursor-pointer'
                        onClick={() => {
                          setShow(true);
                          setUserList(schedule?.students);
                        }}
                      >
                        {schedule?.students?.length}
                      </p>
                    </td>
                  </>
                )}
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
      <Sheet open={show} onOpenChange={setShow}>
        <SheetContent className='p-0 sm:max-w-[550px]'>
          <SheetHeader className='px-5 py-7 border-b'>
            <SheetTitle className='text-lg font-semibold'>{t('student_list')}</SheetTitle>
          </SheetHeader>
          <div className='p-6 h-[calc(100vh-85px)]'>
            <div className='space-y-3 h-[calc(100vh-140px)] overflow-y-auto'>
              <table className=' table-rounded '>
                <thead>
                  <tr className='bg-primary-blue-50'>
                    <th scope='col'>{t('number_order')}</th>
                    <th scope='col'>{t('code')}</th>
                    <th scope='col'>{t('full_name')}</th>
                  </tr>
                </thead>
                <tbody className='bg-white'>
                  {userList?.length > 0 ? (
                    userList?.map((user: any, index: number) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{user.username}</td>
                        <td>
                          <p>{user.display_name}</p>
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TableDay;
