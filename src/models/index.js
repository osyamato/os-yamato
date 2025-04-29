// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Memo, Schedule, Diary, Contact } = initSchema(schema);

export {
  Memo,
  Schedule,
  Diary,
  Contact
};