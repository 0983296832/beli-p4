import { Helmet, HelmetProvider } from 'react-helmet-async';
import { HashRouter, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useRootStore } from '@store/index';
import { USER_ROLE } from '@constants/index';
import VerifyGuard from './VerifyGuard';

const Home = lazy(() => import('@pages/Home'));
const Login = lazy(() => import('@pages/Login'));
const ForgotPassword = lazy(() => import('@pages/ForgotPassword'));
const ProtectedRoute = lazy(() => import('./ProtectedRoute'));

//User - profile
const Profile = lazy(() => import('@pages/profile'));

//User - verify account
const VerifyAccount = lazy(() => import('@pages/VerifyAccount'));

// User - Administrator
const AdministratorList = lazy(() => import('@pages/users/administrator/AdministratorList'));
const AdministratorAdd = lazy(() => import('@pages/users/administrator/AdministratorAdd'));
const AdministratorDetail = lazy(() => import('@pages/users/administrator/AdministratorDetail'));
const AdministratorAddBulk = lazy(() => import('@pages/users/administrator/AdministratorAddBulk'));

// User - Teacher
const TeachersList = lazy(() => import('@pages/users/teacher/TeachersList'));
const TeacherAdd = lazy(() => import('@pages/users/teacher/TeacherAdd'));
const TeacherDetail = lazy(() => import('@pages/users/teacher/TeacherDetail'));
const TeachersAddBulk = lazy(() => import('@pages/users/teacher/TeachersAddBulk'));

// User - Student
const StudentsList = lazy(() => import('@pages/users/students/StudentsList'));
const StudentAdd = lazy(() => import('@pages/users/students/StudentAdd'));
const StudentDetail = lazy(() => import('@pages/users/students/StudentDetail'));
const StudentsAddBulk = lazy(() => import('@pages/users/students/StudentsAddBulk'));

// User - Teacher Assistant
const TeacherAssistantList = lazy(() => import('@pages/users/teacher_assistant/TeacherAssistantList'));
const TeacherAssistantAdd = lazy(() => import('@pages/users/teacher_assistant/TeacherAssistantAdd'));
const TeacherAssistantDetail = lazy(() => import('@pages/users/teacher_assistant/TeacherAssistantDetail'));
const TeacherAssistantAddBulk = lazy(() => import('@pages/users/teacher_assistant/TeacherAssistantAddBulk'));

// Classroom
const ClassroomList = lazy(() => import('@pages/classroom/ClassroomList'));
const ClassroomAdd = lazy(() => import('@pages/classroom/ClassroomAdd'));
const ClassroomAddBulk = lazy(() => import('@pages/classroom/ClassroomAddBulk'));
const ClassroomDetail = lazy(() => import('@pages/classroom/ClassroomDetail'));
const ClassroomSetting = lazy(() => import('@pages/classroom/ClassroomSetting'));

// Subjects
const SubjectsList = lazy(() => import('@pages/subjects/SubjectsList'));
const SubjectAdd = lazy(() => import('@pages/subjects/SubjectAdd'));
const SubjectsAddBulk = lazy(() => import('@pages/subjects/SubjectsAddBulk'));
const SubjectDetail = lazy(() => import('@pages/subjects/SubjectDetail'));

// Locations
const LocationsList = lazy(() => import('@pages/locations/LocationsList'));
const LocationDetail = lazy(() => import('@pages/locations/LocationDetail'));
const LocationAdd = lazy(() => import('@pages/locations/LocationAdd'));
const LocationsAddBulk = lazy(() => import('@pages/locations/LocationsAddBulk'));

// Attendance Students
const AttendanceStudentsList = lazy(() => import('@pages/attendance/students/AttendanceStudentsList'));
const AttendanceStudentDetail = lazy(() => import('@pages/attendance/students/AttendanceStudentDetail'));
const AttendanceStudentEdit = lazy(() => import('@pages/attendance/students/AttendanceStudentEdit'));
const AttendanceStudentCompare = lazy(() => import('@pages/attendance/students/AttendanceCompare'));

// Attendance Teachers
const AttendanceTeacherList = lazy(() => import('@pages/attendance/teachers/index'));
const AttendanceTeacherDetail = lazy(() => import('@pages/attendance/teachers/Detail'));
const AttendanceTeacherEdit = lazy(() => import('@pages/attendance/teachers/Edit'));
const AttendanceTeacherCompare = lazy(() => import('@pages/attendance/teachers/Compare'));

// Attendance Teachers Assistant
const AttendanceTeacherAssistantList = lazy(() => import('@pages/attendance/teacher_assistant/index'));
const AttendanceTeacherAssistantDetail = lazy(() => import('@pages/attendance/teacher_assistant/Detail'));
const AttendanceTeacherAssistantEdit = lazy(() => import('@pages/attendance/teacher_assistant/Edit'));
const AttendanceTeacherAssistantCompare = lazy(() => import('@pages/attendance/teacher_assistant/Compare'));

