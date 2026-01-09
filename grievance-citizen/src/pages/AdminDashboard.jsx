import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import MapView from "../components/MapView";
import Timeline from "../components/Timeline";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Clock, TrendingUp } from "lucide-react";

const DEPARTMENTS = ["roads", "water", "sanitation", "electricity", "municipal", "others"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newStaff, setNewStaff] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    department: "roads",
    staffLevel: "junior" 
  });
  const [allStaffList, setAllStaffList] = useState([]);
  const [showTimeline, setShowTimeline] = useState({});
  const [priorityInputs, setPriorityInputs] = useState({});
  const [departmentInputs, setDepartmentInputs] = useState({});
  const [staffPerformance, setStaffPerformance] = useState([]);

  async function loadData() {
    const [complaintsData, analyticsData] = await Promise.all([
      apiRequest("/api/admin/complaints"),
      apiRequest("/api/admin/analytics"),
    ]);
    setComplaints(complaintsData);
    setAnalytics(analyticsData);
  }

  async function loadStaff(dept) {
    const data = await apiRequest(`/api/admin/staff/${dept}`);
    setStaff(data);
  }

  async function loadAllStaff() {
    try {
      // Load staff from all departments
      const allStaff = [];
      for (const dept of DEPARTMENTS.filter(d => d !== 'others')) {
        const data = await apiRequest(`/api/admin/staff/${dept}`);
        allStaff.push(...data);
      }
      setAllStaffList(allStaff);
      // Also set as default staff list for assignment
      setStaff(allStaff);
    } catch (err) {
      console.error("Error loading staff:", err);
    }
  }

  async function loadStaffPerformance() {
    try {
      const data = await apiRequest("/api/admin/staff-performance");
      setStaffPerformance(data);
    } catch (err) {
      console.error("Error loading staff performance:", err);
    }
  }

  async function createStaff() {
    if (!newStaff.name || !newStaff.email || !newStaff.password || !newStaff.department) {
      alert("Please fill all fields");
      return;
    }

    try {
      await apiRequest("/api/auth/register", "POST", {
        ...newStaff,
        role: "staff",
      });

      alert("✅ Staff created successfully!");
      setNewStaff({ name: "", email: "", password: "", department: "roads", staffLevel: "junior" });
      loadAllStaff();
    } catch (err) {
      alert(err.message || "Failed to create staff");
    }
  }

  async function assignComplaint(complaintId) {
    const staffId = selectedStaff[complaintId];
    if (!staffId) {
      alert("Select staff");
      return;
    }

    await apiRequest("/api/admin/assign", "POST", {
      complaintId,
      staffId,
    });

    alert("Assigned successfully");
    loadData();
  }

  async function deleteComplaint(complaintId) {
    if (!confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`/api/admin/complaints/${complaintId}`, "DELETE");
      alert("✅ Complaint deleted successfully");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete complaint");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  async function updatePriority(complaintId) {
    const priority = priorityInputs[complaintId];
    if (!priority) return;

    try {
      await apiRequest(`/api/admin/complaints/${complaintId}/priority`, "PUT", { priority });
      alert("✅ Priority updated");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to update priority");
    }
  }

  async function changeDepartment(complaintId) {
    const department = departmentInputs[complaintId];
    if (!department) {
      alert("Please select a department");
      return;
    }

    if (!confirm(`Are you sure you want to change this complaint's department to ${department}? This will unassign any currently assigned staff.`)) {
      return;
    }

    try {
      await apiRequest(`/api/admin/complaints/${complaintId}/department`, "PUT", { department });
      alert(`✅ Department changed to ${department}`);
      setDepartmentInputs({ ...departmentInputs, [complaintId]: "" });
      loadData();
      loadAllStaff(); // Reload staff list
    } catch (err) {
      alert(err.message || "Failed to change department");
    }
  }

  useEffect(() => {
    loadData();
    loadAllStaff(); // Load all staff on initial mount
    if (activeTab === "staff") {
      loadAllStaff();
      loadStaffPerformance();
    }
  }, [activeTab]);

  // Load staff when department changes
  useEffect(() => {
    if (selectedDept && selectedDept !== "all") {
      loadStaff(selectedDept);
    }
  }, [selectedDept]);

  const deptComplaints = selectedDept
    ? complaints.filter((c) => c.department === selectedDept)
    : complaints;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/analytics")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <TrendingUp size={20} />
              Analytics Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex gap-2 border-b">
          {["overview", "complaints", "staff", "performance", "map"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && analytics && (
          <div>
            {/* Status Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Total Complaints</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.total}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.pending}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Resolved</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics.resolved}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Escalated</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{analytics.escalated}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Department Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Department-wise Complaints</h3>
                <BarChart width={500} height={300} data={analytics.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Total" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                </BarChart>
              </div>

              {/* Status Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Status Distribution</h3>
                <PieChart width={500} height={300}>
                  <Pie
                    data={analytics.statusStats}
                    cx={250}
                    cy={150}
                    labelLine={false}
                    label={(entry) => `${entry._id}: ${entry.count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>

            {/* Escalated Complaints */}
            {analytics.recentEscalated && analytics.recentEscalated.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4 text-red-600">⚠️ Escalated Complaints</h3>
                <div className="space-y-3">
                  {analytics.recentEscalated.map((c) => (
                    <div key={c._id} className="border-l-4 border-red-500 pl-4 py-2">
                      <h4 className="font-semibold">{c.title}</h4>
                      <p className="text-sm text-gray-600">
                        Escalation Level: {c.escalationLevel} | 
                        Created by: {c.createdBy?.name} |
                        {c.assignedTo && ` Assigned to: ${c.assignedTo.name} (${c.assignedTo.department})`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div>
            {/* Department Filter */}
            <div className="mb-6">
              <h2 className="font-bold mb-2 text-lg">Filter by Department</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedDept(null);
                    setStaff([]);
                  }}
                  className={`px-4 py-2 rounded ${
                    !selectedDept
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  All Departments
                </button>
                {DEPARTMENTS.filter(d => d !== 'others').map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDept(d);
                      loadStaff(d);
                    }}
                    className={`px-4 py-2 rounded ${
                      selectedDept === d
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {deptComplaints.map((c) => (
                <div key={c._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{c.title}</h3>
                      <p className="text-gray-600 mt-1">{c.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        c.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : c.status === "escalated"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <strong>Department:</strong> {c.department}
                      {c.priority && <span className="ml-2">| <strong>Priority:</strong> {c.priority}</span>}
                    </div>
                    <div>
                      <strong>Created by:</strong> {c.createdBy?.name}
                    </div>
                    <div>
                      <strong>Location:</strong> {c.location?.area || "Not specified"}
                    </div>
                    <div>
                      {c.assignedTo && (
                        <>
                          <strong>Assigned to:</strong> {c.assignedTo.name}
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Classification Warning */}
                  {c.department === "others" && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ <strong>AI couldn't classify this complaint.</strong> Please manually assign the correct department below.
                      </p>
                    </div>
                  )}

                  {/* Media */}
                  {c.media && c.media.length > 0 && (
                    <details className="mb-3">
                      <summary className="cursor-pointer text-blue-600 text-sm">
                        View {c.media.length} Attachment(s)
                      </summary>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {c.media.map((m, i) => (
                          <div key={i}>
                            {m.type === "image" && (
                              <img
                                src={`http://localhost:5000${m.url}`}
                                className="w-32 h-32 object-cover rounded"
                              />
                            )}
                            {m.type === "video" && (
                              <video
                                src={`http://localhost:5000${m.url}`}
                                controls
                                className="w-48 rounded"
                              />
                            )}
                            {m.type === "audio" && (
                              <audio src={`http://localhost:5000${m.url}`} controls />
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Assignment */}
                  {c.status !== "resolved" && c.status !== "closed" && (
                    <div className="space-y-3">
                      {/* Department Change Control */}
                      <div className="flex gap-2 items-center bg-orange-50 p-3 rounded border border-orange-200">
                        <span className="text-sm font-medium text-gray-700">Change Department:</span>
                        <select
                          value={departmentInputs[c._id] || c.department}
                          onChange={(e) =>
                            setDepartmentInputs({ ...departmentInputs, [c._id]: e.target.value })
                          }
                          className="border border-gray-300 rounded px-3 py-2 flex-1"
                        >
                          <option value="roads">🛣️ Roads & Transport</option>
                          <option value="water">💧 Water Supply</option>
                          <option value="sanitation">🧹 Sanitation</option>
                          <option value="electricity">⚡ Electricity</option>
                          <option value="municipal">🏛️ Municipal Services</option>
                          <option value="others">❓ Others</option>
                        </select>
                        <button
                          onClick={() => changeDepartment(c._id)}
                          disabled={departmentInputs[c._id] === c.department || !departmentInputs[c._id]}
                          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Update Dept
                        </button>
                      </div>

                      {/* Priority Control */}
                      <div className="flex gap-2 items-center">
                        <select
                          value={priorityInputs[c._id] || c.priority || "medium"}
                          onChange={(e) =>
                            setPriorityInputs({ ...priorityInputs, [c._id]: e.target.value })
                          }
                          className="border border-gray-300 rounded px-3 py-2 flex-1"
                        >
                          <option value="high">🔴 High Priority (1 day)</option>
                          <option value="medium">🟡 Medium Priority (3 days)</option>
                          <option value="low">🟢 Low Priority (7 days)</option>
                        </select>
                        <button
                          onClick={() => updatePriority(c._id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                          Set Priority
                        </button>
                      </div>

                      {/* Staff Assignment */}
                      <div className="flex gap-2 items-center">
                        <select
                          className="border border-gray-300 rounded px-3 py-2 flex-1"
                          onChange={(e) =>
                            setSelectedStaff({ ...selectedStaff, [c._id]: e.target.value })
                          }
                          value={selectedStaff[c._id] || ""}
                      >
                        <option value="">Select Staff to Assign</option>
                        {/* Filter staff by complaint's department */}
                        {staff.filter(s => s.department === c.department).map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.department})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => assignComplaint(c._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Assign
                      </button>
                      </div>
                    </div>
                  )}

                  {/* Delete Button */}
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <button
                      onClick={() => setShowTimeline({ ...showTimeline, [c._id]: !showTimeline[c._id] })}
                      className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      {showTimeline[c._id] ? "Hide" : "Show"} Timeline
                    </button>
                    <button
                      onClick={() => deleteComplaint(c._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm flex items-center gap-2"
                    >
                      🗑️ Delete Complaint
                    </button>
                  </div>

                  {/* Timeline */}
                  {showTimeline[c._id] && (
                    <div className="mt-4">
                      <Timeline complaint={c} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Management Tab */}
        {activeTab === "staff" && (
          <div>
            {/* Create New Staff Form */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Staff Account</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="border border-gray-300 rounded px-4 py-2"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border border-gray-300 rounded px-4 py-2"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-gray-300 rounded px-4 py-2"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                />
                <select
                  className="border border-gray-300 rounded px-4 py-2"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                >
                  {DEPARTMENTS.filter(d => d !== 'others').map((dept) => (
                    <option key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded px-4 py-2"
                  value={newStaff.staffLevel}
                  onChange={(e) => setNewStaff({ ...newStaff, staffLevel: e.target.value })}
                >
                  <option value="junior">Junior Staff (Low Priority)</option>
                  <option value="mid">Mid-Level Staff (Medium Priority)</option>
                  <option value="senior">Senior Staff (High Priority)</option>
                </select>
              </div>
              <button
                onClick={createStaff}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
              >
                Create Staff Account
              </button>
            </div>

            {/* Existing Staff List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-900">All Staff Members</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allStaffList.map((s) => (
                      <tr key={s._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {s.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            s.staffLevel === 'senior' ? 'bg-purple-100 text-purple-800' :
                            s.staffLevel === 'mid' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {s.staffLevel || 'junior'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allStaffList.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No staff members found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Staff Performance Metrics</h2>
            
            {staffPerformance.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">No performance data available yet</p>
              </div>
            )}

            <div className="grid gap-6">
              {staffPerformance.map((staff) => (
                <div key={staff.staffId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Staff Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{staff.name}</h3>
                        <p className="text-blue-100">{staff.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{staff.resolvedCount}</div>
                        <div className="text-blue-100">Resolved</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        📁 {staff.department}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        staff.staffLevel === 'senior' ? 'bg-purple-200 text-purple-900' :
                        staff.staffLevel === 'mid' ? 'bg-green-200 text-green-900' :
                        'bg-gray-200 text-gray-900'
                      }`}>
                        👤 {staff.staffLevel || 'junior'} Staff
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        ⏱️ Avg: {staff.avgResolutionTimeHours}h
                      </span>
                    </div>
                  </div>

                  {/* Recent Resolutions */}
                  <div className="p-6">
                    <h4 className="font-semibold text-lg mb-4 text-gray-800">Recent Resolutions</h4>
                    {staff.recentResolutions && staff.recentResolutions.length > 0 ? (
                      <div className="space-y-3">
                        {staff.recentResolutions.map((resolution) => (
                          <div key={resolution._id} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{resolution.title}</h5>
                                {resolution.staffRemark && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    💬 {resolution.staffRemark}
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  resolution.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  resolution.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {resolution.priority}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(resolution.resolvedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No recent resolutions</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === "map" && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Complaints Map</h2>
              <div className="mb-4">
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span>Active/Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>Resolved</span>
                  </div>
                </div>
              </div>
              <MapView
                complaints={complaints}
                onMarkerClick={(complaint) => setSelectedComplaint(complaint)}
                height="600px"
              />
              
              {/* Selected Complaint Info */}
              {selectedComplaint && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h3 className="font-bold">{selectedComplaint.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedComplaint.description}</p>
                  <p className="text-sm mt-2">
                    <strong>Status:</strong> {selectedComplaint.status} | 
                    <strong> Department:</strong> {selectedComplaint.department}
                  </p>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="mt-2 text-blue-600 text-sm"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
