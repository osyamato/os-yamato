/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMemo = /* GraphQL */ `
  query GetMemo($id: ID!) {
    getMemo(id: $id) {
      id
      content
      tags
      sharedWith
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listMemos = /* GraphQL */ `
  query ListMemos(
    $filter: ModelMemoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMemos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        tags
        sharedWith
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDiary = /* GraphQL */ `
  query GetDiary($id: ID!) {
    getDiary(id: $id) {
      id
      owner
      content
      date
      lastOpenedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listDiaries = /* GraphQL */ `
  query ListDiaries(
    $filter: ModelDiaryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDiaries(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        content
        date
        lastOpenedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSchedule = /* GraphQL */ `
  query GetSchedule($id: ID!) {
    getSchedule(id: $id) {
      id
      owner
      date
      startTime
      endTime
      title
      memo
      lastOpenedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSchedules = /* GraphQL */ `
  query ListSchedules(
    $filter: ModelScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSchedules(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        date
        startTime
        endTime
        title
        memo
        lastOpenedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getContact = /* GraphQL */ `
  query GetContact($id: ID!) {
    getContact(id: $id) {
      id
      name
      furigana
      phoneNumbers
      emails
      note
      yamatoId
      lastOpenedAt
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listContacts = /* GraphQL */ `
  query ListContacts(
    $filter: ModelContactFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listContacts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        furigana
        phoneNumbers
        emails
        note
        yamatoId
        lastOpenedAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getChatRoom = /* GraphQL */ `
  query GetChatRoom($id: ID!) {
    getChatRoom(id: $id) {
      id
      user1
      user2
      lastMessage
      lastTimestamp
      lastReadAtUser2
      lastReadAtUser1
      lastSenderId
      expiresAt
      deletedByUser1
      deletedByUser2
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listChatRooms = /* GraphQL */ `
  query ListChatRooms(
    $filter: ModelChatRoomFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChatRooms(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        user1
        user2
        lastMessage
        lastTimestamp
        lastReadAtUser2
        lastReadAtUser1
        lastSenderId
        expiresAt
        deletedByUser1
        deletedByUser2
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
      id
      roomId
      senderSub
      senderYamatoId
      receiverSub
      receiverYamatoId
      content
      contentType
      imageKey
      thumbnailKey
      timestamp
      createdAt
      expiresAt
      owner
      __typename
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        roomId
        senderSub
        senderYamatoId
        receiverSub
        receiverYamatoId
        content
        contentType
        imageKey
        thumbnailKey
        timestamp
        createdAt
        expiresAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getReaction = /* GraphQL */ `
  query GetReaction($id: ID!) {
    getReaction(id: $id) {
      id
      messageId
      emoji
      reactorSub
      reactorYamatoId
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listReactions = /* GraphQL */ `
  query ListReactions(
    $filter: ModelReactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReactions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        messageId
        emoji
        reactorSub
        reactorYamatoId
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getChatRequest = /* GraphQL */ `
  query GetChatRequest($id: ID!) {
    getChatRequest(id: $id) {
      id
      fromUserId
      toUserId
      status
      message
      createdAt
      ttl
      updatedAt
      __typename
    }
  }
`;
export const listChatRequests = /* GraphQL */ `
  query ListChatRequests(
    $filter: ModelChatRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChatRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fromUserId
        toUserId
        status
        message
        createdAt
        ttl
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPhoto = /* GraphQL */ `
  query GetPhoto($id: ID!) {
    getPhoto(id: $id) {
      id
      owner
      fileName
      thumbnailFileName
      photoTakenAt
      lastOpenedAt
      isFavorite
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listPhotos = /* GraphQL */ `
  query ListPhotos(
    $filter: ModelPhotoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPhotos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        fileName
        thumbnailFileName
        photoTakenAt
        lastOpenedAt
        isFavorite
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getScheduleTemplate = /* GraphQL */ `
  query GetScheduleTemplate($id: ID!) {
    getScheduleTemplate(id: $id) {
      id
      emoji
      label
      startTime
      endTime
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listScheduleTemplates = /* GraphQL */ `
  query ListScheduleTemplates(
    $filter: ModelScheduleTemplateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listScheduleTemplates(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        emoji
        label
        startTime
        endTime
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getWindMessage = /* GraphQL */ `
  query GetWindMessage($id: ID!) {
    getWindMessage(id: $id) {
      id
      fromUserId
      fromDisplayName
      toUserId
      content
      deliveryDate
      isOpened
      openedAt
      deletedByReceiver
      favoriteByReceiver
      ttl
      createdAt
      owner
      __typename
    }
  }
`;
export const listWindMessages = /* GraphQL */ `
  query ListWindMessages(
    $filter: ModelWindMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWindMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fromUserId
        fromDisplayName
        toUserId
        content
        deliveryDate
        isOpened
        openedAt
        deletedByReceiver
        favoriteByReceiver
        ttl
        createdAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getBlossom = /* GraphQL */ `
  query GetBlossom($id: ID!) {
    getBlossom(id: $id) {
      id
      lat
      lng
      comment
      yamatoId
      nickname
      emoji
      hobby
      country
      region
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listBlossoms = /* GraphQL */ `
  query ListBlossoms(
    $filter: ModelBlossomFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBlossoms(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        lat
        lng
        comment
        yamatoId
        nickname
        emoji
        hobby
        country
        region
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPublicProfile = /* GraphQL */ `
  query GetPublicProfile($id: ID!) {
    getPublicProfile(id: $id) {
      id
      yamatoId
      displayName
      icon
      bio
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listPublicProfiles = /* GraphQL */ `
  query ListPublicProfiles(
    $filter: ModelPublicProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPublicProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        yamatoId
        displayName
        icon
        bio
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const publicProfileByYamatoId = /* GraphQL */ `
  query PublicProfileByYamatoId(
    $yamatoId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPublicProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    publicProfileByYamatoId(
      yamatoId: $yamatoId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        yamatoId
        displayName
        icon
        bio
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
