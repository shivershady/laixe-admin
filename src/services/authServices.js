import { Axios } from './Axios';

export const authServices = {
  signIn: (payload) => {
    console.log('🚀 ~ payload:', payload)
    return Axios.post('/api/authenticates/login', payload);
  },
};
