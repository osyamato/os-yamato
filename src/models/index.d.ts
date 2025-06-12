import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";





type EagerMemo = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Memo, 'id'>;
  };
  readonly id: string;
  readonly content: string;
  readonly tags?: (string | null)[] | null;
  readonly sharedWith?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMemo = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Memo, 'id'>;
  };
  readonly id: string;
  readonly content: string;
  readonly tags?: (string | null)[] | null;
  readonly sharedWith?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Memo = LazyLoading extends LazyLoadingDisabled ? EagerMemo : LazyMemo

export declare const Memo: (new (init: ModelInit<Memo>) => Memo) & {
  copyOf(source: Memo, mutator: (draft: MutableModel<Memo>) => MutableModel<Memo> | void): Memo;
}

type EagerDiary = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Diary, 'id'>;
  };
  readonly id: string;
  readonly owner: string;
  readonly content: string;
  readonly date: string;
  readonly lastOpenedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDiary = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Diary, 'id'>;
  };
  readonly id: string;
  readonly owner: string;
  readonly content: string;
  readonly date: string;
  readonly lastOpenedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Diary = LazyLoading extends LazyLoadingDisabled ? EagerDiary : LazyDiary

export declare const Diary: (new (init: ModelInit<Diary>) => Diary) & {
  copyOf(source: Diary, mutator: (draft: MutableModel<Diary>) => MutableModel<Diary> | void): Diary;
}

type EagerSchedule = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Schedule, 'id'>;
  };
  readonly id: string;
  readonly owner: string;
  readonly date: string;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly title?: string | null;
  readonly memo?: string | null;
  readonly lastOpenedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazySchedule = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Schedule, 'id'>;
  };
  readonly id: string;
  readonly owner: string;
  readonly date: string;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly title?: string | null;
  readonly memo?: string | null;
  readonly lastOpenedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Schedule = LazyLoading extends LazyLoadingDisabled ? EagerSchedule : LazySchedule

export declare const Schedule: (new (init: ModelInit<Schedule>) => Schedule) & {
  copyOf(source: Schedule, mutator: (draft: MutableModel<Schedule>) => MutableModel<Schedule> | void): Schedule;
}

type EagerContact = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Contact, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly furigana?: string | null;
  readonly phoneNumbers?: (string | null)[] | null;
  readonly emails?: (string | null)[] | null;
  readonly note?: string | null;
  readonly yamatoId?: string | null;
  readonly lastOpenedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyContact = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Contact, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly furigana?: string | null;
  readonly phoneNumbers?: (string | null)[] | null;
  readonly emails?: (string | null)[] | null;
  readonly note?: string | null;
  readonly yamatoId?: string | null;
  readonly lastOpenedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Contact = LazyLoading extends LazyLoadingDisabled ? EagerContact : LazyContact

export declare const Contact: (new (init: ModelInit<Contact>) => Contact) & {
  copyOf(source: Contact, mutator: (draft: MutableModel<Contact>) => MutableModel<Contact> | void): Contact;
}

type EagerChatRoom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoom, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly user1: string;
  readonly user2: string;
  readonly lastMessage?: string | null;
  readonly lastTimestamp?: string | null;
  readonly lastReadAtUser2?: string | null;
  readonly lastReadAtUser1?: string | null;
  readonly lastSenderId?: string | null;
  readonly expiresAt?: number | null;
  readonly deletedByUser1?: boolean | null;
  readonly deletedByUser2?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoom, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly user1: string;
  readonly user2: string;
  readonly lastMessage?: string | null;
  readonly lastTimestamp?: string | null;
  readonly lastReadAtUser2?: string | null;
  readonly lastReadAtUser1?: string | null;
  readonly lastSenderId?: string | null;
  readonly expiresAt?: number | null;
  readonly deletedByUser1?: boolean | null;
  readonly deletedByUser2?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoom = LazyLoading extends LazyLoadingDisabled ? EagerChatRoom : LazyChatRoom

export declare const ChatRoom: (new (init: ModelInit<ChatRoom>) => ChatRoom) & {
  copyOf(source: ChatRoom, mutator: (draft: MutableModel<ChatRoom>) => MutableModel<ChatRoom> | void): ChatRoom;
}

type EagerMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly roomId: string;
  readonly senderSub: string;
  readonly senderYamatoId: string;
  readonly receiverSub: string;
  readonly receiverYamatoId: string;
  readonly content: string;
  readonly contentType?: string | null;
  readonly imageKey?: string | null;
  readonly thumbnailKey?: string | null;
  readonly timestamp: string;
  readonly createdAt?: string | null;
  readonly expiresAt?: number | null;
  readonly updatedAt?: string | null;
}

type LazyMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly roomId: string;
  readonly senderSub: string;
  readonly senderYamatoId: string;
  readonly receiverSub: string;
  readonly receiverYamatoId: string;
  readonly content: string;
  readonly contentType?: string | null;
  readonly imageKey?: string | null;
  readonly thumbnailKey?: string | null;
  readonly timestamp: string;
  readonly createdAt?: string | null;
  readonly expiresAt?: number | null;
  readonly updatedAt?: string | null;
}

export declare type Message = LazyLoading extends LazyLoadingDisabled ? EagerMessage : LazyMessage

export declare const Message: (new (init: ModelInit<Message>) => Message) & {
  copyOf(source: Message, mutator: (draft: MutableModel<Message>) => MutableModel<Message> | void): Message;
}

type EagerReaction = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Reaction, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly messageId: string;
  readonly emoji: string;
  readonly reactorSub: string;
  readonly reactorYamatoId?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReaction = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Reaction, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly messageId: string;
  readonly emoji: string;
  readonly reactorSub: string;
  readonly reactorYamatoId?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Reaction = LazyLoading extends LazyLoadingDisabled ? EagerReaction : LazyReaction

