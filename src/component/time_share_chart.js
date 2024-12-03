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

const TimeShareChart = ({ data, onSelectRange, sellPoints }) => {
  const timeLabels = data.map((item) => {
    const date = new Date(item.time * 1000); // 转换为毫秒
    const isoString = date.toISOString(); // 获取 ISO 格式字符串
    return isoString.replace("T", " ").slice(0, 19); // 将 'T' 替换为 ' '，并截取前19个字符（保留年月日 时分秒）
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
 
  // 在时间点标记卖点
  const sellPointData = sellPoints.map((sellPointTime) => {
    const index = timeLabels.findIndex((time) => time === sellPointTime);
    console.log(sellPointTime, index);  
    return index !== -1 ? index : null;
  }).filter(index => index !== null);
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
     // 添加注释来标记卖点，用 "s" 字母作为标识符
    
     annotation: {
      annotations: sellPointData.map((index) => ({
        type: 'point',
        xValue: index, // 设置卖点的 x 轴位置
        yValue: prices[index], // 设置卖点的 y 轴位置
        backgroundColor: 'blue', // 蓝色背景
        radius: 3,  // 设置圆形的半径为 5，显示蓝色的小圆点
      })),
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
          callback: (value) => `${value}`, // 显示为货币格式
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
        ticks: {
          callback: (value, index) => {
            // 从 timeLabels 获取完整时间
            const fullTime = timeLabels[index];
            if (fullTime) {
              // 提取 HH:mm 格式
              return fullTime.slice(11, 16);
            }
            return value;
          },
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
  const [stockCode, setStockCode] = useState("易点天下"); // 存储股票代码
  const [chartData, setChartData] = useState([]);  // 存储图表数据
  const [startTime, setStartTime] = useState(""); // 开始卖出时间
  const [endTime, setEndTime] = useState(""); // 结束卖出时间
  const [selectingStartTime, setSelectingStartTime] = useState(true); // 标记是否正在选择开始时间
  const [startTimeInt, setStartTimeInt] = useState(""); // 开始卖出时间
  const [endTimeInt, setEndTimeInt] = useState(""); // 结束卖出时间
  const [sellPoints, setSellPoints] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);  // 新增：控制按钮状态
  const [trainingComplete, setTrainingComplete] = useState(false); // 控制训练完成提示框显示
  const serverIp = "127.0.0.1";  // 替换为你的服务器IP
  const port = "5001";  // 替换为你的服务器端口
  const url = `http://${serverIp}:${port}`;
  // 处理股票代码输入变化
  const handleStockCodeChange = (e) => {
    setStockCode(e.target.value);
  };

 // 点击分时图时的回调函数
 const handleSelectRange = (clickedTime) => {
  if (selectingStartTime) {
    setStartTime(clickedTime); // 更新开始时间
    setSelectingStartTime(false); // 切换到选择结束时间
    setStartTimeInt(clickedTime); // 更新开始时间整数
  } else {
    setEndTime(clickedTime); // 更新结束时间
    setSelectingStartTime(true); // 重置为选择开始时间
    setEndTimeInt(clickedTime); // 更新结束时间整数
  }
};
  // 处理查看分时图按钮点击
  const handleViewChart = async () => {
    if (!stockCode) {
      alert("Please enter a stock code.");
      return;
    }

    // 清空卖点数据
    setSellPoints([]);
    setIsProcessing(false);  // 重置按钮状态
   
    try {
      const response = await fetch(`${url}/time_share_data/${stockCode}`);
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
  const handleStartTraining = async () => {
    if (!stockCode || !startTimeInt || !endTimeInt) {
      alert("Please enter stock code, start time, and end time.");
      return;
    }

    const payload = {
      start_time: startTimeInt,
      end_time: endTimeInt,
      action: "Sell_Point",
    };

   
    try {
      const response = await fetch(`${url}/start_train/${stockCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showTrainingCompleteMessage();
      } else {
        const errorData = await response.json();
        alert(`Failed to start training: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error starting training:", error);
      alert("Error starting training.");
    }
  };

  const handlePlaybackSellPoint = async () => {
    if (isProcessing) return;  // 如果正在处理，则直接返回

    setIsProcessing(true);  // 设置按钮为“正在计算”
  
    try {
      const response = await fetch(`${url}/playback_sell_point/${stockCode}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setSellPoints(data);
        console.log(sellPoints);
      } else {
        alert('Failed to fetch sell points.');
      }
    } catch (error) {
      console.error('Error fetching sell points:', error);
      alert('Error fetching sell points.');
    } finally {
      setIsProcessing(false);  // 恢复按钮状态
    }
  };

  const showTrainingCompleteMessage = () => {
    setTrainingComplete(true);
    setTimeout(() => {
      setTrainingComplete(false);
    }, 1000);  // 3秒后自动消失
  };

  return (
    <div className="container">
      <div className="row mb-3">
        <div className="col-md-3">
          <div className="input-group">
            <input
              type="text"
              value={stockCode}
              onChange={handleStockCodeChange}
              className="form-control"
              placeholder="Enter stock code"
              style={{ minWidth: '200px' }}  // 添加这一行
            />
            <button onClick={handleViewChart} className="btn btn-primary">
              查看分时图
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <label className="input-group-text" htmlFor="startTime">开始卖出时间</label>
            <input
              type="text"
              id="startTime"
              value={startTime}
              className="form-control"
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <label className="input-group-text" htmlFor="endTime">结束卖出时间</label>
            <input
              type="text"
              id="endTime"
              value={endTime}

              className="form-control"
            />
          </div>
        </div>
        <div className="col-sm-12 col-md-2 d-flex align-items-center">
          <div className="input-group">
            <button 
              onClick={handleStartTraining} 
              className="btn btn-primary me-2 rounded"
            >
           开始训练
            </button>
            <button 
              onClick={handlePlaybackSellPoint} 
              className="btn btn-success rounded"
              disabled={isProcessing}  // 禁用按钮
            >
              {isProcessing ? "计算卖点中..." : "查看卖点"}
            </button>
          </div>
      </div>
       
      </div>
      {trainingComplete && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          训练完成！
        </div>
      )}
      {chartData.length > 0 && (
        <TimeShareChart
          data={chartData}  onSelectRange={handleSelectRange} sellPoints={sellPoints}
         
        />
      )}
    </div>
  );
};

export default TimeShareContainer;
