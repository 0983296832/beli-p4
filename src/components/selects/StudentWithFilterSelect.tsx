import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@components/ui/sheet';
import { Button } from '@components/ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '@components/ui/popover';
import SearchInput from '@components/fields/SearchInput';
import { FILTER_HORIZONTAL, NO_AVATAR, SEARCH } from '@lib/ImageHelper';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import ClassroomSelect from '@components/selects/ClassroomSelect';
import CheckboxInput from '@components/fields/CheckboxInput';
import TextInput from '@components/fields/TextInput';
import { TypeUser, useRootStore } from '@store/index';
import _, { cloneDeep, union } from 'lodash';
import mainServices from '@services/main';
import { mergeObjects } from '@lib/JsHelper';
import studentServices from '@services/student';
import EmptyTable from '../empty/EmptyTable';
import Loading from '../loading';
import { Virtuoso } from 'react-virtuoso';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  TA = 'ta',
  STUDENT = 'student'
}

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  value?: number[];
  onChange?: (value: TypeUser[]) => void;
  role?: keyof typeof UserRole;
  filterOptions?: number[];
  classroomIds?: number[];
  hasTab?: boolean;
}

const StudentWithFilterSelect = (props: Props) => {
  const { show, setShow, value = [], onChange, role, filterOptions, classroomIds, hasTab } = props;
  const { t } = useT();
  const userList = useRootStore((state) => state?.users);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TypeUser[]>([]);
  const [usersInClass, setUsersInClass] = useState<TypeUser[]>([]);
  const [usersNotInClass, setUsersNotInClass] = useState<TypeUser[]>([]);
  const [infoSearch, setInfoSearch] = useState<any>({});
  const [openFilter, setOpenFilter] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [tab, setTab] = useState(1);

  const getData = async (filters?: any) => {
    let params: any = {
      fields: 'display_name,avatar',
      filterings: {
        user_job_title: role ? UserRole[role] : undefined,
        'id:in': filterOptions
      },
      limit: 999999,
      offset: 0
    };
    if (infoSearch?.search) {
      params.search = infoSearch?.search;
    }

    if (infoSearch?.un_classroom) {
      params.filterings['un_classroom:eq'] = infoSearch?.un_classroom;
    }

    if (infoSearch?.subject_id) {
      params.filterings['subject_id:eq'] = infoSearch?.subject_id;
    }

    if (infoSearch?.location_id) {
      params.filterings['location_id:eq'] = infoSearch?.location_id;
    }
    if (infoSearch?.classroom_id) {
      params.filterings['classroom_id:eq'] = infoSearch?.classroom_id;
    }
    params = mergeObjects(params, filters);

    try {
      setLoading(true);
      const data: any = await studentServices.getStudents(params);
      setUsers(data?.data || []);
      setUsersInClass(data?.data?.filter((user: { id: number }) => value?.includes(user?.id as number)) || []);
      setUsersNotInClass(data?.data?.filter((user: { id: number }) => !value?.includes(user?.id as number)) || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      getData();
    }
  }, [show]);

  const user_list = tab == 1 ? users : tab == 2 ? usersInClass : usersNotInClass;

  return (
    <Sheet open={show} onOpenChange={setShow}>
      <SheetContent className='p-0 sm:max-w-[700px]'>
        <SheetHeader className='px-5 py-7 border-b flex items-center justify-between flex-row'>
          <SheetTitle className='text-lg font-semibold flex items-center gap-3'>
            <p>{t('student_list')}</p>
            <div className='py-1 px-2 text-primary-blue-500 bg-primary-blue-50 rounded-full text-sm'>
              {t('selected_num', { num: value?.length })}
            </div>
          </SheetTitle>
          <Button
            className='px-6'
            onClick={() => {
              setShow(false);
            }}
          >
            {t('done')}
          </Button>
        </SheetHeader>
        <Loading loading={loading} />
        {hasTab && (
          <div className='flex items-center gap-10 border-b mt-6 mx-7'>
            <div
              className={`w-1/3 text-center px-4 py-3 border-b cursor-pointer hover:text-primary-blue-500 hover:border-primary-blue-500 ${tab == 1 ? 'text-primary-blue-500 border-primary-blue-500' : 'text-primary-neutral-700'}`}
              onClick={() => {
                setTab(1);
              }}
            >
              {t('all')}
            </div>
            <div
              className={`w-1/3 text-center px-4 py-3 border-b cursor-pointer hover:text-primary-blue-500 hover:border-primary-blue-500 ${tab == 2 ? 'text-primary-blue-500 border-primary-blue-500' : 'text-primary-neutral-700'}`}
              onClick={() => {
                setTab(2);
              }}
            >
              {t('in_class')}
            </div>
            <div
              className={`w-1/3 text-center px-4 py-3 border-b cursor-pointer hover:text-primary-blue-500 hover:border-primary-blue-500 ${tab == 3 ? 'text-primary-blue-500 border-primary-blue-500' : 'text-primary-neutral-700'}`}
              onClick={() => {
                setTab(3);
              }}
            >
              {t('not_in_class')}
            </div>
          </div>
        )}

        <div className={`p-6 ${hasTab ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-100px)]'}`}>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <TextInput
                className={'pr-10 w-full'}
                value={infoSearch?.search}
                placeholder={t('search')}
                onChange={(value) => {
                  setInfoSearch({ ...infoSearch, search: value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    getData();
                  }
                }}
              />
              <span className='absolute p-3 transform -translate-y-1/2 top-1/2 right-3 text-primary-neutral-500'>
                <img className='size-4' src={SEARCH} alt='Search' />
              </span>
            </div>

            <div className='relative inline-block text-left'>
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

              {openFilter && (
                <div className='absolute right-0 z-50 mt-2 w-[650px] rounded-xl border bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-1'>
                  <div className='grid grid-cols-2 gap-2'>
                    <TeachingLocationSelect
                      label={t('teaching_location')}
                      isClearable
                      value={infoSearch?.location_id}
                      onChange={(val) => {
                        setInfoSearch({ ...infoSearch, location_id: val?.id });
                      }}
                    />
                    <SubjectsSelect
                      label={t('subject')}
                      isClearable
                      value={infoSearch?.subject_id}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, subject_id: value?.id });
                      }}
                    />
                    <div className='mt-9'>
                      <CheckboxInput
                        className='mr-1'
                        label={t('filter_no_class')}
                        checked={infoSearch?.un_classroom == 1}
                        onCheckedChange={() => {
                          setInfoSearch({ ...infoSearch, un_classroom: infoSearch?.un_classroom == 1 ? 0 : 1 });
                        }}
                      />
                    </div>
                    <ClassroomSelect
                      isClearable
                      label={t('classroom')}
                      value={infoSearch?.classroom_id}
                      onChange={(value) => {
                        setInfoSearch({ ...infoSearch, classroom_id: value?.id });
                      }}
                    />
                  </div>
                  <div className='flex justify-end gap-3 mt-4'>
                    <Button
                      className='border bg-primary-neutral-100 border-primary-neutral-300'
                      variant={'ghost'}
                      onClick={() => {
                        getData({
                          filterings: {
                            'location_id:eq': undefined,
                            'subject_id:eq': undefined,
                            'un_classroom:eq': undefined,
                            'classroom_id:eq': undefined
                          },
                          offset: 0
                        });
                        setInfoSearch({
                          location_id: undefined,
                          subject_id: undefined,
                          un_classroom: 0,
                          classroom_id: undefined
                        });
                        setOpenFilter(false);
                      }}
                    >
                      {t('restore_default')}
                    </Button>
                    <Button
                      className='bg-primary-success hover:bg-primary-success/80'
                      onClick={() => {
                        getData();
                        setOpenFilter(false);
                      }}
                    >
                      {t('apply')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={`mt-6 space-y-2 ${hasTab ? 'h-[calc(100vh-270px)]' : 'h-[calc(100vh-180px)]'} overflow-y-auto`}
          >
            <div className='flex items-center justify-between'>
              {tab == 1 ? (
                <CheckboxInput
                  className='mr-3'
                  label={
                    users.every((user: any) => value?.includes(user?.id as number))
                      ? t('unselect_all')
                      : t('select_all')
                  }
                  checked={users.every((user: any) => value?.includes(user?.id as number))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange?.(users);
                    } else {
                      onChange?.([]);
                    }
                  }}
                />
              ) : tab == 2 ? (
                <CheckboxInput
                  className='mr-3'
                  label={
                    usersInClass.every((user: any) => value?.includes(user?.id as number))
                      ? t('unselect_all')
                      : t('select_all')
                  }
                  checked={usersInClass.every((user: any) => value?.includes(user?.id as number))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const new_value = union(
                        value,
                        usersInClass?.map((u) => u?.id)
                      );

                      onChange?.(users.filter((u) => new_value?.includes(u?.id)));
                    } else {
                      onChange?.(
                        users.filter(
                          (u) => value?.includes(u?.id as number) && !usersInClass.map((user) => user.id).includes(u.id)
                        )
                      );
                    }
                  }}
                />
              ) : (
                <CheckboxInput
                  className='mr-3'
                  label={
                    usersNotInClass.every((user: any) => value?.includes(user?.id as number))
                      ? t('unselect_all')
                      : t('select_all')
                  }
                  checked={usersNotInClass.every((user: any) => value?.includes(user?.id as number))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const new_value = union(
                        value,
                        usersNotInClass?.map((u) => u?.id)
                      );

                      onChange?.(users.filter((u) => new_value?.includes(u?.id)));
                    } else {
                      onChange?.(
                        users.filter(
                          (u) =>
                            value?.includes(u?.id as number) && !usersNotInClass.map((user) => user.id).includes(u.id)
                        )
                      );
                    }
                  }}
                />
              )}

              <span className='text-xs px-2 py-0.5 rounded bg-primary-blue-50 text-primary-blue-500'>
                {user_list.length}
              </span>
            </div>
            {user_list?.length > 0 ? (
              <Virtuoso
                style={{ height: 'calc(100vh - 228px)' }} // đặt chiều cao list, có thể chỉnh theo UI
                totalCount={user_list.length}
                itemContent={(index) => {
                  const user = user_list[index];
                  return (
                    <div className='flex items-center gap-3' key={index}>
                      <CheckboxInput
                        checked={value?.includes(user?.id as number)}
                        onCheckedChange={() => {
                          if (value?.includes(user?.id as number)) {
                            onChange?.(
                              users
                                ?.filter((u) => value?.includes(u?.id as number))
                                ?.filter((u) => u?.id !== (user?.id as number))
                            );
                          } else {
                            onChange?.([...users?.filter((u) => value?.includes(u?.id as number)), user]);
                          }
                        }}
                      />
                      <div
                        className='flex items-center gap-3 cursor-pointer'
                        onClick={() => {
                          if (value?.includes(user?.id as number)) {
                            onChange?.(
                              users
                                ?.filter((u) => value?.includes(u?.id as number))
                                ?.filter((u) => u?.id !== (user?.id as number))
                            );
                          } else {
                            onChange?.([...users?.filter((u) => value?.includes(u?.id as number)), user]);
                          }
                        }}
                      >
                        <img
                          className='object-cover rounded-full size-10 min-w-10 min-h-10'
                          src={user.avatar || NO_AVATAR}
                          alt=''
                        />
                        <p>
                          {user.username} - {user.display_name}
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
            ) : (
              <div className='pt-10'>
                <EmptyTable />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentWithFilterSelect;