export declare const Reaction: (new (init: ModelInit<Reaction>) => Reaction) & {
  copyOf(source: Reaction, mutator: (draft: MutableModel<Reaction>) => MutableModel<Reaction> | void): Reaction;
}

type EagerPublicProfile = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<PublicProfile, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly yamatoId: string;
  readonly displayName?: string | null;
  readonly icon?: string | null;
  readonly bio?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPublicProfile = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<PublicProfile, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly yamatoId: string;
  readonly displayName?: string | null;
  readonly icon?: string | null;
  readonly bio?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type PublicProfile = LazyLoading extends LazyLoadingDisabled ? EagerPublicProfile : LazyPublicProfile

export declare const PublicProfile: (new (init: ModelInit<PublicProfile>) => PublicProfile) & {
  copyOf(source: PublicProfile, mutator: (draft: MutableModel<PublicProfile>) => MutableModel<PublicProfile> | void): PublicProfile;
}

type EagerChatRequest = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRequest, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly status: string;
  readonly message?: string | null;
  readonly createdAt: string;
  readonly ttl?: number | null;
  readonly updatedAt?: string | null;
}

type LazyChatRequest = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRequest, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly status: string;
  readonly message?: string | null;
  readonly createdAt: string;
  readonly ttl?: number | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRequest = LazyLoading extends LazyLoadingDisabled ? EagerChatRequest : LazyChatRequest

export declare const ChatRequest: (new (init: ModelInit<ChatRequest>) => ChatRequest) & {
  copyOf(source: ChatRequest, mutator: (draft: MutableModel<ChatRequest>) => MutableModel<ChatRequest> | void): ChatRequest;
}

type EagerPhoto = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Photo, 'id'>;
  };
  readonly id: string;
  readonly owner: string;
  readonly fileName: string;
  readonly thumbnailFileName: string;
  readonly photoTakenAt?: string | null;
  readonly lastOpenedAt?: string | null;
  readonly isFavorite: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPhoto = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Photo, 'id'>;
  };
  readonly id: string;
  readonly owner: string;
  readonly fileName: string;
  readonly thumbnailFileName: string;
  readonly photoTakenAt?: string | null;
  readonly lastOpenedAt?: string | null;
  readonly isFavorite: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Photo = LazyLoading extends LazyLoadingDisabled ? EagerPhoto : LazyPhoto

export declare const Photo: (new (init: ModelInit<Photo>) => Photo) & {
  copyOf(source: Photo, mutator: (draft: MutableModel<Photo>) => MutableModel<Photo> | void): Photo;
}

type EagerScheduleTemplate = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ScheduleTemplate, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly emoji?: string | null;
  readonly label?: string | null;
  readonly startTime: string;
  readonly endTime: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyScheduleTemplate = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ScheduleTemplate, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly emoji?: string | null;
  readonly label?: string | null;
  readonly startTime: string;
  readonly endTime: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ScheduleTemplate = LazyLoading extends LazyLoadingDisabled ? EagerScheduleTemplate : LazyScheduleTemplate

export declare const ScheduleTemplate: (new (init: ModelInit<ScheduleTemplate>) => ScheduleTemplate) & {
  copyOf(source: ScheduleTemplate, mutator: (draft: MutableModel<ScheduleTemplate>) => MutableModel<ScheduleTemplate> | void): ScheduleTemplate;
}

type EagerWindMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<WindMessage, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly fromUserId: string;
  readonly fromDisplayName: string;
  readonly toUserId: string;
  readonly content: string;
  readonly deliveryDate: string;
  readonly isOpened: boolean;
  readonly openedAt?: string | null;
  readonly deletedByReceiver?: boolean | null;
  readonly favoriteByReceiver?: boolean | null;
  readonly ttl?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWindMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<WindMessage, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly fromUserId: string;
  readonly fromDisplayName: string;
  readonly toUserId: string;
  readonly content: string;
  readonly deliveryDate: string;
  readonly isOpened: boolean;
  readonly openedAt?: string | null;
  readonly deletedByReceiver?: boolean | null;
  readonly favoriteByReceiver?: boolean | null;
  readonly ttl?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type WindMessage = LazyLoading extends LazyLoadingDisabled ? EagerWindMessage : LazyWindMessage

export declare const WindMessage: (new (init: ModelInit<WindMessage>) => WindMessage) & {
  copyOf(source: WindMessage, mutator: (draft: MutableModel<WindMessage>) => MutableModel<WindMessage> | void): WindMessage;
}

type EagerBlossom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Blossom, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly lat: number;
  readonly lng: number;
  readonly comment?: string | null;
  readonly yamatoId?: string | null;
  readonly nickname?: string | null;
  readonly emoji?: string | null;
  readonly hobby?: string | null;
  readonly country?: string | null;
  readonly region?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
}

type LazyBlossom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Blossom, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly lat: number;
  readonly lng: number;
  readonly comment?: string | null;
  readonly yamatoId?: string | null;
  readonly nickname?: string | null;
  readonly emoji?: string | null;
  readonly hobby?: string | null;
  readonly country?: string | null;
  readonly region?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
}

export declare type Blossom = LazyLoading extends LazyLoadingDisabled ? EagerBlossom : LazyBlossom

export declare const Blossom: (new (init: ModelInit<Blossom>) => Blossom) & {
  copyOf(source: Blossom, mutator: (draft: MutableModel<Blossom>) => MutableModel<Blossom> | void): Blossom;
}