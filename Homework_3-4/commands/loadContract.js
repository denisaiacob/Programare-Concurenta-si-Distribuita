require("../../opendsu-sdk/builds/output/openDSU");
const fs = require("fs");
const path = require("path");
const { loadDSU } = require("../lib/dsuHelper");

module.exports = function (program) {
  program
    .command("load-contract <keySSI>")
    .description("Load a contract from a DSU")
    .option("--name <filename>", "Custom name for the saved contract file (without extension)")
    .action(async (keySSI, options) => {
      try {
        const dsu = await loadDSU(keySSI);

        const files = await new Promise((resolve, reject) =>
          dsu.listFiles("/", (err, list) => (err ? reject(err) : resolve(list)))
        );

        const contractsDir = path.join(process.cwd(), "../contracts");
        if (!fs.existsSync(contractsDir)) {
          fs.mkdirSync(contractsDir, { recursive: true });
        }

        const baseName = options.name || "downloaded_contract";

        if (files.includes("contract.pdf")) {

          const pdfData = await dsu.readFileAsync("/contract.pdf");
          const filePath = path.join(contractsDir, `${baseName}.pdf`);
          fs.writeFileSync(filePath, pdfData);
          console.log(`PDF contract saved as: ${filePath}`);

        } else if (files.includes("contract.txt")) {
          
          const textData = await dsu.readFileAsync("/contract.txt");
          const filePath = path.join(contractsDir, `${baseName}.txt`);
          fs.writeFileSync(filePath, textData.toString());
          console.log(`Text contract saved as: ${filePath}`);

        } else {
          console.warn("No contract file found in DSU.");
        }
      } catch (err) {
        console.error("Failed to load contract:", err.message);
      }
    });
};
