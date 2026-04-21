import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '@components/loading';
import AVATAR from '@assets/images/avatar.png';
import { isEmpty } from 'lodash';
import EmptyTable from '@components/empty/EmptyTable';
import { useT } from '@hooks/useT';
import { ChartConfig, ChartContainer } from '@components/ui/chart';
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import Icon from '@components/Icon';
import { CANCEL_ICON, IDEA_ICON, TICK_ICON } from '@lib/ImageHelper';
import { MOCK_DATA, ORDERING } from '../Exercise/constant';
import { QuestionsTypeOptions } from '@components/selects/QuestionsTypeSelect';
import PreviewExercise from '@components/file/PreviewExerciseFile';
import { removeInlineStyles } from '@lib/DomHelper';
import { getLetterByIndex } from '@lib/StringHelper';
import reportExamServices from '@services/reportExam';
import { getUserInfo } from '@lib/GetInfoHelper';
import { MATCHING, FILL_IN_THE_BLANK, MULTIPLE_CHOICE } from '@pages/Exercise/constant';
import { convertTimestampToString } from '@lib/TimeHelper';

const DetailExerciseReport = () => {
  const { exam_id, student_id } = useParams();
  const { t } = useT();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const chartConfig = {
    visitors: {
      label: 'Visitors'
    }
  } satisfies ChartConfig;

  const getData = async () => {
    setLoading(true);
    try {
      const res: any = await reportExamServices.getExamSubmission({
        student_id: student_id,
        exam_id: exam_id
      });
      setData(res);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    Number(student_id) && Number(exam_id) && getData();
  }, [student_id, exam_id]);

  return (
    <div className='p-6 bg-white rounded-lg shadow-lg'>
      <Loading loading={loading} />
      <div className='py-3 flex justify-between border-b'>
        <div className=''>
          <div className='flex items-center gap-2 mb-2'>
            <img src={getUserInfo(Number(student_id))?.avatar} className='size-7 min-w-7 rounded-full object-cover' />
            <p className='text-lg font-semibold'>
              {getUserInfo(Number(student_id))?.display_name} - {getUserInfo(Number(student_id))?.username}
            </p>
          </div>
          <p className='text-sm font-medium'>
            {t('submission_time')}: {convertTimestampToString(data?.submission?.created_at, 'right')}
          </p>
        </div>
        <p className='text-lg font-semibold'>
          {data?.exam?.exercise?.exercise_name} - {data?.exam?.exercise?.exercise_code}
        </p>
      </div>
      {!isEmpty(data?.submissions) ? (
        <div className='py-6'>
          <div className='grid grid-cols-[250px,250px,250px,1fr] gap-6 pb-6'>
            <div className='min-h-[140px] border rounded-lg flex items-center justify-center flex-col p-3'>
              <ChartContainer
                config={chartConfig}
                className={` aspect-square max-h-[100px]  w-full mb-2 ml-32 ${
                  (data?.statistic?.total_correct / data?.statistic?.total_answers) * 100 < 50
                    ? 'fill-[#F7493E]'
                    : (data?.statistic?.total_correct / data?.statistic?.total_answers) * 100 < 80
                      ? 'fill-[#EC8C56]'
                      : 'fill-[#2775FF]'
                }`}
              >
                <RadialBarChart
                  data={[{ visitors: (data?.statistic?.total_correct / data?.statistic?.total_answers) * 100 }]}
                  startAngle={0}
                  endAngle={3.6 * ((data?.statistic?.total_correct / data?.statistic?.total_answers) * 100)}
                  innerRadius={80}
                  outerRadius={110}
                  style={{ maxWidth: 100, maxHeight: 100 }}
                >
                  <PolarGrid
                    gridType='circle'
                    radialLines={false}
                    stroke='none'
                    className={`${
                      (data?.statistic?.total_correct / data?.statistic?.total_answers) * 100 < 50
                        ? 'first:fill-[#FDC8C5]'
                        : (data?.statistic?.total_correct / data?.statistic?.total_answers) * 100 < 80
                          ? 'first:fill-[#F9DCCC]'
                          : 'first:fill-[#91B9FF]'
                    } last:fill-background`}
                    polarRadius={[86, 74]}
                  />
                  <RadialBar dataKey='visitors' background cornerRadius={10} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                              <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-4xl font-bold'>
                                {(
                                  (data?.statistic?.total_correct / data?.statistic?.total_answers) *
                                  100
                                )?.toLocaleString()}
                                %
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
              <p className='text-center text-sm font-medium'>{t('correct_ratio')}</p>
            </div>
            <div className='min-h-[140px] border rounded-lg flex items-center justify-center flex-col p-3'>
              <p className='text-2xl font-semibold  mb-7'>
                {data?.statistic?.total_correct}/
                <span className='text-sm font-medium'>{data?.statistic?.total_answers}</span>
              </p>
              <p className='text-center text-sm font-medium'>{t('correct_answer')}</p>
            </div>
            <div className='min-h-[140px] border rounded-lg flex items-center justify-center flex-col p-3'>
              <p className='text-2xl font-semibold  mb-7'>{data?.statistic?.total_score}</p>
              <p className='text-center text-sm font-medium'>{t('_score')}</p>
            </div>
            <div className='min-h-[140px] border rounded-lg min-w-96'>
              <div className='py-2 border-b'>
                <p className='text-center text-sm font-medium'>{t('teacher_comment')}</p>
              </div>
              <div className='px-4 py-2'>
                <div
                  className='text-sm font-medium break-words'
                  dangerouslySetInnerHTML={{ __html: data?.submission?.note }}
                />
              </div>
            </div>
          </div>
          {!isEmpty(data?.submissions) ? (
            <div className='py-6'>
              {data?.submissions?.length > 0 ? (
                <div className='space-y-6'>
                  {data?.submissions?.map((submission: any, index: number) => {
                    const questionType = QuestionsTypeOptions.find(
                      (type) => type.value === submission?.question?.question_type
                    );
                    return (
                      <div className='p-4 border rounded-lg' key={index}>
                        <div className='flex items-center gap-2 mb-6'>
                          <div
                            className={`rounded-sm px-4 py-[11px] ${submission?.unanswered == 1 ? 'bg-primary-neutral-200' : submission?.is_correct ? 'bg-[#E4FFE9]' : 'bg-[#FFDDDA]'} flex items-center gap-1`}
                          >
                            {submission?.unanswered == 1 ? (
                              <p className='text-primary-neutral-500 text-xs'>!</p>
                            ) : (
                              <Icon
                                icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                size={16}
                              />
                            )}

                            <p
                              className={`${
                                submission?.unanswered == 1
                                  ? 'text-primary-neutral-500'
                                  : submission?.is_correct
                                    ? 'text-primary-success'
                                    : 'text-primary-error'
                              }  text-xs`}
                            >
                              {t(
                                submission?.unanswered == 1
                                  ? 'not_done'
                                  : submission?.is_correct
                                    ? '_correct'
                                    : '_incorrect'
                              )}
                            </p>
                          </div>
                          <div className='px-3 py-2 rounded-sm border border-primary-neutral-300 flex items-center gap-2 '>
                            <img src={questionType?.icon} />
                            <p className='text-sm font-medium'>{questionType?.label}</p>
                          </div>
                          <div className='px-3 py-2 rounded-sm border border-primary-neutral-300 flex items-center gap-2 '>
                            <p className='text-sm font-medium'>
                              {submission?.score} {t('score').toLocaleLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className='flex mb-3 gap-3 space-y-3'>
                          {submission?.question?.question_file?.url && (
                            <PreviewExercise
                              file={submission?.question?.question_file}
                              className={`  rounded-lg flex items-center justify-center ${submission?.question?.question_file?.type == 'audio' ? 'w-[300px]' : submission?.question?.question_file?.type == 'video' ? 'w-[250px] h-[170px]' : 'w-[118px] h-[81px]'}`}
                              audioClassName=''
                            />
                          )}
                          <div
                            className='text-sm font-medium text-primary-neutral-900 no-underline not-italic'
                            dangerouslySetInnerHTML={{
                              __html: removeInlineStyles(submission?.question?.question_title)
                            }}
                          />
                        </div>
                        {submission?.question?.question_type === MULTIPLE_CHOICE ? (
                          <div className='flex items-center w-full'>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-neutral-500'>{t('your_answer')}</p>
                              {submission?.answer ? (
                                submission?.question?.multiple_choice_answers?.options
                                  ?.filter((opt: any) => submission?.answer?.includes(opt?.id))
                                  ?.map((opt: any) => (
                                    <div className=' flex items-center gap-1 w-max mt-3' key={opt?.id}>
                                      <Icon
                                        icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                        className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                        size={16}
                                      />
                                      {opt?.file?.url ? (
                                        <PreviewExercise
                                          isIcon
                                          file={opt?.file}
                                          className='w-min rounded-lg flex items-start mt-0'
                                          imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                          audioClassName='h-min'
                                        />
                                      ) : (
                                        <div
                                          className=' text-sm'
                                          dangerouslySetInnerHTML={{ __html: removeInlineStyles(opt?.answer_title) }}
                                        />
                                      )}
                                    </div>
                                  ))
                              ) : (
                                <p className='text-sm'>{t('no_answer_yet')}</p>
                              )}
                            </div>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-success'>{t('correct_answer_')}</p>
                              {submission?.question?.multiple_choice_answers?.options
                                ?.filter((opt: any) => opt?.is_correct_answer)
                                ?.map((opt: any) => (
                                  <div className=' flex items-center gap-1 w-max mt-3' key={opt?.id}>
                                    <Icon icon={TICK_ICON} className={`text-primary-success `} size={16} />
                                    {opt?.file?.url ? (
                                      <PreviewExercise
                                        isIcon
                                        file={opt?.file}
                                        className='w-min rounded-lg flex items-start mt-0'
                                        imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                        audioClassName='h-min '
                                      />
                                    ) : (
                                      <div
                                        className=' text-sm'
                                        dangerouslySetInnerHTML={{
                                          __html: removeInlineStyles(opt?.answer_title || '')
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : submission?.question?.question_type === FILL_IN_THE_BLANK ? (
                          <div className='flex items-center w-full'>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-neutral-500'>{t('your_answer')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                {submission?.answer ? (
                                  <>
                                    {' '}
                                    <Icon
                                      icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                      className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                      size={16}
                                    />
                                    <div
                                      className=' text-sm'
                                      dangerouslySetInnerHTML={{ __html: removeInlineStyles(submission?.answer || '') }}
                                    />
                                  </>
                                ) : (
                                  <p className='text-sm'>{t('no_answer_yet')}</p>
                                )}
                              </div>
                            </div>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-success'>{t('correct_answer_')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                <Icon icon={TICK_ICON} className={`text-primary-success `} size={16} />
                                <div
                                  className=' text-sm'
                                  dangerouslySetInnerHTML={{
                                    __html: removeInlineStyles(submission?.question?.fill_in_the_blank?.answer_title)
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : submission?.question?.question_type === MATCHING ? (
                          <>
                            <table className='mt-5 table-rounded ' style={{ boxShadow: 'none' }}>
                              <thead>
                                <tr className='bg-primary-blue-50'>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('question')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('your_answer')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('correct_answer_')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='bg-white'>
                                {submission?.question?.matching?.options?.length > 0 ? (
                                  submission?.question?.matching?.options?.map((opt: any, idx: any) => {
                                    const student_desc_answer = submission?.question?.matching?.descriptions?.find(
                                      (desc: any) => {
                                        const stu_answer_id = submission?.answer?.find(
                                          (an: any) => an?.top == opt?.id
                                        )?.bottom;
                                        return desc?.id == stu_answer_id;
                                      }
                                    );
                                    const correct_student_answer =
                                      student_desc_answer?.answer_id ==
                                      submission?.question?.matching?.descriptions[idx]?.answer_id;

                                    return (
                                      <tr key={idx}>
                                        {/* câu hỏi */}
                                        <td className='text-left'>
                                          {opt?.file?.url ? (
                                            <PreviewExercise
                                              isIcon
                                              file={opt?.file}
                                              imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                              className='flex items-center w-min mx-auto'
                                              audioClassName='mx-0'
                                            />
                                          ) : (
                                            <div
                                              className='text-sm font-medium text-primary-neutral-900 no-underline not-italic mt-0.5'
                                              dangerouslySetInnerHTML={{
                                                __html: removeInlineStyles(opt?.answer_title)
                                              }}
                                            />
                                          )}
                                        </td>

                                        {/* câu tl học sinh */}
                                        <td
                                          className={`text-center ${!student_desc_answer?.answer_id ? '' : correct_student_answer ? 'text-primary-success' : 'text-primary-error'}`}
                                        >
                                          {student_desc_answer?.answer_id ? (
                                            <div
                                              className={`text-sm font-medium ${correct_student_answer ? 'text-primary-success' : 'text-primary-error'} no-underline not-italic mt-0.5`}
                                              dangerouslySetInnerHTML={{
                                                __html: removeInlineStyles(
                                                  student_desc_answer?.answer_description || ''
                                                )
                                              }}
                                            />
                                          ) : (
                                            <p className='text-sm'>{t('no_answer_yet')}</p>
                                          )}
                                        </td>

                                        {/* câu tl đúng */}
                                        <td className='text-center text-primary-success'>
                                          <div
                                            className='text-sm font-medium text-primary-success no-underline not-italic mt-0.5'
                                            dangerouslySetInnerHTML={{
                                              __html: removeInlineStyles(
                                                submission?.question?.matching?.descriptions[idx]?.answer_description
                                              )
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td>
                                      <EmptyTable />
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </>
                        ) : submission?.question?.question_type === ORDERING ? (
                          <>
                            <table className='mt-5 table-rounded ' style={{ boxShadow: 'none' }}>
                              <thead>
                                <tr className='bg-primary-blue-50'>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('question')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('your_answer')}
                                  </th>
                                  <th scope='col' className='w-1/3' style={{ backgroundColor: 'white' }}>
                                    {t('correct_answer_')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='bg-white'>
                                {submission?.question?.sort?.descriptions?.length > 0 ? (
                                  submission?.question?.sort?.descriptions?.map((desc: any, idx: any) => {
                                    const match_opt_id = submission?.answer?.matches
                                      ?.find((match: string) => match?.split('|-|')?.[1] == desc?.id)
                                      ?.split('|-|')?.[0];
                                    const opt_matched = submission?.question?.sort?.options?.find(
                                      (opt: any) => opt?.id == match_opt_id
                                    );
                                    const correct_student_answer =
                                      match_opt_id == submission?.question?.sort?.options[idx]?.id;

                                    return (
                                      <tr key={idx}>
                                        {/* câu hỏi */}
                                        <td className='text-left'>
                                          <div
                                            className='text-sm font-medium text-primary-neutral-900 no-underline not-italic mt-0.5'
                                            dangerouslySetInnerHTML={{
                                              __html: removeInlineStyles(desc?.answer_description)
                                            }}
                                          />
                                        </td>

                                        {/* câu tl học sinh */}
                                        <td className='text-center'>
                                          <>
                                            {match_opt_id ? (
                                              <>
                                                {opt_matched?.file?.url ? (
                                                  <PreviewExercise
                                                    isIcon
                                                    file={opt_matched?.file}
                                                    imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                                    className='flex items-center w-min mx-auto'
                                                    audioClassName='mx-0'
                                                  />
                                                ) : (
                                                  <div
                                                    className={`text-sm font-medium ${correct_student_answer ? 'text-primary-success' : 'text-primary-error'} no-underline not-italic mt-0.5`}
                                                    dangerouslySetInnerHTML={{
                                                      __html: removeInlineStyles(opt_matched?.answer_title || '')
                                                    }}
                                                  />
                                                )}
                                              </>
                                            ) : (
                                              <p className='text-sm'>{t('no_answer_yet')}</p>
                                            )}
                                          </>
                                        </td>

                                        {/* câu tl đúng */}
                                        <td className='text-center'>
                                          {submission?.question?.sort?.options[idx]?.file?.url ? (
                                            <PreviewExercise
                                              isIcon
                                              file={submission?.question?.sort?.options[idx]?.file}
                                              imageClassName='h-[81px] w-[118px] min-w-[118px]'
                                              className='flex items-center w-min mx-auto'
                                              audioClassName='mx-0'
                                            />
                                          ) : (
                                            <div
                                              className='text-sm font-medium text-primary-success no-underline not-italic mt-0.5'
                                              dangerouslySetInnerHTML={{
                                                __html: removeInlineStyles(
                                                  submission?.question?.sort?.options[idx]?.answer_title
                                                )
                                              }}
                                            />
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td>
                                      <EmptyTable />
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </>
                        ) : (
                          <div className='flex items-center w-full'>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-neutral-500'>{t('your_answer')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                {submission?.answer ? (
                                  <>
                                    {' '}
                                    <Icon
                                      icon={submission?.is_correct ? TICK_ICON : CANCEL_ICON}
                                      className={`${submission?.is_correct ? 'text-primary-success' : 'text-primary-error'} `}
                                      size={16}
                                    />
                                    <p className='text-sm font-medium'>
                                      {submission?.answer?.map((word: any) => {
                                        const title = submission?.question?.reverse_word?.options?.find(
                                          (val: any) => val?.id === word?.id
                                        )?.answer_title;
                                        return <span key={word?.id}>{title} </span>;
                                      })}
                                    </p>
                                  </>
                                ) : (
                                  <p className='text-sm'>{t('no_answer_yet')}</p>
                                )}
                              </div>
                            </div>
                            <div className='w-1/2'>
                              <p className='text-sm font-medium text-primary-success'>{t('correct_answer_')}</p>
                              <div className=' flex items-center gap-1 w-max mt-3'>
                                <Icon icon={TICK_ICON} className={`text-primary-success `} size={16} />
                                <p className='text-sm font-medium'>
                                  {submission?.question?.reverse_word?.options?.map((word: any) => {
                                    return <span key={word?.id}>{word?.answer_title} </span>;
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className='flex gap-2 mt-2'>
                          <div className='flex items-center gap-1'>
                            <Icon icon={IDEA_ICON} className='text-primary-neutral-900' />
                            <p className='text-sm font-medium'>{t('answer_explanation')}: </p>
                          </div>
                          <div className='flex gap-3 items-start'>
                            {submission?.question?.answer_explanation?.explain_file?.url && (
                              <PreviewExercise
                                isIcon
                                file={submission?.question?.answer_explanation?.explain_file}
                                className='h-[32px] w-[32px] rounded-lg flex items-center justify-center'
                              />
                            )}
                            <div
                              className='text-sm font-medium text-primary-neutral-900 no-underline not-italic leading-9'
                              dangerouslySetInnerHTML={{
                                __html: removeInlineStyles(
                                  submission?.question?.answer_explanation?.explain_description
                                )
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyTable />
              )}
            </div>
          ) : (
            <EmptyTable note={t('teacher_not_graded')} />
          )}
        </div>
      ) : (
        <EmptyTable note={t('teacher_not_graded')} />
      )}
    </div>
  );
};

export default DetailExerciseReport;
