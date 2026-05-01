import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

  const [user] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [products, setProducts] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const Free_LIMIT = 5;

  const [paymentStatus, setPaymentStatus] = useState(
    localStorage.getItem("paymentStatus") || "unpaid",
  );

  const [stats, setStats] = useState({
    totalRequests: 0,
    totalProducts: 0,
    totalKeys: 0,
    amountDue: "0.00",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    baseUrl: "",
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchData = async () => {
    try {
      const productRes = await axios.get(
        `${API_URL}/api/products/my`,
        getAuthConfig(),
      );

      const keyRes = await axios.get(`${API_URL}/api/keys/my`, getAuthConfig());

      const productsData = productRes.data || [];
      const keysData = keyRes.data || [];

      setProducts(productsData);
      setKeys(keysData);

      const totalRequests = keysData.reduce(
        (sum, item) => sum + (item.requestCount || 0),
        0,
      );

      const extra = Math.max(totalRequests - Free_LIMIT, 0);
      const amountDue = (extra * 0.5).toFixed(2);

      setStats({
        totalRequests,
        totalProducts: productsData.length,
        totalKeys: keysData.length,
        amountDue,
      });
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createProduct = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/api/products`, productForm, getAuthConfig());

      alert("Product Created Successfully");

      setProductForm({
        name: "",
        slug: "",
        baseUrl: "",
      });

      fetchData();
    } catch {
      alert("Failed to create product");
    }
  };

  const generateKey = async (productId) => {
    try {
      await axios.post(
        `${API_URL}/api/keys/generate`,
        { productId },
        getAuthConfig(),
      );

      alert("API Key Generated");
      fetchData();
    } catch {
      alert("Failed to generate key");
    }
  };

  const testApiRequest = async (item) => {
    try {
      const slug = item.product?.slug || item.apiProduct?.slug;

      if (!slug) {
        alert("Product slug missing");
        return;
      }

      await axios.get(`${API_URL}/api/gateway/${slug}`, {
        headers: {
          "x-api-key": item.key,
        },
      });

      alert("Test request successful");
      fetchData();
    } catch {
      alert("API request failed");
    }
  };

  const copyKey = async (key) => {
    await navigator.clipboard.writeText(key);
    alert("API Key copied");
  };

  const payBill = async () => {
    try {
      if (Number(stats.amountDue) <= 0) {
        alert("No amount due");
        return;
      }

      if (!window.Razorpay) {
        alert("Razorpay script not loaded");
        return;
      }

      const { data } = await axios.post(
        `${API_URL}/api/payment/create-order`,
        { amount: stats.amountDue },
        getAuthConfig(),
      );

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "MeterFlow",
        description: "API Usage Billing Payment",
        order_id: data.order.id,

        handler: async function (response) {
          await axios.post(
            `${API_URL}/api/payment/verify`,
            response,
            getAuthConfig(),
          );

          localStorage.setItem("paymentStatus", "paid");
          setPaymentStatus("paid");
          alert("Payment successful");
        },

        prefill: {
          name: user?.name || "MeterFlow User",
          email: user?.email || "test@example.com",
        },

        theme: {
          color: "#ec4899",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      alert("Payment failed");
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      await fetchData();
    };

    init();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-xl text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e15] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">MeterFlow</h1>
          <p className="text-sm text-gray-400">Usage Billing Dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
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
          <h2 className="text-4xl font-bold">Welcome Back 👋</h2>
          <p className="mt-2 text-gray-400">
            Manage APIs, requests and billing
          </p>
        </div>

        <div className="mb-10 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-gray-400">Total Requests</p>
            <h3 className="mt-3 text-4xl font-bold">{stats.totalRequests}</h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-gray-400">Products</p>
            <h3 className="mt-3 text-4xl font-bold">{stats.totalProducts}</h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-gray-400">API Keys</p>
            <h3 className="mt-3 text-4xl font-bold">{stats.totalKeys}</h3>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <p className="text-white/80">Amount Due</p>
            <h3 className="mt-3 text-4xl font-bold">₹{stats.amountDue}</h3>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-5 text-2xl font-bold">Create API Product</h3>

          <form onSubmit={createProduct} className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              name="name"
              value={productForm.name}
              onChange={handleProductChange}
              placeholder="Product Name"
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              name="slug"
              value={productForm.slug}
              onChange={handleProductChange}
              placeholder="Slug e.g. pokemon-api"
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              name="baseUrl"
              value={productForm.baseUrl}
              onChange={handleProductChange}
              placeholder="Base URL"
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none"
              required
            />

            <button
              type="submit"
              className="rounded-xl bg-white py-3 font-semibold text-black md:col-span-3"
            >
              Create Product
            </button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-5 text-2xl font-bold">API Products</h3>

            {products.length === 0 ? (
              <p className="text-gray-400">No Products Found</p>
            ) : (
              <div className="space-y-4">
                {products.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-white/10 bg-black/30 p-4"
                  >
                    <h4 className="text-lg font-bold">{item.name}</h4>
                    <p className="mb-2 text-sm text-gray-400">{item.slug}</p>
                    <p className="mb-3 break-all text-xs text-gray-500">
                      {item.baseUrl}
                    </p>

                    <button
                      onClick={() => generateKey(item._id)}
                      className="rounded-lg bg-pink-600 px-4 py-2 text-sm hover:bg-pink-700"
                    >
                      Generate Key
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-5 text-2xl font-bold">API Keys</h3>

            {keys.length === 0 ? (
              <p className="text-gray-400">No Keys Found</p>
            ) : (
              <div className="space-y-4">
                {keys.map((item) => {
                  const productName =
                    item.product?.name || item.apiProduct?.name || "Product";

                  return (
                    <div key={item._id} className="rounded-xl bg-black/30 p-4">
                      <p className="text-sm text-gray-400">{productName}</p>

                      <p className="mt-2 break-all font-mono text-sm font-semibold">
                        {item.key}
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        Requests: {item.requestCount || 0}
                      </p>

                      <p
                        className={`mt-1 text-sm ${
                          item.active ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {item.active ? "Active" : "Revoked"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          onClick={() => copyKey(item.key)}
                          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
                        >
                          Copy Key
                        </button>

                        <button
                          onClick={() => testApiRequest(item)}
                          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                        >
                          Test Request
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-5 text-2xl font-bold">Usage Billing</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-3">API Key</th>
                  <th className="py-3">Requests</th>
                  <th className="py-3">Cost</th>
                </tr>
              </thead>

              <tbody>
                {keys.length === 0 ? (
                  <tr>
                    <td className="py-4 text-gray-400" colSpan="3">
                      No billing data yet.
                    </td>
                  </tr>
                ) : (
                  keys.map((item) => {
                    const reqCount = item.requestCount || 0;
                    const extra = Math.max(reqCount - Free_LIMIT, 0);
                    const cost = extra * 0.5;

                    return (
                      <tr key={item._id} className="border-b border-white/5">
                        <td className="py-3 font-mono text-sm">
                          {item.key.slice(0, 22)}...
                        </td>
                        <td className="py-3">{reqCount}</td>
                        <td className="py-3 font-semibold text-pink-400">
                          ₹{cost.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-2xl font-bold">Payment Summary</h3>

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-gray-400">Current Bill</p>
              <h2 className="mt-2 text-4xl font-bold">₹{stats.amountDue}</h2>

              <p className="mt-2 text-sm">
                Status:
                <span
                  className={
                    paymentStatus === "paid"
                      ? "ml-2 text-green-400"
                      : "ml-2 text-yellow-400"
                  }
                >
                  {paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </span>
              </p>
            </div>

            <button
              onClick={payBill}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
