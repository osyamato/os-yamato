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
import ChatRequestListView from '../views/ChatRequestListView.vue'
import AccountView from '../views/AccountView.vue'
import PhotoView from '../views/PhotoView.vue'
import HiddenChatRoomListView from '../views/HiddenChatRoomListView.vue'
import ScheduleTemplateView from '../views/ScheduleTemplateView.vue'
import WindMessageView from '../views/WindMessageView.vue' // ✅ 風の便り送信用
import WindInboxView from '../views/WindInboxView.vue'     // ✅ 風の便り受信用
import GlobeView from '../views/GlobeView.vue'             // ✅ 地球儀View
import TimeView from '../views/TimeView.vue'
import AboutView from '../views/AboutView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue' // ✅ 新規追加
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import FlowerMatchGameView from '../views/FlowerMatchGameView.vue'
import VideoView from '../views/VideoView.vue' // ✅ 動画ビューのインポート
import SentWindMessagesView from '../views/SentWindMessagesView.vue' 
import TimeView2 from '../views/TimeView2.vue'
import IconGuideView from '@/views/IconGuideView.vue'
import WeatherView from '@/views/WeatherView.vue' 
import TimeView0 from '../views/TimeView0.vue' 
import TimeView3 from '../views/TimeView3.vue'
import ActivityView from '../views/ActivityView.vue'
import GPTMiniView from '../views/GPTMiniView.vue'
import GPTMiniChatView from '../views/GPTMiniChatView.vue'
import Weather875View from '../views/Weather875View.vue' 
import WeatherProfileView from '../views/WeatherProfileView.vue' // ✅ 天気プロフィール
import MissionView from '../views/Mission.vue'
import ShiritoriView from '../views/Shiritori.vue' // ✅ しりとりViewのインポート
import ShiritoriMatchView from '../views/ShiritoriMatch.vue' 
import ShiritoriRoom from '@/views/ShiritoriRoom.vue'
import SnapKeepsPrivacyPolicyView from '../views/SnapKeepsPrivacyPolicyView.vue' 

import { Auth } from 'aws-amplify'


const routes = [
  { path: '/', redirect: '/signin' },
  { path: '/signin', name: 'signin', component: SignInView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/transition', name: 'transition', component: TransitionScreen },
  { path: '/calendar', name: 'calendar', component: CalendarView },
  { path: '/diary', name: 'diary', component: DiaryView },
  { path: '/contact', name: 'contact', component: ContactView },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/weather875', name: 'weather875', component: Weather875View }, 
{ path: '/weather-profile', name: 'weather-profile', component: WeatherProfileView },
  { path: '/camera', name: 'camera', component: CameraView },
  { path: '/memo', name: 'memo', component: MemoView },
  { path: '/settings', name: 'settings', component: SettingsView },
  { path: '/account', name: 'account', component: AccountView },
  { path: '/photo', name: 'photo', component: PhotoView },
{ path: '/shiritori', name: 'shiritori', component: ShiritoriView },
{ path: '/shiritori-match', name: 'shiritori-match', component: ShiritoriMatchView },
{
  path: '/snapkeeps-privacy',
  name: 'snapkeeps-privacy',
  component: SnapKeepsPrivacyPolicyView
},
  {
    path: '/shiritori-room/:id',
    name: 'shiritori-room',
    component: ShiritoriRoom,
    props: true
  },
{
  path: '/mission',
  name: 'Mission',
  component: MissionView
},

  {
    path: '/chat/:roomId/:receiverYamatoId',
    name: 'chat',
    component: ChatView,
    props: true
  },
  { path: '/chat-rooms', name: 'chat-rooms', component: ChatRoomListView },
  { path: '/chat-requests', name: 'chat-requests', component: ChatRequestListView },
  { path: '/profile-setup', name: 'profile-setup', component: ProfileSetupView },
  { path: '/hidden-chat-rooms', name: 'hidden-chat-rooms', component: HiddenChatRoomListView },
  { path: '/scheduletemplate', name: 'scheduletemplate', component: ScheduleTemplateView },

  // ✅ 風の便り関連ルート
  { path: '/wind-message', name: 'wind-message', component: WindMessageView },
  { path: '/wind-inbox', name: 'wind-inbox', component: WindInboxView },

  // ✅ 地球儀Viewルート
  { path: '/globe', name: 'globe', component: GlobeView },
  { path: '/time', name: 'time', component: TimeView },
  { path: '/about', name: 'about', component: AboutView },

  // ✅ メール認証View
  { path: '/verify-email', name: 'verify-email', component: VerifyEmailView },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView } ,
  { path: '/flower-match', name: 'flower-match', component: FlowerMatchGameView },
{ path: '/video', name: 'video', component: VideoView },
  { path: '/sent-wind-messages', name: 'sent-wind-messages', component: SentWindMessagesView },
{ path: '/time2', name: 'time2', component: TimeView2 },
{ path: '/icon-guide', name: 'IconGuide', component: IconGuideView },
  { path: '/weather', name: 'weather', component: WeatherView },
  { path: '/time0', name: 'time0', component: TimeView0 },
{ path: '/time3', name: 'time3', component: TimeView3 },
{ path: '/activity', name: 'activity', component: ActivityView },
{ path: '/gpt-mini', name: 'gpt-mini', component: GPTMiniView },
{ path: '/gpt-mini/:id', name: 'gpt-mini-chat', component: GPTMiniChatView, props: true },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


let historyStack = []
let isBack = false

router.beforeEach(async (to, from, next) => {
const publicPages = [
  '/signin',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/about',
  '/snapkeeps-privacy' // ← 🔑 これを追加！
]
  const authRequired = !publicPages.includes(to.path)

  // 戻り遷移かどうかを記録（既存ロジック）
  const toIndex = historyStack.indexOf(to.fullPath)
  const fromIndex = historyStack.indexOf(from.fullPath)

  if (toIndex !== -1 && toIndex < fromIndex) {
    isBack = true
    historyStack = historyStack.slice(0, toIndex + 1)
  } else {
    isBack = false
    historyStack.push(to.fullPath)
  }

  // 認証チェック
  try {
    await Auth.currentAuthenticatedUser()
    next()
  } catch {
    if (authRequired) {
      next('/signin')
    } else {
      next()
    }
  }
})

// 他ファイルで取得する用にエクスポート
export function getIsBack() {
  return isBack
}

export default router

