import { TodoEntity } from '../todo/todo.entity';

// TODO may use this: https://medium.com/@p3rf/solving-issue-with-entities-loading-for-a-nx-dev-monorepo-setup-with-nest-js-and-typeorm-282d4491f0bc

const entities = [
  // auth
  // OauthTokensAccesstoken,

  // core
  // ContentType,
  // Group,
  // Permission,
  // User,

  // fona
  TodoEntity,
];
export default entities;
