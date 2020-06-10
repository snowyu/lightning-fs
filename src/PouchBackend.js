import Store from "./pouchdb-keyval";
import { apiError, ErrorCode } from './pouchdb-api-error';


function convertError(e, p, message = e.toString()) {
  console.log('TCL::: function convertError -> e', e);
  const ErrorCodeMap = {
    404: 'ENOENT',
    403: 'EACCES',
    400: 'EEXIST',
    412: 'EEXIST',
    500: 'EINVAL',
  }
  switch (e.status) {
    case 404:
      return apiError(e, 'ENOENT', p, message);
    case 403:
      return apiError(e, 'EACCES', p, message);
    case 400:
    // case 409:
    case 412:
      return apiError(e, 'EEXIST', p, message);
    case 500:
      return apiError(e, 'EINVAL', p, message);
    default:
      // The rest do not seem to map cleanly to standard error codes.
      return apiError(e, 'EIO', p, message);
  }
}

export default class PouchBackend {
  constructor(name, options) {
    // options.name = options.fileDbName;
    this._store = new Store(name, options);
  }
  saveSuperblock(superblock) {
    return this._store.set("!root", superblock).catch(e => {throw convertError(e, 'set!root')});
  }
  loadSuperblock() {
    return this._store.get("!root").catch(e => {convertError(e, 'get!root')});
  }
  readFile(inode) {
    // console.log('TCL::: PouchBackend -> readFile -> inode', inode);
    return this._store.loadFile(inode).catch(e => {throw convertError(e, inode)})
  }
  writeFile(inode, data) {
    // console.log('TCL::: PouchBackend -> writeFile -> inode', inode);
    return this._store.saveFile(inode, data).catch(e => {throw convertError(e, inode)})
  }
  unlink(inode) {
    // console.log('TCL::: PouchBackend -> unlink -> inode', inode);
    return this._store.rmFile(inode).catch(e => {throw convertError(e, inode)})
  }
  wipe() {
    return this._store.clear().catch(e => {throw convertError(e)})
  }
  close() {
    return this._store.close().catch(e => {throw convertError(e)})
  }
}
