import React, { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useT } from '@hooks/useT';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { NO_IMAGE } from '@lib/ImageHelper';
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
import {
  RiArrowLeftLine,
  RiBarChart2Line,
  RiBookOpenLine,
  RiCalendarLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFileTextLine
} from '@remixicon/react';

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

  const statLinkClass =
    'w-min cursor-pointer font-medium text-emerald-700 underline-offset-2 transition-colors hover:text-emerald-900 hover:underline';

  return (
    <div className='pb-24'>
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
      <div className='mx-auto max-w-6xl'>
        <div className='overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-violet-200 bg-violet-50 px-5 py-4'>
            <div className='min-w-0'>
              <p className='text-xs font-medium uppercase tracking-wide text-violet-600'>
                {t('detailed_curriculum_info')}
              </p>
              <h3 className='mt-0.5 truncate text-xl font-semibold text-slate-800'>
                {detail?.learning_program_name} — {detail?.learning_program_code}
              </h3>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              {!!permissions.CREATE_STUDY_PROGRAM && (
                <Button
                  variant='outline'
                  className='rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
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
                  variant='ghost'
                  size='icon'
                  className='rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  title={t('delete')}
                  onClick={() => {
                    setIsShowConfirm(true);
                  }}
                >
                  <RiDeleteBin6Line className='size-5' />
                </Button>
              )}
              {detail?.user_ability?.can_edit == 1 && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  title={t('edit')}
                  onClick={() => {
                    navigate('/curriculum/edit/' + id);
                  }}
                >
                  <RiEdit2Line className='size-5' />
                </Button>
              )}
            </div>
          </div>

          <div className='p-5 lg:p-6'>
            <div className='flex flex-col gap-8 lg:flex-row lg:gap-9'>
              <div className='mx-auto w-full max-w-[280px] shrink-0 lg:mx-0'>
                <div className='overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/40 p-4 shadow-sm'>
                  <div className='mb-3 overflow-hidden rounded-xl border border-violet-100 bg-white'>
                    <img
                      className='aspect-square w-full object-cover'
                      src={detail?.avatar || NO_IMAGE}
                      alt=''
                    />
                  </div>
                  <div className='space-y-2 text-center'>
                    <div className='text-sm font-semibold text-slate-800'>
                      {detail?.learning_program_name} — {detail?.learning_program_code}
                    </div>
                    <div className='text-xs text-slate-500'>
                      {getSubjectInfo(detail?.subject_id)?.subject_name} —{' '}
                      {getSubjectInfo(detail?.subject_id)?.subject_code}
                    </div>
                  </div>
                </div>
              </div>

              <div className='min-w-0 flex-1 space-y-6'>
                <div className='flex flex-col gap-6 lg:flex-row'>
                  <div className='min-w-0 flex-1 lg:w-3/5'>
                    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                      <div className='flex items-center gap-2 border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                        <RiBookOpenLine className='size-4 text-violet-600' />
                        <h3 className='text-base font-semibold text-violet-900'>{t('curriculum_info')}</h3>
                      </div>
                      <div className='flex-1 p-5 lg:p-6'>
                        <div className='grid gap-y-4 text-sm'>
                          <div className='grid grid-cols-[160px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('curriculum_name')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.learning_program_name}</div>
                          </div>
                          <div className='grid grid-cols-[160px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('curriculum_code')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.learning_program_code}</div>
                          </div>
                          <div className='grid grid-cols-[160px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('subject')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='flex items-center gap-2 text-slate-800'>
                              {getSubjectInfo(detail?.subject_id)?.subject_name} —{' '}
                              {getSubjectInfo(detail?.subject_id)?.subject_code}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='min-w-0 lg:w-2/5'>
                    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm'>
                      <div className='flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/90 px-4 py-3'>
                        <RiBarChart2Line className='size-4 text-emerald-700' />
                        <h3 className='text-base font-semibold text-emerald-900'>{t('curriculum_content')}</h3>
                      </div>
                      <div className='flex-1 p-5 lg:p-6'>
                        <div className='grid gap-y-4 text-sm'>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('number_of_exercises')}</div>
                            <div className='text-slate-400'>:</div>
                            {currentUser?.user_job_title === USER_ROLE.STUDENT ? (
                              <div className={statLinkClass}>{detail?.statistic?.exercise_count || 0}</div>
                            ) : (
                              <Link
                                to={'/exercise/list'}
                                onClick={() => {
                                  sessionStorage.setItem('curriculum_id', detail?.id);
                                }}
                                className={statLinkClass}
                              >
                                {detail?.statistic?.exercise_count || 0}
                              </Link>
                            )}
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('number_of_questions')}</div>
                            <div className='text-slate-400'>:</div>
                            <div className='text-slate-800'>{detail?.statistic?.question_count || 0}</div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('access_count')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setShowDrawerAccess(true);
                              }}
                            >
                              {detail?.statistic?.access_count || 0}
                            </div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('exercise_completion_count')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
                              onClick={() => {
                                setShowDrawerCompleteExercise(true);
                              }}
                            >
                              {detail?.statistic?.submission_count || 0}
                            </div>
                          </div>
                          <div className='grid grid-cols-[170px_30px_1fr] gap-y-1'>
                            <div className='text-slate-500'>{t('rating_count')}</div>
                            <div className='text-slate-400'>:</div>
                            <div
                              className={statLinkClass}
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
                </div>

                <div className='overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 shadow-sm'>
                  <div className='flex items-center gap-2 border-b border-rose-100 bg-rose-50/90 px-4 py-3'>
                    <RiFileTextLine className='size-4 text-rose-700' />
                    <h3 className='text-base font-semibold text-rose-900'>{t('learning_program_description')}</h3>
                  </div>
                  <div className='p-5 lg:p-6'>
                    <div
                      className='rounded-xl border border-white/80 bg-white/70 p-4 text-sm text-slate-800 break-words'
                      dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(detail?.description) }}
                    />
                  </div>
                </div>

                <div className='overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm'>
                  <div className='flex items-center gap-2 border-b border-violet-100 bg-violet-50/90 px-4 py-3'>
                    <RiCalendarLine className='size-4 text-violet-600' />
                    <h3 className='text-base font-semibold text-violet-900'>{t('update_time')}</h3>
                  </div>
                  <div className='p-5 lg:p-6'>
                    <div className='grid gap-y-4 text-sm'>
                      <div className='grid grid-cols-[160px_30px_1fr] gap-y-1'>
                        <div className='text-slate-500'>{t('update_time')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {convertTimestampToString(detail?.updated_at, 'right')}
                        </div>
                      </div>
                      <div className='grid grid-cols-[160px_30px_1fr] gap-y-1'>
                        <div className='text-slate-500'>{t('updated_by')}</div>
                        <div className='text-slate-400'>:</div>
                        <div className='text-slate-800'>
                          {detail?.last_updated_user?.username} - {detail?.last_updated_user?.display_name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end pt-1'>
                  <Button
                    className='rounded-xl bg-emerald-500 px-6 text-white shadow-sm hover:bg-emerald-600'
                    onClick={() => {
                      navigate('/curriculum/list');
                    }}
                  >
                    <RiArrowLeftLine className='size-4' />
                    {t('close')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExamAccess
        show={showDrawerAccess}
        setShow={setShowDrawerAccess}
        learningProgramId={Number(id)}
        title={`${detail?.learning_program_code} - 
                        ${detail?.learning_program_name}`}
      />
      <ExamComplete
        show={showDrawerCompleteExercise}
        setShow={setShowDrawerCompleteExercise}
        learningProgramId={Number(id)}
        title={`${detail?.learning_program_code} - 
                        ${detail?.learning_program_name}`}
      />
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
