
export const countryMap = {
  '🇯🇵': 'jp', '🇺🇸': 'us', '🇫🇷': 'fr', '🇩🇪': 'de', '🇮🇳': 'in',
  '🇰🇷': 'kr', '🇨🇳': 'cn', '🇬🇧': 'uk', '🇧🇷': 'br', '🇨🇦': 'ca',
  '🇮🇹': 'it', '🇪🇸': 'es', '🇦🇺': 'au', '🇸🇬': 'sg', '🇹🇭': 'th',
  '🇵🇭': 'ph', '🇻🇳': 'vn'
}

export const hobbyMap = {
  '🎨': 'art', '🎸': 'music', '📚': 'reading', '🏃': 'running',
  '✈️': 'travel', '🎮': 'gaming', '☕': 'coffee', '🌸': 'hanami',
  '🌊': 'surfing', '📷': 'photography', '🧘': 'meditation', '🐶': 'dogs',
  '🐱': 'cats', '🍳': 'cooking', '🧵': 'crafting', '🎬': 'movies',
  '🌱': 'gardening'
}

export function codeToEmoji(map, code) {
  return Object.entries(map).find(([emoji, c]) => c === code)?.[0] || ''
}
