import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersFriends, addMembersToGroup, removeMemberFromGroup } from '../lib/api'; 
import toast from 'react-hot-toast';
import { X, Trash2, UserPlus } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser.js';

const ManageGroupModal = ({ channel, onClose }) => {
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();
    const [tab, setTab] = useState('members'); 
    
    // 1. Lấy dữ liệu
    const currentMembers = Object.values(channel.state.members);
    const groupId = channel.id;
    // const isAdmin = authUser._id === channel.data.created_by_id; // Không cần check lại

    // 2. Tải danh sách bạn bè
    const { data: friends, isLoading: isLoadingFriends } = useQuery({
        queryKey: ['friends'],
        queryFn: getUsersFriends,
    });

    // 3. Lọc bạn bè chưa có trong nhóm
    const friendsToInvite = useMemo(() => {
        if (!friends) return [];
        const memberIds = new Set(currentMembers.map(m => m.user_id));
        return friends.filter(friend => !memberIds.has(friend._id));
    }, [friends, currentMembers]);

    // 4. Mutation Mời thành viên
    const { mutate: inviteMutation, isPending: isInviting } = useMutation({
        mutationFn: (memberIds) => addMembersToGroup(groupId, memberIds),
        onSuccess: () => {
            toast.success("Đã gửi lời mời!");
        },
        onError: (err) => toast.error(err.response?.data?.error || "Lỗi mời thành viên"),
    });
    
    // 5. Mutation Xóa thành viên
    const { mutate: removeMutation, isPending: isRemoving } = useMutation({
        mutationFn: (memberId) => removeMemberFromGroup(groupId, memberId),
        onSuccess: () => {
            toast.success("Đã xóa thành viên.");
            queryClient.invalidateQueries({ queryKey: ['conversations'] }); 
        },
        onError: (err) => toast.error(err.response?.data?.error || "Lỗi xóa thành viên"),
    });

    // --- Handlers ---
    const handleInvite = (friendId) => {
        inviteMutation([friendId]);
    };
    
    const handleRemove = (memberId) => {
        if (memberId === authUser._id) {
            toast.error("Bạn không thể tự xóa chính mình.");
            return;
        }
        confirmAction(`Xóa người dùng này khỏi nhóm?`, () => {
            removeMutation(memberId);
        });
    };
    
    const confirmAction = (message, onConfirm) => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-2">
                <p className="font-medium">{message}</p>
                <div className="flex gap-2 justify-end w-full">
                    <button onClick={() => toast.dismiss(t.id)} className="btn btn-xs">Hủy</button>
                    <button onClick={() => { onConfirm(); toast.dismiss(t.id); }} className="btn btn-xs btn-error text-white">Xóa</button>
                </div>
            </div>
        ));
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h3 className="font-bold text-lg mb-4">Quản lý Nhóm</h3>

                <div className="tabs tabs-boxed mb-4">
                    <a className={`tab ${tab === 'members' ? 'tab-active' : ''}`} onClick={() => setTab('members')}>Thành viên ({currentMembers.length})</a> 
                    <a className={`tab ${tab === 'invite' ? 'tab-active' : ''}`} onClick={() => setTab('invite')}>Mời (Bạn bè)</a> 
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {tab === 'members' && (
                        <div className="space-y-2">
                            {currentMembers.map(member => (
                                <div key={member.user_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-10 h-10 rounded-full">
                                            <img src={member.user.image || '/default-avatar.png'} alt={member.user.name} />
                                        </div>
                                        <span className="font-medium">{member.user.name} {member.user_id === authUser._id && "(Bạn)"}</span>
                                        {member.role === 'admin' && <span className="badge badge-primary badge-sm">Admin</span>}
                                    </div>
                                    
                                    {/* 🟢 SỬA LỖI: Bỏ check 'isAdmin', chỉ check không phải chính mình */}
                                    {member.user_id !== authUser._id && (
                                        <button 
                                            className="btn btn-xs btn-ghost text-error" 
                                            onClick={() => handleRemove(member.user_id)}
                                            disabled={isRemoving}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'invite' && (
                        <div className="space-y-2">
                            {isLoadingFriends ? <div className="text-center p-4"><span className="loading loading-spinner"></span></div> : (
                                friendsToInvite.map(friend => (
                                    <div key={friend._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar w-10 h-10 rounded-full">
                                                <img src={friend.profilePic || '/default-avatar.png'} alt={friend.fullName} />
                                            </div>
                                            <span className="font-medium">{friend.fullName}</span>
                                        </div>
                                        <button 
                                            className="btn btn-xs btn-primary" 
                                            onClick={() => handleInvite(friend._id)}
                                            disabled={isInviting}
                                        >
                                            <UserPlus size={16} /> Mời
                                        </button>
                                    </div>
                                ))
                            )}
                            {friendsToInvite.length === 0 && !isLoadingFriends && <p className="text-sm text-center p-4">Tất cả bạn bè đã ở trong nhóm.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageGroupModal;