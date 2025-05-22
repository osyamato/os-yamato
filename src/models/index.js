// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Memo, Diary, Schedule, Contact, ChatRoom, Message, PublicProfile, ChatRequest, Photo, ScheduleTemplate, WindMessage } = initSchema(schema);

export {
  Memo,
  Diary,
  Schedule,
  Contact,
  ChatRoom,
  Message,
  PublicProfile,
  ChatRequest,
  Photo,
  ScheduleTemplate,
  WindMessage
};