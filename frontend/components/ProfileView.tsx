import React, { useState, useEffect } from 'react';
import { User, View } from '../types';
import { api } from '../api';
import toast from 'react-hot-toast';
import { promptInput } from '../utils/swal';

import ProfileInfoCard from './profile/ProfileInfoCard';
import ProfileHistoryTable from './profile/ProfileHistoryTable';
import TransactionDetailModal from './profile/TransactionDetailModal';

interface ProfileViewProps {
    user: User;
    onUpdateUser?: (user: User) => void;
    onViewChange?: (view: View) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onViewChange }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<any | null>(null);

    const fetchHistory = async () => {
        try {
            const data = await api.getTokenHistory();
            setHistory(data.history);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();

        // 🔥 LISTEN EVENT UPDATE TOKEN
        const handleUpdate = () => {
            fetchHistory();
        };

        window.addEventListener("update_user", handleUpdate);

        return () => {
            window.removeEventListener("update_user", handleUpdate);
        };
    }, []);

    const handleUpdateFullName = async () => {
        const newName = await promptInput('Cập nhật Họ tên', 'Nhập họ tên mới của bạn:', user.full_name || '');
        if (newName) {
            try {
                await api.userProfileUpdate({ full_name: newName });
                toast.success('Hồ sơ đã được cập nhật.');
                if (onUpdateUser) {
                    const updatedUser = { ...user, full_name: newName };
                    onUpdateUser(updatedUser);
                }
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    const handleUpdateAvatar = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const toastId = toast.loading('Đang tải ảnh lên...');
                try {
                    const uploadRes = await api.uploadFile(file);
                    if (uploadRes.filename) {
                        import('../api').then(async ({ API_ROOT }) => {
                            const newAvatarUrl = `${API_ROOT}/upload-file/view/${uploadRes.filename}`;
                            await api.userProfileUpdate({ picture_url: newAvatarUrl });
                            toast.success('Ảnh đại diện đã được cập nhật.', { id: toastId });

                            if (onUpdateUser) {
                                const updatedUser = { ...user, picture_url: newAvatarUrl };
                                onUpdateUser(updatedUser);
                            }
                        });
                    } else {
                        toast.error('Lỗi khi tải ảnh lên', { id: toastId });
                    }
                } catch (err: any) {
                    toast.error(err.message, { id: toastId });
                }
            }
        };
        input.click();
    };

    const handleChangePassword = async () => {
        const currentPassword = await promptInput('Đổi Mật Khẩu', 'Nhập mật khẩu hiện tại (bỏ trống nếu dùng Google):', '', 'password');
        const newPassword = await promptInput('Đổi Mật Khẩu', 'Nhập mật khẩu mới (tối thiểu 6 ký tự):', '', 'password');

        if (newPassword) {
            try {
                await api.userProfileUpdate({ current_password: currentPassword, new_password: newPassword });
                toast.success('Mật khẩu đã được thay đổi thành công.');
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    return (
        <div className="relative min-h-screen">


            <div className="p-8 md:p-12 max-w-7xl mx-auto w-full animate-fade">
                <header className="mb-12">
                    <h2 className="text-4xl font-cinzel font-black gold-gradient-text tracking-[2px]">
                        KHÔNG GIAN TÀI KHOẢN
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[4px] mt-1 font-bold">
                        Quản lý danh tính & Lịch sử giám định tiền cổ
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1">
                        <ProfileInfoCard
                            user={user}
                            onUpdateFullName={handleUpdateFullName}
                            onUpdateAvatar={handleUpdateAvatar}
                            onChangePassword={handleChangePassword}
                            onChargeClick={() => onViewChange?.('payment')}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <ProfileHistoryTable
                            history={history}
                            isLoading={isLoading}
                            onViewTx={setSelectedTx}
                        />
                    </div>
                </div>
            </div>

            {selectedTx && (
                <TransactionDetailModal
                    tx={selectedTx}
                    onClose={() => setSelectedTx(null)}
                />
            )}
        </div>
    );
};

export default ProfileView;
