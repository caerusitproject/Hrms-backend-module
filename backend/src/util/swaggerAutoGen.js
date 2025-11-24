const fs = require("fs");
const path = require("path");

function loadRoutes(dir) {
  let routes = [];

  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      routes = routes.concat(loadRoutes(fullPath));
    } else if (file.endsWith("Routes.js") || file.endsWith("routes.js")) {
      routes.push(fullPath);
    }
  });

  return routes;
}

function parseRoutes(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const regex = /router\.(get|post|put|delete|patch)\(['"`](.*?)['"`],\s*(.*?)\)/g;

  let matches = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    matches.push({
      method: match[1],
      route: match[2],
      handler: match[3],
    });
  }

  return matches;
}

function generateSwagger(){
  const basePath = path.join(__dirname, "..", "routes");

  const swaggerJSON = {
    openapi: "3.0.0",
    info: {
      title: "HRMS API Documentation (Auto-generated)",
      version: "1.0.0",
      description: "Swagger generated automatically from route files.",
    },
    paths: {},
  };

  const routeFiles = loadRoutes(basePath);

  for (const file of routeFiles) {
    const routes = parseRoutes(file);

    for (const r of routes) {
      swaggerJSON.paths[r.route] = swaggerJSON.paths[r.route] || {};

      swaggerJSON.paths[r.route][r.method] = {
        tags: [path.basename(file)],
        summary: `${r.method.toUpperCase()} ${r.route}`,
        responses: {
          200: {
            description: "Success",
          },
        },
      };
    }
  }

  return swaggerJSON;
}

module.exports = { generateSwagger };
