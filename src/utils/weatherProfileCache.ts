import { Auth, API, graphqlOperation } from 'aws-amplify'
import { listWeatherProfiles } from '@/graphql/queries'

let cachedProfile: any = null
let cachedDate: string | null = null

export async function getCachedProfile() {
  const today = new Date().toDateString()

  if (cachedProfile && cachedDate === today) {
    return cachedProfile
  }

  const user = await Auth.currentAuthenticatedUser()
  const sub = user.attributes.sub

  // ❗️filterを使わず全件取得 → owner(sub) に一致するものをフロントで選別
  const res = await API.graphql(graphqlOperation(listWeatherProfiles))
  const items = res?.data?.listWeatherProfiles?.items || []

  cachedProfile = items.find(p => p.id === sub || p.owner === sub) || null
  cachedDate = today

  return cachedProfile
}

export function resetCachedProfile() {
  cachedProfile = null
  cachedDate = null
}
