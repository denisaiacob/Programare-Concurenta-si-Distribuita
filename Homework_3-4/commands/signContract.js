require("../../opendsu-sdk/builds/output/openDSU");
const { loadDSU, getSeedSSI, signData } = require("../lib/dsuHelper");

module.exports = function (program) {
  program
    .command("sign-contract <keySSI>")
    .description("Digitally sign a contract stored in a DSU using a generated SeedSSI")
    .action(async (keySSI) => {
      try {
        const dsu = await loadDSU(keySSI);

        let fileContent;
        try {
          fileContent = await dsu.readFileAsync("/contract.pdf");
          console.log("Signing PDF contract...");
        } catch {
          fileContent = await dsu.readFileAsync("/contract.txt");
          console.log("Signing text contract...");
        }

        if (!fileContent) {
          throw new Error("Contract file content is empty or invalid.");
        }

        const bufferData = Buffer.isBuffer(fileContent) ? fileContent : Buffer.from(fileContent);

        const seedSSI = await getSeedSSI();
        const signature = await signData(seedSSI, bufferData);

        const signatureEntry = {
          signer: seedSSI.getIdentifier(),
          signature: signature,
          date: new Date().toISOString(),
        };

        await dsu.safeBeginBatchAsync();

        await dsu.writeFileAsync(
          `/signature.json`,
          JSON.stringify(signatureEntry, null, 2)
        );

        await dsu.commitBatchAsync();

        console.log(`Contract signed by ${signatureEntry.signer}`);
      } catch (err) {
        console.error("Error signing contract:", err.message);
      }
    });
};
