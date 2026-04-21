import { useT } from '@hooks/useT';
import RootRoute from './routes';
import { ToastContainer } from 'react-toastify';
import { useRootStore } from './store/index';
import mainServices from './services/main';
import { useEffect, useState } from 'react';
import i18n from './i18n';
import classroomServices from '@services/classroom';
import teachingLocationServices from '@services/teachingLocation';
import subjectServices from '@services/subject';
import RealtimeSrv from '@lib/SocketClient';
import notiServices from '@services/notification';
import { useCheckVersion } from './hooks/useCheckVersion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Button } from './components/ui/button';

const App = () => {
  const setCurrentUser = useRootStore((state) => state.setCurrentUser);
  const { setUsers, setLocations, setClassrooms, setSubjects, setNotificationCount } = useRootStore((state) => state);
  const setUserPermissions = useRootStore((state) => state.setUserPermissions);
  const restoreSession = useRootStore((state) => state.restoreSession);
  const isLoggedIn = useRootStore((state) => state.isLoggedIn);
  const [open, setOpen] = useState(false);
  const { hasNewVersion, acknowledgeUpdate, versionTag } = useCheckVersion(60000, () => setOpen(true));
  const { t } = useT();

  const handleReload = () => {
    acknowledgeUpdate(); // cập nhật version trước
    setTimeout(() => {
      window.location.reload();
    }, 400); // cho ẩn mượt
  };

  const getNotificationStatistic = async () => {
    try {
      const response: any = await notiServices.getNotificationStatistic();
      setNotificationCount(response?.unread);
    } catch (error) {}
  };

  const getCurrentUser = async () => {
    try {
      const data: any = await mainServices.getCurrentUser();
      if (data.verify_status === 0) {
        setCurrentUser?.(data);
        window.location.href = '/#/verify-account';
      } else {
        setCurrentUser?.(data);
        RealtimeSrv.init('https://socket.beliteachers.com', 'deployment_beliteacher_071202', data?.salt);
        await getNotificationStatistic();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getUserPermission = async () => {
    try {
      const data: any = await mainServices.getUserPermission();
      setUserPermissions?.(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUsers = async () => {
    try {
      const data: any = await mainServices.getUsers();
      setUsers?.(data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getClassrooms = async () => {
    try {
      const data: any = await classroomServices.getSharedClassrooms();
      setClassrooms?.(data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubjects = async () => {
    try {
      const data: any = await subjectServices.getSharedSubjects();
      setSubjects?.(data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getLocations = async () => {
    try {
      const data: any = await teachingLocationServices.getSharedTeachingLocations();
      setLocations?.(data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    restoreSession();
    const lang = localStorage.getItem('language');
    i18n.changeLanguage(lang || 'vi');
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      getCurrentUser();
      getUserPermission();
      getUsers();
      getClassrooms();
      getLocations();
      getSubjects();
    }
  }, [isLoggedIn]);

  return (
    <>
      <div className='fixed -top-2 left-1/2 -translate-x-1/2 z-[9999999]'>
        <span className='text-[8px] font-mono text-gray-700 px-2 py-[2px] rounded-sm opacity-50 pointer-events-none'>
          {versionTag}
        </span>
      </div>
      <RootRoute />
      <ToastContainer
        stacked
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      {hasNewVersion && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='max-w-sm text-center'>
            <DialogHeader>
              <DialogTitle>🚀 {t('has_new_version')}</DialogTitle>
            </DialogHeader>
            <p className='text-sm text-gray-600 my-2'>{t('app_updated_reload')}</p>
            <Button className=' mt-2' onClick={handleReload}>
              {t('reload_now')}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default App;
