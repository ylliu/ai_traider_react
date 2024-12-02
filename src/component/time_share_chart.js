import React, { useState } from "react";
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
  Chart,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import ChartAnnotation from "chartjs-plugin-annotation";
import 'bootstrap/dist/css/bootstrap.min.css';

// 注册必要的组件
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ChartAnnotation
);

const TimeShareChart = ({ data, onSelectRange }) => {
  const timeLabels = data.map((item) => {
    const date = new Date(item.time * 1000); // 转换为毫秒
    return date.toISOString().slice(11, 16); // 获取 HH:mm 格式
  });

  const prices = data.map((item) => item.close);
  const volumes = data.map((item) => item.volume);
  const priceChanges = prices.map((price, index) => index === 0 ? 0 : price - prices[index - 1]);

  // 数据：价格
  const priceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Stock Price",
        data: prices,
        borderColor: (context) => {
          const index = context.dataIndex;
          return priceChanges[index] >= 0 ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)"; // 红绿区分上涨和下跌
        },
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
        backgroundColor: (context) => {
          const index = context.dataIndex;
          return priceChanges[index] >= 0 ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"; // 根据价格涨跌设置颜色
        },
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
      tooltip: {
        enabled: true, // 开启tooltips
        mode: "nearest", // 鼠标接近数据点时显示
        intersect: false, // 鼠标悬停时显示tooltip
        callbacks: {
          label: (tooltipItem) => {
            const price = tooltipItem.raw;
            const time = tooltipItem.label;
            return `Time: ${time}, Price: ${price}`;
          },
        },
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
        ticks: {
          callback: (value) => `$${value}`, // 显示为货币格式
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
    onClick: (event) => {
      const chart = event.chart; // 获取 Chart.js 实例
      const xAxis = chart.scales.x; // 获取 X 轴
      const offsetX = event.native.offsetX; // 鼠标点击位置相对于画布的 X 偏移量

      // 根据 X 偏移量映射到时间索引
      const dataLength = timeLabels.length;
      const clickedIndex = Math.floor(
        ((offsetX - xAxis.left) / (xAxis.right - xAxis.left)) * dataLength
      );

      if (clickedIndex >= 0 && clickedIndex < dataLength) {
        const clickedTime = timeLabels[clickedIndex]; // 获取时间
        onSelectRange(clickedTime); // 传递给父组件
      }
    },
  };

  return (
    <div className="mb-4">
      <Line data={priceData} options={priceOptions} />
      <Bar data={volumeData} options={{ responsive: true }} />
    </div>
  );
};

const TimeShareContainer = () => {
  const [stockCode, setStockCode] = useState("sz300622"); // 存储股票代码
  const [chartData, setChartData] = useState([]);  // 存储图表数据
  const [startTime, setStartTime] = useState(""); // 开始卖出时间
  const [endTime, setEndTime] = useState(""); // 结束卖出时间
  const [selectingStartTime, setSelectingStartTime] = useState(true); // 标记是否正在选择开始时间
  

  // 处理股票代码输入变化
  const handleStockCodeChange = (e) => {
    setStockCode(e.target.value);
  };

 // 点击分时图时的回调函数
 const handleSelectRange = (clickedTime) => {
  if (selectingStartTime) {
    setStartTime(clickedTime); // 更新开始时间
    setSelectingStartTime(false); // 切换到选择结束时间
  } else {
    setEndTime(clickedTime); // 更新结束时间
    setSelectingStartTime(true); // 重置为选择开始时间
  }
};
  // 处理查看分时图按钮点击
  const handleViewChart = async () => {
    if (!stockCode) {
      alert("Please enter a stock code.");
      return;
    }

    const serverIp = "127.0.0.1";  // 替换为你的服务器IP
    try {
      const response = await fetch(`http://${serverIp}:5000/time_share_data/${stockCode}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        alert("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data.");
    }
  };


  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <input
              type="text"
              value={stockCode}
              onChange={handleStockCodeChange}
              className="form-control"
              placeholder="Enter stock code"
            />
            <button onClick={handleViewChart} className="btn btn-primary">
              查看分时图
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-group">
            <label className="input-group-text" htmlFor="startTime">开始卖出时间</label>
            <input
              type="text"
              id="startTime"
              value={startTime}
              readOnly
              className="form-control"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-group">
            <label className="input-group-text" htmlFor="endTime">结束卖出时间</label>
            <input
              type="text"
              id="endTime"
              value={endTime}
              readOnly
              className="form-control"
            />
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <TimeShareChart
          data={chartData}  onSelectRange={handleSelectRange}
         
        />
      )}
    </div>
  );
};

export default TimeShareContainer;
