import  express  from "express";
import { Register , verifyCode ,Login} from "../controllers/auth.controller";
const router = express.Router();

router.post("/register", Register);
router.post("/verify", verifyCode);
router.post("/login", Login);

export default router;