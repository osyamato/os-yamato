export const onCreateShiritoriRoom = /* GraphQL */ `
  subscription OnCreateShiritoriRoom {
    onCreateShiritoriRoom {
      id
      title
      hostId
      guestId
      status
      genreKey
      charLimit
      createdAt
      updatedAt
    }
  }
`

export const onUpdateShiritoriRoom = /* GraphQL */ `
  subscription OnUpdateShiritoriRoom {
    onUpdateShiritoriRoom {
      id
      title
      hostId
      guestId
      status
      genreKey
      charLimit
      createdAt
      updatedAt
    }
  }
`

export const onDeleteShiritoriRoom = /* GraphQL */ `
  subscription OnDeleteShiritoriRoom {
    onDeleteShiritoriRoom {
      id
    }
  }
`
