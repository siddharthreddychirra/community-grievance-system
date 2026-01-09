import { AlertTriangle, TrendingUp, Clock, User, CheckCircle } from "lucide-react";

/**
 * EscalationTimeline Component
 * Shows escalation flow and timeline for transparency
 */
export default function EscalationTimeline({ complaint }) {
  const hasEscalations = complaint?.escalationHistory?.length > 0;
  const escalationLevel = complaint?.escalationLevel || 0;

  if (!hasEscalations && escalationLevel === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">No Escalations</span>
        </div>
        <p className="text-sm text-green-600 mt-1">
          This complaint is being handled within the normal timeframe.
        </p>
      </div>
    );
  }

  const getLevelBadge = (level) => {
    const badges = {
      1: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Level 1 - Mid Staff" },
      2: { color: "bg-orange-100 text-orange-800 border-orange-300", label: "Level 2 - Senior Staff" },
      3: { color: "bg-red-100 text-red-800 border-red-300", label: "Level 3 - Critical" },
    };
    return badges[level] || badges[1];
  };

  const currentLevelInfo = getLevelBadge(escalationLevel);

  // Calculate time since last escalation
  const getTimeSinceEscalation = (escalationDate) => {
    const now = new Date();
    const escalated = new Date(escalationDate);
    const diffHours = Math.floor((now - escalated) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">Escalation Status</h3>
              <p className="text-sm text-orange-50">Tracking for transparency</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border ${currentLevelInfo.color} font-semibold`}>
            {currentLevelInfo.label}
          </div>
        </div>
      </div>

      {/* Escalation Info */}
      <div className="p-4 bg-orange-50 border-b border-orange-100">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-orange-600 mt-1" />
          <div>
            <p className="text-sm text-gray-700">
              <strong>Why was this escalated?</strong> Your complaint exceeded the Service Level Agreement (SLA) 
              deadline and has been automatically escalated to higher-level staff to ensure faster resolution.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Current escalation level: <strong className="text-orange-700">{escalationLevel}</strong> 
              {escalationLevel >= 2 && " (High Priority)"}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Escalation Timeline
        </h4>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {/* Initial Assignment */}
          <div className="relative pl-12 pb-6">
            <div className="absolute left-0 w-8 h-8 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-gray-800">Initially Assigned</h5>
                  {complaint.assignedTo && (
                    <p className="text-sm text-gray-600 mt-1">
                      Assigned to: <strong>{complaint.assignedTo.name}</strong>
                      {complaint.assignedTo.staffLevel && 
                        ` (${complaint.assignedTo.staffLevel} staff)`
                      }
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Escalation Events */}
          {complaint.escalationHistory?.map((escalation, index) => {
            return (
              <div key={index} className="relative pl-12 pb-6">
                <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white ${
                  escalation.level === 1 ? "bg-yellow-500" : 
                  escalation.level === 2 ? "bg-orange-500" : "bg-red-500"
                } flex items-center justify-center`}>
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div className={`p-3 rounded-lg border ${
                  escalation.level === 1 ? "bg-yellow-50 border-yellow-200" : 
                  escalation.level === 2 ? "bg-orange-50 border-orange-200" : 
                  "bg-red-50 border-red-200"
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-gray-800">
                      Escalated to Level {escalation.level}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {getTimeSinceEscalation(escalation.escalatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{escalation.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(escalation.escalatedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Current Status */}
          <div className="relative pl-12">
            <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white ${
              complaint.status === "resolved" ? "bg-green-500" : 
              complaint.status === "in-progress" ? "bg-blue-500" : "bg-gray-500"
            } flex items-center justify-center`}>
              {complaint.status === "resolved" ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <Clock className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`p-3 rounded-lg border ${
              complaint.status === "resolved" 
                ? "bg-green-50 border-green-200" 
                : "bg-gray-50 border-gray-200"
            }`}>
              <h5 className="font-semibold text-gray-800">
                Current Status: <span className="capitalize">{complaint.status}</span>
              </h5>
              {complaint.assignedTo && (
                <p className="text-sm text-gray-600 mt-1">
                  Handled by: <strong>{complaint.assignedTo.name}</strong>
                  {complaint.assignedTo.staffLevel && 
                    ` (${complaint.assignedTo.staffLevel} staff)`
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="bg-blue-50 border-t border-blue-100 p-4">
        <p className="text-sm text-blue-800">
          <strong>🔍 Transparency Note:</strong> Escalations happen automatically when complaints 
          exceed their Service Level Agreement (SLA) deadlines. This ensures your concerns are 
          prioritized and handled by more experienced staff members for faster resolution.
        </p>
      </div>
    </div>
  );
}
