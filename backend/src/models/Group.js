import mongoose from 'mongoose';

    const groupSchema = new mongoose.Schema({
     name: {
    type: String,
    required: [true, 'Tên nhóm là bắt buộc'],
    },
    streamChannelId: {
    type: String,
    required: true,
    unique: true,
    },
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
    members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    }]
    }, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
export default Group;