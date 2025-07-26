import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
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

interface ProfileProps {
  handleResetAll: () => Promise<void>; 
}

const Profile: React.FC<ProfileProps> = ({ handleResetAll }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const iconOptions = [
    { value: "", src: null, name: "None" },
    { value: "1cat", src: Icon1, name: "Cat" },
    { value: "2panda", src: Icon2, name: "Panda" },
    { value: "3bear", src: Icon3, name: "Bear" },
    { value: "4rabbit", src: Icon4, name: "Rabbit" },
    { value: "5meerkat", src: Icon5, name: "Meerkat" },
    { value: "6chicken", src: Icon6, name: "Chicken" },
    { value: "7fox", src: Icon7, name: "Fox" },
    { value: "8dog", src: Icon8, name: "Dog" },
    { value: "9gorilla", src: Icon9, name: "Gorilla" },
  ];

  useEffect(() => {
    console.log("Profile mounted");
    if (user) {
      const fetchProfile = async () => {
        try {
          const profileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setBio(data.bio || "");
            setDisplayName(data.displayName || user.displayName || "");
            setSelectedIcon(data.icon || "1cat");
          } else {
            setSelectedIcon("");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await updateProfile(user, { displayName });
      await setDoc(
        doc(db, "profiles", user.uid),
        { displayName, bio, icon: selectedIcon },
        { merge: true }
      );

      const highScoresQuery = query(
        collection(db, "highScores"),
        where("name", "==", user.displayName || user.email)
      );
      const highScoresSnap = await getDocs(highScoresQuery);
      const updatePromises = highScoresSnap.docs.map((docSnap) =>
        setDoc(docSnap.ref, { name: displayName }, { merge: true })
      );
      await Promise.all(updatePromises);

      window.dispatchEvent(
        new CustomEvent("iconUpdated", { detail: { icon: selectedIcon } })
      );

      Swal.fire({
        title: "Success!",
        text: "Your profile has been updated.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      console.error("Error in handleSave:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = () => {
    Swal.fire({
      title: "Reset My Progress?",
      text: "This will reset all your quiz progress and scores!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reset it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleResetAll();
        Swal.fire("Reset!", "Your progress has been reset.", "success");
      }
    });
  };

  const handleNextIcon = () => {
    const currentIndex = iconOptions.findIndex((opt) => opt.value === selectedIcon);
    const nextIndex = (currentIndex + 1) % iconOptions.length;
    setSelectedIcon(iconOptions[nextIndex].value);
  };

  const handlePrevIcon = () => {
    const currentIndex = iconOptions.findIndex((opt) => opt.value === selectedIcon);
    const prevIndex = (currentIndex - 1 + iconOptions.length) % iconOptions.length;
    setSelectedIcon(iconOptions[prevIndex].value);
  };

  const currentIcon = iconOptions.find((opt) => opt.value === selectedIcon);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8 px-6">
        <h2 className="text-3xl font-bold text-gray-800">Your Profile</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
          Back to Home
        </motion.button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Icon Selector */}
        <div className="mb-6 flex flex-col items-center">
          <span className="text-xl font-semibold text-gray-700 mb-2">
            {currentIcon?.name}
          </span>
          {currentIcon?.src ? (
            <img
              src={currentIcon.src}
              alt="Selected Icon"
              className="w-40 h-40 mb-4"
            />
          ) : (
            <div className="w-40 h-40 mb-4 bg-gray-200 flex items-center justify-center rounded-full">
              <span className="text-gray-500">No Icon</span>
            </div>
          )}
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevIcon}
              className="bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition font-semibold"
            >
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextIcon}
              className="bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition font-semibold"
            >
              Next
            </motion.button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex flex-col items-center space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={loading}
            className={`bg-indigo-500 text-white px-8 py-3 rounded-full hover:bg-indigo-600 transition font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save Profile"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleResetProgress}
            className="w-full max-w-48 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition font-semibold"
          >
            Reset My Progress
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Profile;