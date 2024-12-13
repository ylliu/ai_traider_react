import React, { useState,useEffect } from "react";
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

const TimeShareChart = ({ data, onSelectRange, sellPoints,preClose,buyPoints }) => {
  const timeLabels = data.map((item) => {
    const date = new Date(item.time * 1000); // 转换为毫秒
    const isoString = date.toISOString(); // 获取 ISO 格式字符串
    return isoString.replace("T", " ").slice(0, 19); // 将 'T' 替换为 ' '，并截取前19个字符（保留年月日 时分秒）
  });

  const prices = data.map((item) => item.close);
  const volumes = data.map((item) => item.volume);
  const highs = data.map((item) => item.high);
  const lows = data.map((item) => item.low);
  const priceChanges = prices.map((price, index) => index === 0 ? 0 : price - prices[index - 1]);


  // 找到高低值，忽视null
  const maxPrice = Math.max(...prices.filter(price => price !== null));
  const minPrice = Math.min(...prices.filter(price => price !== null));
  // 计算离 pre_close 的距离
  const distance = Math.max(Math.abs(preClose - maxPrice), Math.abs(preClose - minPrice));

  
  // 设置 y 轴上下限
  const yMin = (preClose - distance)*0.99;
  const yMax = preClose + distance*1.01;

  // 计算当天相对于昨日收盘价的最大涨幅和跌幅
  const maxHigh = Math.max(...highs.filter(high => high !== null));
  const minLow = Math.min(...lows.filter(low=> low !== null));
  const maxChange = (maxHigh-preClose) / preClose * 100;; // 最大涨幅
  const minChange =(minLow-preClose) / preClose * 100;; // 最大涨幅
  const absMaxChange = Math.max(Math.abs(maxChange), Math.abs(minChange)); // 绝对最大涨跌幅

 // 计算累积均线（Cumulative Moving Average）
 const cumulativeMovingAverage = (prices) => {
  const result = [];
  let cumulativeSum = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] === null) {
      continue; // 跳过当前的循环
    }
    cumulativeSum += prices[i];  // 累加价格
    const avgPrice = cumulativeSum / (i + 1);  // 计算当前索引的均值
    result.push(avgPrice);
  }
  return result;
};

