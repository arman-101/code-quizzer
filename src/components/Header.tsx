import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      Swal.fire({
        title: "Logged Out",
        text: "You have successfully logged out.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        timer: 1500,
        timerProgressBar: true,
      });
      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to log out. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <motion.header
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Code Quizzer
        </h1>

        {user && (
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/profile")}
              className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
            >
              Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/achievements")}
              className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
            >
              Achievements
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/leaderboard")}
              className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
            >
              Leaderboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/faq")}
              className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
            >
              FAQ
            </motion.button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium">
                {user.displayName || user.email}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/signin")}
                className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/signup")}
                className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
              >
                Sign Up
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;