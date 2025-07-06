import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    hasUnread: false
  }),
  actions: {
    setUnread(value: boolean) {
      this.hasUnread = value
    },
    clearUnread() {
      this.hasUnread = false
    }
  }
})

