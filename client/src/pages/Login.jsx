import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        form,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login Successful");
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
        {/* Left Section */}
        <div className="hidden md:flex relative bg-gradient-to-br from-pink-600 via-purple-700 to-blue-700 p-10 text-white flex-col justify-between">
          <div>
            <p className="uppercase tracking-[5px] text-sm opacity-80">
              MeterFlow
            </p>
          </div>

          <div>
            <h1 className="text-6xl font-bold leading-tight">
              Build <br />
              APIs <br />
              Faster
            </h1>

            <p className="mt-6 text-lg text-gray-200 max-w-sm">
              Secure API billing, usage tracking, analytics and growth tools in
              one dashboard.
            </p>
          </div>

          <div className="text-sm text-gray-200">© 2026 MeterFlow Platform</div>
        </div>

        {/* Right Section */}
        <div className="p-8 md:p-14 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Login to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 mt-8">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
