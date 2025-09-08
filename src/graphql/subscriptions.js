/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMemo = /* GraphQL */ `
  subscription OnCreateMemo(
    $filter: ModelSubscriptionMemoFilterInput
    $owner: String
  ) {
    onCreateMemo(filter: $filter, owner: $owner) {
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
export const onUpdateMemo = /* GraphQL */ `
  subscription OnUpdateMemo(
    $filter: ModelSubscriptionMemoFilterInput
    $owner: String
  ) {
    onUpdateMemo(filter: $filter, owner: $owner) {
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
export const onDeleteMemo = /* GraphQL */ `
  subscription OnDeleteMemo(
    $filter: ModelSubscriptionMemoFilterInput
    $owner: String
  ) {
    onDeleteMemo(filter: $filter, owner: $owner) {
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
export const onCreateDiary = /* GraphQL */ `
  subscription OnCreateDiary(
    $filter: ModelSubscriptionDiaryFilterInput
    $owner: String
  ) {
    onCreateDiary(filter: $filter, owner: $owner) {
      id
      owner
      content
      date
      emoji
      lastOpenedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateDiary = /* GraphQL */ `
  subscription OnUpdateDiary(
    $filter: ModelSubscriptionDiaryFilterInput
    $owner: String
  ) {
    onUpdateDiary(filter: $filter, owner: $owner) {
      id
      owner
      content
      date
      emoji
      lastOpenedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteDiary = /* GraphQL */ `
  subscription OnDeleteDiary(
    $filter: ModelSubscriptionDiaryFilterInput
    $owner: String
  ) {
    onDeleteDiary(filter: $filter, owner: $owner) {
      id
      owner
      content
      date
      emoji
      lastOpenedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateSchedule = /* GraphQL */ `
  subscription OnCreateSchedule(
    $filter: ModelSubscriptionScheduleFilterInput
    $owner: String
  ) {
    onCreateSchedule(filter: $filter, owner: $owner) {
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
export const onUpdateSchedule = /* GraphQL */ `
  subscription OnUpdateSchedule(
    $filter: ModelSubscriptionScheduleFilterInput
    $owner: String
  ) {
    onUpdateSchedule(filter: $filter, owner: $owner) {
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
export const onDeleteSchedule = /* GraphQL */ `
  subscription OnDeleteSchedule(
    $filter: ModelSubscriptionScheduleFilterInput
    $owner: String
  ) {
    onDeleteSchedule(filter: $filter, owner: $owner) {
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
export const onCreateContact = /* GraphQL */ `
  subscription OnCreateContact(
    $filter: ModelSubscriptionContactFilterInput
    $owner: String
  ) {
    onCreateContact(filter: $filter, owner: $owner) {
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
export const onUpdateContact = /* GraphQL */ `
  subscription OnUpdateContact(
    $filter: ModelSubscriptionContactFilterInput
    $owner: String
  ) {
    onUpdateContact(filter: $filter, owner: $owner) {
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
export const onDeleteContact = /* GraphQL */ `
  subscription OnDeleteContact(
    $filter: ModelSubscriptionContactFilterInput
    $owner: String
  ) {
    onDeleteContact(filter: $filter, owner: $owner) {
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
export const onCreateChatRoom = /* GraphQL */ `
  subscription OnCreateChatRoom(
    $filter: ModelSubscriptionChatRoomFilterInput
    $owner: String
  ) {
    onCreateChatRoom(filter: $filter, owner: $owner) {
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
export const onUpdateChatRoom = /* GraphQL */ `
  subscription OnUpdateChatRoom(
    $filter: ModelSubscriptionChatRoomFilterInput
    $owner: String
  ) {
    onUpdateChatRoom(filter: $filter, owner: $owner) {
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
export const onDeleteChatRoom = /* GraphQL */ `
  subscription OnDeleteChatRoom(
    $filter: ModelSubscriptionChatRoomFilterInput
    $owner: String
  ) {
    onDeleteChatRoom(filter: $filter, owner: $owner) {
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
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onCreateMessage(filter: $filter, owner: $owner) {
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
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onUpdateMessage(filter: $filter, owner: $owner) {
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
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onDeleteMessage(filter: $filter, owner: $owner) {
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
export const onCreateReaction = /* GraphQL */ `
  subscription OnCreateReaction(
    $filter: ModelSubscriptionReactionFilterInput
    $owner: String
  ) {
    onCreateReaction(filter: $filter, owner: $owner) {
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
export const onUpdateReaction = /* GraphQL */ `
  subscription OnUpdateReaction(
    $filter: ModelSubscriptionReactionFilterInput
    $owner: String
  ) {
    onUpdateReaction(filter: $filter, owner: $owner) {
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
export const onDeleteReaction = /* GraphQL */ `
  subscription OnDeleteReaction(
    $filter: ModelSubscriptionReactionFilterInput
    $owner: String
  ) {
    onDeleteReaction(filter: $filter, owner: $owner) {
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
export const onCreatePublicProfile = /* GraphQL */ `
  subscription OnCreatePublicProfile(
    $filter: ModelSubscriptionPublicProfileFilterInput
    $owner: String
  ) {
    onCreatePublicProfile(filter: $filter, owner: $owner) {
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
export const onUpdatePublicProfile = /* GraphQL */ `
  subscription OnUpdatePublicProfile(
    $filter: ModelSubscriptionPublicProfileFilterInput
    $owner: String
  ) {
    onUpdatePublicProfile(filter: $filter, owner: $owner) {
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
export const onDeletePublicProfile = /* GraphQL */ `
  subscription OnDeletePublicProfile(
    $filter: ModelSubscriptionPublicProfileFilterInput
    $owner: String
  ) {
    onDeletePublicProfile(filter: $filter, owner: $owner) {
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
export const onCreateChatRequest = /* GraphQL */ `
  subscription OnCreateChatRequest(
    $filter: ModelSubscriptionChatRequestFilterInput
    $fromUserId: String
    $toUserId: String
  ) {
    onCreateChatRequest(
      filter: $filter
      fromUserId: $fromUserId
      toUserId: $toUserId
    ) {
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
export const onUpdateChatRequest = /* GraphQL */ `
  subscription OnUpdateChatRequest(
    $filter: ModelSubscriptionChatRequestFilterInput
    $fromUserId: String
    $toUserId: String
  ) {
    onUpdateChatRequest(
      filter: $filter
      fromUserId: $fromUserId
      toUserId: $toUserId
    ) {
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
export const onDeleteChatRequest = /* GraphQL */ `
  subscription OnDeleteChatRequest(
    $filter: ModelSubscriptionChatRequestFilterInput
    $fromUserId: String
    $toUserId: String
  ) {
    onDeleteChatRequest(
      filter: $filter
      fromUserId: $fromUserId
      toUserId: $toUserId
    ) {
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
export const onCreatePhoto = /* GraphQL */ `
  subscription OnCreatePhoto(
    $filter: ModelSubscriptionPhotoFilterInput
    $owner: String
  ) {
    onCreatePhoto(filter: $filter, owner: $owner) {
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
export const onUpdatePhoto = /* GraphQL */ `
  subscription OnUpdatePhoto(
    $filter: ModelSubscriptionPhotoFilterInput
    $owner: String
  ) {
    onUpdatePhoto(filter: $filter, owner: $owner) {
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
export const onDeletePhoto = /* GraphQL */ `
  subscription OnDeletePhoto(
    $filter: ModelSubscriptionPhotoFilterInput
    $owner: String
  ) {
    onDeletePhoto(filter: $filter, owner: $owner) {
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
export const onCreateVideo = /* GraphQL */ `
  subscription OnCreateVideo(
    $filter: ModelSubscriptionVideoFilterInput
    $owner: String
  ) {
    onCreateVideo(filter: $filter, owner: $owner) {
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
export const onUpdateVideo = /* GraphQL */ `
  subscription OnUpdateVideo(
    $filter: ModelSubscriptionVideoFilterInput
    $owner: String
  ) {
    onUpdateVideo(filter: $filter, owner: $owner) {
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
export const onDeleteVideo = /* GraphQL */ `
  subscription OnDeleteVideo(
    $filter: ModelSubscriptionVideoFilterInput
    $owner: String
  ) {
    onDeleteVideo(filter: $filter, owner: $owner) {
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
export const onCreateScheduleTemplate = /* GraphQL */ `
  subscription OnCreateScheduleTemplate(
    $filter: ModelSubscriptionScheduleTemplateFilterInput
    $owner: String
  ) {
    onCreateScheduleTemplate(filter: $filter, owner: $owner) {
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
export const onUpdateScheduleTemplate = /* GraphQL */ `
  subscription OnUpdateScheduleTemplate(
    $filter: ModelSubscriptionScheduleTemplateFilterInput
    $owner: String
  ) {
    onUpdateScheduleTemplate(filter: $filter, owner: $owner) {
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
export const onDeleteScheduleTemplate = /* GraphQL */ `
  subscription OnDeleteScheduleTemplate(
    $filter: ModelSubscriptionScheduleTemplateFilterInput
    $owner: String
  ) {
    onDeleteScheduleTemplate(filter: $filter, owner: $owner) {
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
export const onCreateWindMessage = /* GraphQL */ `
  subscription OnCreateWindMessage(
    $filter: ModelSubscriptionWindMessageFilterInput
    $owner: String
  ) {
    onCreateWindMessage(filter: $filter, owner: $owner) {
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
export const onUpdateWindMessage = /* GraphQL */ `
  subscription OnUpdateWindMessage(
    $filter: ModelSubscriptionWindMessageFilterInput
    $owner: String
  ) {
    onUpdateWindMessage(filter: $filter, owner: $owner) {
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
export const onDeleteWindMessage = /* GraphQL */ `
  subscription OnDeleteWindMessage(
    $filter: ModelSubscriptionWindMessageFilterInput
    $owner: String
  ) {
    onDeleteWindMessage(filter: $filter, owner: $owner) {
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
export const onCreateBlossom = /* GraphQL */ `
  subscription OnCreateBlossom(
    $filter: ModelSubscriptionBlossomFilterInput
    $owner: String
  ) {
    onCreateBlossom(filter: $filter, owner: $owner) {
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
export const onUpdateBlossom = /* GraphQL */ `
  subscription OnUpdateBlossom(
    $filter: ModelSubscriptionBlossomFilterInput
    $owner: String
  ) {
    onUpdateBlossom(filter: $filter, owner: $owner) {
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
export const onDeleteBlossom = /* GraphQL */ `
  subscription OnDeleteBlossom(
    $filter: ModelSubscriptionBlossomFilterInput
    $owner: String
  ) {
    onDeleteBlossom(filter: $filter, owner: $owner) {
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
export const onCreateBestRecord = /* GraphQL */ `
  subscription OnCreateBestRecord(
    $filter: ModelSubscriptionBestRecordFilterInput
    $owner: String
  ) {
    onCreateBestRecord(filter: $filter, owner: $owner) {
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
export const onUpdateBestRecord = /* GraphQL */ `
  subscription OnUpdateBestRecord(
    $filter: ModelSubscriptionBestRecordFilterInput
    $owner: String
  ) {
    onUpdateBestRecord(filter: $filter, owner: $owner) {
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
export const onDeleteBestRecord = /* GraphQL */ `
  subscription OnDeleteBestRecord(
    $filter: ModelSubscriptionBestRecordFilterInput
    $owner: String
  ) {
    onDeleteBestRecord(filter: $filter, owner: $owner) {
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
export const onCreateGPTMiniSession = /* GraphQL */ `
  subscription OnCreateGPTMiniSession(
    $filter: ModelSubscriptionGPTMiniSessionFilterInput
    $owner: String
  ) {
    onCreateGPTMiniSession(filter: $filter, owner: $owner) {
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
export const onUpdateGPTMiniSession = /* GraphQL */ `
  subscription OnUpdateGPTMiniSession(
    $filter: ModelSubscriptionGPTMiniSessionFilterInput
    $owner: String
  ) {
    onUpdateGPTMiniSession(filter: $filter, owner: $owner) {
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
export const onDeleteGPTMiniSession = /* GraphQL */ `
  subscription OnDeleteGPTMiniSession(
    $filter: ModelSubscriptionGPTMiniSessionFilterInput
    $owner: String
  ) {
    onDeleteGPTMiniSession(filter: $filter, owner: $owner) {
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
export const onCreateGPTMiniHistory = /* GraphQL */ `
  subscription OnCreateGPTMiniHistory(
    $filter: ModelSubscriptionGPTMiniHistoryFilterInput
    $owner: String
  ) {
    onCreateGPTMiniHistory(filter: $filter, owner: $owner) {
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
export const onUpdateGPTMiniHistory = /* GraphQL */ `
  subscription OnUpdateGPTMiniHistory(
    $filter: ModelSubscriptionGPTMiniHistoryFilterInput
    $owner: String
  ) {
    onUpdateGPTMiniHistory(filter: $filter, owner: $owner) {
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
export const onDeleteGPTMiniHistory = /* GraphQL */ `
  subscription OnDeleteGPTMiniHistory(
    $filter: ModelSubscriptionGPTMiniHistoryFilterInput
    $owner: String
  ) {
    onDeleteGPTMiniHistory(filter: $filter, owner: $owner) {
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
export const onCreateWeatherCity = /* GraphQL */ `
  subscription OnCreateWeatherCity(
    $filter: ModelSubscriptionWeatherCityFilterInput
    $owner: String
  ) {
    onCreateWeatherCity(filter: $filter, owner: $owner) {
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
export const onUpdateWeatherCity = /* GraphQL */ `
  subscription OnUpdateWeatherCity(
    $filter: ModelSubscriptionWeatherCityFilterInput
    $owner: String
  ) {
    onUpdateWeatherCity(filter: $filter, owner: $owner) {
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
export const onDeleteWeatherCity = /* GraphQL */ `
  subscription OnDeleteWeatherCity(
    $filter: ModelSubscriptionWeatherCityFilterInput
    $owner: String
  ) {
    onDeleteWeatherCity(filter: $filter, owner: $owner) {
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
export const onCreateWeatherProfile = /* GraphQL */ `
  subscription OnCreateWeatherProfile(
    $filter: ModelSubscriptionWeatherProfileFilterInput
    $owner: String
  ) {
    onCreateWeatherProfile(filter: $filter, owner: $owner) {
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
export const onUpdateWeatherProfile = /* GraphQL */ `
  subscription OnUpdateWeatherProfile(
    $filter: ModelSubscriptionWeatherProfileFilterInput
    $owner: String
  ) {
    onUpdateWeatherProfile(filter: $filter, owner: $owner) {
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
export const onDeleteWeatherProfile = /* GraphQL */ `
  subscription OnDeleteWeatherProfile(
    $filter: ModelSubscriptionWeatherProfileFilterInput
    $owner: String
  ) {
    onDeleteWeatherProfile(filter: $filter, owner: $owner) {
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
export const onCreateWeatherComment = /* GraphQL */ `
  subscription OnCreateWeatherComment(
    $filter: ModelSubscriptionWeatherCommentFilterInput
    $owner: String
  ) {
    onCreateWeatherComment(filter: $filter, owner: $owner) {
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
export const onUpdateWeatherComment = /* GraphQL */ `
  subscription OnUpdateWeatherComment(
    $filter: ModelSubscriptionWeatherCommentFilterInput
    $owner: String
  ) {
    onUpdateWeatherComment(filter: $filter, owner: $owner) {
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
export const onDeleteWeatherComment = /* GraphQL */ `
  subscription OnDeleteWeatherComment(
    $filter: ModelSubscriptionWeatherCommentFilterInput
    $owner: String
  ) {
    onDeleteWeatherComment(filter: $filter, owner: $owner) {
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
export const onCreateWeatherReply = /* GraphQL */ `
  subscription OnCreateWeatherReply(
    $filter: ModelSubscriptionWeatherReplyFilterInput
    $owner: String
  ) {
    onCreateWeatherReply(filter: $filter, owner: $owner) {
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
export const onUpdateWeatherReply = /* GraphQL */ `
  subscription OnUpdateWeatherReply(
    $filter: ModelSubscriptionWeatherReplyFilterInput
    $owner: String
  ) {
    onUpdateWeatherReply(filter: $filter, owner: $owner) {
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
export const onDeleteWeatherReply = /* GraphQL */ `
  subscription OnDeleteWeatherReply(
    $filter: ModelSubscriptionWeatherReplyFilterInput
    $owner: String
  ) {
    onDeleteWeatherReply(filter: $filter, owner: $owner) {
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
export const onCreateMission = /* GraphQL */ `
  subscription OnCreateMission(
    $filter: ModelSubscriptionMissionFilterInput
    $owner: String
  ) {
    onCreateMission(filter: $filter, owner: $owner) {
      id
      title
      note
      goalDate
      createdAt
      completedAt
      isCompleted
      emoji
      colorHue
      importance
      deletedAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateMission = /* GraphQL */ `
  subscription OnUpdateMission(
    $filter: ModelSubscriptionMissionFilterInput
    $owner: String
  ) {
    onUpdateMission(filter: $filter, owner: $owner) {
      id
      title
      note
      goalDate
      createdAt
      completedAt
      isCompleted
      emoji
      colorHue
      importance
      deletedAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteMission = /* GraphQL */ `
  subscription OnDeleteMission(
    $filter: ModelSubscriptionMissionFilterInput
    $owner: String
  ) {
    onDeleteMission(filter: $filter, owner: $owner) {
      id
      title
      note
      goalDate
      createdAt
      completedAt
      isCompleted
      emoji
      colorHue
      importance
      deletedAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreateShiritoriRoom = /* GraphQL */ `
  subscription OnCreateShiritoriRoom(
    $filter: ModelSubscriptionShiritoriRoomFilterInput
    $hostId: String
    $guestId: String
  ) {
    onCreateShiritoriRoom(filter: $filter, hostId: $hostId, guestId: $guestId) {
      id
      title
      hostId
      guestId
      status
      charLimit
      genreKey
      currentTurn
      winnerId
      isFinished
      finalMessageHost
      finalMessageGuest
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateShiritoriRoom = /* GraphQL */ `
  subscription OnUpdateShiritoriRoom(
    $filter: ModelSubscriptionShiritoriRoomFilterInput
    $hostId: String
    $guestId: String
  ) {
    onUpdateShiritoriRoom(filter: $filter, hostId: $hostId, guestId: $guestId) {
      id
      title
      hostId
      guestId
      status
      charLimit
      genreKey
      currentTurn
      winnerId
      isFinished
      finalMessageHost
      finalMessageGuest
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteShiritoriRoom = /* GraphQL */ `
  subscription OnDeleteShiritoriRoom(
    $filter: ModelSubscriptionShiritoriRoomFilterInput
    $hostId: String
    $guestId: String
  ) {
    onDeleteShiritoriRoom(filter: $filter, hostId: $hostId, guestId: $guestId) {
      id
      title
      hostId
      guestId
      status
      charLimit
      genreKey
      currentTurn
      winnerId
      isFinished
      finalMessageHost
      finalMessageGuest
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateTurn = /* GraphQL */ `
  subscription OnCreateTurn(
    $filter: ModelSubscriptionTurnFilterInput
    $userId: String
  ) {
    onCreateTurn(filter: $filter, userId: $userId) {
      id
      roomId
      userId
      word
      order
      isValid
      isFinalMessage
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateTurn = /* GraphQL */ `
  subscription OnUpdateTurn(
    $filter: ModelSubscriptionTurnFilterInput
    $userId: String
  ) {
    onUpdateTurn(filter: $filter, userId: $userId) {
      id
      roomId
      userId
      word
      order
      isValid
      isFinalMessage
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteTurn = /* GraphQL */ `
  subscription OnDeleteTurn(
    $filter: ModelSubscriptionTurnFilterInput
    $userId: String
  ) {
    onDeleteTurn(filter: $filter, userId: $userId) {
      id
      roomId
      userId
      word
      order
      isValid
      isFinalMessage
      createdAt
      updatedAt
      __typename
    }
  }
`;
