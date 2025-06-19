/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMemo = /* GraphQL */ `
  mutation CreateMemo(
    $input: CreateMemoInput!
    $condition: ModelMemoConditionInput
  ) {
    createMemo(input: $input, condition: $condition) {
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
export const updateMemo = /* GraphQL */ `
  mutation UpdateMemo(
    $input: UpdateMemoInput!
    $condition: ModelMemoConditionInput
  ) {
    updateMemo(input: $input, condition: $condition) {
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
export const deleteMemo = /* GraphQL */ `
  mutation DeleteMemo(
    $input: DeleteMemoInput!
    $condition: ModelMemoConditionInput
  ) {
    deleteMemo(input: $input, condition: $condition) {
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
export const createDiary = /* GraphQL */ `
  mutation CreateDiary(
    $input: CreateDiaryInput!
    $condition: ModelDiaryConditionInput
  ) {
    createDiary(input: $input, condition: $condition) {
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
export const updateDiary = /* GraphQL */ `
  mutation UpdateDiary(
    $input: UpdateDiaryInput!
    $condition: ModelDiaryConditionInput
  ) {
    updateDiary(input: $input, condition: $condition) {
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
export const deleteDiary = /* GraphQL */ `
  mutation DeleteDiary(
    $input: DeleteDiaryInput!
    $condition: ModelDiaryConditionInput
  ) {
    deleteDiary(input: $input, condition: $condition) {
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
export const createSchedule = /* GraphQL */ `
  mutation CreateSchedule(
    $input: CreateScheduleInput!
    $condition: ModelScheduleConditionInput
  ) {
    createSchedule(input: $input, condition: $condition) {
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
export const updateSchedule = /* GraphQL */ `
  mutation UpdateSchedule(
    $input: UpdateScheduleInput!
    $condition: ModelScheduleConditionInput
  ) {
    updateSchedule(input: $input, condition: $condition) {
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
export const deleteSchedule = /* GraphQL */ `
  mutation DeleteSchedule(
    $input: DeleteScheduleInput!
    $condition: ModelScheduleConditionInput
  ) {
    deleteSchedule(input: $input, condition: $condition) {
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
export const createContact = /* GraphQL */ `
  mutation CreateContact(
    $input: CreateContactInput!
    $condition: ModelContactConditionInput
  ) {
    createContact(input: $input, condition: $condition) {
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
export const updateContact = /* GraphQL */ `
  mutation UpdateContact(
    $input: UpdateContactInput!
    $condition: ModelContactConditionInput
  ) {
    updateContact(input: $input, condition: $condition) {
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
export const deleteContact = /* GraphQL */ `
  mutation DeleteContact(
    $input: DeleteContactInput!
    $condition: ModelContactConditionInput
  ) {
    deleteContact(input: $input, condition: $condition) {
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
export const createChatRoom = /* GraphQL */ `
  mutation CreateChatRoom(
    $input: CreateChatRoomInput!
    $condition: ModelChatRoomConditionInput
  ) {
    createChatRoom(input: $input, condition: $condition) {
      id
      user1
      user2
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
export const updateChatRoom = /* GraphQL */ `
  mutation UpdateChatRoom(
    $input: UpdateChatRoomInput!
    $condition: ModelChatRoomConditionInput
  ) {
    updateChatRoom(input: $input, condition: $condition) {
      id
      user1
      user2
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
export const deleteChatRoom = /* GraphQL */ `
  mutation DeleteChatRoom(
    $input: DeleteChatRoomInput!
    $condition: ModelChatRoomConditionInput
  ) {
    deleteChatRoom(input: $input, condition: $condition) {
      id
      user1
      user2
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
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
export const createReaction = /* GraphQL */ `
  mutation CreateReaction(
    $input: CreateReactionInput!
    $condition: ModelReactionConditionInput
  ) {
    createReaction(input: $input, condition: $condition) {
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
export const updateReaction = /* GraphQL */ `
  mutation UpdateReaction(
    $input: UpdateReactionInput!
    $condition: ModelReactionConditionInput
  ) {
    updateReaction(input: $input, condition: $condition) {
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
export const deleteReaction = /* GraphQL */ `
  mutation DeleteReaction(
    $input: DeleteReactionInput!
    $condition: ModelReactionConditionInput
  ) {
    deleteReaction(input: $input, condition: $condition) {
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
export const createPublicProfile = /* GraphQL */ `
  mutation CreatePublicProfile(
    $input: CreatePublicProfileInput!
    $condition: ModelPublicProfileConditionInput
  ) {
    createPublicProfile(input: $input, condition: $condition) {
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
export const updatePublicProfile = /* GraphQL */ `
  mutation UpdatePublicProfile(
    $input: UpdatePublicProfileInput!
    $condition: ModelPublicProfileConditionInput
  ) {
    updatePublicProfile(input: $input, condition: $condition) {
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
export const deletePublicProfile = /* GraphQL */ `
  mutation DeletePublicProfile(
    $input: DeletePublicProfileInput!
    $condition: ModelPublicProfileConditionInput
  ) {
    deletePublicProfile(input: $input, condition: $condition) {
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
export const createChatRequest = /* GraphQL */ `
  mutation CreateChatRequest(
    $input: CreateChatRequestInput!
    $condition: ModelChatRequestConditionInput
  ) {
    createChatRequest(input: $input, condition: $condition) {
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
export const updateChatRequest = /* GraphQL */ `
  mutation UpdateChatRequest(
    $input: UpdateChatRequestInput!
    $condition: ModelChatRequestConditionInput
  ) {
    updateChatRequest(input: $input, condition: $condition) {
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
export const deleteChatRequest = /* GraphQL */ `
  mutation DeleteChatRequest(
    $input: DeleteChatRequestInput!
    $condition: ModelChatRequestConditionInput
  ) {
    deleteChatRequest(input: $input, condition: $condition) {
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
export const createPhoto = /* GraphQL */ `
  mutation CreatePhoto(
    $input: CreatePhotoInput!
    $condition: ModelPhotoConditionInput
  ) {
    createPhoto(input: $input, condition: $condition) {
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
export const updatePhoto = /* GraphQL */ `
  mutation UpdatePhoto(
    $input: UpdatePhotoInput!
    $condition: ModelPhotoConditionInput
  ) {
    updatePhoto(input: $input, condition: $condition) {
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
export const deletePhoto = /* GraphQL */ `
  mutation DeletePhoto(
    $input: DeletePhotoInput!
    $condition: ModelPhotoConditionInput
  ) {
    deletePhoto(input: $input, condition: $condition) {
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
export const createScheduleTemplate = /* GraphQL */ `
  mutation CreateScheduleTemplate(
    $input: CreateScheduleTemplateInput!
    $condition: ModelScheduleTemplateConditionInput
  ) {
    createScheduleTemplate(input: $input, condition: $condition) {
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
export const updateScheduleTemplate = /* GraphQL */ `
  mutation UpdateScheduleTemplate(
    $input: UpdateScheduleTemplateInput!
    $condition: ModelScheduleTemplateConditionInput
  ) {
    updateScheduleTemplate(input: $input, condition: $condition) {
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
export const deleteScheduleTemplate = /* GraphQL */ `
  mutation DeleteScheduleTemplate(
    $input: DeleteScheduleTemplateInput!
    $condition: ModelScheduleTemplateConditionInput
  ) {
    deleteScheduleTemplate(input: $input, condition: $condition) {
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
export const createWindMessage = /* GraphQL */ `
  mutation CreateWindMessage(
    $input: CreateWindMessageInput!
    $condition: ModelWindMessageConditionInput
  ) {
    createWindMessage(input: $input, condition: $condition) {
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
export const updateWindMessage = /* GraphQL */ `
  mutation UpdateWindMessage(
    $input: UpdateWindMessageInput!
    $condition: ModelWindMessageConditionInput
  ) {
    updateWindMessage(input: $input, condition: $condition) {
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
export const deleteWindMessage = /* GraphQL */ `
  mutation DeleteWindMessage(
    $input: DeleteWindMessageInput!
    $condition: ModelWindMessageConditionInput
  ) {
    deleteWindMessage(input: $input, condition: $condition) {
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
export const createBlossom = /* GraphQL */ `
  mutation CreateBlossom(
    $input: CreateBlossomInput!
    $condition: ModelBlossomConditionInput
  ) {
    createBlossom(input: $input, condition: $condition) {
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
export const updateBlossom = /* GraphQL */ `
  mutation UpdateBlossom(
    $input: UpdateBlossomInput!
    $condition: ModelBlossomConditionInput
  ) {
    updateBlossom(input: $input, condition: $condition) {
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
export const deleteBlossom = /* GraphQL */ `
  mutation DeleteBlossom(
    $input: DeleteBlossomInput!
    $condition: ModelBlossomConditionInput
  ) {
    deleteBlossom(input: $input, condition: $condition) {
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
export const createBestRecord = /* GraphQL */ `
  mutation CreateBestRecord(
    $input: CreateBestRecordInput!
    $condition: ModelBestRecordConditionInput
  ) {
    createBestRecord(input: $input, condition: $condition) {
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
export const updateBestRecord = /* GraphQL */ `
  mutation UpdateBestRecord(
    $input: UpdateBestRecordInput!
    $condition: ModelBestRecordConditionInput
  ) {
    updateBestRecord(input: $input, condition: $condition) {
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
export const deleteBestRecord = /* GraphQL */ `
  mutation DeleteBestRecord(
    $input: DeleteBestRecordInput!
    $condition: ModelBestRecordConditionInput
  ) {
    deleteBestRecord(input: $input, condition: $condition) {
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
