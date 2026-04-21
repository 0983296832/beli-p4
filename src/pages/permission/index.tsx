import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { AVATAR, DELETE_04, EDIT_02, PLUS_BLACK, SETTING_01 } from '@lib/ImageHelper';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CheckboxInput from '@components/fields/CheckboxInput';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import { Toast } from '@components/toast';
import permissionServices from '@services/permission';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@components/ui/alert-dialog';
import TextInput from '@components/fields/TextInput';
import { TypeErrors } from '@/src/interface';
import SelectInput from '@components/fields/SelectInput';
import UsersSelect from '@components/selects/UsersSelect';
import _ from 'lodash';
import NumberInput from '@components/fields/NumberInput';
import UserList from '@components/userList';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@components/ui/sheet';
import TablePermission from './TablePermission';
import UsersSelectVirtualized from '@components/selects/UserSelectVirtualized';
interface Props {}

const Permissions = (props: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(0);
  const [activePerm, setActivePerm] = useState(2);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isShowModal, setIsShowModal] = useState(false);
  const [formData, setFormData] = useState<{
    role_name: string;
    added_user_ids: number[];
    removed_user_ids?: number[];
  }>({
    role_name: '',
    added_user_ids: []
  });
  const [errors, setErrors] = useState<TypeErrors>({});
  const [groupsPerm, setGroupsPerm] = useState<any>([]);
  const [permissionDetail, setPermissionDetail] = useState<any>({});
  const [deleteForm, setDeleteForm] = useState<any>({
    move_users_to_new_role: undefined
  });
  const [deleteErrors, setDeleteErrors] = useState<TypeErrors>({});
  const [isShowSheetAddUser, setIsShowSheetAddUser] = useState(false);
  const [userAdd, setUserAdd] = useState<number[]>([]);

  const getGroupPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        fields: 'role_name,valid,is_default,related_users',
        limit: 9999999,
        sort: 'role_id',
        direction: 'asc'
      };
      const res: any = await permissionServices.getGroupPermissions(params);
      setGroupsPerm(res?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getPermissionDetail = async (id: number) => {
    setLoading(true);
    try {
      const params = {
        fields: 'role_name,valid,is_default,permissions,related_users'
      };
      const res: any = await permissionServices.getPermissionDetail(id, params);
      setPermissionDetail(res);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    setLoading(true);
    try {
      let res: any;
      if (!selectedId) {
        const body = _.cloneDeep(formData);
        delete body.removed_user_ids;
        res = await permissionServices.postPermission(body);
        Toast('success', res?.message);
        setErrors({});
        setFormData({ role_name: '', added_user_ids: [], removed_user_ids: [] });
        setIsShowModal(false);
        getGroupPermissions();
        setActivePerm(res?.id);
        getPermissionDetail(res?.id);
      } else {
        const body = _.cloneDeep(formData);
        res = await permissionServices.putPermission(Number(selectedId), body);
        Toast('success', res?.message);
        setErrors({});
        setFormData({ role_name: '', added_user_ids: [], removed_user_ids: [] });
        setIsShowModal(false);
        getGroupPermissions();
        getPermissionDetail(selectedId);
      }
      setLoading(false);
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await permissionServices.deletePermission(Number(selectedId), deleteForm);
      Toast('success', response?.message);
      setIsShowConfirm(false);
      getPermissionDetail(deleteForm?.move_users_to_new_role);
      setActivePerm(deleteForm?.move_users_to_new_role);
      getGroupPermissions();
      setDeleteForm({ move_users_to_new_role: undefined });
    } catch (error: any) {
      setDeleteErrors(error?.response?.data?.errors);
      setLoading(false);
    }
  };

  const onUpdateDetailPerm = async (isCheck: boolean, id: number) => {
    setLoading(true);
    try {
      const body = _.cloneDeep({
        role_name: groupsPerm?.find((perm: any) => perm?.id == activePerm)?.role_name,
        ...(isCheck
          ? { added_permission_ids: [id], removed_permission_ids: [] }
          : { added_permission_ids: [], removed_permission_ids: [id] })
      });
      const res: any = await permissionServices.putPermission(activePerm, body);
      Toast('success', res?.message);
      getPermissionDetail(activePerm);
    } catch (error) {
      setLoading(false);
    }
  };

  const onAddUserRelated = async () => {
    setLoading(true);
    try {
      const body = _.cloneDeep({
        role_name: groupsPerm?.find((perm: any) => perm?.id == activePerm)?.role_name,
        added_user_ids: userAdd
      });
      const res: any = await permissionServices.putPermission(activePerm, body);
      Toast('success', res?.message);
      getPermissionDetail(activePerm);
      getGroupPermissions();
      setUserAdd([]);
      setIsShowSheetAddUser(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroupPermissions();
    getPermissionDetail(2);
  }, []);

  return (
    <div className='flex gap-4 items-start '>
      <Loading loading={loading} />
      <Confirm
        className='w-[400px] text-left'
        show={isShowConfirm}
        type='warning'
        onCancel={() => {
          setIsShowConfirm(false);
          setDeleteForm({ move_users_to_new_role: 0 });
        }}
        onSuccess={handleDelete}
        description={
          <div>
            <p className='text-center text-primary-neutral-900 text-sm font-medium mb-4'>{t('txt_confirm_delete')}</p>
            <SelectInput
              error={deleteErrors?.move_users_to_new_role}
              className='text-left'
              label={t('move_users_to_new_permission_group')}
              options={groupsPerm
                ?.filter((perm: any) => perm?.id != selectedId)
                ?.map((perm: any) => ({ value: perm?.id, label: perm?.role_name }))}
              value={groupsPerm
                ?.filter((perm: any) => perm?.id != selectedId)
                ?.map((perm: any) => ({ value: perm?.id, label: perm?.role_name }))
                ?.find((perm: any) => perm?.value == deleteForm?.move_users_to_new_role)}
              onChange={(value) => {
                setDeleteForm({ ...deleteForm, move_users_to_new_role: value?.value });
                setDeleteErrors({ ...deleteErrors, move_users_to_new_role: '' });
              }}
            />
          </div>
        }
      />
      <AlertDialog
        open={isShowModal}
        onOpenChange={(open) => {
          setIsShowModal(open);
        }}
      >
        <AlertDialogContent className='rounded-xl p-4 max-w-[700px] bg-white'>
          <AlertDialogHeader className='mb-4'>
            <div className='text-base font-semibold'>
              {selectedId ? t('update_permission_group') : t('add_new_permission_group')}
            </div>
          </AlertDialogHeader>
          <div className='w-full mb-5'>
            <TextInput
              label={t('permission_group_name')}
              placeholder={t('enter_group_name')}
              value={formData.role_name}
              error={errors?.role_name}
              onChange={(value) => {
                setFormData({ ...formData, role_name: value });
                setErrors({ ...errors, role_name: '' });
              }}
            />
          </div>
          {!selectedId && (
            <div className='w-full mb-5'>
              <UsersSelectVirtualized
                isMulti
                isClearable
                label={t('participants_list')}
                placeholder={t('participants')}
                value={formData.added_user_ids}
                error={errors?.added_user_ids}
                onChange={(users) => {
                  setFormData({ ...formData, added_user_ids: users?.map((u) => u?.id) as number[] });
                  setErrors({ ...errors, added_user_ids: '' });
                }}
              />
            </div>
          )}

          <div className='flex items-center gap-3'>
            <Button className='w-1/2' variant={'default'} onClick={onUpdate} disabled={loading}>
              {t(selectedId ? 'update' : 'add_new')}
            </Button>
            <Button className='w-1/2' variant={'outline'} onClick={() => setIsShowModal(false)}>
              {t('close')}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className='shadow-lg card bg-primary-neutral-50 w-1/5 p-4 overflow-y-auto min-h-[calc(100vh-123px)] max-h-[calc(100vh-123px)]'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-base font-semibold leading-[100%]'>{t('set_permission_group')}</h3>
          <img
            src={PLUS_BLACK}
            className='cursor-pointer'
            onClick={() => {
              setErrors({});
              setFormData({ role_name: '', added_user_ids: [] });
              setIsShowModal(true);
              setSelectedId(0);
            }}
          />
        </div>
        <div className='space-y-1'>
          {/* <div className='p-2 rounded-md bg-primary-blue-50 flex items-start justify-between border-b cursor-pointer'>
            <p className='text-sm'>{t('owner_permission_group')}</p>
          </div> */}
          {groupsPerm?.map((perm: any, index: number) => {
            return (
              <div
                className={`p-2 rounded-md flex items-start justify-between hover:bg-primary-blue-50 border-b cursor-pointer ${activePerm === perm?.id && 'bg-primary-blue-50'}`}
                key={index}
                onClick={() => {
                  getPermissionDetail(perm?.id);
                  setActivePerm(perm?.id);
                }}
              >
                <p className='text-sm'>{perm?.role_name}</p>
                <div className='flex items-center gap-2'>
                  {perm?.is_default !== 1 && (
                    <img
                      src={DELETE_04}
                      className='cursor-pointer'
                      alt=''
                      onClick={() => {
                        setIsShowConfirm(true);
                        setSelectedId(perm?.id);
                        setDeleteErrors({});
                      }}
                    />
                  )}

                  <img
                    src={EDIT_02}
                    className='cursor-pointer'
                    alt=''
                    onClick={() => {
                      setErrors({});
                      setSelectedId(perm?.id);
                      setIsShowModal(true);
                      setFormData({ role_name: perm?.role_name, added_user_ids: [] });
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className='shadow-lg card bg-primary-neutral-50 w-4/5 p-4'>
        <h3 className='text-base font-semibold leading-[100%]'>{t('set_permission_group')}</h3>
        <div className='flex items-center gap-3 mt-3 mb-4'>
          <p className='text-base font-semibold '>
            {t('users_in_group')} {groupsPerm?.find((perm: any) => perm?.id == activePerm)?.role_name}:
          </p>
          <UserList
            key={activePerm}
            users={groupsPerm?.find((perm: any) => perm?.id == activePerm)?.related_users}
            addFunction={() => {
              setIsShowSheetAddUser(true);
            }}
          />
        </div>

        <div className='card-body'>
          <TablePermission permissionDetail={permissionDetail} onUpdateDetailPerm={onUpdateDetailPerm} type='edit' />
        </div>
      </div>
      <Sheet
        open={isShowSheetAddUser}
        onOpenChange={(open) => {
          setIsShowSheetAddUser(open);
          if (!open) setUserAdd([]);
        }}
      >
        <SheetContent className='w-[650px] sm:max-w-[650px] max-w-[550px] p-0 bg-white'>
          <SheetHeader className='px-10 py-8 border-b'>
            <SheetTitle className='text-base font-semibold'>{t('participants')}</SheetTitle>
          </SheetHeader>
          <div className='h-[calc(100vh-89px)] overflow-y-auto'>
            <div className='flex items-center justify-center gap-3 py-4 px-8'>
              <UsersSelectVirtualized
                filterOptions={permissionDetail?.related_users?.map((user: any) => user?.id)}
                isMulti
                isClearable
                placeholder={t('participants')}
                value={userAdd}
                onChange={(users) => {
                  setUserAdd(users?.map((user) => user?.id) as number[]);
                }}
              />
              <Button onClick={onAddUserRelated}>{t('add_account')}</Button>
            </div>
            <div className='border rounded-lg mx-8'>
              {permissionDetail?.related_users?.map((user: any) => {
                return (
                  <div className='px-2 py-1 flex items-center gap-2 border-b' key={user?.id}>
                    <img className='w-8 h-8 min-w-8 min-h-8 rounded-full object-cover border' src={user?.avatar} />
                    <p className='text-sm font-medium'>
                      {user?.display_name} - {user?.username}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Permissions;
