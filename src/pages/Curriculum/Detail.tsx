import React, { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DELETE_04, EDIT_02 } from '@lib/ImageHelper';
import Loading from '@components/loading';
import Confirm from '@components/confirm';
import { convertTimestampToString } from '@lib/TimeHelper';
import curriculumServices from '@services/curriculum';
import { Toast } from '@components/toast';
import { getSubjectInfo } from '@lib/GetInfoHelper';
import { replaceNewlineWithBr } from '@lib/DomHelper';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';
import { ExamAccess, ExamComplete, ExamRate } from '../Exercise';

const CurriculumDetail = () => {
  const { t } = useT();
  const { currentUser } = useRootStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const { permissions } = useRootStore();
  const [detail, setDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [showDrawerAccess, setShowDrawerAccess] = useState(false);
  const [showDrawerCompleteExercise, setShowDrawerCompleteExercise] = useState(false);
  const [showDrawerVote, setShowDrawerVote] = useState(false);

  const getDetail = async () => {
    setLoading(true);
    let params = {
      fields:
        'identity,context,learning_program_name,learning_program_code,description,subject_id,avatar,last_updated_by,last_updated_user,user_ability,created_at,updated_at,valid,statistic'
    };
    try {
      const res: any = await curriculumServices.getCurriculum(Number(id), params);
      setDetail(res?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      setLoading(false);
      const response: any = await curriculumServices.deleteCurriculum(Number(id));
      Toast('success', response?.message);
      setIsShowConfirm(false);
      navigate('/curriculum/list');
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
            {t('detailed_curriculum_info')}: {detail?.learning_program_name} - {detail?.learning_program_code}
          </h3>
          <div className='flex gap-2'>
            {!!permissions.CREATE_STUDY_PROGRAM && (
              <Button
                variant='secondary'
                className='text-primary-success'
                onClick={() => {
                  navigate('/exercise/edit/0');
                  sessionStorage.setItem('curriculum_id', detail?.id);
                  sessionStorage.setItem('subject_id', detail?.subject_id);
                }}
              >
                {t('add_exercise')}
              </Button>
            )}

            {detail?.user_ability?.can_delete == 1 && (
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
            )}
            {detail?.user_ability?.can_edit == 1 && (
              <Button
                variant='secondary'
                title={t('edit')}
                size={'icon'}
                onClick={() => {
                  navigate('/curriculum/edit/' + id);
                }}
              >
                <img src={EDIT_02} alt='' />
              </Button>
            )}
          </div>
        </div>

        <div className='p-6 card-body flex gap-6 items-stretch flex-wrap'>
          <div className=' border border-primary-neutral-200 card flex-1 '>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t('curriculum_info')}</h3>
            </div>
            <div className='p-6 card-body '>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('curriculum_name')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.learning_program_name}</div>
                </div>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('curriculum_code')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.learning_program_code}</div>
                </div>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('subject')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className='flex items-center gap-2'>
                    <p>
                      {getSubjectInfo(detail?.subject_id)?.subject_name} -{' '}
                      {getSubjectInfo(detail?.subject_id)?.subject_code}
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('learning_program_description')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div
                    className='break-words'
                    dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(detail?.description) }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className=' border border-primary-neutral-200 card flex-1 '>
            <div className='border-b card-header text-primary-blue-600 border-primary-neutral-200'>
              <h3 className='text-base font-semibold leading-[100%]'>{t('curriculum_content')}</h3>
            </div>
            <div className='p-6 card-body'>
              <div className='grid text-sm gap-y-4'>
                <div className='grid grid-cols-[170px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('number_of_exercises')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  {currentUser?.user_job_title === USER_ROLE.STUDENT ? (
                    <div className='underline text-primary-blue-500 cursor-pointer w-min'>
                      {detail?.statistic?.exercise_count || 0}
                    </div>
                  ) : (
                    <Link
                      to={'/exercise/list'}
                      onClick={() => {
                        sessionStorage.setItem('curriculum_id', detail?.id);
                      }}
                      className='underline text-primary-blue-500 cursor-pointer w-min'
                    >
                      {detail?.statistic?.exercise_count || 0}
                    </Link>
                  )}
                </div>
                <div className='grid grid-cols-[170px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('number_of_questions')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>{detail?.statistic?.question_count || 0}</div>
                </div>
                <div className='grid grid-cols-[170px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('access_count')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div
                    className='underline text-primary-blue-500 cursor-pointer w-min'
                    onClick={() => {
                      setShowDrawerAccess(true);
                    }}
                  >
                    {detail?.statistic?.access_count || 0}
                  </div>
                </div>
                <div className='grid grid-cols-[170px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('exercise_completion_count')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div
                    className='underline text-primary-blue-500 cursor-pointer w-min'
                    onClick={() => {
                      setShowDrawerCompleteExercise(true);
                    }}
                  >
                    {detail?.statistic?.submission_count || 0}
                  </div>
                </div>
                <div className='grid grid-cols-[170px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('rating_count')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div
                    className='underline text-primary-blue-500 cursor-pointer w-min'
                    onClick={() => {
                      setShowDrawerVote(true);
                    }}
                  >
                    {detail?.statistic?.rating_count || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className='p-6 pt-0 card-body flex gap-6 items-stretch'>
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
        </div> */}
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
                  <div className=''> {convertTimestampToString(detail?.updated_at, 'right')}</div>
                </div>
                <div className='grid grid-cols-[160px_30px_1fr]'>
                  <div className='text-primary-neutral-600'>{t('updated_by')}</div>
                  <div className='text-primary-neutral-600'>:</div>
                  <div className=''>
                    {detail?.last_updated_user?.username} - {detail?.last_updated_user?.display_name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Access */}
      <ExamAccess
        show={showDrawerAccess}
        setShow={setShowDrawerAccess}
        learningProgramId={Number(id)}
        title={`${detail?.learning_program_code} - 
                        ${detail?.learning_program_name}`}
      />
      {/* Complete exercise */}
      <ExamComplete
        show={showDrawerCompleteExercise}
        setShow={setShowDrawerCompleteExercise}
        learningProgramId={Number(id)}
        title={`${detail?.learning_program_code} - 
                        ${detail?.learning_program_name}`}
      />

      {/* Rate count */}
      <ExamRate
        show={showDrawerVote}
        setShow={setShowDrawerVote}
        learningProgramId={Number(id)}
        title={`${detail?.learning_program_code} - 
                        ${detail?.learning_program_name}`}
      />
    </div>
  );
};

export default CurriculumDetail;
