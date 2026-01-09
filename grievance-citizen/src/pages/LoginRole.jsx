import { useNavigate } from "react-router-dom";
import { User, Users, Shield, ArrowLeft } from "lucide-react";

export default function LoginRole() {
  const navigate = useNavigate();

  function goToLogin(role) {
    navigate(`/login/form?role=${role}`);
  }

  const roles = [
    {
      id: 'citizen',
      name: 'Citizen',
      description: 'Report and track civic issues',
      icon: User,
      gradient: 'from-blue-600 to-cyan-600',
      hoverGradient: 'hover:from-blue-700 hover:to-cyan-700'
    },
    {
      id: 'staff',
      name: 'Staff',
      description: 'Manage assigned complaints',
      icon: Users,
      gradient: 'from-green-600 to-emerald-600',
      hoverGradient: 'hover:from-green-700 hover:to-emerald-700'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full system oversight',
      icon: Shield,
      gradient: 'from-purple-600 to-pink-600',
      hoverGradient: 'hover:from-purple-700 hover:to-pink-700'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Role Card */}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Role
            </h2>
            <p className="text-gray-600">Select how you want to access the system</p>
          </div>

          {/* Role Buttons */}
          <div className="space-y-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => goToLogin(role.id)}
                className={`w-full p-5 bg-gradient-to-r ${role.gradient} ${role.hoverGradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-4 group`}
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                  <role.icon className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-lg font-bold">{role.name}</div>
                  <div className="text-sm opacity-90">{role.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Register Link - Only for Citizens */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New citizen?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                Register here
              </button>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Staff accounts are created by Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
