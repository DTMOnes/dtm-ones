// Core API with the small ("min") metadata passed in explicitly.
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js/core";
import metadata from "libphonenumber-js/min/metadata";

export type CallingCountry = { code: CountryCode; dial: string; name: string };

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Every country with its calling code, by English name. Flags: /assets/flags/{code}.svg. */
export const CALLING_COUNTRIES: CallingCountry[] = getCountries(metadata)
  .map((code) => ({
    code,
    dial: getCountryCallingCode(code, metadata),
    name: regionNames.of(code) ?? code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(CALLING_COUNTRIES.map((country) => [country.code, country]));

export const DEFAULT_COUNTRY: CountryCode = "US";

export function callingCountry(code: string): CallingCountry {
  return byCode.get(code as CountryCode) ?? byCode.get(DEFAULT_COUNTRY)!;
}

/** The visitor's country from the browser language ("es-AR" → AR), when we know it. */
export function countryFromLocale(locale: string): CountryCode {
  try {
    const region = new Intl.Locale(locale).maximize().region;
    return region && byCode.has(region as CountryCode)
      ? (region as CountryCode)
      : DEFAULT_COUNTRY;
  } catch {
    return DEFAULT_COUNTRY;
  }
}

/** What is saved: "+54 11 5555 0000". */
export function fullPhone(code: string, number: string): string {
  return `+${callingCountry(code).dial} ${number.trim()}`;
}
