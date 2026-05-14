export interface GeoTagResult {
  lat: number;
  lng: number;
  address: string;
  area: string;
  road_name: string;
  cross_street: string;
  postcode?: string;
}

function pickAddress(d: Record<string, unknown>): string {
  if (typeof d.display_name === "string") return d.display_name;
  return "";
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeoTagResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
    String(lat)
  )}&lon=${encodeURIComponent(String(lng))}&format=json`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });
  if (!res.ok) {
    throw new Error("Reverse geocoding failed");
  }
  const data = (await res.json()) as Record<string, unknown>;
  const addr = (data.address as Record<string, string> | undefined) || {};
  const road =
    addr.road || addr.pedestrian || addr.neighbourhood || addr.suburb || "";
  const area =
    addr.suburb || addr.neighbourhood || addr.city_district || addr.city || "";
  const city = addr.city || addr.town || addr.village || addr.state || "";
  const postcode = addr.postcode || "";
  const display = pickAddress(data);
  return {
    lat,
    lng,
    address: display || [road, city].filter(Boolean).join(", "),
    area: area || city || "",
    road_name: road,
    cross_street: addr.hamlet || addr.quarter || "",
    postcode,
  };
}

export function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export async function fetchGeoTag(): Promise<GeoTagResult> {
  const { lat, lng } = await getBrowserLocation();
  return reverseGeocode(lat, lng);
}
