import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { FaGoogle as GoogleIcon } from "react-icons/fa";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { UserCredential } from "firebase/auth";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      toast.success("Signed in successfully!");
      Swal.fire({
        title: `Logged in, ${email.split("@")[0]}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign in. Check your credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result: UserCredential = await loginWithGoogle();
      const name = result.user.displayName || result.user.email!.split("@")[0];
      toast.success("Signed in with Google successfully!");
      Swal.fire({
        title: `Logged in, ${name}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign in with Google.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-center p-4 bg-gradient-to-br from-purple-400 to-indigo-600 min-h-[calc(100vh-64px)]"
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mt-8">
        <Toaster />
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign In</h1>
        <form onSubmit={handleSignIn} className="space-y-6">
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
            Sign In
          </motion.button>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <span className="text-gray-700">or sign in with</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition shadow-md"
            >
              <GoogleIcon className="text-red-500 mr-2" />
              Google
            </motion.button>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-700">Don't have an account?</p>
            <a href="/signup" className="text-indigo-500 hover:underline">
              Register here
            </a>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SignIn;