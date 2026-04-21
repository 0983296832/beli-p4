import { useRootStore } from '@store/index';
import { useState } from 'react';
import { useT } from '@hooks/useT';
import AdministratorList from '../users/administrator/AdministratorList';
import TeachersList from '../users/teacher/TeachersList';
import StudentsList from '../users/students/StudentsList';
import TeacherAssistantList from '../users/teacher_assistant/TeacherAssistantList';
import StudySchedule from '../StudySchedule';
import ExamList from '../Exercise/StudentExams';
import { USER_ROLE } from '@constants/index';

interface Props {}

const Home = (props: Props) => {
  const { t } = useT();
  const { permissions, currentUser } = useRootStore();

  return (
    <div className='space-y-6'>
      {currentUser?.user_job_title === USER_ROLE?.OWNER ? (
        <AdministratorList />
      ) : currentUser?.user_job_title === USER_ROLE?.ADMIN ? (
        <TeachersList />
      ) : currentUser?.user_job_title === USER_ROLE?.TEACHER ? (
        <StudySchedule />
      ) : currentUser?.user_job_title === USER_ROLE?.TA ? (
        <StudySchedule />
      ) : (
        <ExamList />
      )}
    </div>
  );
};

export default Home;
