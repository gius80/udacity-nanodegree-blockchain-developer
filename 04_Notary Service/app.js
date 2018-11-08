// Importing Express.js module
const express = require('express');

// Importing BodyParser.js module
const bodyParser = require('body-parser');

// Importing BlockChain and Block Class
const Blockchain = require('./blockchain');
const Block = require('./block');

const Util = require('./util');

const blockChain = new Blockchain.Blockchain();
const app = express();
const PORT = 8000;
const VALIDATION_WINDOW = 300;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mempool = {};

// Endpoint POST /requestValidation
app.post('/requestValidation', (req, res) => {
  if (req.body.address && req.body.address !== '') {
    const { address } = req.body;
    const timestamp = new Date().getTime().toString().slice(0, -3);
    const messageToValidate = `${address}:${timestamp}:starRegistry`;
    // Adding new address & timestamp in mempool (as key:value)
    // If the address is already present in mempool it's replaced
    mempool[address] = timestamp;
    const response = {
      address,
      requestTimeStamp: timestamp,
      message: messageToValidate,
      validationWindow: VALIDATION_WINDOW,
    };
    res.status(201);
    res.json(response);
  } else {
    res.status(400);
    res.json({ error: 'Empty payload' });
  }
});

// Endpoint POST /message-signature/validate
app.post('/message-signature/validate', (req, res) => {
  if (req.body.address && req.body.address !== '' && req.body.signature && req.body.signature !== '') {
    const { address, signature } = req.body;
    // Checking if the address is present in mempool
    const requestTimeStamp = mempool[address];
    if (!requestTimeStamp) {
      res.status(400);
      res.json({ error: ' Request validation not found' });
    }
    const time = parseInt(requestTimeStamp, 10);
    const now = parseInt(new Date().getTime().toString().slice(0, -3), 10);
    const delta = now - time;
    // Checking if the validation is still valid
    if (delta > VALIDATION_WINDOW) {
      // Cleaning mempool
      delete mempool[address];
      res.status(400);
      res.json({ error: 'Request validation timeout' });
    }
    // Checking if the signature is valid
    const message = `${address}:${requestTimeStamp}:starRegistry`;
    if (Util.verifyMessage(message, address, signature)) {
      res.status(201);
      res.json({
        registerStar: true,
        status: {
          address,
          requestTimeStamp,
          message,
          validationWindow: delta,
          messageSignature: 'valid',
        },
      });
    } else {
      res.status(400);
      res.json({ error: 'Invalid signature' });
    }
  } else {
    res.status(400);
    res.json({ error: 'Empty or incomplete payload' });
  }
});

// Defining routes
const router = express.Router();

// Endpoint GET /block/:index
router.get('/:index', async (req, res) => {
  let block = {};
  try {
    block = await blockChain.getBlock(req.params.index);
    res.status(200);
  } catch (error) {
    res.status(404);
    block.error = 'Block not found';
  }
  res.json(block);
});

// Endpoint POST /block/:index
router.post('/', async (req, res) => {
  if (req.body.body && req.body.body !== '') {
    const newBlock = new Block.Block(req.body.body);
    const result = await blockChain.addBlock(newBlock);
    res.status(201);
    res.json(JSON.parse(result));
  } else {
    res.status(400);
    res.json({ error: 'Empty payload' });
  }
});

app.use('/', router);
app.use('/block', router);

app.listen(PORT, () => {
  console.log(`Server Listening for port: ${PORT}`);
});
