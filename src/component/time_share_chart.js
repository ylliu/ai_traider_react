import React from "react";
import {
    Chart as ChartJS,
    LineElement,
    BarElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
  import { Line, Bar } from "react-chartjs-2";
  
  // 注册必要的组件
  ChartJS.register(
    LineElement,
    BarElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
  );

  

  
const TimeShareChart = ({ data }) => {
    const timeLabels = data.map(item => {
        const date = new Date(item.time);
        return date.toTimeString().slice(0, 5); // 获取 HH:mm 格式
      });
  const prices = data.map(item => item.price);
  const volumes = data.map(item => item.volume);

   // 数据：价格
   const priceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Stock Price",
        data: prices,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        pointRadius: 0, // 隐藏圆点
      },
    ],
  };

  // 数据：成交量
  const volumeData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Volume",
        data: volumes,
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // 配置：价格图表
  const priceOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // 隐藏图例
      },
      title: {
        display: true,
        text: "Stock Price",
      },
    },
    scales: {
      y: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Price",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
  };

  // 配置：成交量图表
  const volumeOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // 隐藏图例
      },
      title: {
        display: true,
        text: "Volume",
      },
    },
    scales: {
      y: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Volume",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <Line data={priceData} options={priceOptions} />
      </div>
      <div>
        <Bar data={volumeData} options={volumeOptions} />
      </div>
    </div>
  );
};

export default TimeShareChart;
