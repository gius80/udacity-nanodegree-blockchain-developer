// Importing Express.js module
const express = require('express');

// Importing BodyParser.js module
const bodyParser = require('body-parser');

// Importing BlockChain and Block Class
const Blockchain = require('./blockchain');
const Block = require('./block');

const Util = require('./util');

const PORT = 8000;
const VALIDATION_WINDOW = 20;

const blockChain = new Blockchain.Blockchain();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// mempool is a dictionary containing that uses address as key
// key : {
//  timestamp: string,
//  canRegister: bool
// }
const mempool = {};

// Endpoint POST /requestValidation
app.post('/requestValidation', (req, res) => {
  let status = 200;
  let response = {};
  if (req.body.address && req.body.address !== '') {
    const { address } = req.body;
    let timestamp = new Date().getTime().toString().slice(0, -3);
    let delta = 0;
    // Checking if the address is already present in mempool
    if (mempool[address]) {
      delta = parseInt(timestamp, 10) - parseInt(mempool[address].timestamp, 10);
      // Checking if the validation time is still valid
      if (delta < VALIDATION_WINDOW) { // validation window is valid
        // Read timestamp from mempool
        ({ timestamp } = mempool[address].timestamp);
      } else { // validation window is expired
        // Reset timestamp
        mempool[address].timestamp = timestamp;
        delta = 0;
      }
    } else { // Address not found
      mempool[address] = {
        timestamp,
        canRegister: false,
      };
    }
    const messageToValidate = `${address}:${timestamp}:starRegistry`;
    // Adding new address & timestamp in mempool (as key:value)
    status = 201;
    response = {
      address,
      requestTimeStamp: timestamp,
      message: messageToValidate,
      validationWindow: VALIDATION_WINDOW - delta,
    };
  } else {
    status = 400;
    response = { error: 'Empty payload' };
  }
  res.status(status);
  res.json(response);
});

// Endpoint POST /message-signature/validate
app.post('/message-signature/validate', (req, res) => {
  let status = 200;
  let response = {};
  if (req.body.address && req.body.address !== ''
      && req.body.signature && req.body.signature !== '') {
    const { address, signature } = req.body;
    // Checking if the address is present in mempool
    if (!mempool[address]) { // Address not found
      status = 400;
      response = { error: 'Request validation not found' };
    } else { // Address found
      const requestTimeStamp = mempool[address].timestamp;
      const time = parseInt(requestTimeStamp, 10);
      const now = parseInt(new Date().getTime().toString().slice(0, -3), 10);
      const delta = now - time;
      // Checking if the validation is still valid
      if (delta > VALIDATION_WINDOW) { // validation window is expired
        // Cleaning mempool
        delete mempool[address];
        status = 400;
        response = { error: 'Request validation timeout' };
      } else { // validation window is valid
        const message = `${address}:${requestTimeStamp}:starRegistry`;
        // Checking if the signature is valid
        if (Util.verifyMessage(message, address, signature)) { // valid signature
          mempool[address].canRegister = true;
          status = 201;
          response = {
            registerStar: true,
            status: {
              address,
              requestTimeStamp,
              message,
              validationWindow: VALIDATION_WINDOW - delta,
              messageSignature: 'valid',
            },
          };
        } else { // invalid signature
          status = 400;
          response = {
            registerStar: false,
            status: {
              address,
              requestTimeStamp,
              message,
              validationWindow: VALIDATION_WINDOW - delta,
              messageSignature: 'valid',
            },
          };
        }
      }
    }
  } else {
    status = 400;
    response = { error: 'Empty or incomplete payload' };
  }
  res.status(status);
  res.json(response);
});

// Defining routes
const router = express.Router();
const routerStars = express.Router();

// Endpoint GET /block/:index
router.get('/:index', async (req, res) => {
  let response = {};
  let status = 200;
  try {
    response = await blockChain.getBlock(req.params.index);
    status = 200;
  } catch (error) {
    res.status(404);
    response = { error: 'Block not found' };
  }
  res.status(status);
  res.json(response);
});

// Endpoint POST /block
router.post('/', async (req, res) => {
  let status = 200;
  let response = {};
  let isMessageValid = true;
  if (req.body && req.body !== '') {
    const { address, star } = req.body;
    // Checking if address exists in memory pool & can register a star
    if (mempool[address] && mempool[address].canRegister) {
      if (!Util.validateASCII(star.story)) {
        isMessageValid = false;
        status = 400;
        response = { error: 'Invalid ASCII chars in story' };
      }
      if (!Util.validateMessageSize(star.story)) {
        isMessageValid = false;
        status = 400;
        response = { error: 'Story exceeds 500 bytes' };
      }
      if (isMessageValid) {
        // Cleaning mempool
        delete mempool[address];
        star.story = Buffer.from(star.story, 'ascii').toString('hex');
        const newBlock = new Block.Block({
          address,
          star: req.body.star,
        });
        const result = await blockChain.addBlock(newBlock);
        status = 201;
        response = JSON.parse(result);
      }
    } else {
      status = 400;
      response = { error: 'Invalid submission. You must validate your address before star submission!' };
    }
  } else {
    status = 400;
    response = { error: 'Empty payload' };
  }
  res.status(status);
  res.json(response);
});

// Endpoint GET /stars:address:[address]
routerStars.get('/address::address', async (req, res) => {
  let block = {};
  try {
    block = await blockChain.getBlockByAddress(req.params.address);
    res.status(200);
  } catch (error) {
    res.status(404);
    block.error = 'Block not found';
  }
  res.json(block);
});

// Endpoint GET /stars/hash:[hash]
routerStars.get('/hash::hash', async (req, res) => {
  let block = {};
  try {
    block = await blockChain.getBlockByHash(req.params.hash);
    res.status(200);
  } catch (error) {
    res.status(404);
    block.error = 'Block not found';
  }
  res.json(block);
});

app.use('/block', router);
app.use('/stars', routerStars);

app.listen(PORT, () => {
  console.log(`Server Listening for port: ${PORT}`);
});
