import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

  const [user] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalKeys: 0,
    totalLogs: 0,
    totalRequests: 0,
    revenue: "0.00",
    recentUsers: [],
    recentKeys: [],
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      navigate("/");
      return;
    }

    if (savedUser?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const fetchAdminStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Admin stats fetch failed:", err);
        alert("Admin access failed");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-xl text-white">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e15] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">MeterFlow Admin</h1>
          <p className="text-sm text-gray-400">Platform control dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-pink-400">Admin</p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-white px-4 py-2 font-semibold text-black hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold">Admin Overview 👑</h2>
          <p className="mt-2 text-gray-400">
            Monitor users, API keys, requests and revenue
          </p>
        </div>

        <div className="mb-10 grid gap-5 md:grid-cols-6">
          <Card title="Users" value={stats.totalUsers} />
          <Card title="Products" value={stats.totalProducts} />
          <Card title="API Keys" value={stats.totalKeys} />
          <Card title="Logs" value={stats.totalLogs} />
          <Card title="Requests" value={stats.totalRequests} />

          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <p className="text-white/80">Revenue</p>
            <h3 className="mt-3 text-3xl font-bold">₹{stats.revenue}</h3>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentList title="Recent Users" items={stats.recentUsers} />
          <RecentList
            title="Recent API Keys"
            items={stats.recentKeys}
            isKeyList
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-gray-400">{title}</p>
      <h3 className="mt-3 text-3xl font-bold">{value}</h3>
    </div>
  );
}

function RecentList({ title, items, isKeyList = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-5 text-2xl font-bold">{title}</h3>

      {items.length === 0 ? (
        <p className="text-gray-400">No {isKeyList ? "keys" : "users"} found</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl bg-black/30 p-4">
              {isKeyList ? (
                <>
                  <p className="break-all font-mono text-sm">{item.key}</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Product: {item.product?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Owner: {item.user?.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Requests: {item.requestCount || 0}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-400">{item.email}</p>
                  <p className="mt-1 text-sm text-pink-400">{item.role}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
