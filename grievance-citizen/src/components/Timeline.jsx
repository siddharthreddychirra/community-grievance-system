import { Clock, User, AlertTriangle, CheckCircle, MessageSquare, TrendingUp } from "lucide-react";

export default function Timeline({ complaint }) {
  const events = [];

  // 1. Complaint Submitted
  events.push({
    time: complaint.createdAt,
    type: "submitted",
    title: "Complaint Submitted",
    description: `Filed by ${complaint.createdBy?.name}`,
    icon: Clock,
    color: "blue",
  });

  // 2. AI Classification
  if (complaint.aiClassified) {
    events.push({
      time: complaint.createdAt,
      type: "ai",
      title: "AI Analysis Completed",
      description: `Department: ${complaint.department} | Priority: ${complaint.priority || "Normal"}`,
      icon: TrendingUp,
      color: "purple",
    });
  }

  // 3. Duplicate Detection
  if (complaint.isDuplicate) {
    events.push({
      time: complaint.createdAt,
      type: "duplicate",
      title: "Duplicate Detected",
      description: `Similar to complaint: ${complaint.relatedTo}`,
      icon: AlertTriangle,
      color: "orange",
    });
  }

  // 4. Assignment to Staff
  if (complaint.assignedTo && complaint.assignedAt) {
    events.push({
      time: complaint.assignedAt,
      type: "assigned",
      title: "Assigned to Staff",
      description: `${complaint.assignedTo.name} (${complaint.assignedTo.department})`,
      icon: User,
      color: "green",
    });
  }

  // 5. Status Updates
  const statusHistory = [
    { status: "submitted", label: "Submitted", time: complaint.createdAt },
    { status: "assigned", label: "Assigned", time: complaint.assignedAt },
    { status: "in-progress", label: "In Progress", time: complaint.inProgressAt },
    { status: "resolved", label: "Resolved", time: complaint.resolvedAt },
    { status: "closed", label: "Closed", time: complaint.closedAt },
  ];

  statusHistory.forEach(({ status, label, time }) => {
    if (time && status !== "submitted" && status !== "assigned") {
      events.push({
        time,
        type: status,
        title: `Status: ${label}`,
        description: `Complaint marked as ${label.toLowerCase()}`,
        icon: status === "resolved" || status === "closed" ? CheckCircle : Clock,
        color: status === "resolved" || status === "closed" ? "green" : "blue",
      });
    }
  });

  // 6. Escalations
  if (complaint.escalationHistory && complaint.escalationHistory.length > 0) {
    complaint.escalationHistory.forEach((escalation) => {
      events.push({
        time: escalation.escalatedAt,
        type: "escalation",
        title: `Escalated to Level ${escalation.level}`,
        description: escalation.reason || "Automatic escalation due to SLA breach",
        icon: AlertTriangle,
        color: "red",
      });
    });
  }

  // 7. Comments
  if (complaint.comments && complaint.comments.length > 0) {
    complaint.comments.forEach((comment) => {
      events.push({
        time: comment.createdAt,
        type: "comment",
        title: "Comment Added",
        description: `${comment.author?.name}: ${comment.text.substring(0, 50)}${comment.text.length > 50 ? "..." : ""}`,
        icon: MessageSquare,
        color: "gray",
      });
    });
  }

  // Sort events by time
  events.sort((a, b) => new Date(a.time) - new Date(b.time));

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 border-blue-500",
      purple: "bg-purple-500 border-purple-500",
      orange: "bg-orange-500 border-orange-500",
      green: "bg-green-500 border-green-500",
      red: "bg-red-500 border-red-500",
      gray: "bg-gray-500 border-gray-500",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Action Timeline
      </h3>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* Timeline Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={index} className="relative pl-12">
                {/* Icon Circle */}
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white ${getColorClasses(
                    event.color
                  )} flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Content */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(event.time).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <p className="text-sm text-gray-600">
          <strong>Total Events:</strong> {events.length} | 
          <strong className="ml-2">Duration:</strong>{" "}
          {Math.ceil(
            (new Date() - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24)
          )}{" "}
          days
        </p>
      </div>
    </div>
  );
}
