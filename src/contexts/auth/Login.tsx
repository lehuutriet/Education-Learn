import React, { useState } from "react";
import "./Login.css";

// Hàm hiển thị thông báo
const showNotification = () => {
  const notification = document.getElementById("notification");
  notification?.classList.add("show");

  // Ẩn thông báo sau 3 giây
  setTimeout(() => {
    notification?.classList.remove("show");
  }, 3000);
};

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Hàm xử lý sự kiện khi nhấn nút login
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    // Kiểm tra thông tin nhập vào (có thể thay đổi điều kiện này)
    if (username && password) {
      // Hiển thị thông báo thành công
      showNotification();
    } else {
      alert("Please enter both username and password.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Hello & Welcome</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
          nonummy nibh euismod tincidunt ut laoreet dolore.
        </p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="options">
            <label>
              <input type="checkbox" /> Remember
            </label>
            <a href="/">Forgot Password?</a>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>

      {/* Thông báo */}
      <div id="notification" className="notification">
        Login Successful!
      </div>
    </div>
  );
};

export default Login;