// Attendance summary
const AttendanceSummary = lazy(() => import('@pages/attendance/summary'));
const AttendanceSummaryDetail = lazy(() => import('@pages/attendance/summary/Detail'));

// Teaching program
const TeachingProgramList = lazy(() => import('@pages/TeachingProgram'));
const TeachingProgramDetail = lazy(() => import('@pages/TeachingProgram/Detail'));
const TeachingProgramEdit = lazy(() => import('@pages/TeachingProgram/Edit'));

//Curriculum
const CurriculumList = lazy(() => import('@pages/Curriculum'));
const CurriculumEdit = lazy(() => import('@pages/Curriculum/Edit'));
const CurriculumDetail = lazy(() => import('@pages/Curriculum/Detail'));

// Exercise Report
const ExerciseReport = lazy(() => import('@pages/ExerciseReport'));
const ExerciseReportSession = lazy(() => import('@pages/ExerciseReport/ReportSession'));
const ExerciseReportSessionByStudent = lazy(() => import('@pages/ExerciseReport/ReportSessionByStudent'));
const ExerciseReportDetail = lazy(() => import('@pages/ExerciseReport/DetailReport'));
const DetailExerciseReport = lazy(() => import('@pages/ExerciseReport/DetailExerciseReport'));

// Exercise
const ExerciseList = lazy(() => import('@pages/Exercise'));
const ExamList = lazy(() => import('@pages/Exercise/StudentExams'));
const ExerciseDetailProgram = lazy(() => import('@pages/Exercise/DetailProgram'));
const ExerciseEdit = lazy(() => import('@pages/Exercise/EditExercise'));
const ExerciseDetail = lazy(() => import('@pages/Exercise/DetailExercise'));

//Practice
const Practice = lazy(() => import('@pages/Practice/index'));
const TryAssignment = lazy(() => import('@pages/Practice/TryAssignment'));
const Exam = lazy(() => import('@pages/Practice/Exam'));
const Training = lazy(() => import('@pages/Practice/Training'));

//Study schedule
const StudySchedule = lazy(() => import('@pages/StudySchedule'));

