import { Injectable, NgZone } from '@angular/core';
import { Item } from '../models/item';
import * as PouchDB from 'pouchdb';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  private readonly db = new PouchDB<Item>('items');

  constructor(private zone: NgZone) {
    this.db.sync('http://localhost:5984/items', { live: true, retry: true });
  }

  async findAll() {
    const docs = await this.db.allDocs({ include_docs: true });
    return docs.rows.map(row => row.doc);
  }

  add(item: Item) {
    return this.db.post(item);
  }

  remove(item: Item) {
    return this.db.remove(item._id, item._rev);
  }

  update(item: Item) {
    return this.db.put(item);
  }

  changes() {
    return new Observable<void>(subscriber => {
      this.db.changes({ live: true, since: 'now' })
      .on('change', change => { this.zone.run(() => { subscriber.next(); }); });
    });
  }

}