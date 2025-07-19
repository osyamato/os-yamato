import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWallpaperStore = defineStore('wallpaper', () => {
  const wallpaper = ref('') // "sakura.jpg" や "color.lightYellow" などを保持

  function setWallpaper(value) {
    wallpaper.value = value
  }

  return {
    wallpaper,
    setWallpaper
  }
})

