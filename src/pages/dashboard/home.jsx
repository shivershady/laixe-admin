import { CurrencyDollarIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Typography
} from "@material-tailwind/react";
import { useEffect, useState } from 'react';
import Chart from "react-apexcharts";

import { statisticService } from "@/services/statisticService";

const fetchData = async (startDate, endDate) => {
  const response = await statisticService.revenueStatistics({ startDate, endDate });
  return response.map(item => ({
    date: item.date.split('T')[0],
    revenue: item.totalRevenue
  }));
};

export function Home() {
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [rawData, setRawData] = useState([]);

  const getData = async () => {
    const data = await fetchData(startDate, endDate);
    setRawData(data);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSearch = () => {
    getData();
  };

  const totalRevenue = rawData.reduce((sum, item) => sum + item.revenue, 0);

  const chartOptions = {
    chart: {
      type: 'area',
      height: 350,
    },
    xaxis: {
      categories: rawData.map(item => item.date),
      type: 'datetime',
    },
    yaxis: {
      title: {
        text: 'Doanh thu (VND)',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
  };

  const chartSeries = [
    {
      name: 'Doanh thu',
      data: rawData.map(item => item.revenue),
    },
  ];

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <Typography variant="h2" color="blue-gray" className="mb-4">
        Thống kê doanh thu
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          label="Ngày bắt đầu"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          label="Ngày kết thúc"
        />
        <Button onClick={handleSearch} className="h-10">Tìm kiếm</Button>
      </div>

      <Card className="mb-6">
        <CardBody className="flex items-center">
          <CurrencyDollarIcon className="w-12 h-12 text-green-500 mr-4" />
          <div>
            <Typography variant="h6" color="blue-gray">
              Tổng doanh thu
            </Typography>
            <Typography variant="h4" color="green">
              {totalRevenue.toLocaleString()} VND
            </Typography>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader floated={false} shadow={false} color="transparent">
          <Typography variant="h5" color="blue-gray">
            Biểu đồ doanh thu
          </Typography>
        </CardHeader>
        <CardBody>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={350}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader floated={false} shadow={false} color="transparent">
          <Typography variant="h5" color="blue-gray">
            Chi tiết doanh thu
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {["Thời gian", "Doanh thu"].map((head) => (
                  <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawData.map(({ date, revenue }, index) => (
                <tr key={date} className="even:bg-blue-gray-50/50">
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {date}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {revenue.toLocaleString()} VND
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;
