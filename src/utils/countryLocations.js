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
    vn: { lat: [8, 23], lng: [102, 110] },

my: { lat: [1, 7], lng: [99, 120] },         // マレーシア
id: { lat: [-11, 6], lng: [95, 141] },       // インドネシア
mx: { lat: [14, 33], lng: [-118, -86] },     // メキシコ
ru: { lat: [41, 82], lng: [19, 169] },       // ロシア
ua: { lat: [44, 52], lng: [22, 40] },        // ウクライナ
sa: { lat: [16, 32], lng: [34, 56] },        // サウジアラビア
eg: { lat: [22, 32], lng: [25, 36] },        // エジプト
ng: { lat: [4, 14], lng: [3, 15] },          // ナイジェリア
tr: { lat: [36, 42], lng: [26, 45] },        // トルコ
za: { lat: [-35, -22], lng: [16, 33] },      // 南アフリカ
ar: { lat: [-55, -22], lng: [-73, -53] },    // アルゼンチン
co: { lat: [-5, 13], lng: [-79, -66] },      // コロンビア
pk: { lat: [24, 37], lng: [60, 77] },        // パキスタン
np: { lat: [26, 31], lng: [80, 89] },        // ネパール
se: { lat: [55, 69], lng: [11, 24] },        // スウェーデン
nl: { lat: [50.7, 53.5], lng: [3.4, 7.2] },  // オランダ
no: { lat: [58, 71], lng: [5, 31] },         // ノルウェー
fi: { lat: [59, 70], lng: [20, 31] },        // フィンランド
ch: { lat: [45.8, 47.8], lng: [5.9, 10.5] }, // スイス
nz: { lat: [-47, -34], lng: [166, 179] }  

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
