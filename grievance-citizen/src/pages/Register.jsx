import { useState } from "react";
import { apiRequest } from "../api";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowLeft, UserPlus, Loader2, MapPin } from "lucide-react";

const LOCALITIES = ["jangaon", "warangal", "narapally", "pocharam", "karimnagar"];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    locality: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!form.name || !form.email || !form.password || !form.phone) {
      alert("Please fill all required fields");
      return;
    }
    
    if (!form.locality || form.locality.trim() === "") {
      alert("Please select your locality");
      return;
    }
    
    setLoading(true);
    try {
      const registrationData = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        locality: form.locality,
        role: "citizen",
      };
      
      console.log("Sending registration data:", registrationData);
      
      await apiRequest("/api/auth/register", "POST", registrationData);

      alert("Registered successfully! Please login.");
      navigate("/login?role=citizen");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "name", icon: User, placeholder: "Full Name", type: "text" },
    { name: "email", icon: Mail, placeholder: "Email Address", type: "email" },
    { name: "password", icon: Lock, placeholder: "Password", type: "password" },
    { name: "phone", icon: Phone, placeholder: "Phone Number", type: "tel" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="absolute -top-12 left-0 flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our community and raise complaints</p>
          </div>
          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.name} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <field.icon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder={field.placeholder}
                  type={field.type}
                  value={form[field.name]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                />
              </div>
            ))}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                Locality <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none text-gray-900 appearance-none"
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  required
                >
                  <option value="">Select Your Locality</option>
                  {LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </button>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login?role=citizen")}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
