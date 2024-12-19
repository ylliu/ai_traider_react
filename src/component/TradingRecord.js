import React, { useState, useEffect } from "react";
import axios from "axios";

const TradingRecord = () => {
  const [records, setRecords] = useState([]); // 用于存储交易记录
  const [date, setDate] = useState(""); // 日期参数
  const [message, setMessage] = useState(""); // 消息提示
  const [alertType, setAlertType] = useState("info"); // 提示类型（success, danger, info）
  const [isLoading, setIsLoading] = useState(false); // 查询加载状态
  const [serverIp, setServerIp] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // 排序配置

  const port = "5001"; // 替换为你的服务器端口
  const url = `http://${serverIp}:${port}`;

  const fade_time = 1000; // 提示信息淡出的时间

  // 获取当前日期的字符串，格式为 YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // 月份补零
    const day = String(today.getDate()).padStart(2, "0"); // 日期补零
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetch("./server_ip.json")
      .then((response) => response.json())
      .then((data) => {
        setServerIp(data.server_ip);
        console.log(data.server_ip); // 确保正确获取到 serverIp
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  // 在组件加载时设置默认日期为今天
  useEffect(() => {
    setDate(getTodayDate());
  }, []);

  // 查询交易记录的方法
  const fetchRecords = async () => {
    if (!date) {
      setMessage("请选择日期");
      setAlertType("warning");
      setTimeout(() => setMessage(""), fade_time);
      return;
    }

    setIsLoading(true); // 设置加载状态

    try {
      const response = await axios.get(`${url}/trading_records`, {
        params: { date: date }, // 传递日期参数
      });
      setRecords(response.data); // 更新交易记录
      setMessage("查询成功");
      setAlertType("success");
    } catch (error) {
      setMessage("查询失败，请检查服务器");
      setAlertType("danger");
    } finally {
      setTimeout(() => setMessage(""), fade_time);
      setIsLoading(false); // 取消加载状态
    }
  };

  // 排序方法
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"; // 如果当前为升序，再次点击切换为降序
    }
    setSortConfig({ key, direction });

    const sortedRecords = [...records].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setRecords(sortedRecords); // 更新排序后的记录
  };

  // 计算收益率并格式化为百分比字符串
  const calculateProfitRate = (price, closePrice) => {
    if (!price || !closePrice) return "N/A"; // 如果没有价格数据则返回 "N/A"
    const profitRate = ((closePrice - price) / price) * 100; // 计算收益率
    return `${profitRate.toFixed(2)}%`; // 保留两位小数
  };

  // 格式化时间戳，仅保留小时和分钟
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`; // 格式化为 HH:mm
  };

  // 映射 direction 字段
  const formatDirection = (direction) => {
    if (direction === "Buy_Point") return "buy";
    if (direction === "Sell_Point") return "sell";
    return direction; // 其他情况返回原始值
  };

  return (
    <div>
      <h4>Trading Records</h4>

      {/* 日期输入框和查询按钮 */}
      <div className="input-group mb-3">
        <input
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)} // 更新日期
        />
        <button className="btn btn-primary" onClick={fetchRecords} disabled={isLoading}>
          {isLoading ? "查询中..." : "查询"}
        </button>
      </div>

      {/* 显示消息 */}
      {message && (
        <div className={`alert alert-${alertType}`}>
          {message}
        </div>
      )}

      {/* 交易记录表格 */}
      <table className="table">
        <thead>
          <tr>
            <th>name</th>
            <th onClick={() => handleSort("direction")}>action</th> {/* 添加排序事件 */}
            <th>cost</th>
            <th>price</th>
            <th onClick={() => handleSort("rate")}>rate</th> {/* 添加排序事件 */}
            <th onClick={() => handleSort("timestamp")}>time</th> {/* 添加排序事件 */}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const profitRate = calculateProfitRate(record.price, record.close_price); // 计算收益率
            const profitRateClass = record.close_price >= record.price ? "text-danger" : "text-success"; // 设置颜色类
            return (
              <tr key={index}>
                <td>{record.stock_name}</td>
                <td>{formatDirection(record.direction)}</td> {/* 映射方向 */}
                <td>{record.price.toFixed(2)}</td> {/* 格式化价格 */}
                <td>{record.close_price.toFixed(2)}</td> {/* 格式化价格 */}
                <td className={profitRateClass}>{profitRate}</td>
                <td>{formatTimestamp(record.timestamp)}</td> {/* 格式化时间戳 */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TradingRecord;
