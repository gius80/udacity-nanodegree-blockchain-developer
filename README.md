# Udacity ND Blockchain Developer

This repo contains my projects for the Udacity Nanodegree Course *[Blockchain Developer] (https://eu.udacity.com/course/blockchain-developer-nanodegree--nd1309)*

## Project #2: Private Blockchain

A simple private blockchain with persistent data, using LevelDB

### Getting Started

```sh
# Install dependencies
npm install

# Start test (create and add 10 new blocks)
node test.js
```

## Project #3: RESTful Web API with Express.js

Update project 2 adding REST api for GET and POST block, using Express.js
- [Express.js](https://github.com/expressjs)


### Getting Started

```sh
# Install dependencies
npm install

# Start server
node app.js
```

### API ENDPOINTS

#### GET /block/\[blockheight\]
Get an existent block

##### URL Params
```
(required) blockheight=[integer]
```
##### Success Response
```
Code: 200
Content: requested block, json format
```
##### Error Response
```
Code: 404
Content: {
	error : "Block not found"
}
```

#### POST /block
Add a new block

##### Data Params
```
{
  body : [string]
}
```
##### Success Response
```
Code: 201
Content: submitted block, json format
```
##### Error Response
```
Code: 400
Content: {
	error : "Empty payload"
}
```