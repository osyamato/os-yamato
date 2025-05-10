import { createRouter, createWebHistory } from 'vue-router'

// 各Viewのインポート
import HomeView from '../views/HomeView.vue'
import CameraView from '../views/CameraView.vue'
import MemoView from '../views/MemoView.vue'
import SettingsView from '../views/SettingsView.vue'
import SignInView from '../views/SignInView.vue'
import RegisterView from '../views/RegisterView.vue'
import TransitionScreen from '../views/TransitionScreen.vue'
import CalendarView from '../views/CalendarView.vue'
import DiaryView from '../views/DiaryView.vue'
import ContactView from '../views/ContactView.vue'
import ChatView from '../views/ChatView.vue'
import ChatRoomListView from '../views/ChatRoomListView.vue'
import ProfileSetupView from '../views/ProfileSetupView.vue'
import ChatRequestListView from '../views/ChatRequestListView.vue' // ✅ 新しく追加

const routes = [
  { path: '/', redirect: '/signin' },
  { path: '/signin', name: 'signin', component: SignInView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/transition', name: 'transition', component: TransitionScreen },
  { path: '/calendar', name: 'calendar', component: CalendarView },
  { path: '/diary', name: 'diary', component: DiaryView },
  { path: '/contact', name: 'contact', component: ContactView },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/camera', name: 'camera', component: CameraView },
  { path: '/memo', name: 'memo', component: MemoView },
  { path: '/settings', name: 'settings', component: SettingsView },
  {
    path: '/chat/:roomId/:receiverYamatoId',
    name: 'chat',
    component: ChatView,
    props: true
  },
  { path: '/chat-rooms', name: 'chat-rooms', component: ChatRoomListView },
  { path: '/profile-setup', name: 'profile-setup', component: ProfileSetupView },
  { path: '/chat-requests', name: 'chat-requests', component: ChatRequestListView } // ✅ 追加
]

// ✅ router の作成
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ✅ router を export
export default router
