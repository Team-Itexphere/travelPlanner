import { API_CONFIG } from './apiConfig';

// Generate a random session token for Google Places API to group related queries
const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Location interface
export interface Location {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  country: string;
  administrativeAreaLevel1?: string; // State/Province
  administrativeAreaLevel2?: string; // City
  locality?: string; // City/Town
  sublocality?: string; // Neighborhood
}

// Google Places API response interfaces
interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: Array<{
    offset: number;
    value: string;
  }>;
}

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface GooglePlacesResponse {
  predictions: GooglePlacePrediction[];
  status: string;
}

interface GooglePlaceDetailsResponse {
  result: GooglePlaceDetails;
  status: string;
}



// Search for places using Google Places Autocomplete API with fallback
export const searchPlaces = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
      // Use Google Places API with country restriction to ensure API works properly
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(query)}&` +
        `key=${API_CONFIG.GOOGLE_MAPS.API_KEY}&` +
        `components=country:${API_CONFIG.GOOGLE_MAPS.COUNTRY_RESTRICTION}&` +
        `language=en&region=lk&` +
        // Bias around Sri Lanka (approx center) with ~400km radius to cover island
        `locationbias=circle:400000@7.8731,80.7718`

    console.log('Google Places API Request URL:', url);
    const response = await fetch(url);
    
    // Log response status and headers
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data: GooglePlacesResponse;
    try {
      const responseText = await response.text();
      console.log('Google Places API Response Text:', responseText);
      data = JSON.parse(responseText);
      console.log('Parsed data:', data);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return [];
    }
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      // Log API errors
      console.warn(`Google Places API error: ${data.status}`);
      return [];
    }

    // Convert predictions to Location objects
    const locations: Location[] = [];
    
    // Return lightweight suggestions first (faster list); fetch details on selection
    if (data.predictions?.length) {
      const googleLocations = data.predictions.map((p) => ({
        placeId: p.place_id,
        name: p.structured_formatting?.main_text || p.description,
        formattedAddress: p.description,
        // Lat/Lng will be populated after selection via getPlaceDetails
        latitude: 0,
        longitude: 0,
        country: '',
      } as Location));
      
      return googleLocations.slice(0, 12);
    }

    return locations;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};



// Get detailed information about a place using Google Places Details API
export const getPlaceDetails = async (placeId: string): Promise<Location | null> => {

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `key=${API_CONFIG.GOOGLE_MAPS.API_KEY}&` +
      `fields=place_id,name,formatted_address,geometry,address_components`

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data: GooglePlaceDetailsResponse;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response in getPlaceDetails:', parseError);
      throw new Error('Invalid JSON response');
    }
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places Details API error: ${data.status}`);
    }

    const place = data.result;
    
    // Parse address components
    let country = '';
    let administrativeAreaLevel1 = '';
    let administrativeAreaLevel2 = '';
    let locality = '';
    let sublocality = '';

    for (const component of place.address_components) {
      if (component.types.includes('country')) {
        country = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        administrativeAreaLevel1 = component.long_name;
      } else if (component.types.includes('administrative_area_level_2')) {
        administrativeAreaLevel2 = component.long_name;
      } else if (component.types.includes('locality')) {
        locality = component.long_name;
      } else if (component.types.includes('sublocality')) {
        sublocality = component.long_name;
      }
    }

    return {
      placeId: place.place_id,
      name: place.name,
      formattedAddress: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      country,
      administrativeAreaLevel1,
      administrativeAreaLevel2,
      locality,
      sublocality,
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

// Geocode an address to get coordinates
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(address)}&` +
      `key=${API_CONFIG.GOOGLE_MAPS.API_KEY}&` +
      `components=country:${API_CONFIG.GOOGLE_MAPS.COUNTRY_RESTRICTION}&` +
      `region=lk`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response in geocodeAddress:', parseError);
      return null;
    }
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn(`Google Geocoding API error: ${data.status}`);
      return null;
    }

    const result = data.results[0];
    
    // Parse address components
    let country = '';
    let administrativeAreaLevel1 = '';
    let administrativeAreaLevel2 = '';
    let locality = '';
    let sublocality = '';

    for (const component of result.address_components) {
      if (component.types.includes('country')) {
        country = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        administrativeAreaLevel1 = component.long_name;
      } else if (component.types.includes('administrative_area_level_2')) {
        administrativeAreaLevel2 = component.long_name;
      } else if (component.types.includes('locality')) {
        locality = component.long_name;
      } else if (component.types.includes('sublocality')) {
        sublocality = component.long_name;
      }
    }

    return {
      placeId: result.place_id,
      name: result.formatted_address,
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      country,
      administrativeAreaLevel1,
      administrativeAreaLevel2,
      locality,
      sublocality,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// ============ OSM FALLBACK PROVIDER ============
// Lightweight search for suggestions
export const searchPlacesOSM = async (query: string): Promise<Location[]> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&accept-language=en&q=${encodeURIComponent(query)}&countrycodes=lk`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const json = await resp.json();
    if (!Array.isArray(json)) return [];
    return json.map((item: any) => {
      const address = item.address || {};
      return {
        placeId: `osm-${item.osm_type?.[0]?.toUpperCase() || 'N'}${item.osm_id}`,
        name: item.display_name?.split(',')[0] || item.display_name || 'Location',
        formattedAddress: item.display_name || '',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        country: address.country || '',
        administrativeAreaLevel1: address.state || address.region,
        administrativeAreaLevel2: address.county || address.district,
        locality: address.city || address.town || address.village,
        sublocality: address.suburb || address.neighbourhood,
      } as Location;
    });
  } catch (e) {
    return [];
  }
};

// Geocode with OSM
export const geocodeAddressOSM = async (address: string): Promise<Location | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&accept-language=en&q=${encodeURIComponent(address)}&countrycodes=lk`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const json = await resp.json();
    const item = Array.isArray(json) ? json[0] : null;
    if (!item) return null;
    const addr = item.address || {};
    return {
      placeId: `osm-${item.osm_type?.[0]?.toUpperCase() || 'N'}${item.osm_id}`,
      name: item.display_name?.split(',')[0] || item.display_name || 'Location',
      formattedAddress: item.display_name || '',
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      country: addr.country || '',
      administrativeAreaLevel1: addr.state || addr.region,
      administrativeAreaLevel2: addr.county || addr.district,
      locality: addr.city || addr.town || addr.village,
      sublocality: addr.suburb || addr.neighbourhood,
    } as Location;
  } catch {
    return null;
  }
};

// Calculate distance between two locations (in kilometers)
export const calculateDistance = (location1: Location, location2: Location): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (location2.latitude - location1.latitude) * Math.PI / 180;
  const dLng = (location2.longitude - location1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(location1.latitude * Math.PI/180) * Math.cos(location2.latitude * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Format location for display
export const formatLocationDisplay = (location: Location): string => {
  if (location.locality && location.administrativeAreaLevel1) {
    return `${location.locality}, ${location.administrativeAreaLevel1}`;
  } else if (location.administrativeAreaLevel1) {
    return location.administrativeAreaLevel1;
  } else {
    return location.name;
  }
};
