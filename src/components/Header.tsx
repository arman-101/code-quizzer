import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  return (
    <motion.header
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-lg"
    >
      <Link to="/" className="text-2xl font-bold hover:text-yellow-300 transition">
        Code Quizzer
      </Link>
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-sm">{user.displayName || user.email}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition"
          >
            Logout
          </motion.button>
        </div>
      )}
    </motion.header>
  );
};

export default Header;