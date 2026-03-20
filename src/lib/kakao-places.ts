// Mock Kakao Places for Storybook
export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  distance: string;
  phone?: string;
  url?: string;
  x: string;
  y: string;
}

export async function searchNearbyPlaces(): Promise<NearbyPlace[]> {
  return [];
}
