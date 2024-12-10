const fs = require('fs');
const path = require('path');
const findDependency = require('./scripts/lib/findDependency.js');

/**
 * Generates unique jest project for each directory in `dependencies` folder.
 * Each project will have its own moduleNameMapper configuration mapping their dependencies to their respective node_modules.
 */
function generateConfigs() {
  const dependencies = fs.readdirSync('dependencies');

  return dependencies.map(dependency => {
    return {
      displayName: dependency,
      moduleNameMapper: generateModuleNameMapper(dependency),
      testEnvironment: "jsdom",
      transform: {
        "^.+.tsx?$": ["ts-jest",{}],
      },
    };
  });
}

function generateModuleNameMapper(dependency) {
  const dependencyPath = path.resolve('dependencies', dependency);
  const modules = Object.keys(require(path.resolve(dependencyPath, 'package.json')).devDependencies);

  return modules.reduce((acc, dep) => {
      const depPath = findDependency(dep, dependency);
      acc[`^${dep}$`] = depPath;
      acc[`^${dep}/(.*)$`] = `${depPath}/$1`;
      return acc;
    }, {});
}

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  projects: generateConfigs(),
};
