/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMemo = /* GraphQL */ `
  query GetMemo($id: ID!) {
    getMemo(id: $id) {
      id
      content
      tags
      owner
      createdAt
      updatedAt
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
        owner
        createdAt
        updatedAt
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
      owner
      createdAt
      lastOpenedAt
      updatedAt
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
        owner
        createdAt
        lastOpenedAt
        updatedAt
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
      senderYamatoId
      receiverYamatoId
      content
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
        senderYamatoId
        receiverYamatoId
        content
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
