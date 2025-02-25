import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate for navigation
import axios from "axios";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ Use React Router for navigation

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://root-auto-grade.onrender.com/signup", {
        username,
        password,
      });

      if (response.status === 201) {
        setMessage("✅ Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500); // ✅ Correct navigation method
      }
    } catch (error) {
      // ✅ Better error handling
      if (error.response) {
        if (error.response.status === 400) {
          setMessage("⚠️ User already exists!");
        } else {
          setMessage(`⚠️ Error: ${error.response.data.error || "Something went wrong"}`);
        }
      } else {
        setMessage("⚠️ Cannot connect to server. Make sure Flask backend is running.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-12 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-5xl font-extrabold mb-6 text-gray-800">Create an Account</h2>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-2xl text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-2xl text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="w-full bg-blue-600 text-white p-4 rounded-lg text-2xl font-semibold hover:bg-blue-700 transition duration-300 shadow-lg">
            Sign Up
          </button>
        </form>

        {message && <p className="mt-5 text-red-500 text-2xl font-semibold">{message}</p>}

        <p className="mt-6 text-gray-700 text-2xl">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-bold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
