/**
 * Google Maps Helper
 * Provides map initialization and marker management
 */

export class MapManager {
  constructor(mapElement, options = {}) {
    this.mapElement = mapElement;
    this.markers = [];
    
    const defaultOptions = {
      center: { lat: 28.6139, lng: 77.2090 }, // Default: New Delhi
      zoom: 12,
      ...options,
    };

    this.map = new google.maps.Map(mapElement, defaultOptions);
  }

  /**
   * Add a single marker to the map
   */
  addMarker(complaint, onClick = null) {
    if (!complaint.location?.lat || !complaint.location?.lng) return null;

    const isResolved = ["resolved", "closed"].includes(complaint.status);
    const markerColor = isResolved ? "#10b981" : "#ef4444"; // green : red

    const marker = new google.maps.Marker({
      position: { lat: complaint.location.lat, lng: complaint.location.lng },
      map: this.map,
      title: complaint.title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: markerColor,
        fillOpacity: 0.8,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    if (onClick) {
      marker.addListener("click", () => onClick(complaint));
    }

    this.markers.push(marker);
    return marker;
  }

  /**
   * Add multiple markers
   */
  addMarkers(complaints, onClick = null) {
    complaints.forEach((complaint) => {
      this.addMarker(complaint, onClick);
    });

    // Auto-fit bounds to show all markers
    if (this.markers.length > 0) {
      this.fitBounds();
    }
  }

  /**
   * Clear all markers
   */
  clearMarkers() {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }

  /**
   * Fit map bounds to show all markers
   */
  fitBounds() {
    if (this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach((marker) => {
      bounds.extend(marker.getPosition());
    });

    this.map.fitBounds(bounds);

    // Prevent zooming too much if there's only one marker
    if (this.markers.length === 1) {
      this.map.setZoom(15);
    }
  }

  /**
   * Center map on specific location
   */
  centerOn(lat, lng, zoom = 15) {
    this.map.setCenter({ lat, lng });
    this.map.setZoom(zoom);
  }
}

/**
 * Get user's current location
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Load Google Maps Script
 */
export function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));

    document.head.appendChild(script);
  });
}
