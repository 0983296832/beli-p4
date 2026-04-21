import apiClient from '@lib/AxiosClient';

const attendanceServices = {
  ///Student
  getStudentAttendances: (filter?: object) => {
    const url = '/student_attendances';
    return apiClient.get(url, { params: filter });
  },
  getSharedStudentAttendances: (filter?: object) => {
    const url = 's/student_attendances';
    return apiClient.get(url, { params: filter });
  },
  getStudentAttendance: (id: number, filter?: object) => {
    const url = '/student_attendance/' + id;
    return apiClient.get(url, { params: filter });
  },
  getStudentAttendancesLog: (id: number, filter?: object) => {
    const url = `/student_attendance/${id}/logs`;
    return apiClient.get(url, { params: filter });
  },
  getStudentAttendancesLogCompare: (id: number, log_id: number, filter?: object) => {
    const url = `student_attendance/${id}/log/${log_id}/compare`;
    return apiClient.get(url, { params: filter });
  },
  postStudentAttendance: (body?: object) => {
    const url = '/student_attendance';
    return apiClient.post(url, body);
  },
  postStudentAttendanceDuplicate: (body?: object) => {
    const url = '/student_attendance/check_duplicate';
    return apiClient.post(url, body);
  },
  putStudentAttendance: (id: number, body?: object) => {
    const url = '/student_attendance/' + id;
    return apiClient.put(url, body);
  },

  deleteStudentAttendance: (id: number) => {
    const url = '/student_attendance/' + id;
    return apiClient.delete(url);
  },
  getStudentAttendanceExport: (filter?: object) => {
    const url = `/student_attendances/export`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  },

  /// Teacher
  getTeacherAttendances: (filter?: object) => {
    const url = '/teacher_attendances';
    return apiClient.get(url, { params: filter });
  },
  getSharedTeacherAttendances: (filter?: object) => {
    const url = 's/teacher_attendances';
    return apiClient.get(url, { params: filter });
  },
  getTeacherAttendance: (id: number, filter?: object) => {
    const url = '/teacher_attendance/' + id;
    return apiClient.get(url, { params: filter });
  },
  getTeacherAttendancesLog: (id: number, filter?: object) => {
    const url = `/teacher_attendance/${id}/logs`;
    return apiClient.get(url, { params: filter });
  },
  getTeacherAttendancesLogCompare: (id: number, log_id: number, filter?: object) => {
    const url = `teacher_attendance/${id}/log/${log_id}/compare`;
    return apiClient.get(url, { params: filter });
  },
  postTeacherAttendance: (body?: object) => {
    const url = '/teacher_attendance';
    return apiClient.post(url, body);
  },
  postTeacherAttendanceDuplicate: (body?: object) => {
    const url = '/teacher_attendance/check_duplicate';
    return apiClient.post(url, body);
  },
  putTeacherAttendance: (id: number, body?: object) => {
    const url = '/teacher_attendance/' + id;
    return apiClient.put(url, body);
  },
  deleteTeacherAttendance: (id: number) => {
    const url = '/teacher_attendance/' + id;
    return apiClient.delete(url);
  },
  getTeacherAttendanceExport: (filter?: object) => {
    const url = `/teacher_attendances/export`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  },

  /// Teacher assistant
  getTAAttendances: (filter?: object) => {
    const url = '/ta_attendances';
    return apiClient.get(url, { params: filter });
  },
  getSharedTAAttendances: (filter?: object) => {
    const url = 's/ta_attendances';
    return apiClient.get(url, { params: filter });
  },
  getTAAttendance: (id: number, filter?: object) => {
    const url = '/ta_attendance/' + id;
    return apiClient.get(url, { params: filter });
  },
  getTAAttendancesLog: (id: number, filter?: object) => {
    const url = `/ta_attendance/${id}/logs`;
    return apiClient.get(url, { params: filter });
  },
  getTAAttendancesLogCompare: (id: number, log_id: number, filter?: object) => {
    const url = `ta_attendance/${id}/log/${log_id}/compare`;
    return apiClient.get(url, { params: filter });
  },
  postTAAttendance: (body?: object) => {
    const url = '/ta_attendance';
    return apiClient.post(url, body);
  },
  postTAAttendanceDuplicate: (body?: object) => {
    const url = '/ta_attendance/check_duplicate';
    return apiClient.post(url, body);
  },
  putTAAttendance: (id: number, body?: object) => {
    const url = '/ta_attendance/' + id;
    return apiClient.put(url, body);
  },
  deleteTAAttendance: (id: number) => {
    const url = '/ta_attendance/' + id;
    return apiClient.delete(url);
  },
  getTAAttendanceExport: (filter?: object) => {
    const url = `/ta_attendances/export`;
    return apiClient.get(url, {
      params: filter,
      responseType: 'blob'
    });
  },

  // Điểm danh tổng hợp
  getAttendances: (filter?: object) => {
    const url = '/attendances';
    return apiClient.get(url, { params: filter });
  },
  getSharedAttendances: (filter?: object) => {
    const url = 's/attendances';
    return apiClient.get(url, { params: filter });
  },
  getAttendance: (id: number, filter?: object) => {
    const url = '/attendance/' + id;
    return apiClient.get(url, { params: filter });
  }
};

export default attendanceServices;
