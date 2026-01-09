import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import MapView from "../components/MapView";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const DEPARTMENTS = ["roads", "water", "sanitation", "electricity", "municipal", "others"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [escalationData, setEscalationData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, complaints, map, escalations

  async function loadData() {
    const [complaintsData, analyticsData, escalationAnalytics] = await Promise.all([
      apiRequest("/api/admin/complaints"),
      apiRequest("/api/admin/analytics"),
      apiRequest("/api/admin/escalations"),
    ]);
    setComplaints(complaintsData);
    setAnalytics(analyticsData);
    setEscalationData(escalationAnalytics);
  }

  async function loadStaff(dept) {
    const data = await apiRequest(`/api/admin/staff/${dept}`);
    setStaff(data);
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

  useEffect(() => {
    loadData();
  }, []);

  const deptComplaints = selectedDept
    ? complaints.filter((c) => c.department === selectedDept)
    : complaints;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex gap-2 border-b">
          {["overview", "complaints", "map", "escalations"].map((tab) => (
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
                  onClick={() => setSelectedDept(null)}
                  className={`px-4 py-2 rounded ${
                    !selectedDept
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  All
                </button>
                {DEPARTMENTS.map((d) => (
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
                    <div className="flex gap-2 items-center">
                      <select
                        className="border border-gray-300 rounded px-3 py-2 flex-1"
                        onChange={(e) =>
                          setSelectedStaff({ ...selectedStaff, [c._id]: e.target.value })
                        }
                        value={selectedStaff[c._id] || ""}
                      >
                        <option value="">Select Staff to Assign</option>
                        {staff.map((s) => (
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
                  )}
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

        {/* Escalations Tab */}
        {activeTab === "escalations" && escalationData && (
          <div>
            {/* Escalation Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Total Escalated</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{escalationData.totalEscalated}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Level 1 (Mid)</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{escalationData.byLevel.level1}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Level 2 (Senior)</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">{escalationData.byLevel.level2}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Level 3+ (Critical)</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{escalationData.byLevel.level3}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* By Department */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Escalations by Department</h3>
                <BarChart width={500} height={300} data={Object.keys(escalationData.byDepartment).map(dept => ({
                  name: dept,
                  count: escalationData.byDepartment[dept]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f97316" name="Escalated Complaints" />
                </BarChart>
              </div>

              {/* By Locality */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Escalations by Locality</h3>
                <PieChart width={500} height={300}>
                  <Pie
                    data={Object.keys(escalationData.byLocality).map((loc, idx) => ({
                      name: loc,
                      value: escalationData.byLocality[loc],
                      fill: COLORS[idx % COLORS.length]
                    }))}
                    cx={250}
                    cy={150}
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {Object.keys(escalationData.byLocality).map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>

            {/* Escalated Complaints List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Escalated Complaints</h3>
              <div className="space-y-4">
                {escalationData.complaints.map((c) => (
                  <div key={c._id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{c.title}</h4>
                        <div className="flex gap-4 text-sm text-gray-600 mt-2">
                          <span>Department: <strong>{c.department}</strong></span>
                          <span>Locality: <strong className="capitalize">{c.locality}</strong></span>
                          <span>Priority: <strong className="capitalize">{c.priority}</strong></span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.escalationLevel === 1 ? "bg-yellow-100 text-yellow-800" :
                          c.escalationLevel === 2 ? "bg-orange-100 text-orange-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          Level {c.escalationLevel}
                        </span>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          c.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : c.status === "escalated"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    {/* Escalation Timeline */}
                    {c.escalationHistory && c.escalationHistory.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Escalation History:</h5>
                        <div className="space-y-2">
                          {c.escalationHistory.map((escalation, idx) => (
                            <div key={idx} className="text-sm bg-white p-2 rounded border border-orange-100">
                              <div className="flex justify-between">
                                <span className="font-medium text-orange-700">Level {escalation.level}</span>
                                <span className="text-gray-500 text-xs">
                                  {new Date(escalation.escalatedAt).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{escalation.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assignment Info */}
                    {c.assignedTo && (
                      <div className="mt-3 pt-3 border-t border-orange-200 text-sm">
                        <strong>Currently Assigned to:</strong> {c.assignedTo.name}
                        {c.assignedTo.staffLevel && ` (${c.assignedTo.staffLevel} staff)`}
                        {c.assignedTo.department && ` - ${c.assignedTo.department}`}
                      </div>
                    )}

                    {/* Creator Info */}
                    {c.createdBy && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Reported by:</strong> {c.createdBy.name}
                        {c.createdBy.locality && ` from ${c.createdBy.locality}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
