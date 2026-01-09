export default function ComplaintDetails({ complaint, onClose }) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">
          {complaint.title}
        </h2>

        <p className="mb-4">{complaint.description}</p>

        <h3 className="font-semibold mb-2">Attachments</h3>

        {(!complaint.media || complaint.media.length === 0) && (
          <p className="text-gray-500">No media uploaded</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {complaint.media?.map((m, idx) => {
            if (m.type === "image") {
              return (
                <img
                  key={idx}
                  src={m.url}
                  alt="complaint"
                  className="w-full rounded border"
                />
              );
            }

            if (m.type === "video") {
              return (
                <video key={idx} controls className="w-full rounded">
                  <source src={m.url} />
                </video>
              );
            }

            if (m.type === "audio") {
              return (
                <audio key={idx} controls className="w-full">
                  <source src={m.url} />
                </audio>
              );
            }

            return null;
          })}
        </div>

        <button
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
