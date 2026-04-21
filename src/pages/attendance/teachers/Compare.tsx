import { useEffect, useState } from 'react';
import { useT } from '@hooks/useT';
import { Button } from '@components/ui/button';
import { AVATAR, DELETE_04, DOWNLOAD_ICON, EDIT_02, IMAGE_ICON, SETTING_01, UPLOAD_EXCEL } from '@lib/ImageHelper';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextInput from '@components/fields/TextInput';
import TextAreaInput from '@components/fields/TextAreaInput';
import SearchInput from '@components/fields/SearchInput';
import SelectInput from '@components/fields/SelectInput';
import SwitchInput from '@components/fields/SwitchInput';
import CalendarCustom from '@components/calendarUI/index';
import { TypeErrors } from '@/src/interface';
import SubjectsSelect from '@components/selects/SubjectsSelect';
import TeachingLocationSelect from '@components/selects/TeachingLocationSelect';
import CLassroomSelect from '@components/selects/ClassroomSelect';
import TeacherSelect from '@components/selects/TeacherSelect';
import TimeInput from '@components/fields/TimeInput';
import NumberInput from '@components/fields/NumberInput';
import Upload, { UploadTrigger } from '@components/upload';
import Icon from '@components/Icon';
import UsersSelect from '@components/selects/UsersSelect';
import { cloneDeep, has, isEmpty } from 'lodash';
import { X } from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import attendanceServices from '@services/attendance';
import { Toast } from '@components/toast';
import dayjs from 'dayjs';
import { calculateTimeDifference, convertStringToUnixTimeStamp, getCurrentTimestamp } from '@lib/TimeHelper';
import PeriodSelect from '@components/selects/PeriodSelect';
import Loading from '@components/loading';
interface Props {}

