import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SetShowPassword,
  updateLoginForm,
  setToken,
  setRefreshToken,
  setAuthenticated,
  setUser,
  resetLoginForm,
  setProfile,
} from "../utils/userSlice";
import { hideLoginButton } from "../utils/headerSlice";
import { setCurrentPage } from "../utils/appSlice";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Component/Header.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../utils/authUtils";

function Login() {
  const { showpassword, loginForm } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    dispatch(hideLoginButton());
    dispatch(setCurrentPage("login"));
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    dispatch(updateLoginForm({ [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(setToken(data.token));
        dispatch(setRefreshToken(data.refreshToken));
        dispatch(setAuthenticated(true));

        const userData = data.user || { email: loginForm.email };
        dispatch(setUser(userData));

        dispatch(
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            branch: userData.branch || "",
            whatsapp: userData.whatsappNumber || "",
          })
        );

        dispatch(resetLoginForm());

        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 1500,
        });

        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        toast.error(data.message || "Invalid credentials", {
          position: "top-right",
        });
      }
    } catch (err) {
      toast.error("Server error. Please try again later.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    dispatch(SetShowPassword());
  };

  return (
    <>
      <ToastContainer />
      <Header />
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto shadow-2xl rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/50">
          {/* Left Image Section */}
          <div className="hidden md:block md:w-1/2">
            <img
              className="h-full w-full object-cover"
              src="https://res.cloudinary.com/dzkprawxw/image/upload/v1754252837/sign-in_ahpmg5.png"
              alt="Login visual"
            />
          </div>

          {/* Right Form Section */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm flex flex-col"
            >
              <h2 className="text-3xl sm:text-4xl text-gray-900 font-medium text-center">
                Sign in
              </h2>
              <p className="text-sm text-gray-500/90 mt-3 text-center">
                Welcome back! Please sign in to continue
              </p>
              <p className="text-center text-sm text-gray-600 mt-2 mb-4">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Register now
                </Link>
              </p>

              {/* Email */}
              <div className="flex items-center w-full border border-white/60 bg-white/50 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-white h-12 rounded-2xl px-4 gap-3 mt-4 transition-all duration-300 shadow-sm">
                <span className="text-gray-400">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleChange}
                  placeholder="Email ID"
                  className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative flex items-center mt-6 w-full border border-white/60 bg-white/50 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-white h-12 rounded-2xl px-4 pr-12 gap-3 transition-all duration-300 shadow-sm">
                <span className="text-gray-400">🔒</span>
                <input
                  type={showpassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm w-full h-full"
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-4 text-xl text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {showpassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Remember Me + Forgot */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-gray-500/80 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input className="h-4 w-4" type="checkbox" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm underline text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </Link>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`mt-8 w-full h-12 rounded-2xl text-white font-medium shadow-lg transform transition-all duration-300 ${
                  loading
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-1 hover:shadow-indigo-500/30"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
