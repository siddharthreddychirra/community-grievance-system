import RaiseComplaint from "./RaiseComplaint";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, Map } from "lucide-react";
import ChatAssistant from "../components/ChatAssistant";
import MapView from "../components/MapView";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [localityComplaints, setLocalityComplaints] = useState([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadLocalityComplaints();
    loadEscalationData();
  }, []);

  async function loadDashboardData() {
    try {
      const complaints = await apiRequest("/api/complaints/my");
      setRecentComplaints(complaints.slice(0, 5));
      
      // Calculate stats
      const total = complaints.length;
      const resolved = complaints.filter(c => c.status === "resolved").length;
      const inProgress = complaints.filter(c => c.status === "in-progress" || c.status === "assigned").length;
      const pending = complaints.filter(c => c.status === "open" || c.status === "pending").length;
      const escalated = complaints.filter(c => c.escalationLevel > 0).length;
      
      setStats({ total, resolved, inProgress, pending, escalated });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  }

  async function loadLocalityComplaints() {
    try {
      const complaints = await apiRequest("/api/complaints/locality/all");
      setLocalityComplaints(complaints);
    } catch (err) {
      console.error("Failed to load locality complaints:", err);
    }
  }

  async function loadEscalationData() {
    try {
      const escalations = await apiRequest("/api/complaints/my/escalations");
      setEscalatedComplaints(escalations);
    } catch (err) {
      console.error("Failed to load escalation data:", err);
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Citizen Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Locality: <span className="font-semibold text-indigo-600 capitalize">{user?.locality}</span>
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Complaints</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <FileText className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Resolved</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.resolved}</p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.inProgress}</p>
                </div>
                <Clock className="text-orange-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
                </div>
                <AlertCircle className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Escalated</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.escalated}</p>
                </div>
                <TrendingUp className="text-red-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Escalation Transparency Section */}
        {escalatedComplaints.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-orange-600" size={28} />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Escalation Transparency</h2>
                <p className="text-sm text-gray-600">Track how your complaints are being prioritized</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>What is escalation?</strong> When a complaint exceeds its Service Level Agreement (SLA) 
                deadline, it's automatically escalated to higher-level staff to ensure faster resolution. 
                This transparency feature lets you track this process.
              </p>
              <p className="text-sm text-gray-600">
                You have <strong className="text-orange-700">{escalatedComplaints.length}</strong> complaint{escalatedComplaints.length > 1 ? 's' : ''} currently escalated.
              </p>
            </div>

            <div className="space-y-3">
              {escalatedComplaints.slice(0, 3).map((complaint) => (
                <div 
                  key={complaint._id} 
                  className="bg-white p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate("/my-complaints")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{complaint.title}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Level {complaint.escalationLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Status: <strong className="capitalize">{complaint.status}</strong></span>
                    <span>Department: <strong>{complaint.department}</strong></span>
                    {complaint.assignedTo && (
                      <span>Assigned: <strong>{complaint.assignedTo.name}</strong></span>
                    )}
                  </div>
                  {complaint.escalationHistory && complaint.escalationHistory.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Last escalated: {new Date(complaint.escalationHistory[complaint.escalationHistory.length - 1].escalatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {escalatedComplaints.length > 3 && (
              <button 
                onClick={() => navigate("/my-complaints")}
                className="mt-4 w-full text-center text-sm text-orange-700 hover:text-orange-900 font-medium"
              >
                View all {escalatedComplaints.length} escalated complaints →
              </button>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => navigate("/my-complaints")}
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <FileText size={20} />
            My Complaints
          </button>

          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Map size={20} />
            {showMap ? "Hide Map" : "View Locality Map"}
          </button>

          <button
            onClick={() =>
              document.getElementById("raise-complaint-section")?.scrollIntoView({
                behavior: "smooth",
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <TrendingUp size={20} />
            Raise New Complaint
          </button>
        </div>

        {/* Locality Complaints Map - For Transparency */}
        {showMap && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Complaints in {user?.locality?.charAt(0).toUpperCase() + user?.locality?.slice(1)} - Transparency View
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              All active complaints in your locality are shown below. This promotes transparency and helps you see ongoing issues in your area.
            </p>
            {localityComplaints.length > 0 ? (
              <div>
                <MapView 
                  complaints={localityComplaints} 
                  height="400px"
                  onMarkerClick={(complaint) => {
                    alert(`${complaint.title}\nStatus: ${complaint.status}\nDepartment: ${complaint.department}`);
                  }}
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {localityComplaints.slice(0, 6).map((complaint) => (
                    <div key={complaint._id} className="p-3 border rounded-lg bg-gray-50">
                      <h4 className="font-semibold text-sm text-gray-800">{complaint.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{complaint.department}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          complaint.status === "resolved" 
                            ? "bg-green-100 text-green-800"
                            : complaint.status === "in-progress" || complaint.status === "assigned"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {complaint.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          complaint.priority === "high" 
                            ? "bg-red-100 text-red-800"
                            : complaint.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {localityComplaints.length > 6 && (
                  <p className="text-sm text-gray-500 mt-3">
                    Showing 6 of {localityComplaints.length} complaints in your locality
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No active complaints in your locality.</p>
            )}
          </div>
        )}

        {/* Recent Complaints */}
        {recentComplaints.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Complaints</h2>
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate("/my-complaints")}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{complaint.title}</h3>
                    <p className="text-sm text-gray-500">{complaint.description?.slice(0, 80)}...</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      complaint.status === "resolved" 
                        ? "bg-green-100 text-green-800"
                        : complaint.status === "in-progress" || complaint.status === "assigned"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raise Complaint Section */}
        <div id="raise-complaint-section">
          <RaiseComplaint onSuccess={loadDashboardData} />
        </div>
      </div>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}

