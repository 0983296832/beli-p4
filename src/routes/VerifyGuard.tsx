import { useNavigate } from 'react-router-dom';
import { useRootStore } from '@store/index';
import { useEffect } from 'react';

const VerifyGuard = ({ children }: any) => {
  const navigate = useNavigate();
  const currentUser = useRootStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser?.verify_status === 0 && location.pathname !== '/verify-account') {
      navigate('/verify-account');
    }
  }, [currentUser?.verify_status, navigate]);

  return <>{children}</>;
};
export default VerifyGuard;
