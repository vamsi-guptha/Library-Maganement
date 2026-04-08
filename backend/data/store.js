const crypto = require('crypto');

let db = {
  users: [],
  books: [],
  seats: [],
  notifications: []
};

const store = {
  get: (collection) => db[collection],
  findById: (collection, id) => db[collection].find(item => item._id === id),
  findOne: (collection, query) => {
    return db[collection].find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },
  find: (collection, query = {}) => {
    return db[collection].filter(item => {
      for (let key in query) {
        if (query[key] instanceof RegExp) {
          if (!query[key].test(item[key])) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  },
  create: (collection, doc) => {
    const newDoc = { 
      ...doc, 
      _id: crypto.randomBytes(12).toString('hex'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db[collection].push(newDoc);
    return newDoc;
  },
  updateById: (collection, id, updates) => {
    const index = db[collection].findIndex(item => item._id === id);
    if (index === -1) return null;
    db[collection][index] = { ...db[collection][index], ...updates, updatedAt: new Date() };
    return db[collection][index];
  },
  deleteById: (collection, id) => {
    const index = db[collection].findIndex(item => item._id === id);
    if (index === -1) return false;
    db[collection].splice(index, 1);
    return true;
  },
  updateMany: (collection, query, updates) => {
    db[collection] = db[collection].map(item => {
      let match = true;
      for (let key in query) {
        if (item[key] !== query[key]) match = false;
      }
      if (match) {
        return { ...item, ...updates, updatedAt: new Date() };
      }
      return item;
    });
  },
  deleteMany: (collection, query = {}) => {
    if (Object.keys(query).length === 0) {
      db[collection] = [];
      return;
    }
    db[collection] = db[collection].filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
  },
  reset: () => {
    db = { users: [], books: [], seats: [], notifications: [] };
  }
};

module.exports = store;
