import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import MapView from "../components/MapView";
import Timeline from "../components/Timeline";
import { Clock, Mic, Square, Play, Pause } from "lucide-react";

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [remarkInputs, setRemarkInputs] = useState({});
  const [showTimeline, setShowTimeline] = useState({});
  const [resolutionMedia, setResolutionMedia] = useState({});
  const [priorityInputs, setPriorityInputs] = useState({});
  const [recording, setRecording] = useState({});
  const [mediaRecorder, setMediaRecorder] = useState({});
  const [audioChunks, setAudioChunks] = useState({});
  const [audioBlobs, setAudioBlobs] = useState({});
  const [playingAudio, setPlayingAudio] = useState({});

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
    const remark = remarkInputs[id];
    if (!remark || !remark.trim()) {
      alert("Please add a remark before resolving");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("staffRemark", remark);

      // Add resolution media if uploaded
      const files = resolutionMedia[id];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("resolutionMedia", files[i]);
        }
      }

      // Add voice recording if available
      const audioBlob = audioBlobs[id];
      if (audioBlob) {
        const audioFile = new File([audioBlob], `voice-note-${id}.webm`, { type: "audio/webm" });
        formData.append("resolutionMedia", audioFile);
      }

      const response = await fetch(`http://localhost:5000/api/staff/complaints/${id}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resolve complaint");
      }

      alert("✅ Complaint marked as resolved");
      setRemarkInputs({ ...remarkInputs, [id]: "" });
      setResolutionMedia({ ...resolutionMedia, [id]: null });
      setAudioBlobs({ ...audioBlobs, [id]: null });
      loadComplaints();
    } catch (error) {
      alert("Failed to update complaint: " + error.message);
      console.error("Resolve error:", error);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  async function updatePriority(id) {
    const priority = priorityInputs[id];
    if (!priority) return;

    try {
      await apiRequest(`/api/staff/complaints/${id}/priority`, "PUT", { priority });
      alert("✅ Priority updated");
      loadComplaints();
    } catch {
      alert("Failed to update priority");
    }
  }

  async function updateStatus(id, status) {
    try {
      await apiRequest(`/api/staff/complaints/${id}/status`, "PUT", { status });
      alert("✅ Status updated");
      loadComplaints();
    } catch {
      alert("Failed to update status");
    }
  }

  async function deleteComplaint(id) {
    if (!confirm("Are you sure you want to delete this completed complaint?")) {
      return;
    }

    try {
      await apiRequest(`/api/staff/complaints/${id}`, "DELETE");
      alert("✅ Complaint deleted successfully");
      loadComplaints();
    } catch (err) {
      alert(err.message || "Failed to delete complaint");
    }
  }

  // Voice Recording Functions
  async function startRecording(complaintId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlobs({ ...audioBlobs, [complaintId]: blob });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder({ ...mediaRecorder, [complaintId]: recorder });
      setRecording({ ...recording, [complaintId]: true });
      setAudioChunks({ ...audioChunks, [complaintId]: chunks });
    } catch (error) {
      alert("Microphone access denied or not available");
      console.error("Recording error:", error);
    }
  }

  function stopRecording(complaintId) {
    const recorder = mediaRecorder[complaintId];
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setRecording({ ...recording, [complaintId]: false });
    }
  }

  function playAudio(complaintId) {
    const blob = audioBlobs[complaintId];
    if (blob) {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
      setPlayingAudio({ ...playingAudio, [complaintId]: true });
      audio.onended = () => {
        setPlayingAudio({ ...playingAudio, [complaintId]: false });
      };
    }
  }

  function deleteAudioRecording(complaintId) {
    setAudioBlobs({ ...audioBlobs, [complaintId]: null });
  }

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-1">{complaints.length} assigned complaint(s)</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-medium"
          >
            Logout
          </button>
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
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Priority Control */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Set Priority
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={priorityInputs[c._id] || c.priority || "medium"}
                            onChange={(e) =>
                              setPriorityInputs({ ...priorityInputs, [c._id]: e.target.value })
                            }
                            className="border border-gray-300 rounded px-3 py-2 flex-1"
                          >
                            <option value="high">High (1 day)</option>
                            <option value="medium">Medium (3 days)</option>
                            <option value="low">Low (7 days)</option>
                          </select>
                          <button
                            onClick={() => updatePriority(c._id)}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                          >
                            Update
                          </button>
                        </div>
                      </div>

                      {/* Status Control */}
                      {c.status === "assigned" && (
                        <button
                          onClick={() => updateStatus(c._id, "in-progress")}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Mark as In Progress
                        </button>
                      )}

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Remark (Required)
                      </label>
                      <textarea
                        value={remarkInputs[c._id] || ""}
                        onChange={(e) =>
                          setRemarkInputs({ ...remarkInputs, [c._id]: e.target.value })
                        }
                        placeholder="Describe the action taken..."
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        rows={3}
                      />

                      {/* Resolution Media Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Resolution Media (Photos/Videos)
                        </label>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => setResolutionMedia({ ...resolutionMedia, [c._id]: e.target.files })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload proof of resolution (before/after photos, etc.)
                        </p>
                      </div>

                      {/* Voice Recording for Staff */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          🎤 Voice Note (Staff Only Feature)
                        </label>
                        <p className="text-xs text-blue-700 mb-3">
                          Record a voice explanation of the resolution for admin review
                        </p>
                        <div className="flex gap-2 items-center">
                          {!recording[c._id] && !audioBlobs[c._id] && (
                            <button
                              onClick={() => startRecording(c._id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                            >
                              <Mic size={18} />
                              Start Recording
                            </button>
                          )}
                          
                          {recording[c._id] && (
                            <button
                              onClick={() => stopRecording(c._id)}
                              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 font-medium flex items-center gap-2 animate-pulse"
                            >
                              <Square size={18} />
                              Stop Recording
                            </button>
                          )}

                          {audioBlobs[c._id] && (
                            <>
                              <button
                                onClick={() => playAudio(c._id)}
                                disabled={playingAudio[c._id]}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                              >
                                {playingAudio[c._id] ? <Pause size={18} /> : <Play size={18} />}
                                {playingAudio[c._id] ? "Playing..." : "Play"}
                              </button>
                              <button
                                onClick={() => deleteAudioRecording(c._id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                              >
                                Delete
                              </button>
                              <span className="text-sm text-green-600 font-medium">✓ Voice note recorded</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => markResolved(c._id)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
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

                  {/* Delete Button for Resolved/Closed */}
                  {(c.status === "resolved" || c.status === "closed") && (
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <button
                        onClick={() => setShowTimeline({ ...showTimeline, [c._id]: !showTimeline[c._id] })}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 text-sm flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        {showTimeline[c._id] ? "Hide" : "Show"} Timeline
                      </button>
                      <button
                        onClick={() => deleteComplaint(c._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                      >
                        🗑️ Delete Completed
                      </button>
                    </div>
                  )}

                  {/* Show Timeline button for all complaints */}
                  {c.status !== "resolved" && c.status !== "closed" && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => setShowTimeline({ ...showTimeline, [c._id]: !showTimeline[c._id] })}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 text-sm flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        {showTimeline[c._id] ? "Hide" : "Show"} Timeline
                      </button>
                    </div>
                  )}

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
