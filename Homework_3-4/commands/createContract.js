require("../../opendsu-sdk/builds/output/openDSU");
const readline = require("readline");
const fs = require("fs");
const { createDSU, writeFileToDSU } = require("../lib/dsuHelper");

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

module.exports = function (program) {
  program
    .command("create-contract")
    .description("Create a new digital contract as text or PDF")
    .option("--pdf <path>", "Provide path to a PDF file to store as contract")
    .action(async (options) => {
      try {
        const dsu = await createDSU();
        await dsu.safeBeginBatchAsync();

        if (options.pdf) {
          const pdfPath = options.pdf;

          if (!fs.existsSync(pdfPath)) {
            throw new Error("PDF file not found at: " + pdfPath);
          }

          const pdfBuffer = fs.readFileSync(pdfPath);
          await writeFileToDSU(dsu, "/contract.pdf", pdfBuffer);
          console.log("PDF contract stored.");
        } else {
          const title = await prompt("Enter contract title: ");
          const content = await prompt("Enter contract content: ");
          const contract = `Title: ${title}\n\n${content}`;
          await writeFileToDSU(dsu, "/contract.txt", contract);
          console.log("Contract created and stored.");
        }

        await dsu.commitBatchAsync();

        const keySSI = await $$.promisify(dsu.getKeySSIAsString)();
        console.log(`Contract KeySSI:\n${keySSI}`);
      } catch (err) {
        console.error("Error creating contract:", err.message);
      }
    });
};
