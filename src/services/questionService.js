import { Axios } from './Axios';

export const questionService = {
  postQuestion: (id, payload) => {
    return Axios.post(`api/questions/exam/${id}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
  },
  postPractice: (id, payload) => {
    return Axios.post(`api/questions/exam/practice/${id}`, payload);
  },

};
