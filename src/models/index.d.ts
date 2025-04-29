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
  readonly owner?: string | null;
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
  readonly owner?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Memo = LazyLoading extends LazyLoadingDisabled ? EagerMemo : LazyMemo

export declare const Memo: (new (init: ModelInit<Memo>) => Memo) & {
  copyOf(source: Memo, mutator: (draft: MutableModel<Memo>) => MutableModel<Memo> | void): Memo;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Schedule = LazyLoading extends LazyLoadingDisabled ? EagerSchedule : LazySchedule

export declare const Schedule: (new (init: ModelInit<Schedule>) => Schedule) & {
  copyOf(source: Schedule, mutator: (draft: MutableModel<Schedule>) => MutableModel<Schedule> | void): Schedule;
}

type EagerDiary = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Diary, 'id'>;
  };
  readonly id: string;
  readonly owner: string;
  readonly content: string;
  readonly date: string;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Diary = LazyLoading extends LazyLoadingDisabled ? EagerDiary : LazyDiary

export declare const Diary: (new (init: ModelInit<Diary>) => Diary) & {
  copyOf(source: Diary, mutator: (draft: MutableModel<Diary>) => MutableModel<Diary> | void): Diary;
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
  readonly owner?: string | null;
  readonly createdAt?: string | null;
  readonly lastOpenedAt?: string | null;
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
  readonly owner?: string | null;
  readonly createdAt?: string | null;
  readonly lastOpenedAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Contact = LazyLoading extends LazyLoadingDisabled ? EagerContact : LazyContact

export declare const Contact: (new (init: ModelInit<Contact>) => Contact) & {
  copyOf(source: Contact, mutator: (draft: MutableModel<Contact>) => MutableModel<Contact> | void): Contact;
}