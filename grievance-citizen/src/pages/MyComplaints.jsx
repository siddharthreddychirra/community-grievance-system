import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { FileText, Clock, CheckCircle, Image, Video, Music, MessageCircle, ArrowLeft, Star, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ComplaintFlow from "../components/ComplaintFlow";
import RatingModal from "../components/RatingModal";
import EscalationTimeline from "../components/EscalationTimeline";

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [openMedia, setOpenMedia] = useState({});
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [viewMode, setViewMode] = useState("active"); // active, resolved, all
  const [ratingComplaint, setRatingComplaint] = useState(null);

  async function loadComplaints() {
    try {
      const data = await apiRequest("/api/complaints/my");
      setComplaints(data);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadComplaints();
    };
    fetchData();
  }, []);

  async function addComment(complaintId) {
    if (!commentText.trim()) return;
    
    try {
      await apiRequest(`/api/complaints/${complaintId}/comments`, "POST", {
        text: commentText
      });
      alert("✅ Comment added successfully");
      setCommentText("");
      loadComplaints(); // Reload to get updated comments
    } catch (err) {
      alert(err.message || "Failed to add comment");
    }
  }

  const getStatusColor = (status) => {
    if (status === "resolved" || status === "closed") return "bg-green-100 text-green-800 border-green-200";
    if (status === "in-progress" || status === "assigned") return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusIcon = (status) => {
    if (status === "resolved" || status === "closed") return <CheckCircle size={16} />;
    return <Clock size={16} />;
  };

  // Filter complaints based on department and view mode
  const filteredComplaints = complaints.filter(c => {
    const deptMatch = selectedDept === "all" || c.department === selectedDept;
    const statusMatch = 
      viewMode === "all" ? true :
      viewMode === "resolved" ? (c.status === "resolved" || c.status === "closed") :
      (c.status !== "resolved" && c.status !== "closed");
    return deptMatch && statusMatch;
  });

  const DEPARTMENTS = ["roads", "water", "sanitation", "electricity", "municipal", "others"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Complaints</h1>
            <p className="text-gray-600">Track and manage your submitted complaints</p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setViewMode("active")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "active"
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Active ({complaints.filter(c => c.status !== "resolved" && c.status !== "closed").length})
          </button>
          <button
            onClick={() => setViewMode("resolved")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "resolved"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Resolved ({complaints.filter(c => c.status === "resolved" || c.status === "closed").length})
          </button>
        </div>

        {/* Department Filter */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Filter by Department:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDept("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDept === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Departments
            </button>
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedDept === dept
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {complaints.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No complaints raised yet.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Raise Your First Complaint
            </button>
          </div>
        )}

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 && complaints.length > 0 && (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No complaints found with selected filters.</p>
            </div>
          )}
          {filteredComplaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Complaint Flow Visualization */}
                <ComplaintFlow complaint={c} />

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{c.title}</h3>
                    <p className="text-gray-600">{c.description}</p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(c.status)}`}>
                      {getStatusIcon(c.status)}
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    📁 {c.department}
                  </span>
                  <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                    📅 {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  {c.location?.area && (
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                      📍 {c.location.area}
                    </span>
                  )}
                  {c.assignedTo && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      👤 Assigned to staff
                    </span>
                  )}
                  {c.escalationLevel > 0 && (
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full font-semibold animate-pulse">
                      <AlertTriangle size={14} className="inline mr-1" />
                      Escalated (Level {c.escalationLevel})
                    </span>
                  )}
                </div>

                {/* Escalation Timeline - Show if complaint is escalated */}
                {c.escalationLevel > 0 && (
                  <div className="mb-4">
                    <EscalationTimeline complaint={c} />
                  </div>
                )}

                {/* Rating Display or Button */}
                {(c.status === "resolved" || c.status === "closed") && (
                  <div className="mb-4">
                    {c.citizenRating ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={18}
                                className={`${
                                  star <= c.citizenRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {c.citizenFeedback && (
                          <p className="text-sm text-gray-600 italic">"{c.citizenFeedback}"</p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingComplaint(c)}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg hover:from-yellow-500 hover:to-orange-600 font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <Star size={20} />
                        Rate This Resolution
                      </button>
                    )}
                  </div>
                )}

                {/* Attachments */}
                {c.media && c.media.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setOpenMedia({
                          ...openMedia,
                          [c._id]: !openMedia[c._id],
                        })
                      }
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Image size={20} />
                      {openMedia[c._id]
                        ? "Hide Attachments"
                        : `View Attachments (${c.media.length})`}
                    </button>

                    {openMedia[c._id] && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {c.media.map((m, i) => (
                          <div key={i} className="relative">
                            {m.type === "image" && (
                              <img
                                src={`http://localhost:5000${m.url}`}
                                className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                alt={m.originalName || "attachment"}
                              />
                            )}

                            {m.type === "video" && (
                              <video
                                src={`http://localhost:5000${m.url}`}
                                controls
                                className="w-full h-48 rounded-lg border shadow-sm"
                              />
                            )}

                            {m.type === "audio" && (
                              <div className="bg-gray-100 p-4 rounded-lg border">
                                <Music size={32} className="mx-auto text-gray-400 mb-2" />
                                <audio
                                  src={`http://localhost:5000${m.url}`}
                                  controls
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Resolution Media (if resolved) */}
                {c.resolutionMedia && c.resolutionMedia.length > 0 && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      ✅ Resolution Media
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {c.resolutionMedia.map((m, i) => (
                        <div key={i}>
                          {m.type === "image" && (
                            <img
                              src={`http://localhost:5000${m.url}`}
                              alt="Resolution"
                              className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
                            />
                          )}
                          {m.type === "video" && (
                            <video
                              src={`http://localhost:5000${m.url}`}
                              controls
                              className="w-full rounded-lg border-2 border-green-300"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff Remark (if resolved) */}
                {c.staffRemark && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Staff Remark:</h4>
                    <p className="text-gray-700">{c.staffRemark}</p>
                  </div>
                )}

                {/* Comments Section */}
                {c.comments && c.comments.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MessageCircle size={18} />
                      Comments ({c.comments.length})
                    </h4>
                    <div className="space-y-2">
                      {c.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-800">
                              {comment.user?.name || "User"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Comment */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={selectedComplaint === c._id ? commentText : ""}
                      onFocus={() => setSelectedComplaint(c._id)}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") addComment(c._id);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => addComment(c._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating Modal */}
        {ratingComplaint && (
          <RatingModal
            complaint={ratingComplaint}
            onClose={() => setRatingComplaint(null)}
            onRated={loadComplaints}
          />
        )}
      </div>
    </div>
  );
}

