const express = require('express');
const axios = require('axios');
const http = require('http');
const crypto = require('crypto');
const app = express();

handleRequest = async (req, res) => {
  const secKey = 'revoked';
  const apiUrl = 'revoked';
  const { endpoint } = req.params;
  const resource = '/vrageremote/v1/' + endpoint;
  const reqUrl = apiUrl + resource;
  const nonce = (Math.floor(Math.random() * 100000) + 1).toString();
  const date = new Date(Date.now()).toUTCString();


  let message = '';
  message += `${resource}\r\n`;
  message += `${nonce}\r\n`;
  message += `${date}\r\n`;

  const messageBuffer = Buffer.from(message, 'utf8');
  const messageBytes = new Uint8Array(messageBuffer);
  const key = new Buffer(secKey, 'base64');
  const keyBytes = new Uint8Array(key);

  const computedHash = crypto
    .createHmac('sha1', keyBytes)
    .update(messageBytes)
    .digest('base64');
  const hash = new Buffer(computedHash, 'base64').toString('base64');

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: `${nonce}:${hash}`,
      Date: date
    },
    url: reqUrl
  });
  res.send(response.data);
};

app.get('/:endpoint', handleRequest);

const server = http.createServer(app);
server.listen(3001, () => {
  console.log('running on 3001');
})
