import { Axios } from './Axios';

export const courseServices = {
  getAllCourses: () => {
    return Axios.get('api/courses/all');
  },
  getCourses: (payload) => {
    return Axios.get('api/courses', payload);
  },
  postCourse: (payload) => {
    return Axios.post('api/courses', payload);
  },
  editCourse: (id, payload) => {
    return Axios.put(`api/courses/${id}`, payload);
  },
  deleteCourse: (id) => {
    return Axios.del(`api/courses/${id}`);
  },
};
