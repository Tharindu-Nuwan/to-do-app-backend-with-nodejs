import express, { json } from "express";
import { TaskHttpController } from "./controller/task.http.controller.js";
import cors from "cors";
const app = express();
app.use(json());
app.use(cors());
app.use('/api/v1/tasks', TaskHttpController);
app.listen(8080, () => {
    console.log("Server is listening to the port 8080");
});
//# sourceMappingURL=main.js.map