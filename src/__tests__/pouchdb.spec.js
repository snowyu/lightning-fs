import PouchDB from 'pouchdb-core';
import idb from 'pouchdb-adapter-idb';
import { installTry } from 'pouchdb-ex';
import upsert from 'pouchdb-upsertex';

PouchDB.plugin(idb)
PouchDB.plugin(installTry)
PouchDB.plugin(upsert)

import PouchBackend from '../PouchBackend'

import FS from "../index.js";
import test from './fs.js';

FS.register('pouchdb', PouchBackend)

const fs = new FS("testpouch", { wipe: true, database: 'pouchdb', adapter: 'idb' });

test(fs, 'pouchdb')
