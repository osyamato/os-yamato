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
      owner
      createdAt
      updatedAt
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
      owner
      createdAt
      updatedAt
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
      owner
      createdAt
      updatedAt
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
      owner
      createdAt
      lastOpenedAt
      updatedAt
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
      owner
      createdAt
      lastOpenedAt
      updatedAt
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
      owner
      createdAt
      lastOpenedAt
      updatedAt
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
export const onUpdateChatRoom = /* GraphQL */ `
  subscription OnUpdateChatRoom(
    $filter: ModelSubscriptionChatRoomFilterInput
    $owner: String
  ) {
    onUpdateChatRoom(filter: $filter, owner: $owner) {
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
export const onDeleteChatRoom = /* GraphQL */ `
  subscription OnDeleteChatRoom(
    $filter: ModelSubscriptionChatRoomFilterInput
    $owner: String
  ) {
    onDeleteChatRoom(filter: $filter, owner: $owner) {
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
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($filter: ModelSubscriptionMessageFilterInput) {
    onCreateMessage(filter: $filter) {
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
