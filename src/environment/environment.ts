import * as dotenv from 'dotenv';
import ProcessEnv = NodeJS.ProcessEnv;

dotenv.config();
const env: ProcessEnv = process.env;

export const environment = {
  port: env.PORT || 3003,
  mongodb: env.MONGODB_URL || `mongodb://127.0.0.1:27017`,
  dbName: `geo`,
  jwtSecret: env.JWT_SECRET || 'mysecret',
  jwtExp: env.JWT_EXP || '3600s',
  uploadPath: env.UPLOAD_PATH || `data`,
};
