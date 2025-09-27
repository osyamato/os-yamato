import { Ref, ref } from 'vue'

interface EffectPattern {
  pattern: RegExp
  effect: string
}

// 💡 ソフトキーボードを強制的に閉じる（iOS 対応）
function hideKeyboard() {
  const activeElement = document.activeElement as HTMLElement
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur()
  }

  const dummy = document.createElement('input')
  dummy.type = 'text'
  dummy.style.position = 'absolute'
  dummy.style.opacity = '0'
  dummy.style.height = '0'
  dummy.style.fontSize = '16px'
  document.body.appendChild(dummy)
  dummy.focus()
  setTimeout(() => {
    dummy.blur()
    document.body.removeChild(dummy)
  }, 50)
}

export function useChatEffects(
  chatEffect: Ref<any>,
  messageAnimationEnabled: Ref<boolean>
) {
  const lastPlayedContent = ref('')

  const specialPatterns: EffectPattern[] = [
    { pattern: /(金閣寺|三島由紀夫|愛国|林ゆかり|倉岡剛)/, effect: 'mishima' },
    { pattern: /(i love you|愛している|愛してる|te amo|我爱你)/i, effect: 'moon' },
    { pattern: /(プラネタリウム|planetarium|space|宇宙|土星|saturn|espacio|planeta)/i, effect: 'saturn' },
    { pattern: /(おめでとう|お祝い|祝|congratulations|congrats|celebrate|felicidades|enhorabuena|祝贺)/i, effect: 'confetti' },
    { pattern: /(星空|モンゴル|星|夜空|stars|starry sky|night sky|mongolia|cielo estrellado|夜空)/i, effect: 'starry' },
    { pattern: /(虹|rainbow|🌈)/i, effect: 'rainbow' },
    { pattern: /(シャボン玉|泡|bubble|bubbles|soap bubble|burbuja|泡泡)/i, effect: 'bubble' },
  { pattern: /(新緑|greenery|風|fresh green|verdor)/i, effect: 'leaf' } ,
  { pattern: /(雷|稲妻|雷鳴|thunder|lightning|tormenta)/i, effect: 'lightning' }

  ]

  const seasonalPatterns: EffectPattern[] = [
    { pattern: /(雨|rain|lluvia|雨水)/i, effect: 'rain' },
    { pattern: /(雪|snow|nieve|下雪)/i, effect: 'snow' },
    { pattern: /(晴れ|sunny|soleado|晴天)/i, effect: 'sunny' },
    { pattern: /(春|spring|primavera|春天)/i, effect: 'spring' },
    { pattern: /(桜|cherry blossom|flor de cerezo|樱花)/i, effect: 'spring' },
    { pattern: /(秋|fall|autumn|otoño|秋天)/i, effect: 'autumn' },
    { pattern: /(冬|winter|invierno|冬天)/i, effect: 'snow' }
  ]

  function maybePlayEffect(content: string): boolean {
    if (!messageAnimationEnabled.value) return false
    if (!chatEffect?.value) return false
    if (!content || content === lastPlayedContent.value) return false

    for (const { pattern, effect } of specialPatterns) {
      if (pattern.test(content)) {
        chatEffect.value.playEffect(effect)
        lastPlayedContent.value = content
        hideKeyboard()
        return true
      }
    }

    for (const { pattern, effect } of seasonalPatterns) {
      if (pattern.test(content)) {
        chatEffect.value.playEffect(effect)
        lastPlayedContent.value = content
        hideKeyboard()
        return true
      }
    }

    // 夏だけ別トリガー（triggerSummer）を利用
    if (/夏|summer|verano|夏天/i.test(content)) {
      chatEffect.value.triggerSummer()
      lastPlayedContent.value = content
      hideKeyboard()
      return true
    }

    return false
  }

  return {
    maybePlayEffect
  }
}

