/**
 * Pure booking-screening rules shared by the contact page script and CI tests.
 * HighLevel calendar config lives outside this repo; these rules only gate the on-site interstitial.
 */

export const BOOKING_WIDGET_SRC =
  'https://api.leadconnectorhq.com/widget/booking/uCDQjgPy4GKKL7DTbiR2';

export const SIMPLE_RESIDENTIAL_PURPOSES = new Set([
  'mortgage_refinance',
  'purchase_sale',
]);

export function normalizeCity(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function isWindsorMarket(market, cityDetail) {
  if (market === 'windsor_essex') return true;
  const city = normalizeCity(cityDetail);
  if (!city) return false;
  return (
    city.includes('windsor') ||
    city.includes('essex') ||
    city.includes('lasalle') ||
    city.includes('tecumseh') ||
    city.includes('amherstburg') ||
    city.includes('kingsville') ||
    city.includes('leamington')
  );
}

/**
 * Soft-gate standard single-family mortgage/purchase work in Windsor-Essex.
 * Complex residential (estate, divorce, litigation, multi-family, etc.) stays open.
 */
export function isSimpleWindsorResidential(answers) {
  return (
    answers.propertyType === 'residential_single' &&
    isWindsorMarket(answers.market, answers.cityDetail) &&
    SIMPLE_RESIDENTIAL_PURPOSES.has(answers.purpose)
  );
}
