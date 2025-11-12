// import express from "express";
// import { protectRoute } from "../middleware/auth.middleware.js";
// import {
//   acceptFriendRequest,
//   getFriendRequests,
//   getMyFriends,
//   getOutgoingFriendReqs,
//   getRecommendedUsers,
//   sendFriendRequest,
// } from "../controllers/user.controller.js";

// const router = express.Router();

// // apply auth middleware to all routes
// router.use(protectRoute);

// router.get("/", getRecommendedUsers);
// router.get("/friends", getMyFriends);

// router.post("/friend-request/:id", sendFriendRequest);
// router.put("/friend-request/:id/accept", acceptFriendRequest);

// router.get("/friend-requests", getFriendRequests);
// router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

// export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
   acceptFriendRequest,
   getFriendRequests,
   getMyFriends,
   getOutgoingFriendReqs,
   getRecommendedUsers,
   sendFriendRequest,
   getMyContext,
   declineFriendRequest, 
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

// ==========================================================
// ROUTE MỚI ĐƯỢC THÊM VÀO ĐỂ HỖ TRỢ TRANG TÌM KIẾM
// ==========================================================
// GET /api/users/me/context
router.get("/me/context", getMyContext);

router.delete(
    '/friend-request/:senderId/decline', 
    protectRoute, 
    declineFriendRequest
);

export default router;