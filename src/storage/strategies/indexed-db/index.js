import { configuration, configure } from './config';

const asDbPromise = async (f, store) => {
  await store.promise;
  return new Promise((resolve, reject) => {
    const request = f();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (e) => {
      reject(e);
    };
  });
};

export const getItem = (key, store) =>
  asDbPromise(() => {
    const { db, name } = store;
    const readTransaction = db.transaction([name]);
    const objectStore = readTransaction.objectStore(name);
    return objectStore.get(key);
  }, store);

const addInternal = (data, store) =>
  asDbPromise(() => {
    const { db, name } = store;
    const userReadWriteTransaction = db.transaction(name, 'readwrite');
    const newObjectStore = userReadWriteTransaction.objectStore(name);
    return newObjectStore.add(data);
  }, store);

const putInternal = (data, store) =>
  asDbPromise(() => {
    const { db, name } = store;
    const userReadWriteTransaction = db.transaction(name, 'readwrite');
    const newObjectStore = userReadWriteTransaction.objectStore(name);
    return newObjectStore.put(data);
  }, store);

export const setItem = async (data, store) => {
  const value = await getItem(data.key, store);
  if (value === undefined) {
    return addInternal(data, store);
  }
  return putInternal(data, store);
};

export const iterate = async (f, store) => {
  const list = await asDbPromise(() => {
    const { db, name } = store;
    const readTransaction = db.transaction([name]);
    const objectStore = readTransaction.objectStore(name);
    return objectStore.getAll();
  }, store);

  return (list || []).forEach((item) => f(item));
};

export const createInstance = ({ name }) => {
  let resolveCreate;
  let rejectCreate;

  const result = {
    promise: new Promise((resolve, reject) => {
      resolveCreate = resolve;
      rejectCreate = reject;
    }),
    version: undefined,
    error: undefined,
    db: undefined,
    name,
  };

  // eslint-disable-next-line no-undef
  const request = window.indexedDB.open(name, configuration.version);

  request.onerror = (e) => {
    result.error = e;
    rejectCreate();
  };

  request.onsuccess = () => {
    result.db = request.result;
    resolveCreate();
  };

  request.onupgradeneeded = (e) => {
    result.db = e.target.result;
    result.version = e.target.version;
    configure({ name, db: result.db, version: result.version });
  };

  return {
    getItem: (key) => getItem(key, result),
    setItem: (key, data) =>
      setItem(
        {
          key,
          ...data,
        },
        result,
      ),
    iterate: (condition) => iterate(condition, result),
  };
};
