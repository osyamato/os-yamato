// shiritoriModes.js

export const speedModes = {
  ume: {
    name: 'Plum',
    emoji: '🌸',
    timeLimit: 15000,
    label: '梅',
    description: 'ゆったり遊べる初心者モード',
    rules: {
      allowRepeat: true,
      allowSmallKanaMismatch: true
    }
  },
  take: {
    name: 'Bamboo',
    emoji: '🎋',
    timeLimit: 10000,
    label: '竹',
    description: '標準のバランスモード',
    rules: {
      allowRepeat: false,
      allowSmallKanaMismatch: true
    }
  },
  matsu: {
    name: 'Pine',
    emoji: '🌲',
    timeLimit: 5000,
    label: '松',
    description: 'スピード勝負の上級者モード',
    rules: {
      allowRepeat: false,
      allowSmallKanaMismatch: false
    }
  }
}

export const genreModes = {
  any: {
    name: '自由',
    label: '制限なし',
    emoji: '🔓',
    description: 'どんな単語でもOK',
    category: null
  },
  animal: {
    name: 'Animal',
    label: '動物',
    emoji: '🐾',
    description: '動物の名前だけ使えるよ',
    category: 'animal'
  },
  food: {
    name: 'Food',
    label: '食べ物',
    emoji: '🍙',
    description: '食べ物の名前だけ使えるよ',
    category: 'food'
  }
}

