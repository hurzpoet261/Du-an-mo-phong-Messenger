import { streamChatClient, streamVideoClient, generateVideoUserToken } from '../lib/stream.js';
import Group from '../models/Group.js';
import { v4 as uuidv4 } from 'uuid';

// 1. Tạo nhóm
export const createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body; 
        const creatorId = req.user._id.toString();

        if (!name || !memberIds || memberIds.length === 0) {
            return res.status(400).json({ error: 'Tên nhóm và thành viên là bắt buộc' });
        }

        const allMemberIds = [creatorId, ...memberIds];
        const groupId = uuidv4();

        const channel = streamChatClient.channel('messaging', groupId, {
            name: name,
            created_by_id: creatorId,
            members: allMemberIds // Thêm trực tiếp
        });

        const channelData = await channel.create();

        const newGroup = new Group({
            name,
            streamChannelId: channelData.channel.id,
            streamChannelCid: channelData.channel.cid,
            admin: creatorId,
            members: allMemberIds
        });
        await newGroup.save();

        res.status(201).json({ message: 'Tạo nhóm thành công', group: newGroup, channel: channelData.channel });

    } catch (error) {
        console.error('Lỗi tạo nhóm:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// 2. Chấp nhận lời mời
export const acceptInvite = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id.toString();

        const channel = streamChatClient.channel('messaging', groupId);
        
        await channel.addMembers([userId]);

        await Group.findOneAndUpdate(
            { streamChannelId: groupId },
            { $addToSet: { members: userId } }
        );

        res.status(200).json({ message: 'Đã tham gia nhóm' });
    } catch (error) {
        console.error('Lỗi chấp nhận lời mời:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// 3. Từ chối lời mời
export const rejectInvite = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id.toString();

        const channel = streamChatClient.channel('messaging', groupId);
        
        await channel.removeMembers([userId]);

        res.status(200).json({ message: 'Đã từ chối lời mời' });
    } catch (error) {
        console.error('Lỗi từ chối lời mời:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// 4. Thêm thành viên (chỉ Admin)
export const addMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberIds } = req.body;
        const requesterId = req.user._id.toString();

        const groupInDb = await Group.findOne({ streamChannelId: groupId });
        if (!groupInDb || groupInDb.admin.toString() !== requesterId) {
            return res.status(403).json({ error: 'Bạn không có quyền thêm thành viên' });
        }

        const channel = streamChatClient.channel('messaging', groupId);
        await channel.inviteMembers(memberIds);

        res.status(200).json({ message: 'Đã gửi lời mời cho thành viên mới' });
    } catch (error) {
        console.error('Lỗi thêm thành viên:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// 5. Xóa thành viên (chỉ Admin)
export const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const requesterId = req.user._id.toString();

        const groupInDb = await Group.findOne({ streamChannelId: groupId });
        if (!groupInDb || groupInDb.admin.toString() !== requesterId) {
            return res.status(403).json({ error: 'Bạn không có quyền xóa thành viên' });
        }

        if (memberId === requesterId) {
            return res.status(400).json({ error: 'Admin không thể tự xóa mình' });
        }

        const channel = streamChatClient.channel('messaging', groupId);
        await channel.removeMembers([memberId]);

        await Group.updateOne(
            { streamChannelId: groupId },
            { $pull: { members: memberId } }
        );

        res.status(200).json({ message: 'Đã xóa thành viên' });
    } catch (error) {
        console.error('Lỗi xóa thành viên:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// 6. Lấy Video Token (cho user hiện tại)
export const getVideoToken = (req, res) => {
    try {
        const userId = req.user._id.toString();
        const token = generateVideoUserToken({ user_id: userId });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Lỗi tạo video token:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// 7. Bắt đầu cuộc gọi nhóm
export const startGroupCall = async (req, res) => {
     try {
        const { groupId } = req.params;
        const userId = req.user._id.toString();
        const callId = uuidv4();

        // Tạo cuộc gọi trên server video
        await streamVideoClient.calls.createCall('default', callId, {
            custom: {
                chatChannelId: groupId
            }
        });

        // Gửi sự kiện vào kênh chat
        const channel = streamChatClient.channel('messaging', groupId);
        await channel.sendEvent({
            type: 'group-call-started',
            call_id: callId,
            user: { 
                id: userId, 
                name: req.user.fullName 
            },
        });

        res.status(200).json({ message: 'Cuộc gọi đã bắt đầu', callId: callId });
    } catch (error) {
        console.error('Lỗi bắt đầu cuộc gọi:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};