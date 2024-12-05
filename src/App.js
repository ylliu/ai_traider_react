import React, { useEffect, useState } from "react";
import TimeShareChart from "./component/time_share_chart";
import MonitorStocks from "./component/MonitorStocks";  // 导入 MonitorStocks 组件
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
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
          { <TimeShareChart /> }
        </div>
      </div>
    </div>
  );
};
export default App;
