export function getRandomLocationForCountry(code) {
  const countryBounds = {
    jp: { lat: [30, 45], lng: [129, 146] },
    us: { lat: [25, 49], lng: [-125, -66] },
    fr: { lat: [41, 51], lng: [-5, 10] },
    de: { lat: [47, 55], lng: [5, 15] },
    in: { lat: [6, 35], lng: [68, 97] },
    kr: { lat: [33, 39], lng: [124, 130] },
    cn: { lat: [18, 53], lng: [73, 135] },
    uk: { lat: [50, 59], lng: [-8, 2] },
    br: { lat: [-33, 5], lng: [-74, -34] },
    ca: { lat: [43, 70], lng: [-140, -50] },
    it: { lat: [36, 47], lng: [6, 19] },
    es: { lat: [36, 43], lng: [-9, 4] },
    au: { lat: [-43, -10], lng: [113, 154] },
    sg: { lat: [1.2, 1.5], lng: [103.6, 104.0] },
    th: { lat: [5, 20], lng: [97, 106] },
    ph: { lat: [5, 20], lng: [115, 126] },
    vn: { lat: [8, 23], lng: [102, 110] }
  }

  const bounds = countryBounds[code]

  if (!bounds) {
    // 未対応の国コードの場合は世界全体からランダムに
    return {
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180
    }
  }

  const lat = Math.random() * (bounds.lat[1] - bounds.lat[0]) + bounds.lat[0]
  const lng = Math.random() * (bounds.lng[1] - bounds.lng[0]) + bounds.lng[0]

  return { lat, lng }
}
