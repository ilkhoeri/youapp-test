import { USER } from '@/resource/types/user';

export function transformMemberAddress(address: USER.ADDRESS | null | undefined): string[] {
  if (!address) return [];
  return Object.values({
    village: address.village || '',
    subdistrict: address.subdistrict || '',
    district: address.district || '',
    regency: address.regency || '',
    city: address.city || '',
    street: address.street || '',
    postalcode: address.postalcode || '',
    state: address.state || '',
    country: address.country || ''
  });
}
export function formatAddressToArray(address: Record<string, string> | null | undefined) {
  if (!address) return [];

  return Object.values({
    village: address.village,
    subdistrict: address.subdistrict,
    district: address.district,
    regency: address.regency,
    city: address.city,
    street: address.street,
    postalcode: address.postalcode,
    state: address.state,
    country: address.country
  });
}
export function formatAddressInstituteToObject(address: string[] | null | undefined) {
  if (!address) return null;
  const [village, subdistrict, district, regency, city, street, postalcode, state, country] = address;

  return {
    village: village || '',
    subdistrict: subdistrict || '',
    district: district || '',
    regency: regency || '',
    city: city || '',
    street: street || '',
    postalcode: postalcode || '',
    state: state || '',
    country: country || ''
  };
}

export function formatAddress(address: USER.ADDRESS | null | undefined): string[] {
  if (!address) return [];

  return Object.entries({
    village: address.village,
    subdistrict: address.subdistrict,
    district: address.district,
    regency: address.regency,
    city: address.city,
    street: address.street,
    postalcode: address.postalcode,
    state: address.state,
    country: address.country
  })
    .map(([_, value]) => value)
    .filter((value): value is string => !!value && value.trim() !== '');
}
