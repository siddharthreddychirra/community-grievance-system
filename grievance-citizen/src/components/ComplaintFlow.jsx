import { FileText, Clock, UserCheck, CheckCircle, AlertTriangle } from "lucide-react";

export default function ComplaintFlow({ complaint }) {
  const steps = [
    {
      status: "open",
      label: "Submitted",
      icon: FileText,
      color: "blue",
      reached: true
    },
    {
      status: "assigned",
      label: "Assigned",
      icon: UserCheck,
      color: "purple",
      reached: complaint.status !== "open" && complaint.status !== "pending"
    },
    {
      status: "in-progress",
      label: "In Progress",
      icon: Clock,
      color: "orange",
      reached: complaint.status === "in-progress" || complaint.status === "resolved" || complaint.status === "closed"
    },
    {
      status: "resolved",
      label: "Resolved",
      icon: CheckCircle,
      color: "green",
      reached: complaint.status === "resolved" || complaint.status === "closed"
    }
  ];

  const getColorClasses = (color, reached) => {
    if (!reached) return "bg-gray-200 text-gray-400";
    
    switch (color) {
      case "blue": return "bg-blue-500 text-white";
      case "purple": return "bg-purple-500 text-white";
      case "orange": return "bg-orange-500 text-white";
      case "green": return "bg-green-500 text-white";
      default: return "bg-gray-300 text-gray-600";
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className={`h-full transition-all duration-500 ${
              complaint.status === "resolved" || complaint.status === "closed"
                ? "bg-green-500 w-full"
                : complaint.status === "in-progress"
                ? "bg-orange-500 w-2/3"
                : complaint.status === "assigned"
                ? "bg-purple-500 w-1/3"
                : "bg-blue-500 w-0"
            }`}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Icon Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${getColorClasses(
                  step.color,
                  step.reached
                )} shadow-lg`}
              >
                <Icon size={24} />
              </div>
              
              {/* Label */}
              <p
                className={`mt-2 text-sm font-medium text-center ${
                  step.reached ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              
              {/* Timestamp */}
              {step.reached && complaint.updatedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(complaint.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      {complaint.escalationLevel > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Escalated</p>
            <p className="text-xs text-red-600">
              This complaint has been escalated {complaint.escalationLevel} time(s) due to delay
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
