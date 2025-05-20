const { loadDSU, verifySign } = require("../lib/dsuHelper");
const opendsu = require("opendsu");

module.exports = function (program) {
  program
    .command("verify-contract <keySSI>")
    .description("Verify the contract's signature and integrity")
    .action(async (keySSI) => {
      try {
        const dsu = await loadDSU(keySSI);

        let fileContent;
        try {
          fileContent = await dsu.readFileAsync("/contract.pdf");
          console.log("Loaded PDF contract for verification.");
        } catch {
          fileContent = await dsu.readFileAsync("/contract.txt");
          console.log("Loaded text contract for verification.");
        }

        if (!fileContent) throw new Error("Contract file not found or empty.");

        const bufferData = Buffer.isBuffer(fileContent) ? fileContent : Buffer.from(fileContent);

        const sigFile = await dsu.readFileAsync("/signature.json");
        const { signer, signature, date } = JSON.parse(sigFile.toString());

        if (!signer || !signature) {
          throw new Error("Signature file is missing required fields.");
        }

        const sigBuffer = Buffer.from(signature.data); 
        const isValid = await verifySign(signer,bufferData,sigBuffer);

        if (isValid) {
          console.log(`Signature is valid.`);
          console.log(`Signed by: ${signer}`);
          console.log(`Date: ${date}`);
        } else {
          console.log(`Signature is invalid or does not match content.`);
        }
      } catch (err) {
        console.error("Verification failed:", err.message);
      }
    });
};