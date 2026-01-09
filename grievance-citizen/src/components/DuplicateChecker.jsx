import { useState, useEffect } from "react";
import { AlertTriangle, X, Eye } from "lucide-react";
import { apiRequest } from "../api";

export default function DuplicateChecker({ title, description, onViewComplaint }) {
  const [similarComplaints, setSimilarComplaints] = useState([]);
  const [_loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Debounce search
    if (!title || title.length < 10 || dismissed) {
      setSimilarComplaints([]);
      return;
    }

    const searchSimilar = async () => {
      setLoading(true);
      try {
        const results = await apiRequest("/api/complaints/check-duplicate", "POST", {
          title,
          description: description || ""
        });
        setSimilarComplaints(results.filter(r => r.score > 0.6));
      } catch (err) {
        console.error("Error checking duplicates:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchSimilar();
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [title, description, dismissed]);

  if (dismissed || similarComplaints.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-yellow-900 text-lg">
              Similar Complaints Found
            </h3>
            <p className="text-yellow-800 text-sm mt-1">
              We found {similarComplaints.length} complaint{similarComplaints.length > 1 ? "s" : ""} that might be related to yours.
              Please check if your issue has already been reported.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-600 hover:text-yellow-800"
          title="Dismiss"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-2 mt-4">
        {similarComplaints.slice(0, 3).map((complaint) => (
          <div
            key={complaint._id}
            className="bg-white rounded-lg p-3 border border-yellow-200"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {complaint.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {complaint.description}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    complaint.status === "resolved" || complaint.status === "closed"
                      ? "bg-green-100 text-green-800"
                      : complaint.status === "in-progress" || complaint.status === "assigned"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {complaint.status}
                  </span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {complaint.department}
                  </span>
                  {complaint.similarity && (
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                      {Math.round(complaint.similarity * 100)}% match
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onViewComplaint && onViewComplaint(complaint)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1 flex-shrink-0"
              >
                <Eye size={16} />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-yellow-200 text-sm text-yellow-800">
        <p className="font-medium">
          💡 If none of these match your issue, you can proceed to submit your complaint.
        </p>
      </div>
    </div>
  );
}
