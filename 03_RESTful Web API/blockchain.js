/* ===== SHA256 with Crypto-js ============================= |
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  ========================================================= */

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./levelSandbox');
const block = require('./block');

/* ===== Blockchain Class ========================= |
|  Class with a constructor for new blockchain      |
|  ================================================ */

class Blockchain {
  constructor() {
    this.db = new LevelSandbox.LevelSandbox();
    this.getBlockHeight().then((height) => {
      if (height < 0) {
        this.addBlock(new block.Block('First block in the chain - Genesis block'));
      }
    });
  }

  // Add new block
  async addBlock(newBlock) {
    // Block height
    newBlock.height = await this.getBlockHeight() + 1;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);

    // previous block hash
    if (newBlock.height > 0) {
      const prevBlock = await this.getBlock(newBlock.height - 1);
      newBlock.previousBlockHash = prevBlock.hash;
    }

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    return await this.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
  }

  // Get block height
  async getBlockHeight() {
    const blockCount = await this.db.getBlockCount();
    return blockCount - 1;
  }

  // get block
  async getBlock(blockHeight) {
    const rawBlock = await this.db.getLevelDBData(blockHeight);
    return JSON.parse(rawBlock);
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    const block = await this.getBlock(blockHeight);
    // get block hash
    const blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    const validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    const result = blockHash === validBlockHash;
    if (!result) {
      console.log(`Block #${blockHeight} invalid hash:\n${blockHash} <> ${validBlockHash}`);
    }
    return result;
  }

  // Validate blockchain
  async validateChain() {
    const errorLog = [];
    const blockCount = await this.db.getBlockCount();
    let lastHash = '';
    for (let i = 0; i < blockCount; i++) {
      // validate block
      const isValid = await this.validateBlock(i);
      if (!isValid) errorLog.push(i);
      // compare blocks hash link
      const { previousBlockHash, hash } = await this.getBlock(i);
      if (lastHash !== previousBlockHash) {
        errorLog.push(i);
      }
      lastHash = hash;
    }
    if (errorLog.length > 0) {
      console.log(`Block errors = ${errorLog.length}`);
      console.log(`Blocks: ${errorLog}`);
    } else {
      console.log('No errors detected');
    }
  }
}

module.exports = { Blockchain };
