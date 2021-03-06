/* ===== Persist data with LevelDB ====================== |
|  Learn more: level: https://github.com/Level/level      |
|  ====================================================== */
const level = require('level');

const chainDB = './chaindata';

class LevelSandbox {
  // Class constructor
  constructor() {
    this.db = level(chainDB);
  }

  // Add data to levelDB with key/value pair
  addLevelDBData(key, value) {
    return new Promise((resolve, reject) => {
      this.db.put(key, value, (err) => {
        if (err) {
          console.log(`LevelSandbox:: Block ${key} submission failed`, err);
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  // Get data from levelDB with key
  getLevelDBData(key) {
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if (err) {
          console.log('LevelSandbox:: Not found!', err);
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  // Return the number of block inside chaindata
  getBlockCount() {
    return new Promise((resolve, reject) => {
      let i = 0;
      this.db.createReadStream()
        .on('data', () => {
          i += 1;
        }).on('error', (err) => {
          reject(err);
        }).on('close', () => {
          resolve(i);
        });
    });
  }

  // Add data to levelDB with value
  addDataToLevelDB(value) {
    this.getBlockCount().then(count => new Promise((resolve, reject) => {
      this.addLevelDBData(count, value)
        .then(() => {
          resolve();
        });
    }));
  }
}

module.exports.LevelSandbox = LevelSandbox;
