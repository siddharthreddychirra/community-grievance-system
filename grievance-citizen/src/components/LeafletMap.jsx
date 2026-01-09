import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (color, isHotspot = false) => {
  const size = isHotspot ? 32 : 24;
  const pulse = isHotspot ? 'animation: pulse 2s infinite;' : '';
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); ${pulse}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const redIcon = createCustomIcon("#ef4444");
const hotspotIcon = createCustomIcon("#dc2626", true); // Darker red for hotspots
const greenIcon = createCustomIcon("#10b981");
const orangeIcon = createCustomIcon("#f97316");
const blueIcon = createCustomIcon("#3b82f6");

// Component to auto-fit bounds
function MapBounds({ complaints }) {
  const map = useMap();

  useEffect(() => {
    if (complaints && complaints.length > 0) {
      const validLocations = complaints.filter(
        (c) => c.location?.lat && c.location?.lng
      );

      if (validLocations.length > 0) {
        const bounds = validLocations.map((c) => [
          c.location.lat,
          c.location.lng,
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [complaints, map]);

  return null;
}

export default function LeafletMap({ complaints, onMarkerClick, height = "500px" }) {
  const defaultCenter = [28.6139, 77.209]; // New Delhi
  const defaultZoom = 12;

  const getMarkerIcon = (complaint) => {
    // Hotspots get special red marker
    if (complaint.isHotspot) return hotspotIcon;
    
    const status = complaint.status?.toLowerCase();
    if (status === "resolved" || status === "closed") return greenIcon;
    if (status === "in-progress" || status === "assigned") return orangeIcon;
    if (status === "pending" || status === "open") return redIcon;
    return blueIcon;
  };

  const validComplaints = complaints?.filter(
    (c) => c.location?.lat && c.location?.lng
  ) || [];

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden shadow-lg border border-gray-300">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validComplaints.map((complaint) => (
          <Marker
            key={complaint._id}
            position={[complaint.location.lat, complaint.location.lng]}
            icon={getMarkerIcon(complaint)}
            eventHandlers={{
              click: () => onMarkerClick?.(complaint),
            }}
          >
            <Popup>
              <div className="p-2">
                {complaint.isHotspot && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-300 rounded">
                    <p className="text-xs font-bold text-red-800">
                      🔥 HIGH PRIORITY HOTSPOT
                    </p>
                    <p className="text-xs text-red-600">
                      {complaint.hotspotCount || 3}+ similar complaints in this area
                    </p>
                  </div>
                )}
                <h3 className="font-bold text-sm mb-1">{complaint.title}</h3>
                <p className="text-xs text-gray-600 mb-1">{complaint.description?.slice(0, 100)}...</p>
                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    complaint.status === "resolved" || complaint.status === "closed"
                      ? "bg-green-100 text-green-800"
                      : complaint.status === "in-progress" || complaint.status === "assigned"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {complaint.status}
                  </span>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {complaint.department}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapBounds complaints={validComplaints} />
      </MapContainer>
    </div>
  );
}