// Permission
const Permissions = lazy(() => import('@pages/permission'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Group Protected routes together
const ProtectedLayout = () => (
  <ProtectedRoute>
    <VerifyGuard>
      <Outlet />
    </VerifyGuard>
  </ProtectedRoute>
);

const RootRoute = () => {
  const { currentUser, onLogout, permissions } = useRootStore();

  return (
    <HelmetProvider>
      <Helmet>
        <title>VHS Education</title>
        <meta name='description' content='Website quản lý và luyện tập' />
      </Helmet>
      <HashRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/forgot_password' element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route
                path='/'
                element={
                  currentUser?.user_job_title == USER_ROLE.STUDENT ? (
                    <ExamList />
                  ) : currentUser?.user_job_title === USER_ROLE.TEACHER ||
                    currentUser?.user_job_title === USER_ROLE.TA ? (
                    <StudySchedule />
                  ) : (
                    <Home />
                  )
                }
              />
              <Route path='/verify-account' element={<VerifyAccount />} />
              {/* Profile route */}
              <Route path='/profile' element={<Profile />} />
              <Route path='/profile/user/:id' element={<Profile />} />
              {/* Administrator Routes */}
              <Route path='/user/administrator/list' element={<AdministratorList />} />
              <Route path='/user/administrator/add' element={<AdministratorAdd />} />
              <Route path='/user/administrator/edit/:id' element={<AdministratorAdd />} />
              <Route path='/user/administrator/add_bulk' element={<AdministratorAddBulk />} />
              <Route path='/user/administrator/detail/:id' element={<AdministratorDetail />} />
              {/* Teacher Routes */}
              <Route path='/user/teacher/list' element={<TeachersList />} />
              <Route path='/user/teacher/add' element={<TeacherAdd />} />
              <Route path='/user/teacher/edit/:id' element={<TeacherAdd />} />
              <Route path='/user/teacher/add_bulk' element={<TeachersAddBulk />} />
              <Route path='/user/teacher/detail/:id' element={<TeacherDetail />} />
              {/* Student Routes */}
              <Route path='/user/student/list' element={<StudentsList />} />
              <Route path='/user/student/add' element={<StudentAdd />} />
              <Route path='/user/student/edit/:id' element={<StudentAdd />} />
              <Route path='/user/student/add_bulk' element={<StudentsAddBulk />} />
              <Route path='/user/student/detail/:id' element={<StudentDetail />} />
              {/* Teacher Assistant Routes */}
              <Route path='/user/teacher_assistant/list' element={<TeacherAssistantList />} />
              <Route path='/user/teacher_assistant/add' element={<TeacherAssistantAdd />} />
              <Route path='/user/teacher_assistant/edit/:id' element={<TeacherAssistantAdd />} />
              <Route path='/user/teacher_assistant/add_bulk' element={<TeacherAssistantAddBulk />} />
              <Route path='/user/teacher_assistant/detail/:id' element={<TeacherAssistantDetail />} />
              {/* Classroom Routes */}
              <Route path='/classroom/list' element={<ClassroomList />} />
              <Route path='/classroom/add' element={<ClassroomAdd />} />
              <Route path='/classroom/edit/:id' element={<ClassroomAdd />} />
              <Route path='/classroom/add_bulk' element={<ClassroomAddBulk />} />
              <Route path='/classroom/detail/:id' element={<ClassroomDetail />} />
              <Route path='/classroom/setting/:id' element={<ClassroomSetting />} />
              {/* Subjects Routes */}
              <Route path='/subjects/list' element={<SubjectsList />} />
              <Route path='/subjects/add' element={<SubjectAdd />} />
              <Route path='/subjects/edit/:id' element={<SubjectAdd />} />
              <Route path='/subjects/add_bulk' element={<SubjectsAddBulk />} />
              <Route path='/subjects/detail/:id' element={<SubjectDetail />} />
              {/* Locations Routes */}
              <Route path='/locations/list' element={<LocationsList />} />
              <Route path='/locations/add' element={<LocationAdd />} />
              <Route path='/locations/edit/:id' element={<LocationAdd />} />
              <Route path='/locations/add_bulk' element={<LocationsAddBulk />} />
              <Route path='/locations/detail/:id' element={<LocationDetail />} />
              {/* Attendance Students Routes */}
              <Route path='/attendance/students/list' element={<AttendanceStudentsList />} />
              <Route path='/attendance/students/detail/:id' element={<AttendanceStudentDetail />} />
              <Route
                path='/attendance/students/detail-compare/:id/log/:log_id'
                element={<AttendanceStudentCompare />}
              />
              <Route path='/attendance/students/edit/:id' element={<AttendanceStudentEdit />} />
              {/* Attendance Teacher Routes */}
              <Route path='/attendance/teachers/list' element={<AttendanceTeacherList />} />
              <Route path='/attendance/teachers/detail/:id' element={<AttendanceTeacherDetail />} />
              <Route path='/attendance/teachers/edit/:id' element={<AttendanceTeacherEdit />} />
              <Route
                path='/attendance/teachers/detail-compare/:id/log/:log_id'
                element={<AttendanceTeacherCompare />}
              />
              {/* Attendance Teacher Assistant Routes */}
              <Route path='/attendance/teachers_assistant/list' element={<AttendanceTeacherAssistantList />} />
              <Route path='/attendance/teachers_assistant/detail/:id' element={<AttendanceTeacherAssistantDetail />} />
              <Route path='/attendance/teachers_assistant/edit/:id' element={<AttendanceTeacherAssistantEdit />} />
              <Route
                path='/attendance/teachers_assistant/detail-compare/:id/log/:log_id'
                element={<AttendanceTeacherAssistantCompare />}
              />
              {/* Attendance Summary Routes */}
              <Route path='/attendance/summary/list' element={<AttendanceSummary />} />
              <Route path='/attendance/summary/detail/:id' element={<AttendanceSummaryDetail />} />
              {/* Teaching program route */}
              <Route path='/teaching-program/list' element={<TeachingProgramList />} />
              <Route path='/teaching-program/detail/:id' element={<TeachingProgramDetail />} />
              <Route path='/teaching-program/edit/:id' element={<TeachingProgramEdit />} />

              {/* Study schedule */}
              <Route path='/study-schedule' element={<StudySchedule />} />

              {/* Curriculum */}
              <Route path='/curriculum/list' element={<CurriculumList />} />
              <Route path='/curriculum/detail/:id' element={<CurriculumDetail />} />
              <Route path='/curriculum/edit/:id' element={<CurriculumEdit />} />

              {/* Exercise Report */}
              <Route path='/curriculum/report' element={<ExerciseReport />} />
              <Route path='/curriculum/report-session/:id' element={<ExerciseReportSession />} />
              <Route path='/curriculum/report-session' element={<ExerciseReportSessionByStudent />} />
              <Route path='/curriculum/report/detail/:id' element={<ExerciseReportDetail />} />
              <Route
                path='/curriculum/report/detail-exercise/:exam_id/:student_id'
                element={<DetailExerciseReport />}
              />

              {/* Exercise */}
              <Route
                path='/exercise/list'
                element={currentUser?.user_job_title === USER_ROLE.STUDENT ? <ExamList /> : <ExerciseList />}
              />
              <Route path='/exercise/detail-program/:id' element={<ExerciseDetailProgram />} />
              <Route path='/exercise/detail/:id' element={<ExerciseDetail />} />
              <Route path='/exercise/edit/:id' element={<ExerciseEdit />} />

              {/* Practice */}
              <Route path='/practice/:id' element={<Practice />} />
              <Route path='/try-assignment/:id' element={<TryAssignment />} />
              {/* <Route path='/practice/exam/:id' element={<Exam />} />
            <Route path='/practice/training/:id' element={<Training />} /> */}

              {/* Permission */}
              <Route path='/permission' element={<Permissions />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </HelmetProvider>
  );
};

export default RootRoute;
