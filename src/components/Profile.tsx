import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import Swal from "sweetalert2";

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
      console.log("Updating Firebase Auth profile...");
      await updateProfile(user, { displayName });
      console.log("Firebase Auth profile updated.");

      console.log("Saving to Firestore profiles...");
      await setDoc(
        doc(db, "profiles", user.uid),
        { displayName, bio },
        { merge: true }
      );
      console.log("Firestore profiles save complete.");

      console.log("Updating highScores...");
      const highScoresQuery = query(
        collection(db, "highScores"),
        where("name", "==", user.displayName || user.email)
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

        <div className="flex justify-center">
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
        </div>
      </div>
    </div>
  );
};

export default Profile;