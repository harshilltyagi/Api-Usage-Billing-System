import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, form);

      alert("Account Created Successfully");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
        {/* Left Section */}
        <div className="hidden md:flex relative bg-gradient-to-br from-blue-700 via-purple-700 to-pink-600 p-10 text-white flex-col justify-between">
          <div>
            <p className="uppercase tracking-[5px] text-sm opacity-80">
              MeterFlow
            </p>
          </div>

          <div>
            <h1 className="text-6xl font-bold leading-tight">
              Join <br />
              Build <br />
              Grow
            </h1>

            <p className="mt-6 text-lg text-gray-200 max-w-sm">
              Create your account and manage API products, billing, analytics
              and users with premium tools.
            </p>
          </div>

          <div className="text-sm text-gray-200">© 2026 MeterFlow Platform</div>
        </div>

        {/* Right Section */}
        <div className="p-8 md:p-14 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">
              Register to access your dashboard
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

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
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-purple-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
