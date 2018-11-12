# Private Blockchain Notary Service

## Getting Started

```sh
# Install dependencies
npm install

# Start server
node app.js
```

## API ENDPOINTS

### POST /requestValidation
Submit a validation request

#### Data Params
```
{
  address : [string]
}
```
#### Success Response
```
Code: 200
Content: {
  address: [string],
  requestTimeStamp: [string],
  message: [string],
  validationWindow: [number]
}
```
#### Error Response
```
Code: 400
Content: {
  error : "Empty payload"
}
```

### POST /message-signature/validate
Verify an existent validation request

#### Data Params
```
{
  address: [string],
  signature: [string],
}
```
#### Success Response
```
Code: 200
Content: {
	registerStar: [boolean]
    status: {
    	address: [string],
    	requestTimeStamp: [string],
   		message: [string],
    	validationWindow: [number],
    	messageSignature: [boolean]
    }
}
```
#### Error Response - Payload error
```
Code: 400
Content: {
	error : "Empty or incomplete payload"
}
```
#### Error Response - Invalid signature
```
Code: 400
Content: {
	registerStar: [boolean]
	status: {
		address: [string],
		requestTimeStamp: [string],
		message: [string],
		validationWindow: [number],
		messageSignature: [boolean]
	}
}
```

### POST /block
Add a new block

#### Data Params
Note: story description must not exceed 500 characters (only valid ASCII characters are accepted)
```
{
	address: [string],
	star: {
		dec: [string],
		ra: [string],
		story: [string] -> ASCII, max 500 bytes
	}
}
```
#### Success Response
```
Code: 201
Content: {
  "hash": [string],
  "height": 1,
  "body": {
    "address": [string],
    "star": {
      "ra": [string],
      "dec": [string],
      "story": [string] -> hex encoded
    }
  },
  "time": [string],
  "previousBlockHash": [string]
}
```
#### Error Response - Empty payload
```
Code: 400
Content: {
	error : "Empty payload"
}
```
#### Error Response - Story too long
```
Code: 400
Content: {
  error : "Story exceeds 500 bytes"
}
```
#### Error Response - Invalid charset
```
Code: 400
Content: {
  error : "Only ASCII chars allowed"
}
```
#### Error Response - Invalid submission
```
Code: 400
Content: {
  error : "Invalid submission. You must validate your address before star submission!"
}
```

### GET /block/\[blockheight\]
Get an existent block by height

#### URL Params
```
(required) blockheight=[integer]
```
#### Success Response
```
Code: 200
Content: {
  "hash": [string],
  "height": 1,
  "body": {
    "address": [string],
    "star": {
      "ra": [string],
      "dec": [string],
      "story": [string] -> hex encoded
    }
  },
  "time": [string],
  "previousBlockHash": [string]
}
```
#### Error Response - Block not found
```
Code: 404
Content: {
	error : "Block not found"
}
```

### GET /stars/hash:\[hash\]
Get an existent block by hash

#### URL Params
```
(required) hash=[string]
```
#### Success Response
```
Code: 200
Content: {
  "hash": [string],
  "height": 1,
  "body": {
    "address": [string],
    "star": {
      "ra": [string],
      "dec": [string],
      "story": [string] -> hex encoded
    }
  },
  "time": [string],
  "previousBlockHash": [string]
}
```
#### Error Response - Block not found
```
Code: 404
Content: {
  error : "Block not found"
}
```

### GET /stars/address:\[address\]
Get an existent block by address

#### URL Params
```
(required) address=[string]
```
#### Success Response
```
Code: 200
Content: [{
  "hash": [string],
  "height": 1,
  "body": {
    "address": [string],
    "star": {
      "ra": [string],
      "dec": [string],
      "story": [string] -> hex encoded
    }
  },
  "time": [string],
  "previousBlockHash": [string]
  },]
```
#### Error Response - Block not found
```
Code: 404
Content: {
  error : "Block not found"
}
```