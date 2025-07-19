import { computed } from 'vue'
import { useWallpaperStore } from '@/stores/wallpaperStore'

export function useWallpaperStyle() {
  const store = useWallpaperStore()

  const wallpaperStyle = computed(() => {
    const value = store.wallpaper
    if (!value) return {}

    if (value.startsWith('color.')) {
      const colorMap = {
        'color.lightBlue': '#e6f0f9',
        'color.lightYellow': '#fff9e3',
        'color.lightPurple': '#f5f0fb',
        'color.grayDark': '#1e1e1e' // ✅ 追加
      }
      return { backgroundColor: colorMap[value] || '#f5f5f5' }
    }

    return {
      backgroundImage: `url(/${value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  })

  return { wallpaperStyle }
}

