import { useRootStore } from '@store/index';
import { useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp';
import { CLOCK, LOGO } from '@lib/ImageHelper';
import AuthServices from '@services/auth';
import { Toast } from '@components/toast';
import ResetPassword from './ResetPassword';

interface Props {
  username: string;
  onForgotPassword: (is_show_toast?: boolean) => Promise<void>;
}

const VerifyOTP = (props: Props) => {
  const { t } = useT();
  const { username, onForgotPassword } = props;
  const [otp, setOTP] = useState('');
  const [isShowFormResetPw, setIsShowFormResetPw] = useState(false);
  const onVerifyOTP = async () => {
    try {
      const data: any = await AuthServices.verifyOtp(username, otp);
      if (data?.status === 200) {
        setIsShowFormResetPw(true);
      }
      Toast('success', data?.data?.message);
    } catch (error: any) {
      console.log(error);
    }
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onVerifyOTP();
  };
  return (
    <>
      {isShowFormResetPw ? (
        <ResetPassword username={username} otp={otp} />
      ) : (
        <div className='p-6 border bg-primary-neutral-50 sm:mx-auto sm:w-full sm:max-w-sm rounded-xl border-primary-neutral-200'>
          <div className=''>
            <img alt='Your Company' src={LOGO} className='mx-auto w-[100px] h-[100px]' />
            <h2 className='mt-10 font-medium tracking-tight text-center text-3xl/9 text-primary-neutral-900'>
              {t('otp_verification')}
            </h2>
          </div>
          {username}
          <div className='mt-9 sm:mx-auto sm:w-full sm:max-w-sm'>
            <form onSubmit={handleSubmit}>
              <div className='space-y-[30px]'>
                <div className='flex justify-center'>
                  <InputOTP maxLength={6} onChange={(value) => setOTP(value)}>
                    <InputOTPGroup className='flex items-center gap-2'>
                      <InputOTPSlot index={0} className='border rounded' />
                      <InputOTPSlot index={1} className='border rounded' />
                      <InputOTPSlot index={2} className='border rounded' />
                      <InputOTPSlot index={3} className='border rounded' />
                      <InputOTPSlot index={4} className='border rounded' />
                      <InputOTPSlot index={5} className='border rounded' />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className='space-y-4'>
                  <div className='flex justify-center'>
                    <Button variant='default' type='submit' className=''>
                      {t('continue')}
                    </Button>
                  </div>
                  <div className='text-xs flex items-center justify-between'>
                    <a href='#/login' className='underline hover:text-primary-blue-500'>
                      {t('back_to_login')}
                    </a>
                    <p className='font-sans text-primary-blue-500 cursor-auto' onClick={() => onForgotPassword(true)}>
                      <img src={CLOCK} /> {t('resend')} (20s)
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VerifyOTP;
