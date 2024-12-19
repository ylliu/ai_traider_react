import React, { useEffect, useState } from "react";
import TimeShareChart from "./component/time_share_chart";
import MonitorStocks from "./component/MonitorStocks";  // 导入 MonitorStocks 组件
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthForm from "./component/AuthForm";  // 导入 Register 组件
import MyHoldings from "./component/MyHoldings";  // 导入 MyHoldings 组件
import TradingRecord from "./component/TradingRecord";  // 导入 TradingRecord 组件
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true); // 认证成功后设置为已登录
  };


  // // 如果用户没有注册，显示注册界面
  // if (!isAuthenticated) {
  //   return (
  //     <div className="container-fluid">
  //       <div className="row">
  //         <div className="col-md-12 p-3">
  //           <AuthForm onAuthSuccess={handleAuthSuccess} />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

 
  return (
    <div className="container-fluid"> {/* 使用 Bootstrap 的 container-fluid 类，支持全宽页面布局 */}
      <div className="row"> {/* Bootstrap 的行布局 */}
        
        {/* 左侧窗口，包含 MonitorStocks 组件 */}
        <div className="col-md-3 bg-light p-3"> {/* 左侧区域，宽度占 3 列 */}
          <MonitorStocks />  {/* 显示 MonitorStocks 组件 */}
        </div>
        
        {/* 中间窗口 */}
        <div className="col-md-6 p-3"> {/* 中间区域，宽度占 6 列 */}
          {/* Stock Sell Assistant 区域 */}
          <h4>Stock Sell Assistant</h4>
          <TimeShareChart /> {/* 显示分时图 TimeShareChart 组件 */}
          
          {/* Trading Records 区域 */}
          <TradingRecord /> {/* 显示交易记录 TradingRecord 组件 */}
        </div>
        
        {/* 右侧窗口，包含 MyHoldings 组件 */}
        <div className="col-md-3 p-3"> {/* 右侧区域，宽度占 3 列 */}
          <MyHoldings />  {/* 显示 MyHoldings 组件 */}
        </div>
  
      </div>
    </div>
  );
};
export default App;
