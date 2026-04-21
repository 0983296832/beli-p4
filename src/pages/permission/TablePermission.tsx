import React, { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import permissionServices from '@services/permission';
import Loading from '@components/loading';
import CheckboxInput from '@components/fields/CheckboxInput';
import Icon from '@components/Icon';
import { TICK_ICON } from '@lib/ImageHelper';

interface Props {
  permissionDetail?: any;
  onUpdateDetailPerm?: (value: boolean, id: number) => void;
  type: 'view' | 'edit';
}

const TablePermission = ({ permissionDetail, onUpdateDetailPerm, type = 'edit' }: Props) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const getTablePermission = async () => {
    setLoading(true);
    try {
      const params = {
        fields: 'identity,permission_name,permission_display_name,module'
      };
      const res: any = await permissionServices.getPermissions(params);
      setTableData(res);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const { t } = useT();
  useEffect(() => {
    getTablePermission();
  }, []);
  return (
    <>
      <Loading loading={loading} />
      <table className='table-rounded '>
        <thead>
          <tr className='bg-primary-blue-50'>
            <th scope='col' className='w-16'>
              {t('number_order')}
            </th>
            <th scope='col'>{t('function')}</th>

            <th scope='col ' className='w-32'>
              {t('view')}
            </th>
            <th scope='col ' className='w-32'>
              {t('create')}
            </th>
            <th scope='col ' className='w-32'>
              {t('edit')}
            </th>
            <th scope='col ' className='w-32'>
              {t('delete')}
            </th>
            <th scope='col ' className='w-32'>
              {t('approve')}
            </th>
            <th scope='col ' className='w-32'>
              {t('view_all')}
            </th>
          </tr>
        </thead>
        <tbody className='bg-white'>
          {tableData?.map((item: any, index) => {
            const permAccess = item.permissions?.find((perm: any) => perm?.action_key == 'access');
            const permCreate = item.permissions?.find((perm: any) => perm?.action_key == 'create');
            const permUpdate = item.permissions?.find((perm: any) => perm?.action_key == 'update');
            const permDelete = item.permissions?.find((perm: any) => perm?.action_key == 'delete');
            const permApprove = item.permissions?.find((perm: any) => perm?.action_key == 'approve');
            const permViewAll = item.permissions?.find((perm: any) => perm?.action_key == 'view_all');

            const hasPermissionAccess = permissionDetail?.permissions?.find(
              (permission: any) => permission?.permission_name == permAccess?.permission_name
            );
            const hasPermissionCreate = permissionDetail?.permissions?.find(
              (permission: any) => permission?.permission_name == permCreate?.permission_name
            );
            const hasPermissionUpdate = permissionDetail?.permissions?.find(
              (permission: any) => permission?.permission_name == permUpdate?.permission_name
            );
            const hasPermissionDelete = permissionDetail?.permissions?.find(
              (permission: any) => permission?.permission_name == permDelete?.permission_name
            );
            const hasPermissionApprove = permissionDetail?.permissions?.find(
              (permission: any) => permission?.permission_name == permApprove?.permission_name
            );
            const hasPermissionViewAll = permissionDetail?.permissions?.find(
              (permission: any) => permission?.permission_name == permViewAll?.permission_name
            );
            return (
              <tr>
                <td>{index + 1}</td>
                <td className='text-left' id={item?.module_key}>
                  {item?.module_name}
                </td>
                <td>
                  {permAccess?.action_key === 'access' && (
                    <div className='flex items-center justify-center' id={permAccess?.permission_name}>
                      {type === 'view' ? (
                        <Icon
                          icon={!!hasPermissionAccess ? TICK_ICON : undefined}
                          className='text-primary-blue-500'
                          size={16}
                        />
                      ) : (
                        <CheckboxInput
                          checked={!!hasPermissionAccess}
                          onCheckedChange={() => {
                            onUpdateDetailPerm?.(!!!hasPermissionAccess, permAccess?.id);
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {permCreate?.action_key === 'create' && (
                    <div className='flex items-center justify-center' id={permCreate?.permission_name}>
                      {type === 'view' ? (
                        <Icon
                          icon={!!hasPermissionCreate ? TICK_ICON : undefined}
                          className='text-primary-blue-500'
                          size={16}
                        />
                      ) : (
                        <CheckboxInput
                          checked={!!hasPermissionCreate}
                          onCheckedChange={() => {
                            onUpdateDetailPerm?.(!!!hasPermissionCreate, permCreate?.id);
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {permUpdate?.action_key === 'update' && (
                    <div className='flex items-center justify-center' id={permUpdate?.permission_name}>
                      {type === 'view' ? (
                        <Icon
                          icon={!!hasPermissionUpdate ? TICK_ICON : undefined}
                          className='text-primary-blue-500'
                          size={16}
                        />
                      ) : (
                        <CheckboxInput
                          checked={!!hasPermissionUpdate}
                          onCheckedChange={() => {
                            onUpdateDetailPerm?.(!!!hasPermissionUpdate, permUpdate?.id);
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {permDelete?.action_key === 'delete' && (
                    <div className='flex items-center justify-center' id={permDelete?.permission_name}>
                      {type === 'view' ? (
                        <Icon
                          icon={!!hasPermissionDelete ? TICK_ICON : undefined}
                          className='text-primary-blue-500'
                          size={16}
                        />
                      ) : (
                        <CheckboxInput
                          checked={!!hasPermissionDelete}
                          onCheckedChange={() => {
                            onUpdateDetailPerm?.(!!!hasPermissionDelete, permDelete?.id);
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {permApprove?.action_key === 'approve' && (
                    <div className='flex items-center justify-center' id={permApprove?.permission_name}>
                      {type === 'view' ? (
                        <Icon
                          icon={!!hasPermissionApprove ? TICK_ICON : undefined}
                          className='text-primary-blue-500'
                          size={16}
                        />
                      ) : (
                        <CheckboxInput
                          checked={!!hasPermissionApprove}
                          onCheckedChange={() => {
                            onUpdateDetailPerm?.(!!!hasPermissionApprove, permApprove?.id);
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {permViewAll?.action_key === 'view_all' && (
                    <div className='flex items-center justify-center' id={permViewAll?.permission_name}>
                      {type === 'view' ? (
                        <Icon
                          icon={!!hasPermissionViewAll ? TICK_ICON : undefined}
                          className='text-primary-blue-500'
                          size={16}
                        />
                      ) : (
                        <CheckboxInput
                          checked={!!hasPermissionViewAll}
                          onCheckedChange={() => {
                            onUpdateDetailPerm?.(!!!hasPermissionViewAll, permViewAll?.id);
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default TablePermission;
