const bitcoinMessage = require('bitcoinjs-message');

module.exports.verifyMessage = (message, address, signature) => {
  try {
    const isValid = bitcoinMessage.verify(message, address, signature);
    return isValid;
  } catch (err) {
    return false;
  }
};
