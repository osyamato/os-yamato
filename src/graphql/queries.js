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
      isAllDay
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
        isAllDay
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
      memberSubs
      isGroup
      groupName
      lastMessage
      lastContentType
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
        memberSubs
        isGroup
        groupName
        lastMessage
        lastContentType
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
      reactions {
        nextToken
        __typename
      }
      updatedAt
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
        updatedAt
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
      isGroup
      provisionalRoomId
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
        isGroup
        provisionalRoomId
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
      albumId
      albumName
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
        albumId
        albumName
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
      isAllDay
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
        isAllDay
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
      toDisplayName
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
        toDisplayName
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
export const getBestRecord = /* GraphQL */ `
  query GetBestRecord($id: ID!) {
    getBestRecord(id: $id) {
      id
      gameType
      bestTimeSec
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listBestRecords = /* GraphQL */ `
  query ListBestRecords(
    $filter: ModelBestRecordFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBestRecords(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        gameType
        bestTimeSec
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
export const getVideo = /* GraphQL */ `
  query GetVideo($id: ID!) {
    getVideo(id: $id) {
      id
      owner
      fileName
      thumbnailFileName
      videoTakenAt
      isFavorite
      lastOpenedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listVideos = /* GraphQL */ `
  query ListVideos(
    $filter: ModelVideoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listVideos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        fileName
        thumbnailFileName
        videoTakenAt
        isFavorite
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
export const getGPTMiniSession = /* GraphQL */ `
  query GetGPTMiniSession($id: ID!) {
    getGPTMiniSession(id: $id) {
      id
      title
      mode
      lastOpenedAt
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listGPTMiniSessions = /* GraphQL */ `
  query ListGPTMiniSessions(
    $filter: ModelGPTMiniSessionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGPTMiniSessions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        mode
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
export const getGPTMiniHistory = /* GraphQL */ `
  query GetGPTMiniHistory($id: ID!) {
    getGPTMiniHistory(id: $id) {
      id
      sessionId
      prompt
      response
      language
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listGPTMiniHistories = /* GraphQL */ `
  query ListGPTMiniHistories(
    $filter: ModelGPTMiniHistoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGPTMiniHistories(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        sessionId
        prompt
        response
        language
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
export const getWeatherCity = /* GraphQL */ `
  query GetWeatherCity($id: ID!) {
    getWeatherCity(id: $id) {
      id
      name
      countryCode
      lat
      lon
      lastUsedAt
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listWeatherCities = /* GraphQL */ `
  query ListWeatherCities(
    $filter: ModelWeatherCityFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWeatherCities(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        countryCode
        lat
        lon
        lastUsedAt
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
export const getWeatherProfile = /* GraphQL */ `
  query GetWeatherProfile($id: ID!) {
    getWeatherProfile(id: $id) {
      id
      icon
      nickname
      yamatoId
      bio
      homepage
      blockedSubs
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listWeatherProfiles = /* GraphQL */ `
  query ListWeatherProfiles(
    $filter: ModelWeatherProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWeatherProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        icon
        nickname
        yamatoId
        bio
        homepage
        blockedSubs
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
export const getWeatherComment = /* GraphQL */ `
  query GetWeatherComment($id: ID!) {
    getWeatherComment(id: $id) {
      id
      owner
      ownerNickname
      icon
      weather
      temperature
      timeOfDay
      language
      content
      imageKey
      thumbnailKey
      profileView
      likeCount
      reportCount
      replyCount
      replyAllowed
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listWeatherComments = /* GraphQL */ `
  query ListWeatherComments(
    $filter: ModelWeatherCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWeatherComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        ownerNickname
        icon
        weather
        temperature
        timeOfDay
        language
        content
        imageKey
        thumbnailKey
        profileView
        likeCount
        reportCount
        replyCount
        replyAllowed
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getWeatherReply = /* GraphQL */ `
  query GetWeatherReply($id: ID!) {
    getWeatherReply(id: $id) {
      id
      commentId
      owner
      ownerNickname
      icon
      content
      language
      reported
      reportReason
      hiddenByCommentOwner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listWeatherReplies = /* GraphQL */ `
  query ListWeatherReplies(
    $filter: ModelWeatherReplyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWeatherReplies(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        commentId
        owner
        ownerNickname
        icon
        content
        language
        reported
        reportReason
        hiddenByCommentOwner
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesByRoomId = /* GraphQL */ `
  query MessagesByRoomId(
    $roomId: ID!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByRoomId(
      roomId: $roomId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const reactionsByMessageIdAndCreatedAt = /* GraphQL */ `
  query ReactionsByMessageIdAndCreatedAt(
    $messageId: ID!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelReactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reactionsByMessageIdAndCreatedAt(
      messageId: $messageId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
export const historiesBySession = /* GraphQL */ `
  query HistoriesBySession(
    $sessionId: ID!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelGPTMiniHistoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    historiesBySession(
      sessionId: $sessionId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        sessionId
        prompt
        response
        language
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
