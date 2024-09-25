import { Axios } from './Axios';

export const statisticService = {
  revenueStatistics: ({ startDate, endDate }) => {
    return Axios.get(`api/Vnpay/revenue-statistics?startDate=${startDate}&endDate=${endDate}`);
  },
};
