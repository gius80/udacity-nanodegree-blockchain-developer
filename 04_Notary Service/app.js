// Importing Express.js module
const express = require('express');

// Importing BodyParser.js module
const bodyParser = require('body-parser');

// Importing BlockChain and Block Class
const Blockchain = require('./blockchain');
const Block = require('./block');

const blockChain = new Blockchain.Blockchain();
const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.listen(port, () => {
  console.log(`Server Listening for port: ${port}`);
});
