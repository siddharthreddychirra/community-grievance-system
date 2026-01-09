import { useState, useEffect } from "react";
import { apiRequest } from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowLeft, LogIn, Loader2, MapPin } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const roleSelected = params.get("role"); // citizen / staff / admin

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [locality, setLocality] = useState("");
  const [autoDetecting, setAutoDetecting] = useState(false);

  const localities = [
    { id: "jangaon", name: "Jangaon", coords: { lat: 17.7269, lng: 79.1514 } },
    { id: "warangal", name: "Warangal", coords: { lat: 17.9689, lng: 79.5941 } },
    { id: "narapally", name: "Narapally", coords: { lat: 17.4948, lng: 78.5863 } },
    { id: "pocharam", name: "Pocharam", coords: { lat: 17.5688, lng: 78.7858 } },
    { id: "karimnagar", name: "Karimnagar", coords: { lat: 18.4386, lng: 79.1288 } }
  ];

  // Auto-detect location on mount
  useEffect(() => {
    function findNearestLocality(lat, lng) {
      let nearest = localities[0].id;
      let minDistance = Infinity;

      localities.forEach((loc) => {
        const distance = Math.sqrt(
          Math.pow(lat - loc.coords.lat, 2) + Math.pow(lng - loc.coords.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = loc.id;
        }
      });

      return nearest;
    }

    async function detectLocation() {
      if (!navigator.geolocation) {
        return;
      }

      setAutoDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearest = findNearestLocality(latitude, longitude);
          setLocality(nearest);
          setAutoDetecting(false);
        },
        () => {
          setAutoDetecting(false);
        }
      );
    }

    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!locality) {
      alert("Please select a locality");
      return;
    }
    
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/login", "POST", {
        email,
        password,
        locality, // Send locality with login
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "staff") navigate("/staff");
      else navigate("/dashboard");
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const roleColors = {
    citizen: 'from-blue-600 to-cyan-600',
    staff: 'from-green-600 to-emerald-600',
    admin: 'from-purple-600 to-pink-600'
  };

  const currentGradient = roleColors[roleSelected] || 'from-blue-600 to-indigo-600';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute -top-12 left-0 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${currentGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {roleSelected
                ? `${roleSelected.charAt(0).toUpperCase() + roleSelected.slice(1)} Login`
                : "Welcome Back"}
            </h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          {/* Input Fields */}
          <div className="space-y-5">
            {/* Locality Selection */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <select
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-gray-900"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                disabled={autoDetecting}
              >
                <option value="">
                  {autoDetecting ? "Detecting location..." : "Select Locality"}
                </option>
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </>
            )}
          </button>

          {/* Register Link - Only for Citizens */}
          {(!roleSelected || roleSelected === 'citizen') && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Register here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
