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
