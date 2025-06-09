import { supabase } from './supabaseClient';


export interface Hotel {
  hotelid: number;
  hotel_name: string;
  review_score: number;
  hotel_experience: string;
  amenities: string[] | string;
  address: string;
  country: string;
  location: string;
  price: number;
  city: string;
  review_count: number;
  stars: number;
  room_types: string[];
  max_adults: number;
  max_children: number;
  total_rooms: number;
  image_url: string | string[];
  continent: string;
}

export async function getHotels() {
  const { data, error } = await supabase
    .from('hotels')
    .select('*');
  
  if (error) throw error;
  return data as Hotel[];
}

export async function getHotelById(id: string | number) {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('hotelid', id)
    .single();
  
  if (error) throw error;
  
  // Handle the image_url field
  return {
    ...data,
    image_url: Array.isArray(data.image_url) ? data.image_url : [data.image_url]
  };
}

export async function searchHotels(query: string) {
  let allData: Hotel[] = [];
  let from = 0;
  const PAGE_SIZE = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .or(`hotel_name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`)
      .range(from, from + PAGE_SIZE - 1);
    
    if (error) throw error;
    if (!data || data.length === 0) break;
    
    allData = [...allData, ...data];
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  
  return allData as Hotel[];
}

export async function getTopHotels(limit: number = 6) {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .order('review_score', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as Hotel[];
}

export async function getHotelsByContinent(continent: string) {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('continent', continent);
  
  if (error) throw error;
  return data as Hotel[];
}

export async function getDestinations() {
  const { data, error } = await supabase
    .from('hotels')
    .select('city, country, continent, image_url')
    .order('city');
  
  if (error) throw error;
  return [...new Set(data.map(d => JSON.stringify(d as Record<string, string>)))].map(d => JSON.parse(d));
}

export async function getHotelsByIds(ids: (string | number)[]) {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .in('hotelid', ids);
  
  if (error) throw error;
  return data as Hotel[];
} 