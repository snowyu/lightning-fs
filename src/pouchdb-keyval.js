import PouchDB from 'pouchdb-core';
// const PouchDB = require("pouchdb-core");
// import upsertPlugin from 'pouchdb-upsertex';
// import mem from 'pouchdb-adapter-memory';
// const mem = require("pouchdb-adapter-memory");
// PouchDB.plugin(mem);
// PouchDB.plugin(upsertPlugin);
const FILE_ID = 'M';
const FILE_TYPE = 'file/binary';

// PouchDB.on('created', function (dbName) {
//   console.log('TCL::: PouchDB created dbName', dbName);

// });
// PouchDB.on('destroyed', function (dbName) {
//   // called whenever a db is destroyed.
//   console.log('TCL::: PouchDB created destroyed', dbName);
// });

function setTimeoutPromise(cb, timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(cb);
    }, timeout);
  })
}

function blob2buff(b) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const ab = fr.result;
      resolve(Buffer.from(ab));
    };
    fr.onabort = reject;
    fr.onerror = reject;
    fr.readAsArrayBuffer(b);
  });
}

export default class Store {
    constructor(name, aScheme) {
      this._locked = 0;
      const vDataOpts = Object.assign({
          location: 'default',
          auto_compaction: true,
          revs_limit:1,
          // adapter: 'cordova-sqlite',
          // adapter: 'memory',
        }, aScheme);
      name = name || vDataOpts.name || 'fs-git'
      this._opts = vDataOpts;
      this.name = name;
      this._init(vDataOpts);
    }
    _init(opts = this._opts, db = this._db) {
      if (!db) {
          db = this._db = new PouchDB(this.name, opts);
      }
      return db;
    }
    async get(key, db = this._db) {
      const result = await db.get(key);
      return result.value;
    }
    async set(_id, value, db = this._db) {
      this._locked++;
      try{
        return await db.upsert({ _id, value });
      } finally {
        this._locked--;
      }
    }

    async del(key, db = this._db) {
      this._locked++;
      try{
        const doc = await db.get(key);
        return await this._db.remove(doc);
      } finally {
        this._locked--;
      }
    }

    async loadFile(aPath, db = this._db) {
      let result;
      if (typeof aPath === 'string') {
        const { filename } = splitPath(aPath);
        result = await db.getAttachment(aPath, filename);
      } else if (aPath) {
        result = await db.getAttachment(String(aPath), FILE_ID);
      } else throw new TypeError('no path to load');
      if (result instanceof Blob) {
        result = blob2buff(result)
      }
      return result;
    }
    async saveFile(aPath, content, db = this._db) {
      this._locked++;
      try{
        const blob = new Blob([content]);
        let filename;
        // const vPath = typeof aPath === 'string' ? aPath : doc && doc._id;
        if (typeof aPath === 'string' ) {
          filename = splitPath(aPath).filename;
          // return this._db.putAttachment(doc._id, filename, blob, FILE_TYPE);
        } else if (aPath) {
          aPath = String(aPath);
          filename = FILE_ID;
          // return this._db.putAttachment(String(aPath), FILE_ID, blob, FILE_TYPE);
        } else throw new TypeError('no path to save');
        const doc = await db.tryGet(aPath);
        if (doc) {
          return await db.putAttachment(aPath, filename, doc._rev, blob, FILE_TYPE);
        } else {
          return await db.putAttachment(aPath, filename, blob, FILE_TYPE);
        }
      } finally {
        this._locked--;
      }
    }
    async rmFile(aPath, db = this._db) {
      this._locked++;
      try{
        const doc = await db.get(String(aPath));
        if (typeof aPath === 'string') {
          const { filename } = splitPath(aPath);
          return db.removeAttachment(aPath, filename, doc._rev);
        } else if (aPath) {
          return db.removeAttachment(String(aPath), FILE_ID, doc._rev);
        } else throw new TypeError('no path to del');
      } finally {
        this._locked--;
      }
    }
    async clear(db = this._db) {
        console.log('TCL::: Store -> clear -> db');
        if (this._locked > 0) return setTimeoutPromise(() => this.clear(db), 1000)
        this._db = undefined;
        await db.destroy();
        return this._init();
    }
    async close(db = this._db) {
      // console.log('TCL::: Store -> close');
      // return db.close();
    }
}

function splitPath(aPath) {
  if (aPath) {
    const i = aPath.lastIndexOf('/');
    const dir = i === -1 ? '' : aPath.substring(0, i);
    const filename = i === -1 ? aPath : aPath.substring(i + 1);
    return { dir, filename };
  } else {
    return {dir: '', filename: ''};
  }
}
