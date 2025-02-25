import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Redirect after login

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://root-auto-grade.onrender.com/login", {
        username,
        password,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token); // Save token
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/quiz"), 1500);
      } else {
        setMessage("⚠️ Invalid credentials");
      }
    } catch (error) {
      setMessage("⚠️ Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Welcome Back!
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300">
            Login
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-green-500 font-semibold">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
