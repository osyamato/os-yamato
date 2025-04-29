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
