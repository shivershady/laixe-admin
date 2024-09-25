import { Axios } from './Axios';

export const userService = {
  getUserInfo: () => {
    return Axios.get('api/users/my-info');
  },
  // Thêm API để thay đổi thông tin người dùng
  changeUser: (userData) => {
    return Axios.put('/api/users', userData);
  },
  // Thêm API để thay đổi mật khẩu
  changePassword: (passwordData) => {
    return Axios.post('/api/users/change-password', passwordData);
  },
  getAllUser: () => {
    return Axios.get('api/users')
  }
};
