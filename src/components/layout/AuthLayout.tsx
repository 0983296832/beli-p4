import { BG_VHS_01_1, LOGO } from '@lib/ImageHelper';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const AuthLayout = (props: Props) => {
  const { children } = props;
  return (
    <div className='flex flex-col min-h-screen bg-center bg-cover bg-img-layout'>
      <div className='w-full p-6'>
        <div className='bg-white w-[80px] h-[80px] flex justify-center items-center rounded-lg'>
          <img src={LOGO} className='w-[60px]' />
        </div>
      </div>
      <div className={`flex-1`}>{children}</div>
      <div className='w-full bg-primary-blue-600 h-[96px] md:h-[110px]'></div>
    </div>
  );
};

export default AuthLayout;
