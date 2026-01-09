import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Star,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocality, setSelectedLocality] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, [selectedLocality]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const params = selectedLocality ? `?locality=${selectedLocality}` : "";
      const result = await apiRequest(`/api/analytics/dashboard${params}`);
      setData(result);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load analytics data</p>
      </div>
    );
  }

  const { overview, byDepartment, byLocality, byPriority, byStatus, resolutionStats, staffPerformance, citizenSatisfaction, recentActivity } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into complaint management</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Locality Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Locality
          </label>
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs"
          >
            <option value="">All Localities</option>
            {byLocality.map((loc) => (
              <option key={loc._id} value={loc._id}>{loc._id}</option>
            ))}
          </select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<Activity size={24} />}
            title="Total Complaints"
            value={overview.total}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle size={24} />}
            title="Resolved"
            value={overview.resolved}
            color="green"
            subtitle={`${overview.resolutionRate}% resolution rate`}
          />
          <StatCard
            icon={<Clock size={24} />}
            title="In Progress"
            value={overview.inProgress}
            color="yellow"
          />
          <StatCard
            icon={<AlertTriangle size={24} />}
            title="Escalated"
            value={overview.escalated}
            color="red"
          />
        </div>

        {/* Resolution Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Resolution Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Average Resolution Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {resolutionStats.avgDays ? `${resolutionStats.avgDays.toFixed(1)} days` : "N/A"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Fastest Resolution</p>
              <p className="text-2xl font-bold text-green-600">
                {resolutionStats.minDays ? `${resolutionStats.minDays.toFixed(1)} days` : "N/A"}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Slowest Resolution</p>
              <p className="text-2xl font-bold text-red-600">
                {resolutionStats.maxDays ? `${resolutionStats.maxDays.toFixed(1)} days` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Citizen Satisfaction */}
        {citizenSatisfaction.totalRated > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" size={24} />
              Citizen Satisfaction
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    className={`${
                      star <= Math.round(citizenSatisfaction.avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {citizenSatisfaction.avgRating.toFixed(1)} / 5.0
                </p>
                <p className="text-sm text-gray-600">
                  Based on {citizenSatisfaction.totalRated} ratings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Department Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={24} />
            Complaints by Department
          </h2>
          <div className="space-y-3">
            {byDepartment.map((dept) => (
              <div key={dept._id} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-gray-700 truncate">
                  {dept._id || "Unassigned"}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                    style={{ width: `${(dept.count / overview.total) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {dept.count}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {((dept.count / overview.total) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locality Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="text-green-600" size={24} />
            Complaints by Locality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {byLocality.map((loc) => (
              <div key={loc._id} className="bg-green-50 rounded-lg p-4">
                <p className="text-lg font-bold text-gray-900 capitalize">{loc._id}</p>
                <p className="text-3xl font-bold text-green-600">{loc.count}</p>
                <p className="text-sm text-gray-600">
                  {((loc.count / overview.total) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Priority */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Priority Distribution</h2>
            <div className="space-y-2">
              {byPriority.map((p) => (
                <div key={p._id} className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    p._id === "high" ? "bg-red-100 text-red-800" :
                    p._id === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {p._id}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Status Distribution</h2>
            <div className="space-y-2">
              {byStatus.map((s) => (
                <div key={s._id} className="flex justify-between items-center">
                  <span className="text-sm capitalize text-gray-700">{s._id}</span>
                  <span className="text-lg font-bold text-gray-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-purple-600" size={24} />
            Top Staff Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Staff Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Resolved</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {staffPerformance.map((staff, index) => (
                  <tr key={staff._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? "bg-yellow-100 text-yellow-800" :
                        index === 1 ? "bg-gray-200 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-800" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {staff.name || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-green-600 font-semibold">{staff.resolved}</td>
                    <td className="py-3 px-4 text-gray-700">{staff.assigned}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                        {staff.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h2>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-blue-600">{recentActivity.last7Days}</p>
            <p className="text-gray-600 mt-2">New complaints in the past week</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, subtitle }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600"
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}
