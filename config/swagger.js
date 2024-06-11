import swaggerJSDoc from "swagger-jsdoc";

const swaggerOption = {
  swaggerDefinition: {
    info: {
      title: "Swagger api",
      description: "Swagger api documentation",
      termsOfService: "",
      contact: {
        name: "Rv Matrix",
      },
      server: ["http://localhost:5000"],
    },
  },
};

const swaggerDocs = swaggerJSDoc(swaggerOption);

export default swaggerDocs;
