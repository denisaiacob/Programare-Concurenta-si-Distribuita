require("../../opendsu-sdk/builds/output/openDSU");
const fs = require("fs");
const path = require("path");
const { loadDSU } = require("../lib/dsuHelper");

module.exports = function (program) {
  program
    .command("export-contract <keySSI>")
    .option("--file <file>", "Export file name", "contract_export.json")
    .description("Export contract DSU content and signature for sharing")
    .action(async (keySSI, options) => {
      try {
        const dsu = await loadDSU(keySSI);

        let contractContent = null;
        let fileType = null;

        try {
          contractContent = await dsu.readFileAsync("/contract.pdf");
          fileType = "pdf";
        } catch {
          contractContent = await dsu.readFileAsync("/contract.txt");
          fileType = "text";
        }

        let signature = null;
        try {
          const sig = await dsu.readFileAsync("/signature.json");
          signature = JSON.parse(sig.toString());
        } catch {
          console.warn("No signature found.");
        }

        const payload = {
          keySSI,
          fileType,
          contractContent: contractContent.toString("base64"),
          signature,
        };

        fs.writeFileSync(path.resolve(options.file), JSON.stringify(payload, null, 2));
        console.log(`Contract exported to: ${options.file}`);
      } catch (err) {
        console.error("Failed to export contract:", err.message);
      }
    });
};
