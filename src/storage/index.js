import { createInstance } from './strategies/indexed-db';
import { DbNotFound } from './errors';

export const createStore = ({ name }) => createInstance({ name });

export const get = async ({ key }, Store) => {
  const { data } = (await Store.getItem(key)) || { data: null };
  if (data === null) {
    throw new DbNotFound(key);
  }
  return data;
};

export const set = ({ key, value }, Store) => Store.setItem(key, { timestamp: +new Date(), data: value });

export const find = async (condition, Store) => {
  const result = [];
  await Store.iterate(({ data }) => {
    if (condition(data)) {
      result.push(data);
    }
  });
  return result;
};

export const storage = ({ name }) => {
  const Store = createStore({ name });
  return {
    get: ({ key }) => get({ key }, Store),
    set: ({ key, value }) => set({ key, value }, Store),
    find: (condition) => find(condition, Store),
  };
};
