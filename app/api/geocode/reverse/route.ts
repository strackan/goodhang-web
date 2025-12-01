import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

interface NominatimAddress {
  amenity?: string;
  shop?: string;
  restaurant?: string;
  bar?: string;
  cafe?: string;
  pub?: string;
  fast_food?: string;
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResponse {
  name?: string;
  display_name: string;
  address: NominatimAddress;
}

/**
 * Format address from Nominatim response
 */
function formatAddress(address: NominatimAddress): string {
  const parts: string[] = [];

  // Street address
  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }

  // City/Town
  const city = address.city || address.town || address.village;
  if (city) {
    parts.push(city);
  }

  // State
  if (address.state) {
    parts.push(address.state);
  }

  return parts.join(', ');
}

/**
 * Extract venue name from Nominatim response
 */
function extractVenueName(data: NominatimResponse): string | null {
  // Try explicit name first
  if (data.name) {
    return data.name;
  }

  // Try common venue types from address
  const address = data.address;
  return (
    address.amenity ||
    address.restaurant ||
    address.bar ||
    address.cafe ||
    address.pub ||
    address.fast_food ||
    address.shop ||
    null
  );
}

/**
 * GET /api/geocode/reverse
 * Reverse geocode coordinates to venue/address using OpenStreetMap Nominatim
 *
 * Query params:
 * - lat: number (required)
 * - lng: number (required)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng query parameters are required' },
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: 'lat and lng must be valid numbers' },
        { status: 400 }
      );
    }

    // Call Nominatim API
    const nominatimUrl = new URL(NOMINATIM_URL);
    nominatimUrl.searchParams.set('lat', lat);
    nominatimUrl.searchParams.set('lon', lng);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('addressdetails', '1');

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'GoodHang/1.0 (https://goodhang.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 502 }
      );
    }

    const data: NominatimResponse = await response.json();

    // Extract venue name and address
    const venueName = extractVenueName(data);
    const address = formatAddress(data.address);

    return NextResponse.json({
      success: true,
      venue_name: venueName,
      address: address || data.display_name,
      display_name: data.display_name,
      raw: data, // Include raw data for debugging
    });
  } catch (error) {
    console.error('Error in GET /api/geocode/reverse:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
