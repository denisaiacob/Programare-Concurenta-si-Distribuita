require("../../opendsu-sdk/builds/output/openDSU");
const fs = require("fs");
const path = require("path");
const { createDSU, writeFileToDSU } = require("../lib/dsuHelper");

module.exports = function (program) {
  program
    .command("import-contract <file>")
    .description("Import a contract from a shared export file")
    .action(async (file) => {
      try {
        const content = fs.readFileSync(path.resolve(file), "utf-8");
        const { fileType, contractContent, signature } = JSON.parse(content);

        const dsu = await createDSU();
        await dsu.safeBeginBatchAsync();

        const buffer = Buffer.from(contractContent, "base64");
        const filePath = fileType === "pdf" ? "/contract.pdf" : "/contract.txt";
        await writeFileToDSU(dsu, filePath, buffer);

        if (signature) {
          await writeFileToDSU(dsu, "/signature.json", JSON.stringify(signature, null, 2));
          console.log("Signature restored.");
        }

        await dsu.commitBatchAsync();

        const newKeySSI = await $$.promisify(dsu.getKeySSIAsString)();
        console.log("Contract imported successfully.");
        console.log("New KeySSI:", newKeySSI);
      } catch (err) {
        console.error("Failed to import contract:", err.message);
      }
    });
};
