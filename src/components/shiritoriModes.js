export const speedModes = {
  ume: {
    name: 'Plum',
    timeLimit: 15000,
    label: '🐢',
    description: 'ゆったり遊べる初心者モード',
    rules: {
      allowRepeat: true,
      allowSmallKanaMismatch: true
    }
  },
  take: {
    name: 'Bamboo',
    timeLimit: 10000,
    label: '🐿️',
    description: '標準のバランスモード',
    rules: {
      allowRepeat: false,
      allowSmallKanaMismatch: true
    }
  },
  matsu: {
    name: 'Pine',
    timeLimit: 5000,
    label: '🐇',
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
    description: 'どんな単語でもOK',
    category: null
  },
  animal: {
    name: 'Animal',
    label: '動物',
    description: '動物の名前だけ使えるよ',
    category: 'animal'
  },
  food: {
    name: 'Food',
    label: '食べ物',
    description: '食べ物の名前だけ使えるよ',
    category: 'food'
  }
}

