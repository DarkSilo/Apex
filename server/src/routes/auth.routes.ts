import { Router } from "express";
import { register, login, refreshToken, getMe, updateMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, updateMeSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, validate(updateMeSchema), updateMe);

export default router;
