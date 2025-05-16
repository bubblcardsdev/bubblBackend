// import swaggerJSDoc from "swagger-jsdoc";
import swaggerAutogen from "swagger-autogen";

const swaggerOption = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swagger API",
      version: "1.0.0",
      description: "Swagger API documentation",
      termsOfService: "",
      contact: {
        name: "Developer Rv Matrix software technologies pvt ltd",
      },
    },
  },
};

const outputFile = "./../swagger-output.json";
const endpointsFiles = ["./routes/index.route.js"];

swaggerAutogen()(outputFile, endpointsFiles, swaggerOption).then(() => {
  console.log("Swagger documentation generated");
});
// const swaggerDocs = swaggerJSDoc(swaggerOption);

// export default swaggerDocs;
