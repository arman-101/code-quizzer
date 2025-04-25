import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";

import Icon1 from "../assets/icons/1cat.png";
import Icon2 from "../assets/icons/2panda.png";
import Icon3 from "../assets/icons/3bear.png";
import Icon4 from "../assets/icons/4rabbit.png";
import Icon5 from "../assets/icons/5meerkat.png";
import Icon6 from "../assets/icons/6chicken.png";
import Icon7 from "../assets/icons/7fox.png";
import Icon8 from "../assets/icons/8dog.png";
import Icon9 from "../assets/icons/9gorilla.png";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedIcon, setSelectedIcon] = useState<string>("");

  const iconOptions = [
    { value: "1cat", src: Icon1 },
    { value: "2panda", src: Icon2 },
    { value: "3bear", src: Icon3 },
    { value: "4rabbit", src: Icon4 },
    { value: "5meerkat", src: Icon5 },
    { value: "6chicken", src: Icon6 },
    { value: "7fox", src: Icon7 },
    { value: "8dog", src: Icon8 },
    { value: "9gorilla", src: Icon9 },
  ];

  useEffect(() => {
    if (user) {
      const fetchIcon = async () => {
        try {
          const profileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (profileDoc.exists()) {
            setSelectedIcon(profileDoc.data().icon || "1cat");
          } else {
            setSelectedIcon("");
          }
        } catch (error) {
          console.error("Error fetching icon:", error);
        }
      };
      fetchIcon();
    }

    const handleIconUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ icon: string }>;
      setSelectedIcon(customEvent.detail.icon);
    };
    window.addEventListener("iconUpdated", handleIconUpdate);
    return () => window.removeEventListener("iconUpdated", handleIconUpdate);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      await Swal.fire({
        title: "Logged Out",
        text: "You have successfully logged out.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        timer: 1500,
        timerProgressBar: true,
      });
      navigate("/signin", { replace: true });
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
              {selectedIcon && (
                <img
                  src={iconOptions.find((opt) => opt.value === selectedIcon)?.src}
                  alt="User Icon"
                  className="w-7 h-7 mr-2"
                />
              )}
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
              <a href="/signin" className="text-indigo-500 hover:underline">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
                >
                  Sign In
                </motion.button>
              </a>
              <a href="/signup" className="text-indigo-500 hover:underline">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition"
                >
                  Sign Up
                </motion.button>
              </a>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;