import { LRUCache } from "lru-cache";


const options = {
  max: 500,              // max number of items to store
  ttl: 1000 * 60 * 5,    // 5 minutes TTL (time-to-live)
  updateAgeOnGet: true,  // refresh TTL on get
};
const lruCache = new LRUCache(options);

export default lruCache;