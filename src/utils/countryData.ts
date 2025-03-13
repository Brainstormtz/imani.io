// Country data with phone codes and flags
export interface CountryCode {
  name: string;
  code: string; // ISO code
  dial_code: string;
  flag: string;
}

export const countryCodes: CountryCode[] = [
  // Africa-centric list (put African countries first)
  { name: "Tanzania", code: "TZ", dial_code: "+255", flag: "🇹🇿" },
  { name: "Kenya", code: "KE", dial_code: "+254", flag: "🇰🇪" },
  { name: "Uganda", code: "UG", dial_code: "+256", flag: "🇺🇬" },
  { name: "Rwanda", code: "RW", dial_code: "+250", flag: "🇷🇼" },
  { name: "South Africa", code: "ZA", dial_code: "+27", flag: "🇿🇦" },
  { name: "Nigeria", code: "NG", dial_code: "+234", flag: "🇳🇬" },
  { name: "Ghana", code: "GH", dial_code: "+233", flag: "🇬🇭" },
  { name: "Ethiopia", code: "ET", dial_code: "+251", flag: "🇪🇹" },
  // Added more African countries
  { name: "Zambia", code: "ZM", dial_code: "+260", flag: "🇿🇲" },
  { name: "Botswana", code: "BW", dial_code: "+267", flag: "🇧🇼" },
  { name: "Mozambique", code: "MZ", dial_code: "+258", flag: "🇲🇿" },
  { name: "Zimbabwe", code: "ZW", dial_code: "+263", flag: "🇿🇼" },
  { name: "Burundi", code: "BI", dial_code: "+257", flag: "🇧🇮" },
  { name: "Angola", code: "AO", dial_code: "+244", flag: "🇦🇴" },
  { name: "Malawi", code: "MW", dial_code: "+265", flag: "🇲🇼" },
  { name: "Senegal", code: "SN", dial_code: "+221", flag: "🇸🇳" },
  { name: "Congo (DRC)", code: "CD", dial_code: "+243", flag: "🇨🇩" },
  // Other countries
  { name: "United States", code: "US", dial_code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dial_code: "+44", flag: "🇬🇧" },
  { name: "India", code: "IN", dial_code: "+91", flag: "🇮🇳" },
  { name: "China", code: "CN", dial_code: "+86", flag: "🇨🇳" },
  { name: "Japan", code: "JP", dial_code: "+81", flag: "🇯🇵" },
  { name: "Brazil", code: "BR", dial_code: "+55", flag: "🇧🇷" },
  { name: "Germany", code: "DE", dial_code: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dial_code: "+33", flag: "🇫🇷" },
  { name: "Canada", code: "CA", dial_code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dial_code: "+61", flag: "🇦🇺" },
];

// Get browser's country via Geolocation API
export async function getUserCountry(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('Error detecting country:', error);
    return null;
  }
}

// Helper function to get Country object by country code
export function getCountryByCode(code: string): CountryCode | undefined {
  return countryCodes.find(country => country.code === code);
}

// Validate international phone number
export function validateInternationalPhone(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  // Remove spaces, dashes, and parentheses
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with + and contains 7-15 digits
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(cleaned);
}

// Format phone number with country code
export function formatPhoneWithCountryCode(countryCode: string, phoneNumber: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) return phoneNumber;
  
  // Remove leading zeros
  const cleanedPhone = phoneNumber.replace(/^0+/, '');
  
  // If phone already has the country code, return as is
  if (cleanedPhone.startsWith(country.dial_code)) {
    return cleanedPhone;
  }
  
  // If phone starts with +, assume it already has a country code
  if (cleanedPhone.startsWith('+')) {
    return cleanedPhone;
  }
  
  // Otherwise, prepend the country code
  return `${country.dial_code}${cleanedPhone}`;
}