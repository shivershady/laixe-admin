import { Axios } from './Axios';

export const classServices = {
  getAllClass: (payload) => {
    return Axios.get('api/Class', payload)
  },
  postClass: (payload) => {
    return Axios.post('api/Class', payload);
  },
  editClass: ({ id, payload }) => {
    return Axios.put(`api/Class/${id}`, payload);
  },
  deleteClass: (id) => {
    return Axios.del(`api/Class/${id}`);
  },
  getClassDetails: (classId) => {
    return Axios.get(`api/Class/${classId}`)
  },
  getAttendanceList: (classId, date) => {
    return Axios.get(`api/Class/${classId}/attendance-status?date=${date}`)
  },
  addStudentToClass: (classId, studentId) => {
    return Axios.post(`/api/Class/add-student`, { classId, studentId })
  },
  removeStudentToClass: (classId, studentId) => {
    return Axios.del(`/api/Class/remove-student?classId=${classId}&studentId=${studentId}`)
  },
  submitAttendance: (classId, attendanceList) => {
    return Axios.post(`/api/Class/attendance`, {
      classId,
      studenAttendances: attendanceList
    })
  }
};
