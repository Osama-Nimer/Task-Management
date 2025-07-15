import  express  from "express";
import { getAllUsers , getUserbyId, getUserbyeamil} from "../controllers/user.controller";
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
        isAuthorizedRole("Admin" , "user"),
        getUserbyeamil
    );

router.get("/getUserById",
        authMiddleware ,
        isAuthorizedRole("Admin" , "user"),
        getUserbyId
    );

export default router;