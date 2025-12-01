import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// City coordinates mapping
const cityCoordinates = {
  'brussels': [50.8503, 4.3517],
  'bruges': [51.2093, 3.2247],
  'antwerp': [51.2194, 4.4025],
  'ghent': [51.0543, 3.7174],
  'liege': [50.6326, 5.5797],
  'namur': [50.4674, 4.8720],
  'leuven': [50.8798, 4.7005],
  'mechelen': [51.0259, 4.4777],
  'hasselt': [50.9307, 5.3378],
  'charleroi': [50.4108, 4.4446],
};

export default function CityMap({ cityName, locations = [] }) {
  // Get city coordinates or default to Brussels
  const citySlug = cityName.toLowerCase();
  const defaultCenter = cityCoordinates[citySlug] || cityCoordinates['brussels'];

  // For now, we'll use the city center as locations don't have exact coordinates
  // In a real app, you'd geocode addresses or store lat/lng in the database
  const mapLocations = locations.slice(0, 10).map((location, index) => ({
    ...location,
    // Distribute markers around the city center for demo purposes
    position: [
      defaultCenter[0] + (Math.random() - 0.5) * 0.05,
      defaultCenter[1] + (Math.random() - 0.5) * 0.05
    ]
  }));

  return (
    <div className="h-[500px] w-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapLocations.map((location) => (
          <Marker key={location.id} position={location.position}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{location.name}</h3>
                {location.address && (
                  <p className="text-xs text-gray-600 mb-2">{location.address}</p>
                )}
                <Link
                  to={createPageUrl('BusinessDetail') + '?slug=' + location.slug}
                  className="text-xs text-[var(--belgian-red)] hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-[var(--belgian-red)]" />
          <span className="font-medium">{mapLocations.length} Businesses</span>
        </div>
      </div>
    </div>
  );
}