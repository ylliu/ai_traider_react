import React, { useState, useEffect } from "react";
import axios from "axios";

const MyHoldings = () => {
  // 状态变量，用于存储持仓数据
  const [holdings, setHoldings] = useState([]);
  const [newStock, setNewStock] = useState("");  // 新增持仓的股票名称
  const [costPrice, setCostPrice] = useState("");  // 新增持仓的买入价
  const [message, setMessage] = useState("");  // 显示错误信息
  const [alertType, setAlertType] = useState("info");  // 用于控制提示消息类型（success, danger, info）
  const [fadeOut, setFadeOut] = useState(false);  // 控制提示消息淡出动画
  const [serverIp, setServerIp] = useState(null);
  const port = "5001";  // 替换为你的服务器端口
  const url = `http://${serverIp}:${port}`;
  const fade_time=1000

  // 获取当前持仓列表
  const fetchHoldings = async () => {
    try {
      const response = await axios.get(`${url}/get_holdings`);
      setHoldings(response.data);
    } catch (error) {
      setMessage("获取持仓数据失败");
      setAlertType("warning");
      setTimeout(() => setMessage(""), fade_time);  // 3秒后清除消息
    }
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

  useEffect(() => {
    if (serverIp) { // 当 serverIp 不为 null 时调用 fetchStocks
      fetchHoldings();
    }
  }, [serverIp]);

  // 添加新的持仓
  const handleAddHolding = async () => {
    if (!newStock || !costPrice) {
      setMessage("请输入股票名称和买入价");
      setAlertType("warning");
      setTimeout(() => setMessage(""), fade_time);  // 3秒后清除消息
      return;
    }
    try {
      await axios.post(`${url}/add_holding/${newStock}`, {
        cost_price: parseFloat(costPrice),  // 买入价
      });
      setNewStock(""); // 清空输入框
      setCostPrice(""); // 清空买入价输入框
      fetchHoldings(); // 重新加载持仓列表
      setMessage("持仓添加成功");
      setAlertType("success");
      setFadeOut(true); // 开始淡出效果
      setTimeout(() => setMessage(""), fade_time);  // 1000ms后清除消息
    } catch (error) {
      setMessage("添加持仓失败");
      setAlertType("danger");
      setFadeOut(true); // 开始淡出效果
      setTimeout(() => setMessage(""), fade_time);  // 1000ms后清除消息
    }
  };

  // 删除指定的持仓
  const handleDeleteHolding = async (stockName) => {
    try {
      await axios.post(`${url}/del_holding/${stockName}`);
      fetchHoldings(); // 重新加载持仓列表
      setMessage("持仓删除成功");
      setAlertType("success");
      setFadeOut(true); // 开始淡出效果
      setTimeout(() => setMessage(""), fade_time);  // 1000ms后清除消息
    } catch (error) {
      setMessage("删除持仓失败");
      setAlertType("danger");
      setFadeOut(true); // 开始淡出效果
      setTimeout(() => setMessage(""), fade_time);  // 1000ms后清除消息
    }
  };

  return (
    <div className="container">
      <h4>MyHoldings</h4>

      <div className="d-flex flex-column">
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="请输入股票名称"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
          />
          <input
            type="number"
            className="form-control"
            placeholder="请输入买入价"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
          />
        </div>

        <div>
          <button
            className="btn btn-primary w-100"  // 设置按钮宽度为 100% 以匹配输入框
            onClick={handleAddHolding}
          >
            添加持仓
          </button>
        </div>
      </div>

      {/* 显示消息 */}
      {message && (
        <div
          className={`alert alert-${alertType} ${fadeOut ? "fade-out" : ""}`}
          onTransitionEnd={() => setFadeOut(false)} // 动画结束后重置fadeOut
        >
          {message}
        </div>
      )}

      {/* 持仓列表 */}
      <table className="table mt-3">
        <thead>
          <tr>
            <th>股票名称</th>
            <th>买入价</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.stockName}>
              <td>{holding.stockName}</td>
              <td>{holding.costPrice}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteHolding(holding.stockName)}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyHoldings;
