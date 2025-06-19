// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Memo, Diary, Schedule, Contact, ChatRoom, Message, Reaction, PublicProfile, ChatRequest, Photo, ScheduleTemplate, WindMessage, Blossom, BestRecord } = initSchema(schema);

export {
  Memo,
  Diary,
  Schedule,
  Contact,
  ChatRoom,
  Message,
  Reaction,
  PublicProfile,
  ChatRequest,
  Photo,
  ScheduleTemplate,
  WindMessage,
  Blossom,
  BestRecord
};