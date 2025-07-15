import  express  from "express";
import { getAllUsers , getUserbyeamil} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { isAuthorizedRole } from "../middlewares/role.middleware";
const router = express.Router();

router.get("/getAllUsers",
        authMiddleware ,
        isAuthorizedRole("Admin") ,
        getAllUsers
    );

router.get("/getUserByEmail",
        authMiddleware ,
        isAuthorizedRole("Admin"),
        getUserbyeamil
    );

export default router;