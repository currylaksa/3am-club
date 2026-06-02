// Country name -> flag emoji. Emoji flags are free of licensing concerns
// (unlike crest/flag image assets). Home nations (England, Scotland) use their
// dedicated subdivision emoji; everyone else is built from the ISO-3166 code.

const ISO = {
  Mexico: "MX",
  "South Africa": "ZA",
  "South Korea": "KR",
  Czechia: "CZ",
  Canada: "CA",
  "Bosnia and Herzegovina": "BA",
  Qatar: "QA",
  Switzerland: "CH",
  Brazil: "BR",
  Morocco: "MA",
  Haiti: "HT",
  "United States": "US",
  Paraguay: "PY",
  Australia: "AU",
  Turkey: "TR",
  Germany: "DE",
  Curacao: "CW",
  "Ivory Coast": "CI",
  Ecuador: "EC",
  Netherlands: "NL",
  Japan: "JP",
  Sweden: "SE",
  Tunisia: "TN",
  Belgium: "BE",
  Egypt: "EG",
  Iran: "IR",
  "New Zealand": "NZ",
  Spain: "ES",
  "Cape Verde": "CV",
  "Saudi Arabia": "SA",
  Uruguay: "UY",
  France: "FR",
  Senegal: "SN",
  Iraq: "IQ",
  Norway: "NO",
  Argentina: "AR",
  Algeria: "DZ",
  Austria: "AT",
  Jordan: "JO",
  Portugal: "PT",
  "Congo DR": "CD",
  Uzbekistan: "UZ",
  Colombia: "CO",
  Croatia: "HR",
  Ghana: "GH",
  Panama: "PA",
};

// Subdivision flags that aren't a single ISO country code.
const SPECIAL = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

function codeToEmoji(code) {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

/** @param {string} team @returns {string} flag emoji, or a neutral globe for TBD/unknown */
export function flag(team) {
  if (SPECIAL[team]) return SPECIAL[team];
  const code = ISO[team];
  return code ? codeToEmoji(code) : "🏳️";
}

/** All 48 nations, sorted, for the onboarding grid. */
export const ALL_TEAMS = [...Object.keys(ISO), ...Object.keys(SPECIAL)].sort();
