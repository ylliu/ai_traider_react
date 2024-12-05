import React, { useEffect, useState } from "react";
import TimeShareChart from "./component/time_share_chart";
import MonitorStocks from "./component/MonitorStocks";  // 导入 MonitorStocks 组件
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [data, setData] = useState([]);
  const stockCode = "易点天下";  // 示例股票代码
  const serverIp = "127.0.0.1";  // 替换为你的服务器IP
  const port = "5001";  // 替换为你的服务器端口
  const url = `http://${serverIp}:${port}`;
 

  return (
    <div className="container-fluid">
      <div className="row">
        {/* 左侧窗口，包含 MonitorStocks 组件 */}
        <div className="col-md-3 bg-light p-3">
          <MonitorStocks />  {/* 显示 MonitorStocks 组件 */}
        </div>
        {/* 右侧窗口，包含 TimeShareChart 组件 */}
        <div className="col-md-9 p-3">
          <h4>Stock Sell Assistant </h4>
          { <TimeShareChart data={data} /> }
        </div>
      </div>
    </div>
  );
};
export default App;
