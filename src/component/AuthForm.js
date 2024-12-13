import React, { useState, useEffect } from "react";
import axios from "axios";

// 用于检查是否登录
const checkLoginStatus = () => {
  const token = localStorage.getItem("access_token");
  console.log(token); 
  if (token) {
    // 解析 token 并检查是否过期
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = decodedToken.exp * 1000;  // 将过期时间转换为毫秒
      if (expirationTime > Date.now()) {
        return true;  // Token 未过期，表示已登录
      } else {
        localStorage.removeItem("access_token");  // Token 已过期，清除本地存储
        return false;
      }
    } catch (error) {
      localStorage.removeItem("access_token");  // Token 解析失败，清除本地存储
      return false;
    } 
  }
  return false;  // 没有 Token，表示未登录
};

const AuthForm = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true); // 控制显示登录还是注册表单
  const [showRegisterMessage, setShowRegisterMessage] = useState(false); // 控制是否显示注册提示
  const port = "5001";  // 替换为你的服务器端口
  const url = `http://${serverIp}:${port}`;

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
    if (checkLoginStatus()) {
      onAuthSuccess();  // 如果已经登录，调用成功回调
    }
  }, [onAuthSuccess]);

  // 登录提交
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5001/login", {
        username,
        password,
      });
      setMessage(response.data.message);
      const token = response.data.access_token;
      console.log('token', token);
      localStorage.setItem("access_token", token);  // 保存 Token
      onAuthSuccess(); // 登录成功，调用父组件的回调
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  // 注册提交
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5001/register", {
        username,
        password,
      });
      setMessage(response.data.message);
      setIsLogin(true); // 注册成功后切换回登录界面
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  // 表单提交处理
  const handleSubmit = (e) => {
    if (isLogin) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  // 显示注册提示信息
  const handleRegisterMessage = () => {
    setShowRegisterMessage(true);
    setTimeout(() => {
      setShowRegisterMessage(false);
    }, 3000);  // 3秒后自动隐藏提示信息
  };

  return (
    <div className="container d-flex justify-content-center">
      <div style={{ width: "50%" }}>
        <h2>{isLogin ? "登录" : "注册"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名：</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>密码：</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {isLogin ? "登录" : "注册"}
          </button>
        </form>
        {message && <div className="mt-2 text-danger">{message}</div>}
        {showRegisterMessage && (
          <div className="mt-2 text-warning">
            暂未开放注册功能
          </div>
        )}
        <div className="mt-3">
          {isLogin ? (
            <p>
              没有账号？{" "}
              <button
                className="btn btn-link"
                onClick={handleRegisterMessage} // 点击时显示提示信息
              >
                立即注册
              </button>
            </p>
          ) : (
            <p>
              已有账号？{" "}
              <button
                className="btn btn-link"
                onClick={() => setIsLogin(true)} // 切换到登录界面
              >
                立即登录
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
