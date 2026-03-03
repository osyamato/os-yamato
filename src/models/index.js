// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const RoomStatus = {
  "OPEN": "open",
  "PLAYING": "playing",
  "FINISHED": "finished"
};

const { Memo, Diary, Schedule, Contact, ChatRoom, Message, Reaction, PublicProfile, ChatRequest, Photo, Video, ScheduleTemplate, WindMessage, Blossom, BestRecord, GPTMiniSession, GPTMiniHistory, WeatherCity, WeatherProfile, WeatherComment, WeatherReply, Mission, ShiritoriRoom, Turn, HanacoGardenBackup } = initSchema(schema);

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
  WeatherReply,
  Mission,
  ShiritoriRoom,
  Turn,
  HanacoGardenBackup,
  RoomStatus
};