const bitcoinMessage = require('bitcoinjs-message');

const verifyMessage = (message, address, signature) => {
  try {
    const isValid = bitcoinMessage.verify(message, address, signature);
    return isValid;
  } catch (err) {
    return false;
  }
};

const validateASCII = (message) => {
  let isASCII = true;
  for (let i = 0; i < message.length; i++) {
    if (message[i].charCodeAt() > 255) {
      isASCII = false;
      break;
    }
  }
  return isASCII;
};

const validateMessageSize = message => message.length <= 500;

module.exports = {
  verifyMessage,
  validateASCII,
  validateMessageSize,
};
