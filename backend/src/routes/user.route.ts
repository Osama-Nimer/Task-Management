import  express  from "express";
import { Register , verifyCode} from "../controllers/user.controller";
const router = express.Router();

router.post("/register", Register);
router.post("/verify", verifyCode);

export default router;