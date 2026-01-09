import { useState } from "react";
import { apiRequest } from "../api";
import { MapPin, Upload, Send, Loader2 } from "lucide-react";
import DuplicateChecker from "../components/DuplicateChecker";

export default function RaiseComplaint({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("others");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    area: "",
  });

  async function handleSubmit() {
    if (!title || !description) {
      alert("Please fill all fields");
      return;
    }

    // ✅ Ensure location is filled
    if (!location.lat || !location.lng) {
      alert("Please detect location");
      return;
    }
    if (!location.area.trim()) {
      alert("Please enter area");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Create complaint with location
      const complaint = await apiRequest("/api/complaints", "POST", {
        title,
        description,
        department,
        location, // ✅ must be included
      });

      // 2️⃣ Upload media (if any)
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const uploadResponse = await fetch(
          `http://localhost:5000/api/complaints/${complaint._id}/media`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              // ❌ Do NOT set Content-Type here, browser will set it with boundary
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || "Media upload failed. Please ensure images are relevant to civic issues (roads, water, sanitation, etc.). Selfies and irrelevant content are not allowed.");
        }
      }

      alert("✅ Complaint submitted successfully! Our AI will classify and assign it to the right department.");

      // Reset form
      setTitle("");
      setDescription("");
      setFiles([]);
      setDepartment("others");
      setLocation({ lat: null, lng: null, area: "" });
      
      // Callback to refresh parent component
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📝 Raise a Complaint</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Title *</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief title of your issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide detailed information about the issue"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Duplicate Detection */}
        <DuplicateChecker
          title={title}
          description={description}
          onViewComplaint={(complaint) => {
            alert(`Viewing similar complaint: ${complaint.title}\nStatus: ${complaint.status}`);
          }}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="roads">🛣️ Roads & Transport</option>
            <option value="water">💧 Water Supply</option>
            <option value="sanitation">🧹 Sanitation</option>
            <option value="electricity">⚡ Electricity</option>
            <option value="municipal">🏛️ Municipal Services</option>
            <option value="others">❓ Not Sure (AI will classify)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <button
            onClick={() => {
              if (!navigator.geolocation) {
                alert("Geolocation not supported by your browser");
                return;
              }

              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setLocation({
                    ...location,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  });
                  alert("📍 Location detected successfully!");
                },
                () => alert("❌ Location permission denied or unavailable")
              );
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            type="button"
          >
            <MapPin size={20} />
            Detect My Location
          </button>
          {location.lat && location.lng && (
            <p className="text-sm text-green-600 mt-2">✅ Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area / Locality *</label>
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Kukatpally, Sector 12"
            value={location.area}
            onChange={(e) => setLocation({ ...location, area: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
          <p className="text-xs text-gray-500 mb-2">
            ⚠️ Only upload images relevant to civic issues (roads, water, sanitation, etc.). Selfies, memes, or irrelevant images will be rejected by our AI.
          </p>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer transition-colors">
              <Upload size={20} />
              <span>Choose Files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={(e) => setFiles([...e.target.files])}
                className="hidden"
              />
            </label>
            {files.length > 0 && (
              <span className="text-sm text-gray-600">{files.length} file(s) selected</span>
            )}
          </div>

          {/* Preview */}
          {files.length > 0 && (
            <div className="mt-3 space-y-1">
              {files.map((f, i) => (
                <div key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  📎 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={20} />
              Submit Complaint
            </>
          )}
        </button>
      </div>
    </div>
  );
}