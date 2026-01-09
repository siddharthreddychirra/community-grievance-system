import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import MapView from "../components/MapView";

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // list, map
  const [remark, setRemark] = useState("");

  async function loadComplaints() {
    try {
      const data = await apiRequest("/api/staff/complaints");
      setComplaints(data);
    } catch (err) {
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  async function markResolved(id) {
    if (!remark.trim()) {
      alert("Please add a remark before resolving");
      return;
    }

    try {
      await apiRequest(`/api/staff/complaints/${id}/resolve`, "PUT", {
        staffRemark: remark,
      });
      alert("Complaint marked as resolved");
      setRemark("");
      loadComplaints();
    } catch {
      alert("Failed to update complaint");
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">{complaints.length} assigned complaint(s)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex gap-2 border-b">
          {["list", "map"].map((tab) => (
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
        {/* List View */}
        {activeTab === "list" && (
          <div>
            {complaints.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600">No complaints assigned to you</p>
              </div>
            )}

            <div className="space-y-4">
              {complaints.map((c) => (
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
                    </div>
                    <div>
                      <strong>Priority:</strong>{" "}
                      <span
                        className={
                          c.priority === "high"
                            ? "text-red-600 font-semibold"
                            : c.priority === "medium"
                            ? "text-yellow-600 font-semibold"
                            : "text-green-600"
                        }
                      >
                        {c.priority || "medium"}
                      </span>
                    </div>
                    <div>
                      <strong>Location:</strong> {c.location?.area || "Not specified"}
                    </div>
                    <div>
                      {c.location?.lat && c.location?.lng && (
                        <span className="text-xs">
                          📍 {c.location.lat.toFixed(4)}, {c.location.lng.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Escalation Warning */}
                  {c.escalationLevel > 0 && (
                    <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <p className="text-red-800 font-medium">
                        ⚠️ Escalated (Level {c.escalationLevel})
                      </p>
                      {c.slaDeadline && (
                        <p className="text-sm text-red-600 mt-1">
                          SLA Deadline: {new Date(c.slaDeadline).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Media */}
                  {c.media && c.media.length > 0 && (
                    <details className="mb-3">
                      <summary className="cursor-pointer text-blue-600 text-sm font-medium">
                        View {c.media.length} Attachment(s)
                      </summary>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {c.media.map((m, i) => (
                          <div key={i}>
                            {m.type === "image" && (
                              <img
                                src={`http://localhost:5000${m.url}`}
                                alt="Complaint"
                                className="w-32 h-32 object-cover rounded border"
                              />
                            )}
                            {m.type === "video" && (
                              <video
                                src={`http://localhost:5000${m.url}`}
                                controls
                                className="w-48 rounded border"
                              />
                            )}
                            {m.type === "audio" && (
                              <audio
                                src={`http://localhost:5000${m.url}`}
                                controls
                                className="w-full"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Action Section */}
                  {c.status !== "resolved" && c.status !== "closed" && (
                    <div className="mt-4 pt-4 border-t">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Remark (Required)
                      </label>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Describe the action taken..."
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                        rows={3}
                      />
                      <button
                        onClick={() => markResolved(c._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  )}

                  {/* Staff Remark (if resolved) */}
                  {c.staffRemark && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700">Staff Remark:</p>
                      <p className="text-sm text-gray-600 mt-1">{c.staffRemark}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map View */}
        {activeTab === "map" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Assigned Complaints Map</h2>
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
                  <strong> Priority:</strong> {selectedComplaint.priority}
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
        )}
      </div>
    </div>
  );
}