const Compare = (props: Props) => {
  const { id, log_id } = useParams();
  const { t } = useT();
  const [formData, setFormData] = useState<any>({
    classroom_id: null,
    checkin_timestamp: null,
    checkout_timestamp: null,
    attendance_time: getCurrentTimestamp()
  });
  const [logVersion, setLogVerSion] = useState<any>({});
  const [newestVersion, setNewestVersion] = useState<any>({});
  const [differences, setDifferences] = useState<any>({});
  const [errors, setErrors] = useState<TypeErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [version, setVersion] = useState<'new' | 'old'>('new');

  const getDataCompare = async () => {
    setLoading(true);
    try {
      const response: any = await attendanceServices.getTeacherAttendancesLogCompare(Number(id), Number(log_id));
      setLogVerSion(response?.log_version);
      setNewestVersion(response?.newest_version);
      setFormData(response?.newest_version);
      setDifferences(response?.differences);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkKeyDiff = (key: string) => {
    let text_class = 'text-primary-neutral-900 font-normal';
    if (version == 'new') {
      if (has(differences, key)) {
        text_class = 'text-primary-success font-semibold';
      }
    } else {
      if (has(differences, key)) {
        text_class = 'text-primary-error font-semibold';
      }
    }
    return text_class;
  };

  useEffect(() => {
    if (Number(id) && Number(log_id)) {
      getDataCompare();
    }
  }, [id]);

  return (
    <>
      <Loading loading={loading} />
      <div className='pb-20'>
        <div className='shadow-lg card bg-primary-neutral-50 '>
          <div className='flex items-center justify-between py-2.5 px-6 text-neutral-50 bg-primary-blue-500 card-header'>
            <h3 className='text-base font-semibold leading-[100%]'>{t('assistant_attendance')}</h3>
            <div className='flex items-center gap-2'>
              <Button
                className={`${version == 'new' ? 'bg-primary-success text-white hover:bg-primary-success hover:text-white' : 'bg-white text-primary-neutral-900 hover:bg-white hover:text-primary-neutral-900'}`}
                size={'sm'}
                onClick={() => {
                  setFormData(newestVersion);
                  setVersion('new');
                }}
              >
                {t('new_version')}
              </Button>
              <Button
                className={`${version == 'old' ? 'bg-primary-success text-white hover:bg-primary-success hover:text-white' : 'bg-white text-primary-neutral-900 hover:bg-white hover:text-primary-neutral-900'}`}
                size={'sm'}
                onClick={() => {
                  setFormData(logVersion);
                  setVersion('old');
                }}
              >
                {t('old_version')}
              </Button>
            </div>
          </div>
          <div className='p-6 card-body'>
            <div className='flex gap-9'>
              <div className='w-[310px]'>
                <div className='p-2 space-y-4 border rounded-lg border-primary-neutral-300 mb-6 '>
                  <CalendarCustom
                    value={formData?.attendance_time}
                    className='px-2 pt-2 pb-0'
                    onChange={(value) => {}}
                  />
                </div>
                <div className='p-2 space-y-4 rounded-lg'>
                  <div className='w-full'>
                    <SubjectsSelect
                      disabled
                      required
                      label={t('subject')}
                      value={formData?.subject_id}
                      error={errors?.subject_id}
                      onChange={(val) => {}}
                    />
                  </div>
                  <div className='full'>
                    <TeachingLocationSelect
                      disabled
                      required
                      label={t('teaching_location')}
                      error={errors?.location_id}
                      value={formData?.location_id}
                      onChange={(val) => {}}
                    />
                  </div>
                  <div className='full'>
                    <CLassroomSelect
                      label={t('classroom')}
                      disabled
                      required
                      error={errors?.classroom_id}
                      locationId={formData?.location_id}
                      subjectId={formData?.subject_id}
                      value={formData?.classroom_id}
                      onChange={(val) => {}}
                    />
                  </div>
                  <div className='full'>
                    <PeriodSelect
                      menuPlacement='top'
                      disabled
                      required
                      label={t('period')}
                      value={formData?.timeline_id}
                      onChange={(value) => {}}
                      classroomId={formData?.classroom_id}
                    />
                  </div>
                </div>
              </div>
              <div className='flex-1 space-y-6'>
                <div className='w-full border border-primary-neutral-300 card'>
                  <div className='border-b card-header text-primary-blue-600 border-primary-neutral-300 bg-primary-blue-50'>
                    <h3 className='text-base font-semibold leading-[100%]'>{t('working_time')}</h3>
                  </div>
                  <div className='p-6 card-body'>
                    <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                      <div className='grid grid-cols-2 gap-6'>
                        <div className='col-span-2'>
                          <p className={`${checkKeyDiff(`teacher_id`)} text-sm mb-2`}>{t('teachers')}</p>
                          <UsersSelect
                            disabled
                            value={formData?.teacher_id}
                            error={errors?.teacher_id}
                            onChange={(val) => {}}
                            role='TEACHER'
                          />
                        </div>
                        {/* <div>
                          <p className={`${checkKeyDiff(`start_time`)} text-sm mb-2`}>{t('start_time')}</p>
                          <TimeInput
                            disabled
                            value={convertStringToUnixTimeStamp(formData?.start_time)}
                            error={errors?.start_time}
                            onChange={(val) => {}}
                          />
                        </div>

                        <div>
                          <p className={`${checkKeyDiff(`end_time`)} text-sm mb-2`}>{t('end_time')}</p>
                          <TimeInput
                            disabled
                            value={convertStringToUnixTimeStamp(formData?.end_time)}
                            error={errors?.end_time}
                            onChange={(val) => {}}
                          />
                        </div>

                        <div className='flex items-center justify-between border border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 w-full rounded p-2'>
                          <PhotoProvider>
                            <PhotoView src={formData?.checkin_timestamp}>
                              <div className='flex items-center gap-2'>
                                <Icon icon={IMAGE_ICON} className='text-primary-blue-500 size-5 min-w-5' />
                                <p className='text-primary-blue-500 cursor-pointer line-clamp-1'>
                                  {t('checkin_image')}
                                </p>
                              </div>
                            </PhotoView>
                          </PhotoProvider>
                        </div>
                        <div className='flex items-center justify-between border border-primary-blue-500 hover:bg-primary-blue-50 bg-primary-blue-50 w-full rounded p-2'>
                          <PhotoProvider>
                            <PhotoView src={formData?.checkout_timestamp}>
                              <div className='flex items-center gap-2 '>
                                <Icon icon={IMAGE_ICON} className='text-primary-blue-500 size-5  min-w-5' />
                                <p className='text-primary-blue-500 cursor-pointer line-clamp-1'>
                                  {t('checkout_image')}
                                </p>
                              </div>
                            </PhotoView>
                          </PhotoProvider>
                        </div>

                        <NumberInput
                          label={t('total_minutes_taught')}
                          disabled
                          value={
                            calculateTimeDifference(
                              dayjs.unix(formData?.start_time).format('hh:mm'),
                              dayjs.unix(formData?.end_time).format('hh:mm')
                            )?.minutes
                          }
                        />
                        <NumberInput
                          label={t('total_hours_taught')}
                          disabled
                          value={
                            calculateTimeDifference(
                              dayjs.unix(formData?.start_time).format('hh:mm'),
                              dayjs.unix(formData?.end_time).format('hh:mm')
                            )?.hours
                          }
                        /> */}
                      </div>

                      <div className=''>
                        <p className={`${checkKeyDiff(`note`)} text-sm mb-2`}>
                          {t('personal_report_notes')}
                          <span className='text-primary-error'> *</span>
                        </p>
                        <TextAreaInput
                          disabled
                          className='border-primary-neutral-200'
                          placeholder={t('enter_description')}
                          rows={11}
                          value={formData?.note}
                          error={errors?.note}
                          onChange={(value) => {}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Compare;