// 计算累积均线
const cmaData = cumulativeMovingAverage(prices);

  // 数据：价格
  const priceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Stock Price",
        data: prices,
        borderColor: (context) => {
          const index = context.dataIndex;
          return priceChanges[index] >= 0 ? "" : "rgba(255, 99, 132, 1)"; // 红绿区分上涨和下跌
        },
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
        pointRadius: 0, // 隐藏圆点
      },
      {
        label: "Cumulative Moving Average", // 均线的label
        data: cmaData,
        borderColor: "orange", // 设置均线的颜色为橙黄色
        backgroundColor: "rgba(255, 159, 64, 0.2)", // 橙黄色的透明背景
        borderWidth: 1,
        pointRadius: 0, // 隐藏圆点
        borderDash: [], // 实线（默认就是实线，移除虚线配置）
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
        borderColor: (context) => {
          const index = context.dataIndex;
          return priceChanges[index] >= 0 ? "rgba(248, 70, 58,1.0)" : "rgba(000, 142, 009,1.0)"; // 使用更深的颜色
        },
        borderWidth: 1,
      },
    ],
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
    tooltip: {
      enabled: true, // 开启tooltips
      callbacks: {
        label: (tooltipItem) => {
          const volume = tooltipItem.raw;
          const time = tooltipItem.label;
          return `Time: ${time}, Volume: ${volume}`;
        },
      },
    },
  },
  scales: {
    y: {
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
};

 
  // 在时间点标记卖点
  const sellPointData = sellPoints.map((sellPointTime) => {
    const index = timeLabels.findIndex((time) => time === sellPointTime);
    console.log(sellPointTime, index);  
    return index !== -1 ? index : null;
  }).filter(index => index !== null);

  // 在时间点标记买点
  const buyPointData = buyPoints.map((buyPointTime) => {
    const index = timeLabels.findIndex((time) => time === buyPointTime);
    console.log(buyPointTime, index);  
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
            return `Time: ${time}, Price: ${parseFloat(price).toFixed(2)}`; // 保持两位小数
          },
        },
      },
     // 添加注释来标记卖点，用 "s" 字母作为标识符
    
     annotation: {
      annotations: [
        // 绘制收盘价上下的虚线分界线
        {
          type: 'line',
          xMin: timeLabels[0], // 从第一个时间点开始
          xMax: timeLabels[timeLabels.length - 1], // 到最后一个时间点结束
          borderColor: 'rgba(0, 0, 0, 0.7)', // 线的颜色
          borderWidth: 1, // 线宽
          borderDash: [5, 5], // 设置虚线样式
          label: {
            content: `Pre-close: ${parseFloat(preClose).toFixed(2)}`, // 保持两位小数
            position: 'start',
            backgroundColor: 'rgba(255, 159, 64, 0.8)',
          },
          yMin: preClose, // 预收盘价
          yMax: preClose, // 预收盘价
        },
        // 卖点标记
        ...sellPointData.map((index) => ({
          type: 'point',
          xValue: index,
          yValue: prices[index],
          backgroundColor: 'blue',
          radius: 3,
        })),
        // 买点标记
        ...buyPointData.map((index) => ({
          type: 'point',
          xValue: index,
          yValue: prices[index],
          backgroundColor: 'red',
          radius: 3,
        })),
         // 显示最大涨幅百分比
         {
          type: 'label',
          xValue: 235, // X轴的最后一个时间点
          yValue: yMax*0.995, // 最大股价
          color: 'rgba(255, 99, 132, 1)', // 红色
          content: `+${absMaxChange.toFixed(2)}%`, // 显示最大涨幅
          font: {
            size: 12,
            weight: 'bold',
          },
          position: 'top',
          offsetX: 10, // 向右偏移
        },
        // 显示最大跌幅百分比
        {
          type: 'label',
          xValue:235, // X轴的最后一个时间点
          yValue: yMin*1.005, // 最小股价
          color: 'rgba(000, 142, 009)', // 绿色
          content: `${absMaxChange.toFixed(2)}%`, // 显示最大跌幅
          font: {
            size: 12,
            weight: 'bold',
          },
          position: 'bottom',
          offsetX: -10, // 向左偏移
        },
      ],
    },
  },
    scales: {
      y: {
        min: yMin, // 设置 y 轴的最小值
        max: yMax, // 设置 y 轴的最大值
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Price",
        },
        ticks: {
          callback: (value) => `${parseFloat(value).toFixed(2)}`, // 保持两位小数
          stepSize: (yMax - yMin) / 4,  // 设定 4 个显示刻度
        },
        grid: {
          drawOnChartArea: true, // 仅在图表区域绘制网格
          drawBorder: true, // 不绘制边框
          color: 'rgba(0, 0, 0, 0.1)', // 网格颜色
          lineWidth: 1, // 网格线宽度
          borderDash: [5, 5], // 设置虚线样式
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
        ticks: {
          max: timeLabels[timeLabels.length - 1], // 最大值为最后一个时间点
          min: timeLabels[0], // 最小值为第一个时间点
          stepSize: Math.floor(timeLabels.length / 4), // 设置每个刻度之间的间距为总数/4
          callback: (value, index) => {
            // 从 timeLabels 获取完整时间
            const fullTime = timeLabels[index];
            if (fullTime) {
              // 提取 HH:mm 格式
              return fullTime.slice(11, 16);
            }
            return value;
          },
          grid: {
            drawOnChartArea: true, // 仅在图表区域绘制网格
            drawBorder: true, // 不绘制边框
            color: 'rgba(0, 0, 0, 0.1)', // 网格颜色
            lineWidth: 1, // 网格线宽度
            borderDash: [5, 5], // 设置虚线样式
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
      <Bar data={volumeData} options={volumeOptions} />
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
  const [buyPoints, setBuyPoints] = useState([]);  // 新增：存储买点
  const [isProcessing, setIsProcessing] = useState(false);  // 新增：控制按钮状态
  const [isBuyProcessing, setIsBuyProcessing] = useState(false);  // 新增：控制按钮状态
  const [trainingComplete, setTrainingComplete] = useState(false); // 控制训练完成提示框显示
  const [preClose, setPreClose] = useState(null); // 新增这一行
  const [sellPointMessage, setSellPointMessage] = useState('');  // 提示信息
  const [isMessageVisible, setIsMessageVisible] = useState(false);  // 控制提示框是否显示
  const [serverIp, setServerIp] = useState(null);
  const port = "5001";  // 替换为你的服务器端口
  const url = `http://${serverIp}:${port}`;
  // 处理股票代码输入变化
  const handleStockCodeChange = (e) => {
    setStockCode(e.target.value);
  };

  useEffect(() => {
    fetch('./server_ip.json')
      .then(response => response.json())
      .then(data => {
        setServerIp(data.server_ip);
        console.log(data.server_ip); // 确保正确获取到 serverIp
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

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
  const handleViewChart = async () => {
    if (!stockCode) {
      alert("Please enter a stock code.");
      return;
    }

    // 清空卖点数据
    setSellPoints([]);
    // 清空买点数据
    setBuyPoints([]);
    setIsProcessing(false);  // 重置按钮状态
    setIsBuyProcessing(false);  // 重置按钮状态

    try {
      const response = await fetch(`${url}/time_share_data/${stockCode}`);
      if (response.ok) {
        const jsonResponse = await response.json();
         // 从 jsonResponse 中提取 data
        const data = jsonResponse.data; // 提取 data 部分
        const preClose = jsonResponse.pre_close; // 提取 pre_close
        // 检查数据长度并填充不足的数据
        const requiredLength = 241;
        if (data.length < requiredLength) {
          // 计算需要填充的数量
          const fillCount = requiredLength - data.length;
          // 用空对象填充
          const filledData = [
            ...data,
            ...Array(fillCount).fill({ time: null, close: null, volume: null,high : null, low: null }),
          ];
          setChartData(filledData);
        } else {
          setChartData(data);
        }
         // 保存 pre_close 以便传递给图表组件
         setPreClose(preClose); // 假设你已经定义了 setPreClose
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
        if (data.length === 0) {
          // 如果没有卖点，显示提示信息
          setSellPointMessage('未找到卖点');
          setIsMessageVisible(true);
          
          // 1秒后自动隐藏提示框
          setTimeout(() => {
            setIsMessageVisible(false);
          }, 1000);
        }
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
  // 新增：查看买点
  const handlePlaybackBuyPoint = async () => {
    if (isProcessing) return;  // 如果正在处理，则直接返回

    setIsBuyProcessing(true);  // 设置按钮为“正在计算”

    try {
      const response = await fetch(`${url}/playback_buy_point/${stockCode}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setBuyPoints(data);
        if (data.length === 0) {
          setSellPointMessage('未找到买点');
          setIsMessageVisible(true);
          setTimeout(() => {
            setIsMessageVisible(false);
          }, 1000);
        }
        console.log(buyPoints);
      } else {
        alert('Failed to fetch buy points.');
      }
    } catch (error) {
      console.error('Error fetching buy points:', error);
      alert('Error fetching buy points.');
    } finally {
      setIsBuyProcessing(false);  // 恢复按钮状态(false);  
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
        {/* <div className="col-md-3">
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
        </div> */}
        <div className="col-sm-12 col-md-2 d-flex align-items-center">
          <div className="input-group">
            {/* <button 
              onClick={handleStartTraining} 
              className="btn btn-primary me-2 rounded"
            >
           开始训练
            </button> */}
            <button 
              onClick={handlePlaybackSellPoint} 
              className="btn btn-success rounded  mr-3"
              style={{ marginRight: "10px" }}  // 设置右边的间距
              disabled={isProcessing}  // 禁用按钮
            >
              {isProcessing ? "计算卖点" : "查看卖点"}
            </button>
            <button
            onClick={handlePlaybackBuyPoint}
            className="btn btn-warning rounded"  // 使用橙色
            disabled={isBuyProcessing}
           >
            {isBuyProcessing ? "计算买点" : "查看买点"}
            </button>
          </div>
      </div>
       
      </div>
      {trainingComplete && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          训练完成！
        </div>
      )}
      {isMessageVisible && (
      <div className="alert alert-warning alert-dismissible fade show" role="alert">
        {sellPointMessage}
      </div>
    )}
      {chartData.length > 0 && (
        <TimeShareChart
          data={chartData}  onSelectRange={handleSelectRange} sellPoints={sellPoints} buyPoints={buyPoints} 
          preClose={preClose}
         
        />
      )}
    </div>
  );
};

export default TimeShareContainer;
