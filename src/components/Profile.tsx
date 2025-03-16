import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import Swal from "sweetalert2";
import { topics } from "../data/questions"; // Import topics to get topic names

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const profileDoc = await getDoc(doc(db, "profiles", user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setBio(data.bio || "");
            setDisplayName(data.displayName || user.displayName || "");
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
      // Update Firebase Auth profile
      console.log("Updating Firebase Auth profile...");
      await updateProfile(user, { displayName });
      console.log("Firebase Auth profile updated.");

      // Save to Firestore profiles
      console.log("Saving to Firestore profiles...");
      await setDoc(
        doc(db, "profiles", user.uid),
        { displayName, bio },
        { merge: true }
      );
      console.log("Firestore profiles save complete.");

      // Update all highScores entries for this user
      console.log("Updating highScores...");
      const highScoresQuery = query(
        collection(db, "highScores"),
        where("name", "==", user.displayName || user.email) // Match old name
      );
      const highScoresSnap = await getDocs(highScoresQuery);
      const updatePromises = highScoresSnap.docs.map((docSnap) =>
        setDoc(docSnap.ref, { name: displayName }, { merge: true })
      );
      await Promise.all(updatePromises);
      console.log("HighScores updated.");

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
      console.log("Loading state reset.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-start justify-center" // Changed p-8 to p-4, items-center to items-start
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full border border-gray-200">
        <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
          Your Profile
        </h2>

        <div className="flex justify-center mb-6">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-indigo-200 object-cover"
            />
          ) : (
            <img
              src="https://via.placeholder.com/120"
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-indigo-200 object-cover"
            />
          )}
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

        <div className="flex justify-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-full shadow-md hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-lg font-semibold"
          >
            Back to Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={loading}
            className={`bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-full shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 text-lg font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save Profile"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;