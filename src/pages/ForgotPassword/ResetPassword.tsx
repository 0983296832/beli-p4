import { useRootStore } from '@store/index';
import { useState } from 'react';
import { Button } from '@components/ui/button';
import TextInput from '@components/fields/TextInput';
import { useT } from '@hooks/useT';
import { LOGO } from '@lib/ImageHelper';
import AuthServices from '@services/auth';
import { Toast } from '@components/toast';
import ReactPasswordChecklist from '@components/utils/PasswordCheckList';
import { useNavigate } from 'react-router-dom';

interface Props {
  username: string;
  otp: string;
}

const ResetPassword = (props: Props) => {
  const { t } = useT();
  const { username, otp } = props;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const onVerifyOTP = async () => {
    try {
      const data: any = await AuthServices.resetPassword({
        username,
        otp,
        password,
        password_confirmation: confirmPassword
      });
      Toast('success', data?.data?.message);
      navigate('/login');
    } catch (error: any) {
      console.log(error);
    }
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onVerifyOTP();
  };
  return (
    <div className='p-6 border bg-primary-neutral-50 sm:mx-auto sm:w-full sm:max-w-sm rounded-xl border-primary-neutral-200'>
      <div className=''>
        <img alt='Your Company' src={LOGO} className='mx-auto w-[100px] h-[100px]' />
        <h2 className='mt-10 font-medium tracking-tight text-center text-3xl/9 text-primary-neutral-900'>
          {t('change_password')}
        </h2>
      </div>
      <div className='mt-9 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form onSubmit={handleSubmit}>
          <div className='space-y-[30px]'>
            <div className='space-y-3'>
              <TextInput
                label={t('new_password')}
                placeholder={t('new_password')}
                className='border-primary-neutral-300'
                type='password'
                value={password}
                onChange={(value) => {
                  setPassword(value);
                }}
              />
              <div>
                <ReactPasswordChecklist
                  className='pl-5 text-sm list-disc text-primary-neutral-500'
                  rules={['notEmpty', 'minLength', 'specialCharAndNumber', 'capitalAndLowercase']}
                  minLength={8}
                  maxLength={50}
                  value={password}
                  valueAgain={confirmPassword}
                />
              </div>
              <TextInput
                label={t('confirm_password')}
                placeholder={t('confirm_password')}
                className='border-primary-neutral-300'
                type='password'
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                }}
              />
            </div>
            <div className='space-y-4'>
              <div className='flex justify-center'>
                <Button variant='default' type='submit' className='w-full'>
                  {t('continue')}
                </Button>
              </div>
              <div className='text-xs'>
                <a href='#/login' className='underline hover:text-primary-blue-500'>
                  {t('back_to_login')}
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
