import { API, graphqlOperation, Auth } from 'aws-amplify'
import { listMemos, listContacts, listPhotos, listVideos, listChatRooms } from '@/graphql/queries'

export async function fetchAllCounts() {
  const user = await Auth.currentAuthenticatedUser()
  const mySub = user.attributes.sub

  const [memoRes, contactRes, photoRes, videoRes, chatRoomRes] = await Promise.all([
    API.graphql(graphqlOperation(listMemos)),
    API.graphql(graphqlOperation(listContacts)),
    API.graphql(graphqlOperation(listPhotos)),
    API.graphql(graphqlOperation(listVideos)),
    API.graphql(graphqlOperation(listChatRooms, {
      filter: {
        and: [
          {
            or: [
              { user1: { eq: mySub } },
              { user2: { eq: mySub } }
            ]
          },
          {
            and: [
              { deletedByUser1: { ne: true } },
              { deletedByUser2: { ne: true } }
            ]
          }
        ]
      }
    }))
  ])

  return {
    memos: memoRes.data.listMemos.items.length,
    contacts: contactRes.data.listContacts.items.length,
    photos: photoRes.data.listPhotos.items.length,
    videos: videoRes.data.listVideos.items.length,
    chatRooms: chatRoomRes.data.listChatRooms.items.length
  }
}

