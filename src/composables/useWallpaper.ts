import { ref, watchEffect } from 'vue'

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

export function useWallpaper() {
  const setWallpaper = (value: string) => {
    wallpaper.value = value
    localStorage.setItem('wallpaper', value)
  }

  return { wallpaper, setWallpaper }
}
