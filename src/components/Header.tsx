import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // Add Link for navigation
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    Swal.fire({
      title: "Logged out",
      icon: "info",
      timer: 1500,
      showConfirmButton: false,
    });
    navigate("/sign-in");
  };

  return (
    <motion.header
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-center items-center shadow-lg relative"
    >
      <Link to="/" className="flex items-center space-x-2"> {/* Link to home page */}
        <img src="/icons8-done-bubbles-120.png" alt="Favicon" className="w-8 h-8" />
        <span className="text-2xl font-bold hover:text-yellow-300 transition">Code Quizzer</span>
      </Link>
      {user && (
        <div className="absolute right-4 flex items-center space-x-4">
          <span className="text-base font-medium">{user.displayName || user.email}</span>
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