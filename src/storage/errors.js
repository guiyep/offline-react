export class DbNotFound extends Error {
  constructor(key) {
    super(`Db: Item not found with key: ${key}`);
    this.name = 'DbNotFound';
  }
}
