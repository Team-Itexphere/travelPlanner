import { API_CONFIG, getEndpointUrl } from './apiConfig';

// Trip type interface based on API response
export interface TripType {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
  link: string;
  taxonomy: string;
  meta: any[];
  acf: any[];
  yoast_head: string;
  yoast_head_json: any;
  _links: any;
}

// API response type
export interface TripTypesResponse extends Array<TripType> {}

// Fetch trip types from API
export const fetchTripTypes = async (): Promise<TripType[]> => {
  try {
    const response = await fetch(getEndpointUrl('TRIP_TYPES'), {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TripTypesResponse = await response.json();
    
    // Filter out child categories (parent !== 0) and sort by name
    const mainCategories = data
      .filter(tripType => tripType.parent === 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return mainCategories;
  } catch (error) {
    console.error('Error fetching trip types:', error);
    throw new Error(`Failed to fetch trip types: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Icon mapping for different trip types
export const getTripTypeIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('adventure') || lowerName.includes('hiking')) return '🏔️';
  if (lowerName.includes('beach') || lowerName.includes('coastal')) return '🏖️';
  if (lowerName.includes('history') || lowerName.includes('culture')) return '🏛️';
  if (lowerName.includes('nature') || lowerName.includes('wildlife')) return '🌿';
  if (lowerName.includes('parks') || lowerName.includes('safari')) return '🦁';
  if (lowerName.includes('elephant')) return '🐘';
  return '🎯'; // Default icon
};

// Helper function to clean HTML entities in names
export const cleanTripTypeName = (name: string): string => {
  return name.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

// ===== Suggested Stops (WordPress AJAX) =====
export type SuggestedStop = {
  title: string;
  lat: number;
  lng: number;
  entry_fees?: number;
  visit_time?: number; // hours
};

export const fetchSuggestedStops = async (
  path: Array<{ lat: number; lng: number }>,
  tripTypeSlugs: string[]
): Promise<SuggestedStop[]> => {
  const url = `${API_CONFIG.WORDPRESS.ADMIN_AJAX_URL}?action=find_nearby_posts`;
  const body = { path, tripTypes: tripTypeSlugs } as any;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`AJAX HTTP ${resp.status}`);
  const data = await resp.json();
  console.log('Suggested stops AJAX Response', data);
  console.log('Suggested stops AJAX Body', JSON.stringify(body));
  const posts = Array.isArray(data?.posts) ? data.posts : [];
  return posts
    .filter((p: any) => p && p.lat && p.lng)
    .map((p: any) => ({
      title: String(p.title ?? 'Untitled'),
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lng),
      entry_fees: p.entry_fees != null ? Number(p.entry_fees) : undefined,
      visit_time: p.visit_time != null ? Number(p.visit_time) : undefined,
    }));
};
