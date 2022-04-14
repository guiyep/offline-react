import localforage from 'localforage';

export const createStore = ({ name }) =>
  localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name,
  });

export const get = ({ key }, Store) => Store.getItem(key);

export const set = async ({ key, value }, Store) => {
  await Store.setItem(key, value);
  return get(key);
};

export const find = async (condition, Store) => {
  const result = [];
  await Store.iterate((value, key) => {
    if (condition({ value, key })) {
      result.push({ value, key });
    }
  });
  return result;
};

export const DbAccess = ({ name }) => {
  const Store = createStore({ name });
  return {
    get: ({ key }) => get({ key }, Store),
    set: ({ key, value }) => set({ key, value }, Store),
    find: (condition) => find(condition, Store),
  };
};
