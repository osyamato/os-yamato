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
      owner
      createdAt
      updatedAt
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
      owner
      createdAt
      updatedAt
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
      owner
      createdAt
      updatedAt
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
      owner
      createdAt
      lastOpenedAt
      updatedAt
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
      owner
      createdAt
      lastOpenedAt
      updatedAt
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
      owner
      createdAt
      lastOpenedAt
      updatedAt
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
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
