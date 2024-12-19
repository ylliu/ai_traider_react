import React, { useState } from "react";
import axios from "axios";

const TradingRecord = () => {
  const [records, setRecords] = useState([]); // 用于存储交易记录
  const [date, setDate] = useState(""); // 日期参数
  const [message, setMessage] = useState(""); // 消息提示
  const [alertType, setAlertType] = useState("info"); // 提示类型（success, danger, info）

  const port = "5001"; // 替换为你的服务器端口
  const serverIp = "127.0.0.1"; // 替换为你的服务器地址
  const url = `http://${serverIp}:${port}`;

  const fade_time = 1000; // 提示信息淡出的时间

  // 查询交易记录的方法
  const fetchRecords = async () => {
    if (!date) {
      setMessage("请选择日期");
      setAlertType("warning");
      setTimeout(() => setMessage(""), fade_time);
      return;
    }
    try {
      const response = await axios.get(`${url}/trading_records`, {
        params: { date: date }, // 传递日期参数
      });
      setRecords(response.data); // 更新交易记录
      setMessage("查询成功");
      setAlertType("success");
      setTimeout(() => setMessage(""), fade_time);
    } catch (error) {
      setMessage("查询失败，请检查服务器");
      setAlertType("danger");
      setTimeout(() => setMessage(""), fade_time);
    }
  };

  // 计算收益率并格式化为百分比字符串
  const calculateProfitRate = (price, closePrice) => {
    if (!price || !closePrice) return "N/A"; // 如果没有价格数据则返回 "N/A"
    const profitRate = ((closePrice - price) / price) * 100; // 计算收益率
    return `${profitRate.toFixed(2)}%`; // 保留两位小数
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
        <button className="btn btn-primary" onClick={fetchRecords}>
          查询
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
            <th>股票名称</th>
            <th>方向</th>
            <th>买入价</th>
            <th>当前价</th>
            <th>收益率</th>
            <th>时间戳</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const profitRate = calculateProfitRate(record.price, record.close_price); // 计算收益率
            const profitRateClass = record.close_price >= record.price ? "text-danger" : "text-success"; // 设置颜色类
            return (
              <tr key={index}>
                <td>{record.stock_name}</td>
                <td>{record.direction}</td>
                <td>{record.price}</td>
                <td>{record.close_price}</td>
                <td className={profitRateClass}>{profitRate}</td>
                <td>{record.timestamp}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TradingRecord;
