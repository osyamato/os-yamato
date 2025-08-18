// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Memo, Diary, Schedule, Contact, ChatRoom, Message, Reaction, PublicProfile, ChatRequest, Photo, Video, ScheduleTemplate, WindMessage, Blossom, BestRecord, GPTMiniSession, GPTMiniHistory, WeatherCity, WeatherProfile, WeatherComment, WeatherReply } = initSchema(schema);

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
  Video,
  ScheduleTemplate,
  WindMessage,
  Blossom,
  BestRecord,
  GPTMiniSession,
  GPTMiniHistory,
  WeatherCity,
  WeatherProfile,
  WeatherComment,
  WeatherReply
};