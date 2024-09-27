import { Axios } from './Axios';

export const socketService = {
  getHistory: () => {
    return Axios.get(`api/sockets/history`);
  },
};
