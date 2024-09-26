import app from "./app.js";
import router from "./routes/index.route.js";
import adminRouter from "./routes/adminRoutes/index.admin.route.js";
import bodyParser from "body-parser";

app.use("/api", router);
app.use("/api/admin", adminRouter);
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
  })
);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
