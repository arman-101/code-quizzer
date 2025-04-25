import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { FaGoogle as GoogleIcon } from "react-icons/fa";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { UserCredential } from "firebase/auth";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showConsent, setShowConsent] = useState(true);
  const [showDenyPopup, setShowDenyPopup] = useState(false);
  const { signUpWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUpWithEmail(email, password);
      toast.success("Signed up successfully!");
      Swal.fire({
        title: `Logged in, ${email.split("@")[0]}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign up. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result: UserCredential = await loginWithGoogle();
      const name = result.user.displayName || result.user.email!.split("@")[0];
      toast.success("Signed up with Google successfully!");
      Swal.fire({
        title: `Logged in, ${name}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign up with Google.");
    }
  };

  const handleAgree = () => {
    setShowConsent(false); 
    setShowDenyPopup(false); 
  };

  const handleDisagree = () => {
    setShowConsent(false); 
    setShowDenyPopup(true);
  };

  const handleReturnToConsent = () => {
    setShowDenyPopup(false); 
    setShowConsent(true); 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-center p-4 bg-gradient-to-br from-purple-400 to-indigo-600 min-h-[calc(100vh-64px)]"
    >
      <Toaster />
      {showConsent ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Consent to Participate</h2>
            <p className="text-gray-600 mb-4">
              Welcome to <strong>Code Quizzer</strong>, a platform to learn programming through interactive quizzes. Before signing up, please review the following consent terms:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-6 space-y-2">
              <li>I have read and understood the participant information for Code Quizzer (version 1, 30/12/2024).</li>
              <li>My participation is voluntary, and I can withdraw at any time without affecting my legal rights.</li>
              <li>My quiz progress and profile data (email, display name, scores) will be stored securely for research purposes and leaderboard display.</li>
              <li>My data may be transferred to the UK for analysis, and anonymous quiz results may be quoted in research outputs.</li>
              <li>I consent to being contacted for future research opportunities related to Code Quizzer.</li>
            </ul>
            <p className="text-gray-600 mb-6">
              By clicking "Agree," you confirm your understanding and consent to participate. If you choose "Don't Agree," you will be prompted to review the consent again.
            </p>
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAgree}
                className="bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition font-semibold"
              >
                Agree
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDisagree}
                className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition font-semibold"
              >
                Don't Agree
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : showDenyPopup ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Consent Required</h2>
            <p className="text-gray-600 mb-6">
              Sorry, you need to accept the terms to access Code Quizzer. Please review the consent form again to proceed with signup.
            </p>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReturnToConsent}
                className="bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition font-semibold"
              >
                Return to Consent
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mt-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign Up</h1>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition shadow-md"
            >
              Register
            </motion.button>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <span className="text-gray-700">or sign up with</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="button"
                onClick={handleGoogleSignUp}
                className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition shadow-md"
              >
                <GoogleIcon className="text-red-500 mr-2" />
                Google
              </motion.button>
            </div>
            <div className="text-center mt-4">
              <p className="text-gray-700">Already have an account?</p>
              <a href="/signin" className="text-indigo-500 hover:underline">
                Sign In here
              </a>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default SignUp;