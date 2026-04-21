import React, { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import { useNavigate, useParams } from 'react-router-dom';
import { DELETE_04, EDIT_02 } from '@lib/ImageHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import { convertTimestampToString } from '@lib/TimeHelper';

const ExerciseDetail = () => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'user_id,age,username,user_job_title,description,email,phone,display_name,avatar,birthday,gender,verify_code,verify_status,status,valid,role_id,created_at,updated_at,address,working_status,province_id,district_id,ward_id,manager_statistic,user_ability'
    };
    try {
      //   const res: any = await studentServices.getStudent(Number(id), params);
      setDetail({
        id: 1,
        program_code: 'CTD.0001',
        program_name: 'Tiếng anh lớp 1',
        description:
          'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eveniet soluta voluptas id consequatur nisi omnis optio, nulla qui ipsa, consectetur architecto perferendis et numquam officia neque repellendus. Et id voluptatum blanditiis non asperiores eius unde nihil nemo odit laudantium, amet explicabo, veniam atque, labore natus! Sed maiores beatae fugiat et.',
        subject: 'Tiếng Anh MH.001',
        exercise: 35,
        question: 24,
        payment_method: 'Thời gian',
        price: 15000000,
        access_count: [
          {
            user_id: 1,
            username: 'U.00001',
            display_name: 'Lê Văn Bình',
            avatar: 'https://bsmlight.s3.amazonaws.com/uploads/beli-teacher/logo_1746075855.png',
            time: 1747664955
          }
        ],
        complete_exercise: [
          {
            user_id: 1,
            username: 'U.00001',
            display_name: 'Lê Văn Bình',
            avatar: 'https://bsmlight.s3.amazonaws.com/uploads/beli-teacher/logo_1746075855.png',
            time: 1747664955
          }
        ],
        rate_count: [
          {
            user_id: 1,
            username: 'U.00001',
            display_name: 'Lê Văn Bình',
            avatar: 'https://bsmlight.s3.amazonaws.com/uploads/beli-teacher/logo_1746075855.png',
            time: 1747664955,
            score: 8
          }
        ],
        avg_rate: 5.2,
        updated_info: {
          updated_time: 1747664955,
          updated_by: 'Nguyễn Hoàng Minh - QTV.0005'
        }
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      //   const response: any = await studentServices.deleteStudent(Number(id));
      //   Toast('success', response?.message);
      setIsShowConfirm(false);
      navigate('/teaching-program/list');
    } catch (error) {
      setLoading(false);
      setIsShowConfirm(false);
    }
  };

  useEffect(() => {
    id && getDetail();
  }, [id]);

  return (
    <div className='pb-20'>
      <Loading loading={loading} />
      <Confirm
        show={isShowConfirm}
        type='warning'
        onCancel={() => {
          setIsShowConfirm(false);
        }}
        onSuccess={handleDelete}
        description={t('txt_confirm_delete')}
      />
      <div className='shadow-lg card bg-primary-neutral-50 mb-6'>
        <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
          <h3 className='text-base font-semibold leading-[100%]'>
            {t('exercise_details')}: {detail?.program_name} - {detail?.program_code}
          </h3>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              className=''
              title={t('delete')}
              size={'icon'}
              onClick={() => {
                setIsShowConfirm(true);
              }}
            >
              <img src={DELETE_04} alt='' />
            </Button>
            <Button
              variant='secondary'
              title={t('edit')}
              size={'icon'}
              onClick={() => {
                navigate('/teaching-program/edit/' + id);
              }}
            >
              <img src={EDIT_02} alt='' />
            </Button>
          </div>
        </div>

        <div className='p-6 card-body flex gap-6 items-stretch flex-wrap'>
          <div className=' border border-primary-neutral-200 card flex-1 '>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t('exercise_info')}</h3>
            </div>
            <div className='p-6 card-body '>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('exercise_code_name')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {detail?.program_name} - {detail?.program_code}
                  </div>
                </div>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('learning_program_code_name')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {detail?.program_name} - {detail?.program_code}
                  </div>
                </div>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('subject')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.subject}</div>
                </div>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('learning_program_description')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.description}</div>
                </div>
              </div>
            </div>
          </div>
          <div className=' border border-primary-neutral-200 card flex-1 '>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t('exercise_content')}</h3>
            </div>
            <div className='p-6 card-body'>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[100px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('number_of_questions')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className='underline text-primary-blue-500'>{detail?.question}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='p-6 pt-0 card-body flex gap-6 items-stretch'>
          <div className=' border border-primary-neutral-200 card flex-1 '>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t('payment_info')}</h3>
            </div>
            <div className='p-6 card-body '>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('payment_method')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.payment_method}</div>
                </div>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('price_per_exercise')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.price}</div>
                </div>
              </div>
            </div>
          </div>
          <div className=' border border-primary-neutral-200 card flex-1 '>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t('interaction_and_review')}</h3>
            </div>
            <div className='p-6 card-body'>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('access_count')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className='underline text-primary-blue-500'>{detail?.access_count?.length}</div>
                </div>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('exercise_completion_count')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className='underline text-primary-blue-500'>{detail?.complete_exercise?.length}</div>
                </div>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('rating_count')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className='underline text-primary-blue-500'>{detail?.rate_count?.length}</div>
                </div>
                <div className='grid grid-cols-[200px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('average_rating_score')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className='underline text-primary-blue-500'>{detail?.rate_count?.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='p-6 pt-0 card-body flex gap-6 items-stretch'>
          <div className=' border border-primary-neutral-200 card flex-1 '>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t('update_time')}</h3>
            </div>
            <div className='p-6 card-body '>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('update_time')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''> {convertTimestampToString(1747664955, 'right')}</div>
                </div>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('payment_method')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>Nguyễn Hoàng Minh - GV.0005</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
