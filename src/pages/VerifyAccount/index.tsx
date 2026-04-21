import React, { useEffect, useState } from 'react';
import { BG_VHS_02_2, LOGO } from '@lib/ImageHelper';
import { useT } from '@hooks/useT';
import TextInput from '@components/fields/TextInput';
import { Button } from '@components/ui/button';
import { useRootStore } from '@store/index';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp';
import useQueryString from '@hooks/useQueryString';
import { useNavigate } from 'react-router-dom';
import { TypeErrors } from '@/src/interface';
import Loading from '@components/loading';
import AuthLayout from '@components/layout/AuthLayout';
import profileServices from '@services/profile';
import { Toast } from '@components/toast';
import Confirm from '@components/confirm';

const VerifyAccount = () => {
  const { currentUser, onLogout, setCurrentUser } = useRootStore();
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<TypeErrors>({});
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [domainInvalid, setDomainInvalid] = useState(false);
  const popularDomains = [
    'gmail.com',
    'yahoo.com',
    'yahoo.com.vn',
    'yahoo.co.uk',
    'ymail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'me.com',
    'mac.com'
  ];

  const checkDomain = (value: string) => {
    const atIndex = value.indexOf('@');
    if (atIndex === -1) {
      setDomainInvalid(false);
      return;
    }
    const domain = value
      .slice(atIndex + 1)
      .toLowerCase()
      .trim();
    if (domain && !popularDomains.includes(domain)) {
      setDomainInvalid(true);
      setShowConfirmEmail(false);
    } else {
      setDomainInvalid(false);
    }
  };

  const getOtp = async () => {
    setLoading(false);
    try {
      const params = {
        fields: 'verify_code,verify_status,email'
      };
      const res: any = await profileServices.getProfile(params);
      if (res?.data?.verify_status == 1) {
        navigate('/');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    setLoading(true);
    try {
      const res: any = await profileServices.putVerifyAccount({ otp });
      Toast('success', res?.message);
      setLoading(false);
      if (currentUser) setCurrentUser?.({ ...currentUser, verify_status: 1 });
      navigate('/');
    } catch (error) {
      setLoading(false);
    }
  };

  const onUpdateEmail = async () => {
    if (email !== confirmEmail) {
      setShowConfirmEmail(false);
      setErrors({ ...errors, confirmEmail: t('email_not_match') });
      return;
    }
    if (!email.includes('@')) {
      setShowConfirmEmail(false);
      setErrors({ ...errors, email: t('invalid_email_format') });
      return;
    }

    checkDomain(email);

    setLoading(true);
    try {
      const res: any = await profileServices.putProfile({ email });
      Toast('success', res?.message);
      setLoading(false);
      getOtp();
      setStep(2);
      setShowConfirmEmail(false);
    } catch (error: any) {
      setErrors(error?.response?.data?.errors);
      setLoading(false);
      setShowConfirmEmail(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      currentUser?.verify_status == 0 && window.history.pushState(null, '', window.location.href);
    };

    currentUser?.verify_status == 0 && window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      setStep(2);
      getOtp();
    }
  }, [currentUser?.email]);

  return (
    <AuthLayout>
      <div className='flex items-center justify-center px-6 py-6 lg:px-[105px]'>
        <Confirm
          show={showConfirmEmail}
          type='warning'
          onCancel={() => {
            setShowConfirmEmail(false);
          }}
          onSuccess={onUpdateEmail}
          description={t('txt_confirm_email1')}
        />
        <div className='w-2/5'>
          <Loading loading={loading} />
          <div className='p-6 border bg-primary-neutral-50 rounded-xl border-primary-neutral-200 max-w-[463px]'>
            <div className=''>
              <img alt='Your Company' src={LOGO} className='mx-auto w-[100px] h-[100px]' />
              <h2 className='mt-9 font-medium tracking-tight text-center text-3xl/9 text-primary-neutral-900'>
                {t('account_verification')}
              </h2>
            </div>
            <div className='mt-9'>
              <div className='space-y-4'>
                {step == 1 ? (
                  <div>
                    <TextInput
                      label={t('email')}
                      value={email}
                      placeholder={t('type_email')}
                      error={errors?.email}
                      className='w-full border-primary-neutral-300'
                      onChange={(value) => {
                        setEmail(value);
                        setDomainInvalid(false);
                        setErrors({ ...errors, email: '' });
                      }}
                    />
                    <div className='mt-4'>
                      <TextInput
                        label={t('confirm_email')}
                        value={confirmEmail}
                        placeholder={t('confirm_email')}
                        error={errors?.confirmEmail}
                        className='w-full border-primary-neutral-300'
                        onChange={(value) => {
                          setConfirmEmail(value);
                          setDomainInvalid(false);
                          setErrors({ ...errors, confirmEmail: '' });
                        }}
                      />
                      {domainInvalid && (
                        <div className='mt-3 text-sm text-primary-neutral-700'>
                          <p>{t('txt_confirm_email')}</p>
                          <ul className='list-disc list-inside mt-1'>
                            <li>gmail.com</li>
                            <li>yahoo.com, yahoo.com.vn, yahoo.co.uk, ymail.com</li>
                            <li>outlook.com, hotmail.com, live.com, msn.com</li>
                            <li>icloud.com, me.com, mac.com</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <Button
                      variant='default'
                      type='submit'
                      className='w-full mt-4'
                      disabled={!email || !confirmEmail || loading}
                      onClick={() => setShowConfirmEmail(true)}
                    >
                      {t('continue')}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className='mb-2 text-center'>{t('verification_code_sent_email')}:</p>
                    <p className='mb-9 text-center'>
                      {currentUser?.username} - {email || currentUser?.email}
                    </p>
                    <div className='flex justify-center mb-5'>
                      <InputOTP maxLength={6} onChange={(value) => setOTP(value)}>
                        <InputOTPGroup className='flex items-center gap-2'>
                          <InputOTPSlot index={0} className='border rounded size-[60px] text-2xl' />
                          <InputOTPSlot index={1} className='border rounded size-[60px] text-2xl' />
                          <InputOTPSlot index={2} className='border rounded size-[60px] text-2xl' />
                          <InputOTPSlot index={3} className='border rounded size-[60px] text-2xl' />
                          <InputOTPSlot index={4} className='border rounded size-[60px] text-2xl' />
                          <InputOTPSlot index={5} className='border rounded size-[60px] text-2xl' />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p
                      className='mb-6 text-right text-sm font-medium text-primary-blue-500 cursor-pointer hover:text-orange-500'
                      onClick={!loading ? getOtp : () => {}}
                    >
                      {t('resend_code')}
                    </p>
                    <Button
                      variant='default'
                      type='submit'
                      className='w-full'
                      disabled={otp?.length != 6 || loading}
                      onClick={onVerify}
                    >
                      {t('verify')}
                    </Button>
                  </div>
                )}
              </div>
              <div className='text-xs mt-4 w-full flex items-center justify-center'>
                <a
                  href='#/login'
                  className='underline hover:text-primary-blue-500 text-center'
                  onClick={() => {
                    onLogout?.(true);
                  }}
                >
                  {t('back_to_login')}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className='w-3/5 '>
          <img alt='Your Company' src={BG_VHS_02_2} className='max-w-2xl mx-auto' />
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyAccount;
