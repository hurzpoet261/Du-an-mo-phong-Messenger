import express from "express";
import { search } from "../controllers/search.controller.js";
// Đảm bảo đường dẫn này chính xác tới middleware của bạn
import { protectRoute } from "../middleware/auth.middleware.js"; 

const router = express.Router();

// Định nghĩa route: GET /api/search
// Nó sẽ được bảo vệ bởi protectRoute và gọi hàm globalSearch
router.get("/", protectRoute, search);

export default router;