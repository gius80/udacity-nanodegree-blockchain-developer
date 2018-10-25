const simpleChain = require('./simpleChain');
const myBlockChain = new simpleChain.Blockchain();

(function theLoop(i) {
  setTimeout(() => {
    let blockTest = new simpleChain.Block(`Test Block ${i + 1}`);
    myBlockChain.addBlock(blockTest).then((result) => {
      console.log(result);
      i++;
      if (i < 10) theLoop(i);
    });
  }, 500);
})(0);

setTimeout(() => {
  myBlockChain.validateChain();
}, 10000);
