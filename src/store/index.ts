import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Toast } from '@components/toast';
import { getToken, removeRefreshToken, removeToken } from '@lib/JwtHelper';
import mainServices from '@services/main';
import subjectServices from '@services/subject';
import teachingLocationServices from '@services/teachingLocation';
import classroomServices from '@services/classroom';
import i18n from '../i18n';

interface UserInfo {
  user_id: number;
  role_id: number;
  display_name: string;
  avatar: string;
  user_job_title: string;
  email: string;
  phone: string;
  verify_status: number;
  username: string;
  salt: string;
}

export interface Permissions {
  /** Truy cập vào trang quản trị viên */
  ACCESS_ADMIN?: number;
  /** Tạo mới quản trị viên */
  CREATE_ADMIN?: number;
  /** Cập nhật thông tin quản trị viên */
  UPDATE_ADMIN?: number;
  /** Xóa quản trị viên */
  DELETE_ADMIN?: number;
  /** Xem tất cả quản trị viên */
  VIEW_ALL_ADMIN?: number;

  /** Truy cập vào trang giáo viên */
  ACCESS_TEACHER?: number;
  /** Tạo mới giáo viên */
  CREATE_TEACHER?: number;
  /** Cập nhật thông tin giáo viên */
  UPDATE_TEACHER?: number;
  /** Xóa giáo viên */
  DELETE_TEACHER?: number;
  /** Xem tất cả giáo viên */
  VIEW_ALL_TEACHER?: number;

  /** Truy cập vào trang trợ giảng */
  ACCESS_TA?: number;
  /** Tạo mới trợ giảng */
  CREATE_TA?: number;
  /** Cập nhật thông tin trợ giảng */
  UPDATE_TA?: number;
  /** Xóa trợ giảng */
  DELETE_TA?: number;
  /** Xem tất cả trợ giảng */
  VIEW_ALL_TA?: number;

  /** Truy cập vào trang học sinh */
  ACCESS_STUDENT?: number;
  /** Tạo mới học sinh */
  CREATE_STUDENT?: number;
  /** Cập nhật thông tin học sinh */
  UPDATE_STUDENT?: number;
  /** Xóa học sinh */
  DELETE_STUDENT?: number;

  /** Truy cập vào lớp học */
  ACCESS_CLASSROOM?: number;
  /** Tạo mới lớp học */
  CREATE_CLASSROOM?: number;
  /** Cập nhật thông tin lớp học */
  UPDATE_CLASSROOM?: number;
  /** Xóa lớp học */
  DELETE_CLASSROOM?: number;
  /** Xem tất cả lớp học */
  VIEW_ALL_CLASSROOM?: number;

  /** Truy cập vào môn học */
  ACCESS_SUBJECT?: number;
  /** Tạo mới môn học */
  CREATE_SUBJECT?: number;
  /** Cập nhật thông tin môn học */
  UPDATE_SUBJECT?: number;
  /** Xóa môn học */
  DELETE_SUBJECT?: number;
  /** Xem tất cả môn học */
  VIEW_ALL_SUBJECT?: number;

  /** Truy cập vào địa điểm */
  ACCESS_LOCATION?: number;
  /** Tạo mới địa điểm */
  CREATE_LOCATION?: number;
  /** Cập nhật thông tin địa điểm */
  UPDATE_LOCATION?: number;
  /** Xóa địa điểm */
  DELETE_LOCATION?: number;
  /** Xem tất cả địa điểm */
  VIEW_ALL_LOCATION?: number;

  /** Truy cập vào điểm danh */
  ACCESS_ATTENDANCE?: number;
  /** Tạo mới bản ghi điểm danh */
  CREATE_ATTENDANCE?: number;
  /** Cập nhật bản ghi điểm danh */
  UPDATE_ATTENDANCE?: number;
  /** Xóa bản ghi điểm danh */
  DELETE_ATTENDANCE?: number;
  /** Xem tất cả bản ghi điểm danh */
  VIEW_ALL_ATTENDANCE?: number;

