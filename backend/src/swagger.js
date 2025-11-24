const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "HRMS API Docs",
        version: "1.0.0",
      },
    },
    // IMPORTANT: include all controller & routes!
  apis: [
    "./src/routes/**/*.js",
    "./src/controllers/**/*.js",
    "./src/models/**/*.js"
  ]
  };

 exports.swaggerSpec = swaggerJSDoc(options);

  //app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  


