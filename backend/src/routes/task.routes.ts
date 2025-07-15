import  express  from "express";
import { createTask } from "../controllers/task.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { isAuthorizedRole } from "../middlewares/role.middleware";
const router = express.Router();

router.post("/creteTask", 
    authMiddleware,
    isAuthorizedRole("Admin"),
    createTask);

export default router;