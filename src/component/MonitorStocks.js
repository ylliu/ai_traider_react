import React, { useState, useEffect } from "react";
import "../css/MonitorStocks.css";
const MonitorStocks = () => {
  const [stockName, setStockName] = useState("");  // 存储输入的股票名称
  const [stocks, setStocks] = useState([]);  // 存储股票池中的所有股票
  const [isProcessing, setIsProcessing] = useState(false);  // 控制按钮是否禁用
  const [alertMessage, setAlertMessage] = useState("");  // 用于显示自动消失的提示消息
  const [alertType, setAlertType] = useState("info");  // 用于控制提示消息类型（success, danger, info）
  const [fadeOut, setFadeOut] = useState(false);  // 控制提示消息淡出动画
  const [isMonitoring, setIsMonitoring] = useState(false);  // 新增监控状态
  const [isStopMonitoring, setIsStopMonitoring] = useState(false);  // 新增监控状态
  const [serverIp, setServerIp] = useState(null);
  const port = "5001";  // 替换为你的服务器端口
  const [url, setUrl] = useState(null); 
  const disappearTime = 1000;  // 提示消息自动消失时间

  useEffect(() => {
    fetch('./server_ip.json')
      .then(response => response.json())
      .then(data => {
        setServerIp(data.server_ip);
        setUrl(`http://${data.server_ip}:${port}`);
        console.log(data.server_ip); // 确保正确获取到 serverIp
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);
  
  // 从数据库加载所有股票池列表
  const fetchStocks = async () => {
    try {
      const response = await fetch(`${url}/get_all_stocks`);
      if (response.ok) {
        const data = await response.json();
        setStocks(data);  // 更新股票列表
      } else {
        setAlertMessage("Failed to fetch stock list.");
        setAlertType("danger");  // 错误提示
        setTimeout(() => setAlertMessage(""), disappearTime);  // 3秒后自动消失
      }
    } catch (error) {
      console.error("Error fetching stock list:", error);
      setAlertMessage("Error fetching stock list.");
      setAlertType("danger");
      setTimeout(() => setAlertMessage(""), disappearTime);  // 3秒后自动消失
    }
  };

  // 添加股票到股票池
  const handleAddStock = async () => {
    if (!stockName) {
      setAlertMessage("Please enter a stock name.");
      setAlertType("warning");
      setFadeOut(true);
      setTimeout(() => setAlertMessage(""), disappearTime);  // 3秒后自动消失
      setFadeOut(false);
      return;
    }

    setIsProcessing(true);  // 开始处理，禁用按钮

    try {
      const response = await fetch(`${url}/add_stock/${stockName}`, {
        method: "POST",
      });
      if (response.ok) {
        // 添加成功，重新加载股票池
        fetchStocks();
        setStockName("");  // 清空输入框
      } else {
        setAlertMessage("Failed to add stock.");
        // setAlertType("danger");
        setFadeOut(true);
        setTimeout(() => setAlertMessage(""), disappearTime);  // 3秒后自动消失
        setFadeOut(false);
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      setAlertMessage("Error adding stock.");
      setAlertType("danger");
      setFadeOut(true);
      setTimeout(() => setAlertMessage(""), disappearTime);  // 3秒后自动消失
      setFadeOut(false);
    } finally {
      setIsProcessing(false);  // 完成处理，恢复按钮状态
    }
  };

  // 删除股票
  const handleDeleteStock = async (code) => {
    if (isProcessing) return;

   

    try {
      const response = await fetch(`${url}/delete_stock/${code}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // 删除成功，重新加载股票池
        fetchStocks();
      } else {
        setAlertMessage("Failed to delete stock.");
        setAlertType("danger");
        setTimeout(() => setAlertMessage(""), disappearTime);  // 3秒后自动消失
      }
    } catch (error) {
      console.error("Error deleting stock:", error);
      setAlertMessage("Error deleting stock.");
      setAlertType("danger");
      setTimeout(() => setAlertMessage(""), disappearTime);  // 3秒后自动消失
    } finally {
     
    }
  };

  const handleStartMonitor = async () => {
    setIsMonitoring(true);
    try {
      const response = await fetch(`${url}/start_monitor`, {
        method: "POST",
      });
      if (response.ok) {
        setAlertMessage("监控已开始");
        setAlertType("success");
        setTimeout(() => setAlertMessage(""), disappearTime);
      } else {
        setAlertMessage("启动监控失败。");
        setAlertType("danger");
        setTimeout(() => setAlertMessage(""), disappearTime);
      }
    } catch (error) {
      console.error("Error starting monitor:", error);
      setAlertMessage("启动监控时出错。");
      setAlertType("danger");
      setTimeout(() => setAlertMessage(""), disappearTime);
    } finally {
   
    }
  };

  const handleStopMonitor = async () => {
   setIsStopMonitoring(true);
    try {
      const response = await fetch(`${url}/stop_monitor`, {
        method: "POST",
      });
      if (response.ok) {
        setAlertMessage("监控已结束");
        setAlertType("success");
        setTimeout(() => setAlertMessage(""), disappearTime);
        setIsMonitoring(false);
      } else {
        setAlertMessage("结束监控失败。");
        setAlertType("danger");
        setTimeout(() => setAlertMessage(""), disappearTime);
      }
    } catch (error) {
      console.error("Error stopping monitor:", error);
      setAlertMessage("结束监控时出错。");
      setAlertType("danger");
      setTimeout(() => setAlertMessage(""), disappearTime);
    } finally {
      setIsStopMonitoring(false);
    }
  };

  // 组件首次渲染时，加载所有股票池
  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <div className="container">
      <h4>Monitor Stocks</h4>
      {/* 输入框和添加按钮 */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            className="form-control"
            placeholder="Enter stock name"
          />
        </div>
        <div className="col-md-6">
          <button
            onClick={handleAddStock}
            className="btn btn-primary"
            disabled={isProcessing}  // 如果正在处理，禁用按钮
          >
            {isProcessing ? "添加中..." : "添加监控"}
          </button>
        </div>
      </div>
       {/* 开始监控和结束监控按钮 */}
       <div className="row mb-3">
        <div className="col-md-6">
          <button
            onClick={handleStartMonitor}
            className="btn btn-success"
            disabled={isMonitoring}
          >
              {isMonitoring ? "正在监控" : "开始监控"}
          </button>
        </div>
        <div className="col-md-6">
          <button
            onClick={handleStopMonitor}
            className="btn btn-warning"
            disabled={isStopMonitoring}
          >
            结束监控
          </button>
        </div>
      </div>
       {/* 显示提示消息 */}
      {alertMessage && (
        <div
          className={`alert alert-${alertType} ${fadeOut ? "fade-out" : ""}`}
          role="alert"
        >
          {alertMessage}
        </div>
      )}
      {/* 股票池列表 */}
      <h4>Stock Pool</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Code</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.length === 0 ? (
            <tr>
              <td colSpan="3">No stocks in the pool</td>
            </tr>
          ) : (
            stocks.map((stock, index) => (
              <tr key={index}>
                <td>{stock.name}</td>
                <td>{stock.stock_code}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteStock(stock.stock_code)}
                    disabled={isProcessing}  // 如果正在处理，禁用删除按钮
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
       
    </div>
  );
};

export default MonitorStocks;
