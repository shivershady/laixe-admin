import { Axios } from './Axios';

export const examServices = {
  getAllExams: (payload) => {
    return Axios.get('api/exams', payload);
  },
  getDetail: (id) => {
    return Axios.get(`api/exams/${id}`);
  },
  postExam: (payload) => {
    return Axios.post('api/exams', payload);
  },
  editExam: (id, payload) => {
    return Axios.put(`api/exams/${id}`, payload);
  },
  deleteExam: (id) => {
    return Axios.del(`api/exams/${id}`);
  },
};
