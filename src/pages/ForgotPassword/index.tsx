import { useRootStore } from '@store/index';
import { useState } from 'react';
import AuthServices from '@services/auth';
import { Button } from '@components/ui/button';
import TextInput from '@components/fields/TextInput';
import { useT } from '@hooks/useT';
import AuthLayout from '@components/layout/AuthLayout';
import VerifyOTP from './VerifyOTP';
import { BG_VHS_02_2, LOGO } from '@lib/ImageHelper';
import { Toast } from '@components/toast';
import { TypeErrors } from '@/src/interface';

interface Props {}

const ForgotPassword = (props: Props) => {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isShowFormOTP, setIsShowFormOTP] = useState(false);
  const [errors, setErrors] = useState<TypeErrors>({});
  const onForgotPassword = async (is_show_toast?: boolean) => {
    try {
      const data: any = await AuthServices.forgotPassword({ username, email });
      if (data?.status === 200) {
        is_show_toast && Toast('success', data?.data?.message);
        setIsShowFormOTP(true);
      }
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
    }
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onForgotPassword();
  };
  return (
    <AuthLayout>
      <div className='flex items-center justify-center px-6 py-12 lg:px-8'>
        <div className='w-2/5'>
          {isShowFormOTP ? (
            <VerifyOTP username={username} onForgotPassword={onForgotPassword} />
          ) : (
            <div className='p-6 border bg-primary-neutral-50 sm:mx-auto sm:w-full sm:max-w-sm rounded-xl border-primary-neutral-200'>
              <div className=''>
                <img alt='Your Company' src={LOGO} className='mx-auto w-[100px] h-[100px]' />
                <h2 className='mt-10 font-medium tracking-tight text-center text-3xl/9 text-primary-neutral-900'>
                  {t('forgot_password')}
                </h2>
              </div>
              <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
                <form onSubmit={handleSubmit}>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <TextInput
                        label={t('account')}
                        value={username}
                        error={errors?.username}
                        placeholder={t('type_account')}
                        className='w-full border-primary-neutral-300'
                        onChange={(value) => {
                          setUsername(value);
                          setErrors({ ...errors, username: '' });
                        }}
                      />
                      <TextInput
                        // label={t('account')}
                        value={email}
                        error={errors?.email?.[0]}
                        label='Email'
                        placeholder={t('type_account')}
                        className='w-full border-primary-neutral-300'
                        onChange={(value) => {
                          setEmail(value);
                          setErrors({ ...errors, email: '' });
                        }}
                      />
                    </div>
                    <div>
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
                </form>
              </div>
            </div>
          )}
        </div>
        <div className='w-3/5 '>
          <img alt='Your Company' src={BG_VHS_02_2} className='max-w-2xl mx-auto' />
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
