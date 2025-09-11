// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://travelsrilanka.org',
  ENDPOINTS: {
    TRIP_TYPES: '/wp-json/wp/v2/travel-type?acf_format=standard',
  },
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  GOOGLE_MAPS: {
    API_KEY: 'AIzaSyCUDHA3khY63dx8k-1jhJITCWfQSRXKBU0',
    PLACES_API_URL: 'https://maps.googleapis.com/maps/api/place',
    GEOCODING_API_URL: 'https://maps.googleapis.com/maps/api/geocode',
    DIRECTIONS_API_URL: 'https://maps.googleapis.com/maps/api/directions',
    COUNTRY_RESTRICTION: 'lk', // Sri Lanka
  },
  WORDPRESS: {
    ADMIN_AJAX_URL: 'https://travelsrilanka.org/wp-admin/admin-ajax.php',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get full endpoint URL
export const getEndpointUrl = (endpointKey: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[endpointKey]);
};
