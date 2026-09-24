import { mkdir, writeFile } from "node:fs/promises";
import { exportWorkflowContracts } from "../src/lib/base44/contracts";
await mkdir("docs/base44", { recursive: true });
await writeFile(
  "docs/base44/lead-workflow-contracts.v1.json",
  JSON.stringify(exportWorkflowContracts(), null, 2) + "\n",
);
