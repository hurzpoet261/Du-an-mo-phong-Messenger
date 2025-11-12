import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên nhóm là bắt buộc'],
    },
    // ID của channel trên GetStream (ví dụ: "group-uuid-1234")
    streamChannelId: {
        type: String,
        required: true,
        unique: true,
    },
    // CID của channel (ví dụ: "messaging:group-uuid-1234")
    streamChannelCid: {
        type: String,
        required: true,
        unique: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Chỉ lưu các thành viên đã chấp nhận
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);

export default Group; 