// Using Leaflet (free OpenStreetMap) instead of Google Maps
import LeafletMap from "./LeafletMap";

export default function MapView({ complaints, onMarkerClick, height = "500px" }) {
  return <LeafletMap complaints={complaints} onMarkerClick={onMarkerClick} height={height} />;
}
