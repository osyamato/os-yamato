// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const RoomStatus = {
  "OPEN": "open",
  "PLAYING": "playing",
  "FINISHED": "finished"
};

const GiftStatus = {
  "SENT": "sent",
  "CLAIMED": "claimed",
  "CANCELLED": "cancelled",
  "EXPIRED": "expired"
};

const { Memo, Diary, Schedule, Contact, ChatRoom, Message, Reaction, PublicProfile, ChatRequest, Photo, Video, ScheduleTemplate, WindMessage, Blossom, BestRecord, GPTMiniSession, GPTMiniHistory, WeatherCity, WeatherProfile, WeatherComment, WeatherReply, Mission, ShiritoriRoom, Turn, HanacoGardenBackup, Gift, WeatherFootprint, SharedGarden, PushDevice, SleepyCatRecord } = initSchema(schema);

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
  Gift,
  WeatherFootprint,
  SharedGarden,
  PushDevice,
  SleepyCatRecord,
  RoomStatus,
  GiftStatus
};