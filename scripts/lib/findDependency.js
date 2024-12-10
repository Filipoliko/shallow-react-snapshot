const fs = require('fs');
const path = require('path');

function findDependency(dependency, reactDir) {
    const dependencyPath = path.resolve(__dirname, '../../dependencies', reactDir, 'node_modules', dependency);
  
    if (fs.existsSync(dependencyPath)) {
      return dependencyPath;
    }
  
    const rootPath = path.resolve(__dirname, '../../node_modules', dependency);
  
    if (fs.existsSync(rootPath)) {
      return rootPath;
    }
  
    throw new Error(`Cannot find "${dependency}".`);
}

module.exports = findDependency;
