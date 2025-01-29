import fs from "node:fs";
import path from "node:path";
import findDependency from "./scripts/lib/findDependency.mjs";

/**
 * Generates unique jest project for each directory in `dependencies` folder.
 * Each project will have its own moduleNameMapper configuration mapping their dependencies to their respective node_modules.
 */
function generateConfigs() {
  const dependencies = fs.readdirSync("dependencies");

  return dependencies.map((dependency) => {
    return {
      displayName: dependency,
      moduleNameMapper: generateModuleNameMapper(dependency),
      testEnvironment: "jsdom",
      preset: "ts-jest",
    };
  });
}

function generateModuleNameMapper(dependency) {
  const dependencyPath = path.resolve("dependencies", dependency);
  const { devDependencies } = JSON.parse(
    fs.readFileSync(path.resolve(dependencyPath, "package.json")),
  );
  const modules = Object.keys(devDependencies);

  return modules.reduce((acc, dep) => {
    const depPath = findDependency(dep, dependency);
    acc[`^${dep}$`] = depPath;
    acc[`^${dep}/(.*)$`] = `${depPath}/$1`;
    return acc;
  }, {});
}

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  projects: generateConfigs(),
};
