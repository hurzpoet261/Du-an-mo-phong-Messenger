import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js'; 
import {
    createGroup,
    acceptInvite,
    rejectInvite,
    addMembers,
    removeMember,
    getVideoToken,
    startGroupCall
} from '../controllers/group.controller.js';

const router = express.Router();

// Áp dụng middleware cho tất cả các route bên dưới
router.use(protectRoute);

// Tạo nhóm
router.post('/create', createGroup);

// Chấp nhận / Từ chối lời mời
router.post('/:groupId/accept', acceptInvite);
router.post('/:groupId/reject', rejectInvite);

// Quản lý thành viên (chỉ admin)
router.post('/:groupId/add-members', addMembers);
router.delete('/:groupId/remove-member/:memberId', removeMember);

// Gọi Video
router.get('/video-token', getVideoToken); // Lấy token cho user
router.post('/:groupId/start-call', startGroupCall); // Bắt đầu cuộc gọi

export default router; 