  /** Truy cập vào điểm danh học sinh */
  ACCESS_STUDENT_ATTENDANCE?: number;
  /** Tạo mới bản ghi điểm danh học sinh */
  CREATE_STUDENT_ATTENDANCE?: number;
  /** Cập nhật bản ghi điểm danh học sinh */
  UPDATE_STUDENT_ATTENDANCE?: number;
  /** Xóa bản ghi điểm danh học sinh */
  DELETE_STUDENT_ATTENDANCE?: number;
  /** Xem tất cả bản ghi điểm danh học sinh */
  VIEW_ALL_STUDENT_ATTENDANCE?: number;
  /** Duyệt điểm danh học sinh*/
  APPROVE_STUDENT_ATTENDANCE?: number;

  /** Truy cập vào điểm danh giáo viên */
  ACCESS_TEACHER_ATTENDANCE?: number;
  /** Tạo mới bản ghi điểm danh giáo viên */
  CREATE_TEACHER_ATTENDANCE?: number;
  /** Cập nhật bản ghi điểm danh giáo viên */
  UPDATE_TEACHER_ATTENDANCE?: number;
  /** Xóa bản ghi điểm danh giáo viên */
  DELETE_TEACHER_ATTENDANCE?: number;
  /** Xem tất cả bản ghi điểm danh giáo viên */
  VIEW_ALL_TEACHER_ATTENDANCE?: number;
  /** Duyệt điểm danh giáo viên*/
  APPROVE_TEACHER_ATTENDANCE?: number;

  /** Truy cập vào điểm danh trợ giảng */
  ACCESS_TA_ATTENDANCE?: number;
  /** Tạo mới bản ghi điểm danh trợ giảng */
  CREATE_TA_ATTENDANCE?: number;
  /** Cập nhật bản ghi điểm danh trợ giảng */
  UPDATE_TA_ATTENDANCE?: number;
  /** Xóa bản ghi điểm danh trợ giảng */
  DELETE_TA_ATTENDANCE?: number;
  /** Xem tất cả bản ghi điểm danh trợ giảng */
  VIEW_ALL_TA_ATTENDANCE?: number;
  /** Duyệt điểm danh trợ giảng*/
  APPROVE_TA_ATTENDANCE?: number;

  /** Truy cập vào chương trình học*/
  ACCESS_STUDY_PROGRAM?: number;
  /** Tạo chương trình học*/
  CREATE_STUDY_PROGRAM?: number;
  /** Cập nhật chương trình học*/
  UPDATE_STUDY_PROGRAM?: number;
  /** Xóa chương trình học*/
  DELETE_STUDY_PROGRAM?: number;
  /** Xem tất cả chương trình học*/
  VIEW_ALL_STUDY_PROGRAM?: number;

  /** Truy cập vào chương trình dạy*/
  ACCESS_TEACHING_PROGRAM?: number;
  /** Tạo chương trình dạy*/
  CREATE_TEACHING_PROGRAM?: number;
  /** Cập nhật chương trình dạy*/
  UPDATE_TEACHING_PROGRAM?: number;
  /** Xóa chương trình dạy*/
  DELETE_TEACHING_PROGRAM?: number;
  /** Xem tất cả chương trình dạy*/
  VIEW_ALL_TEACHING_PROGRAM?: number;

  /** Truy cập vào quản lý file */
  ACCESS_FILE?: number;
  /** Tải lên file mới */
  CREATE_FILE?: number;
  /** Cập nhật file */
  UPDATE_FILE?: number;
  /** Xóa file */
  DELETE_FILE?: number;
  /** Xem tất cả file */
  VIEW_ALL_FILE?: number;

  /** Truy cập vào quyền chủ sở hữu */
  ACCESS_OWNER?: number;
}

