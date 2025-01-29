import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function findDependency(dependency, reactDir) {
  const dependencyPath = path.resolve(
    __dirname,
    "../../dependencies",
    reactDir,
    "node_modules",
    dependency,
  );

  if (fs.existsSync(dependencyPath)) {
    return dependencyPath;
  }

  const rootPath = path.resolve(__dirname, "../../node_modules", dependency);

  if (fs.existsSync(rootPath)) {
    return rootPath;
  }

  throw new Error(`Cannot find "${dependency}".`);
}
