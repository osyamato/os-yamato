// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Memo, Schedule } = initSchema(schema);

export {
  Memo,
  Schedule
};