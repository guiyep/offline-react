export const configuration = {
  version: 1,
};

export const configure = ({ name, db, version }) => {
  if (version === undefined) {
    const objectStore = db.createObjectStore(name, { keyPath: 'key' });
    objectStore.createIndex('key', 'key', { unique: true });
    objectStore.createIndex('timestamp', 'hours', { unique: false });
    objectStore.createIndex('data', 'hours', { unique: false });
  }
};
