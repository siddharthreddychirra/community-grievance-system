import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Brain, 
  Clock, 
  Shield, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  Zap,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Classification",
      description: "Smart department routing using machine learning for faster resolution",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Interactive maps with real-time tracking of complaints in your area",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      title: "Auto-Escalation",
      description: "SLA-based automatic escalation ensures timely resolution",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Duplicate Detection",
      description: "AI prevents duplicate complaints using semantic similarity",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Citizen, Staff, and Admin dashboards with role-based controls",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Interactive charts and insights for better decision making",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const stats = [
    { label: "Response Time", value: "24hrs", icon: Clock },
    { label: "Success Rate", value: "95%", icon: CheckCircle },
    { label: "AI Accuracy", value: "98%", icon: Brain },
    { label: "Avg Resolution", value: "3-5 days", icon: TrendingUp }
  ];

  const departments = [
    { name: "Roads & Transport", icon: "🛣️" },
    { name: "Water Supply", icon: "💧" },
    { name: "Electricity", icon: "⚡" },
    { name: "Sanitation", icon: "🧹" },
    { name: "Municipal Services", icon: "🏛️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GrievanceHub
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Civic Platform</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Smart Community
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Grievance Portal
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Report civic issues instantly. Track complaints in real-time. 
                Experience AI-powered department routing and automated escalations 
                for faster resolutions.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                >
                  <span>Raise Complaint</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-200 hover:scale-105"
                >
                  Staff Login
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative w-full aspect-square">
                {/* Animated circles */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full animate-pulse delay-75"></div>
                <div className="absolute inset-16 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full animate-pulse delay-150"></div>
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">New Complaint</div>
                        <div className="text-sm text-gray-500">Assigned by AI</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Hyderabad</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">Priority: High</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">SLA: 24 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Artificial Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry-leading features that make complaint management smart, 
              efficient, and transparent
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Departments We Serve
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive coverage across all civic services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {dept.icon}
                </div>
                <div className="font-semibold text-gray-900">{dept.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of citizens creating a better community together
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 hover:scale-105"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">GrievanceHub</span>
              </div>
              <p className="text-sm">
                AI-powered civic complaint management system for smarter communities.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 GrievanceHub. All rights reserved. Built with ❤️ for better communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
