import React, { useEffect, useState } from 'react';
import adminServices from '@services/admin';
import teacherServices from '@services/teacher';
import teacherAssistantServices from '@services/teacherAssistant';
import studentServices from '@services/student';
import subjectServices from '@services/subject';
import teachingLocationServices from '@services/teachingLocation';
import classroomServices from '@services/classroom';
import { mergeObjects } from '@lib/JsHelper';
import EmptyTable from '../empty/EmptyTable';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@components/ui/sheet';
import { useT } from '@hooks/useT';
import Loading from '../loading';
import { NO_AVATAR, NO_IMAGE } from '@lib/ImageHelper';
import Pagination from '../pagination';
import curriculumServices from '@services/curriculum';
import teachingProgramServices from '@services/teachingProgram';

interface Props {
  objectId: number;
  type:
    | 'student'
    | 'teacher'
    | 'admin'
    | 'ta'
    | 'classroom'
    | 'subject'
    | 'location'
    | 'learning_program'
    | 'teaching_program';
  show: boolean;
  setShow: (show: boolean) => void;
  className?: string;
  extraFilter: any;
}

const DrawerStatistic = (props: Props) => {
  const { objectId, type, show, className, extraFilter, setShow } = props;
  const { t } = useT();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [infoSearch, setInfoSearch] = useState<any>({});
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const getData = async (filters?: any) => {
    setLoading(true);
    try {
      let params: any;
      let repo: any;
      switch (type) {
        case 'admin':
          params = {
            fields: 'display_name,username,avatar',
            limit,
            offset
          };
          repo = adminServices.getSharedAdmins;
          break;
        case 'teacher':
          params = {
            fields: 'display_name,username,avatar',
            limit,
            offset
          };
          repo = teacherServices.getSharedTeachers;
          break;
        case 'ta':
          params = {
            fields: 'display_name,username',
            limit,
            offset
          };
          repo = teacherAssistantServices.getSharedTeacherAssistants;
          break;
        case 'student':
          params = {
            fields: 'display_name,username,avatar',
            limit,
            offset
          };
          repo = studentServices.getSharedStudents;
          break;
        case 'subject':
          params = {
            fields: 'subject_name,subject_code,subject_avatar',
            limit,
            offset
          };
          repo = subjectServices.getSharedSubjects;
          break;
        case 'location':
          params = {
            fields: 'location_name,location_code,location_avatar',
            limit,
            offset
          };
          repo = teachingLocationServices.getSharedTeachingLocations;
          break;
        case 'classroom':
          params = {
            fields: 'classroom_name,classroom_code,classroom_avatar',
            limit,
            offset
          };
          repo = classroomServices.getSharedClassrooms;
          break;
        case 'learning_program':
          params = {
            fields: 'learning_program_name,learning_program_code',
            limit,
            offset
          };
          repo = curriculumServices.getSharedCurriculums;
          break;
        case 'teaching_program':
          params = {
            fields: 'program_name,program_code',
            limit,
            offset
          };
          repo = teachingProgramServices.getSharedTeachingPrograms;
          break;
        default:
          break;
      }
      params = mergeObjects({ ...params, ...extraFilter }, filters);
      const response: any = await repo(params);
      setData(
        response?.data?.map((i: any) => ({
          code:
            type == 'admin' || type == 'teacher' || type == 'ta' || type == 'student'
              ? i?.username
              : type == 'teaching_program'
                ? i.program_code
                : i[`${type}_code`],
          name:
            type == 'admin' || type == 'teacher' || type == 'ta' || type == 'student'
              ? i?.display_name
              : type == 'teaching_program'
                ? i.program_name
                : i[`${type}_name`],
          avatar:
            type == 'admin' || type == 'teacher' || type == 'ta' || type == 'student' || type == 'learning_program'
              ? i?.avatar
              : i[`${type}_avatar`] || NO_IMAGE
        }))
      );
      setHasMore(response.has_more);
      setLimit(response?.limit);
      setOffset(response?.offset);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (objectId && show) {
      getData();
    } else {
      setOffset(0);
      setLimit(20);
      setHasMore(false);
    }
  }, [show, objectId]);

  return (
    <Sheet open={show} onOpenChange={setShow}>
      <SheetContent className='p-0 sm:max-w-[700px]'>
        <SheetHeader className='px-5 py-7 border-b flex items-center justify-between flex-row'>
          <SheetTitle className='text-lg font-semibold flex items-center gap-3'>
            <p>
              {t(
                type == 'admin'
                  ? 'admin_list'
                  : type == 'teacher'
                    ? 'teacher_list'
                    : type == 'ta'
                      ? 'teaching_assistant_list'
                      : type == 'student'
                        ? 'student_list'
                        : type == 'classroom'
                          ? 'class_list'
                          : type == 'location'
                            ? 'location_list'
                            : 'subject_list'
              )}
            </p>
          </SheetTitle>
        </SheetHeader>
        <Loading loading={loading} />

        <div className={`p-4 h-[calc(100vh-123px)]`}>
          <div className={`space-y-2 h-[calc(100vh-143px)] mb-4 overflow-y-auto`}>
            <table className='table-rounded '>
              <thead>
                <tr className='bg-primary-blue-50'>
                  {' '}
                  <th className='w-14'>#</th>
                  <th className='text-left'>
                    {t('code_and_name')}{' '}
                    {t(
                      type == 'admin'
                        ? 'administrator'
                        : type == 'teacher'
                          ? 'teachers'
                          : type == 'ta'
                            ? 'teaching_assistant'
                            : type == 'student'
                              ? 'students'
                              : type == 'classroom'
                                ? 'classroom'
                                : type == 'location'
                                  ? 'teaching_location'
                                  : 'subject'
                    ).toLocaleLowerCase()}
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {data?.length > 0 ? (
                  data?.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + offset + 1}</td>
                        <td>
                          <div className='flex items-center gap-3 cursor-pointer'>
                            <img
                              className='object-cover rounded-full size-10 min-w-10 min-h-10'
                              src={item?.avatar || NO_AVATAR}
                              alt=''
                            />
                            <p>
                              {item?.code} - {item?.name}
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={2}>
                      <EmptyTable />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className='w-full bg-white'>
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
      </SheetContent>
    </Sheet>
  );
};

export default DrawerStatistic;
