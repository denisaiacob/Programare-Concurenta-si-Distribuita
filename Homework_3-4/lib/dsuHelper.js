require("../../opendsu-sdk/builds/output/openDSU");

const opendsu = require("opendsu");
const resolver = opendsu.loadAPI('resolver');
const keySSISpace = opendsu.loadAPI('keyssi');
const crypto = opendsu.loadAPI("crypto");

function loadDSU(keySSI) {
  return new Promise((resolve, reject) => {
    resolver.loadDSU(keySSI, (err, dsu) => {
      if (err) return reject(err);

      dsu.readFileAsync = (path) =>
        new Promise((res, rej) => dsu.readFile(path, (err, data) => (err ? rej(err) : res(data))));

      dsu.writeFileAsync = (path, content) =>
        new Promise((res, rej) => dsu.writeFile(path, content, (err) => (err ? rej(err) : res())));

      dsu.safeBeginBatchAsync = () =>
        new Promise((res, rej) => dsu.safeBeginBatch((err) => (err ? rej(err) : res())));

      dsu.commitBatchAsync = () =>
        new Promise((res, rej) => dsu.commitBatch((err) => (err ? rej(err) : res())));

      resolve(dsu);
    });
  });
}

async function getSeedSSI() {
  const keySSI = await $$.promisify(keySSISpace.createSeedSSI)('default');
  return keySSI;
}

async function signData(seedSSI, data) {
  const signature = await $$.promisify(crypto.sign)(seedSSI, data);
  return signature;
}

async function verifySign(signer,bufferData,sigBuffer){
  const signerKeySSI = keySSISpace.parse(signer);
  const isValid = await $$.promisify(crypto.verifySignature)(signerKeySSI, bufferData, sigBuffer);
  return isValid;
}

async function createDSU() {
  const seedSSI = await $$.promisify(keySSISpace.createSeedSSI)("default");
  return new Promise((resolve, reject) => {
    resolver.createDSU(seedSSI, (err, dsu) => {
      if (err) return reject(err);

      dsu.safeBeginBatchAsync = () =>
        new Promise((res, rej) => dsu.safeBeginBatch((err) => (err ? rej(err) : res())));

      dsu.commitBatchAsync = () =>
        new Promise((res, rej) => dsu.commitBatch((err) => (err ? rej(err) : res())));

      resolve(dsu);
    });
  });
}

function writeFileToDSU(dsu, path, content) {
  return new Promise((resolve, reject) => {
    dsu.writeFile(path, content, (err) => (err ? reject(err) : resolve()));
  });
}

module.exports = { loadDSU, getSeedSSI, signData, createDSU, writeFileToDSU, verifySign };
