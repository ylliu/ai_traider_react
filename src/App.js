import React, { useEffect, useState } from "react";
import TimeShareChart from "./component/time_share_chart";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [data, setData] = useState([]);
  const stockCode = "sz300622";  // 示例股票代码
  const serverIp = "127.0.0.1";  // 示例服务器IP地址
  useEffect(() => {
    axios.get(`http://${serverIp}:5000/time_share_data/${stockCode}`)
        .then(response => setData(response.data))
        .catch(error => console.error('Error fetching config:', error));
  }, []);

  return (
    <div>
      <h1>Time Share Chart</h1>
      {data.length > 0 ? <TimeShareChart data={data} /> : <p>Loading...</p>}
    </div>
  );
};

export default App;
