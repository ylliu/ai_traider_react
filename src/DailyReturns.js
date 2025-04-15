import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";
import "bootstrap/dist/css/bootstrap.min.css";

const DailyReturns = () => {
  const [dailyReturns, setDailyReturns] = useState({});
  const [currentDate, setCurrentDate] = useState(getTodayDate());
  const [currentReturn, setCurrentReturn] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [fadeOut, setFadeOut] = useState(false);
  const [serverIp, setServerIp] = useState(null);
  const [allowedPositionSize, setAllowedPositionSize] = useState(null);  // State for max position size
  const port = "5001";
  const url = `http://${serverIp}:${port}`;
  const fadeTime = 1000; // 消息淡出时间

  // 获取当前日期
  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // 获取本月的所有收益数据
  const fetchCurrentMonthReturns = async () => {
    try {
      const response = await axios.get(`${url}/get_current_month_returns`);
      setDailyReturns(response.data);
    } catch (error) {
      setMessage("获取本月收益数据失败");
      setAlertType("warning");
      triggerFadeOut();
    }
  };

  // 获取最大仓位
  const fetchAllowedPositionSize = async () => {
    try {
      const response = await axios.get(`${url}/allowed_position_size`);
      setAllowedPositionSize(response.data.size*100);
    } catch (error) {
      setMessage("获取最大仓位失败");
      setAlertType("warning");
      triggerFadeOut();
    }
  };

  // 添加新的收益率
  const handleAddReturn = async () => {
    if (!currentDate || !currentReturn) {
      setMessage("请输入日期和收益率");
      setAlertType("warning");
      triggerFadeOut();
      return;
    }

    try {
      await axios.post(`${url}/add_return`, {
        date: currentDate,
        return: parseFloat(currentReturn),
      });
      setMessage("收益率添加成功");
      setAlertType("success");
      setCurrentDate(getTodayDate());
      setCurrentReturn("");
      await fetchCurrentMonthReturns(); // 刷新收益数据
      triggerFadeOut();
    } catch (error) {
      setMessage("添加收益率失败");
      setAlertType("danger");
      triggerFadeOut();
    }
  };

  // 删除收益率
  const handleDeleteReturn = async (date) => {
    try {
      await axios.delete(`${url}/delete_return/${date}`);
      setMessage(`成功删除 ${date} 的收益率`);
      setAlertType("success");
      await fetchCurrentMonthReturns(); // 刷新收益数据
      triggerFadeOut();
    } catch (error) {
      setMessage(`删除 ${date} 的收益率失败`);
      setAlertType("danger");
      triggerFadeOut();
    }
  };

  // 触发消息淡出动画
  const triggerFadeOut = () => {
    setFadeOut(true);
    setTimeout(() => setFadeOut(false), fadeTime);
  };

  // 计算累计收益
  const calculateCumulativeReturns = () => {
    const dates = Object.keys(dailyReturns).sort();
    let cumulative = 1;
    return dates.map((date) => {
      cumulative *= 1 + (dailyReturns[date] / 100 || 0);
      return { date, cumulative };
    });
  };

  // 准备图表数据
  const chartData = calculateCumulativeReturns();
  const data = {
    labels: chartData.map((point) => point.date),
    datasets: [
      {
        label: "Cumulative Returns",
        data: chartData.map((point) => point.cumulative),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  // 页面加载时获取服务器 IP、本月收益数据和最大仓位数据
  useEffect(() => {
    fetch("./server_ip.json")
      .then((response) => response.json())
      .then((data) => {
        setServerIp(data.server_ip);
      })
      .catch((error) => {
        console.error("Error fetching server IP:", error);
      });
  }, []);

  useEffect(() => {
    if (serverIp) {
      fetchCurrentMonthReturns();
      fetchAllowedPositionSize(); // Fetch allowed position size when server IP is available
    }
  }, [serverIp]);

  return (
    <div className="container mt-4">
    <h4 className="text-start mb-4">Daily Returns Tracker</h4>

    {/* 显示最大仓位 */}
    <div className="card mb-4">
    <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">Max Position Size</h6>
        {allowedPositionSize !== null ? (
            <p className="fs-5 mb-0">{allowedPositionSize}%</p>
        ) : (
            <p className="text-muted fs-6 mb-0">Loading...</p>
        )}
        </div>
    </div>
    </div>

      {/* 添加收益率 */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title">Add Daily Return</h4>
          <form className="row g-3">
            <div className="col-md-6">
              <label htmlFor="date" className="form-label">
                Select Date:
              </label>
              <input
                id="date"
                type="date"
                className="form-control"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="return" className="form-label">
                Enter Return (%):
              </label>
              <input
                id="return"
                type="number"
                className="form-control"
                value={currentReturn}
                onChange={(e) => setCurrentReturn(e.target.value)}
              />
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleAddReturn}
              >
                Add Return
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 显示消息 */}
      {message && (
        <div
          className={`alert alert-${alertType} ${fadeOut ? "fade-out" : ""}`}
          onTransitionEnd={() => setFadeOut(false)}
        >
          {message}
        </div>
      )}

      {/* 收益列表 */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title">Daily Returns</h4>
          {Object.keys(dailyReturns).length === 0 ? (
            <p className="text-muted">No returns added yet.</p>
          ) : (
            <ul className="list-group">
              {Object.entries(dailyReturns).map(([date, value]) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={date}
                >
                  <div>
                    {date}:{" "}
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          value > 0
                            ? "#8B0000"
                            : value < 0
                            ? "#ADD8E6"
                            : "#D3D3D3",
                        color: value > 0 || value < 0 ? "white" : "black",
                      }}
                    >
                      {value}%
                    </span>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteReturn(date)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 累计收益曲线 */}
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Cumulative Returns Chart</h4>
          <Line data={data} />
        </div>
      </div>
    </div>
  );
};

export default DailyReturns;