export interface TypeUser {
  id?: number;
  username?: string;
  user_job_title?: string;
  display_name?: string;
  avatar?: string;
  role_id?: number;
  student_classroom_id?: number;
}
export interface TypeLocation {
  id: number;
  location_avatar: string;
  location_code: string;
  location_name: string;
  valid: 0 | 1;
}
export interface TypeClassroom {
  id: number;
  classroom_avatar?: string;
  classroom_code?: string;
  classroom_name?: string;
  valid?: number;
  location_id?: number;
  start_date?: number;
  end_date?: number;
  schedules?: { day_of_week: number; end_time: string; id: number; start_time: string; valid: number }[];
  students?: {
    student_name: string;
    student_avatar: string;
    student_id: number;
    student_code: string;
    valid: 0 | 1;
  }[];
}

export interface TypeSubject {
  id: number;
  subject_avatar: string;
  subject_code: string;
  subject_name: string;
}

interface RootState {
  isLoggedIn: boolean;
  currentUser?: UserInfo | null;
  permissions: Permissions;
  users: TypeUser[];
  locations: TypeLocation[];
  classrooms: TypeClassroom[];
  subjects: TypeSubject[];
  setCurrentUser?: (user: UserInfo) => void;
  setUsers?: (users: TypeUser[]) => void;
  setLocations?: (users: TypeLocation[]) => void;
  setClassrooms?: (users: TypeClassroom[]) => void;
  setSubjects?: (users: TypeSubject[]) => void;
  setUserPermissions?: (permissions: Permissions) => void;
  setIsLoggedIn?: (isLoggedIn: boolean) => void;
  restoreSession: () => void;
  onLogout: (isShowToast?: boolean) => void;
  syncUsersStore: () => Promise<void>;
  syncSubjectStore: () => Promise<void>;
  syncLocationsStore: () => Promise<void>;
  syncClassroomsStore: () => Promise<void>;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  addNotificationCount: () => void;
  removeNotificationCount: () => void;
  removeAllNotification: () => void;
}

export const useRootStore = create(
  devtools<RootState>((set, getState) => ({
    isLoggedIn: false,
    currentUser: null,
    permissions: {},
    users: [],
    locations: [],
    classrooms: [],
    subjects: [],
    notificationCount: 0,
    setCurrentUser: (user: any) => set({ currentUser: user }),
    setUsers: (users: any) => set({ users: users }),
    setLocations: (locations: any) => set({ locations: locations }),
    setClassrooms: (classrooms: any) => set({ classrooms: classrooms }),
    setSubjects: (subjects: any) => set({ subjects: subjects }),
    setUserPermissions: (permissions: any) => set({ permissions: permissions }),
    setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn: isLoggedIn }),
    restoreSession: () => {
      const token = getToken();
      if (token) {
        set({ isLoggedIn: true });
      } else {
        window.location.href = '/#/login';
        set({ isLoggedIn: false, currentUser: null });
      }
    },
    onLogout: (isShowToast?: boolean) => {
      set({ isLoggedIn: false, currentUser: null });
      removeToken();
      removeRefreshToken();
      isShowToast && Toast('success', i18n.t('logout_successfully'));
    },
    syncUsersStore: async () => {
      try {
        const data: any = await mainServices.getUsers();
        set({ users: data?.data });
      } catch (err: any) {
        console.log(err);
      }
    },
    syncSubjectStore: async () => {
      try {
        const data: any = await subjectServices.getSharedSubjects();
        set({ subjects: data?.data });
      } catch (err: any) {
        console.log(err);
      }
    },
    syncLocationsStore: async () => {
      try {
        const data: any = await teachingLocationServices.getSharedTeachingLocations();
        set({ locations: data?.data });
      } catch (err: any) {
        console.log(err);
      }
    },
    syncClassroomsStore: async () => {
      try {
        const data: any = await classroomServices.getSharedClassrooms();
        set({ classrooms: data?.data });
      } catch (err: any) {
        console.log(err);
      }
    },
    setNotificationCount: (count: number) => {
      set({ notificationCount: count });
    },
    addNotificationCount: () => {
      set((state) => ({ notificationCount: state.notificationCount + 1 }));
    },
    removeNotificationCount: () => {
      set((state) => ({ notificationCount: state.notificationCount - 1 }));
    },
    removeAllNotification: () => {
      set({ notificationCount: 0 });
    }
  }))
);
