import React, { useEffect, useState } from "react";
import TimeShareChart from "./component/time_share_chart";

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 模拟加载 JSON 文件
    fetch("/timeshare_data.json")
      .then(response => response.json())
      .then(json => setData(json))
      .catch(error => console.error("Error loading data:", error));
  }, []);

  return (
    <div>
      <h1>Time Share Chart</h1>
      {data.length > 0 ? <TimeShareChart data={data} /> : <p>Loading...</p>}
    </div>
  );
};

export default App;
