import React, { useEffect, useState } from 'react';
import AuthServices from '@services/auth';
import { useRootStore } from '@store/index';
import { useT } from '@hooks/useT';
import { Toast } from '@components/toast';
import { useNavigate } from 'react-router-dom';
import { saveRefreshToken, saveToken } from '@lib/JwtHelper';
import TextInput from '@components/fields/TextInput';
import { Button } from '@components/ui/button';
import CheckboxInput from '@components/fields/CheckboxInput';
import { LOGO } from '@lib/ImageHelper';
import { TypeErrors } from '@/src/interface';

interface Props {}

const LOGIN_BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1800&q=80';
const LOGIN_SIDE_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80';

const Login = (props: Props) => {
  const { t } = useT();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setError] = useState<TypeErrors>({});
  const [isRememberMe, setIsRememberMe] = useState(false);
  const { setIsLoggedIn, onLogout } = useRootStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    try {
      const data: any = await AuthServices.login({ username, password });
      if (data?.status === 200) {
        setIsLoggedIn?.(true);
        Toast('success', t('login_successfully'));
        navigate('/');
        // if (data.data?.role_id === USER_ROLE.STUDENT) {
        //   navigate('/study-schedule');
        // } else if (data.data?.role_id === USER_ROLE.TEACHER || data.data?.role_id === USER_ROLE.TA) {
        //   navigate('/teaching-program/list');
        // } else {
        //   navigate('/');
        // }

        saveToken(data.data.access_token);
        saveRefreshToken(data.data.refresh_token);

        if (isRememberMe) {
          localStorage.setItem('username', JSON.stringify({ username }));
        }
        setLoading(false);
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Toast('error', error?.response?.data?.message);
      setError(error?.response?.data?.errors);
    }
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onLogin();
  };

  useEffect(() => {
    const localStorageUsername = localStorage.getItem('username');
    if (localStorageUsername) {
      const parsedUsername = JSON.parse(localStorageUsername);
      setUsername(parsedUsername.username);
    }
    onLogout?.();
  }, []);

  return (
    <div
      className='min-h-screen bg-cover bg-center bg-no-repeat p-4 md:p-8'
      style={{ backgroundImage: `url(${LOGIN_BACKGROUND_IMAGE})` }}
    >
      <div className='mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl grid-cols-1 overflow-hidden rounded-3xl bg-primary-neutral-50 shadow-[0_26px_70px_-26px_rgba(15,23,42,0.6)] md:min-h-[calc(100vh-4rem)] lg:grid-cols-2'>
        <div
          className='relative hidden lg:flex items-end p-12 bg-cover bg-center'
          style={{ backgroundImage: `url(${LOGIN_SIDE_IMAGE})` }}
        >
          <div className='absolute inset-0 bg-gradient-to-t from-primary-blue-900/90 via-primary-blue-800/55 to-transparent' />
          <div className='relative z-10 max-w-md text-white'>
            <p className='text-xs font-semibold uppercase tracking-[0.35em] text-primary-blue-100'>
              {t('login_welcome')}
            </p>
            <h1 className='mt-4 text-5xl font-bold leading-tight'>{t('login')}</h1>
            <p className='mt-6 text-base leading-7 text-primary-neutral-100'>{t('login_subtitle')}</p>
          </div>
        </div>

        <div className='flex items-center justify-center bg-primary-neutral-50 px-6 py-10 sm:px-10 lg:px-14'>
          <div className='w-full max-w-md'>
            <div
              className='mb-8 h-36 w-full rounded-2xl bg-cover bg-center shadow-md lg:hidden'
              style={{ backgroundImage: `url(${LOGIN_SIDE_IMAGE})` }}
            />
            <div className='text-center'>
              <img alt='Beliteachers' src={LOGO} className='mx-auto mb-3 h-20 w-20 rounded-2xl object-contain' />
              <p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary-blue-600'>
                {t('login_welcome')}
              </p>
              <h2 className='mt-3 text-4xl font-semibold tracking-tight text-primary-neutral-900'>{t('login')}</h2>
              <p className='mt-3 text-sm leading-6 text-primary-neutral-600'>{t('login_subtitle')}</p>
            </div>
            <div className='mt-9'>
              <form className='space-y-6 w-full sm:mx-auto' onSubmit={handleSubmit}>
                <div className='space-y-4'>
                  <div className='w-full'>
                    <TextInput
                      label={t('account')}
                      value={username}
                      placeholder={t('type_account')}
                      className='w-full text-sm border-primary-neutral-200 bg-primary-neutral-50 focus-within:border-primary-blue-600'
                      error={errors?.username}
                      onChange={(value) => {
                        setUsername(value);
                        setError({ ...errors, username: '' });
                      }}
                    />
                  </div>
                  <div className='w-full'>
                    <TextInput
                      label={t('password')}
                      value={password}
                      error={errors?.password}
                      className='border-primary-neutral-200 bg-primary-neutral-50 focus-within:border-primary-blue-600'
                      placeholder={t('type_password')}
                      type='password'
                      onChange={(value) => {
                        setPassword(value);
                        setError({ ...errors, password: '' });
                      }}
                    />
                  </div>

                  <div className='flex justify-between w-full items-center gap-2'>
                    <CheckboxInput
                      label={t('remember_username')}
                      labelClassName={'text-xs text-primary-neutral-600'}
                      checked={isRememberMe}
                      onCheckedChange={() => {
                        setIsRememberMe(!isRememberMe);
                      }}
                    />
                    <div className='text-xs whitespace-nowrap'>
                      <a
                        href='#/forgot_password'
                        className='underline text-primary-blue-700 hover:text-primary-blue-600'
                      >
                        {t('forgot_password')}
                      </a>
                    </div>
                  </div>
                </div>
                <div className='w-full'>
                  <Button
                    variant='default'
                    type='submit'
                    className='w-full h-12 rounded-xl bg-primary-blue-600 hover:bg-primary-blue-700 text-white font-semibold shadow-md shadow-primary-blue-200'
                    disabled={loading}
                  >
                    {t('login')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
