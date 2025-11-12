import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersFriends, createGroup } from '../lib/api'; 
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);
    const queryClient = useQueryClient();

    // 1. Tải danh sách bạn bè
    const { data: friends, isLoading: isLoadingFriends } = useQuery({
        queryKey: ['friends'],
        queryFn: getUsersFriends, 
    });

    // 2. Mutation để tạo nhóm
    const { mutate: createGroupMutation, isPending: isCreating } = useMutation({
        mutationFn: createGroup,
        onSuccess: (data) => {
            toast.success(`Đã tạo nhóm ${data.group.name}!`);
            queryClient.invalidateQueries({ queryKey: ['conversations'] }); // Làm mới ChatListPage
            onGroupCreated(data.channel.id); 
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Lỗi khi tạo nhóm");
        }
    });

    const handleToggleFriend = (id) => {
        setSelectedFriendIds(prev =>
            prev.includes(id) ? prev.filter(friendId => friendId !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!groupName.trim() || selectedFriendIds.length === 0) {
            toast.error("Tên nhóm và ít nhất 1 thành viên là bắt buộc.");
            return;
        }
        createGroupMutation({ name: groupName, memberIds: selectedFriendIds });
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h3 className="font-bold text-lg mb-4">Tạo Nhóm Chat Mới</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-control w-full mb-4">
                        <label className="label"><span className="label-text">Tên nhóm</span></label>
                        <input 
                            type="text" 
                            placeholder="Nhập tên nhóm..." 
                            className="input input-bordered w-full" 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>
                    
                    <label className="label"><span className="label-text">Mời bạn bè</span></label>
                    <div className="max-h-60 overflow-y-auto space-y-2 bg-base-200 p-2 rounded-lg">
                        {isLoadingFriends ? <div className="text-center p-4"><span className="loading loading-spinner"></span></div> : (
                            friends?.map(friend => (
                                <div 
                                    key={friend._id} 
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-base-100 cursor-pointer"
                                    onClick={() => handleToggleFriend(friend._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-10 h-10 rounded-full">
                                            <img src={friend.profilePic || '/default-avatar.png'} alt={friend.fullName} />
                                        </div>
                                        <span className="font-medium">{friend.fullName}</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="checkbox checkbox-primary" 
                                        checked={selectedFriendIds.includes(friend._id)}
                                        readOnly
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    <div className="modal-action mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={isCreating}>
                            {isCreating ? <span className="loading loading-spinner"></span> : "Tạo Nhóm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;