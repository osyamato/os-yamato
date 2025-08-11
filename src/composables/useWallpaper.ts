import { ref, computed, watchEffect } from 'vue'

const wallpaper = ref(localStorage.getItem('wallpaper') || '')

watchEffect(() => {
  const html = document.documentElement
  html.classList.remove('dark-mode', 'wallpaper-active')
  if (wallpaper.value) {
    html.classList.add('wallpaper-active')
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.classList.add('dark-mode')
  }
})

// 🔽 スタイルを生成する computed
const wallpaperStyle = computed(() => {
  if (wallpaper.value.startsWith('color.')) {
    const colorName = wallpaper.value.replace('color.', '')
    const colorMap: Record<string, string> = {
      lightYellow: '#fef9c3',
      palePink: '#fde2e2',
      navy: '#1e293b',
      gray: '#aaa',
    }
    const bg = colorMap[colorName] || '#000'

    // ✅ navyやgray系は暗め、他は明るめ
    const isDark = colorName === 'navy' || colorName === 'gray'

    return {
      backgroundColor: bg,
      backgroundImage: 'none',
      textColor: isDark ? '#fff' : '#111',
      modalBg: isDark ? '#444' : '#fff',
    }
  } else {
    // ✅ 画像背景は常に暗めに
    return {
      backgroundImage: `url('/wallpapers/${wallpaper.value}')`,
      backgroundColor: 'transparent',
      textColor: '#fff',
      modalBg: '#444',
    }
  }
})

watchEffect(() => {
  const style = wallpaperStyle.value
  if (style.modalBg)
    document.documentElement.style.setProperty('--yamato-modal-bg', style.modalBg)
  if (style.textColor)
    document.documentElement.style.setProperty('--yamato-text-color', style.textColor)
})

export function useWallpaper() {
  const setWallpaper = (value: string) => {
    wallpaper.value = value
    localStorage.setItem('wallpaper', value)
  }

  return {
    wallpaper,
    setWallpaper,
    wallpaperStyle,
  }
}

