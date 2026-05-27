import React from 'react';
import { 
    Shield, 
    User as UserIcon, 
    Edit3, 
    Trash2, 
    ArrowUpCircle, 
    Search, 
    X, 
    ChevronLeft, 
    ChevronRight
} from 'lucide-react';

interface UsersTabProps {
    users: any[];
    isLoading: boolean;
    onViewDetail: (userId: number) => void;
    onUpdateBalance: (userId: number, currentBalance: number) => void;
    onToggleAdmin: (userId: number, currentStatus: boolean) => void;
    onDeleteUser: (userId: number) => void;
    
    // Pagination & Search
    page: number;
    limit: number;
    search: string;
    totalPages: number;
    totalUsers: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onSearch: (search: string) => void;
}

const AvatarImage: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
    const [error, setError] = React.useState(false);
    if (error) return (
        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center text-[#D4AF37] font-black border border-white/10 shadow-inner">
            {alt[0].toUpperCase()}
        </div>
    );
    return (
        <img
            src={src}
            alt={alt}
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl object-cover border border-[#D4AF37]/20 shadow-lg"
            onError={() => setError(true)}
        />
    );
};

const UsersTab: React.FC<UsersTabProps> = ({
    users,
    isLoading,
    onViewDetail,
    onUpdateBalance,
    onToggleAdmin,
    onDeleteUser,
    page,
    limit,
    search,
    totalPages,
    totalUsers,
    onPageChange,
    onLimitChange,
    onSearch
}) => {
    const [localSearch, setLocalSearch] = React.useState(search);

    React.useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localSearch);
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onSearch('');
    };

    const getPageRange = () => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l > 2) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    // Calculate item indexes being displayed
    const startIdx = totalUsers === 0 ? 0 : (page - 1) * limit + 1;
    const endIdx = Math.min(page * limit, totalUsers);

    return (
        <div className="space-y-6 animate-fade">
            {/* SEARCH AND LIMIT HEADER BLOCK */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[28px] glass-card">
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm thành viên (Tên hoặc Email)..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#D4AF37]/50 focus:bg-white/[0.08] pl-11 pr-10 py-3 rounded-2xl text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                    />
                    {localSearch && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </form>

                {/* Filter / Limit controls */}
                <div className="flex items-center justify-end gap-4 w-full md:w-auto shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">Hiển thị:</span>
                        <select
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors cursor-pointer"
                        >
                            <option value="10" className="bg-[#0B0B0D]">10 dòng</option>
                            <option value="25" className="bg-[#0B0B0D]">25 dòng</option>
                            <option value="50" className="bg-[#0B0B0D]">50 dòng</option>
                            <option value="100" className="bg-[#0B0B0D]">100 dòng</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-4 py-4 md:px-8 md:py-6 text-left text-[9px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-gray-500">Thành Viên</th>
                                <th className="px-4 py-4 md:px-8 md:py-6 text-left text-[9px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-gray-500 hidden sm:table-cell">Danh Tính</th>
                                <th className="px-4 py-4 md:px-8 md:py-6 text-right text-[9px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-gray-500">Tài Sản</th>
                                <th className="px-4 py-4 md:px-8 md:py-6 text-center text-[9px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-gray-500 hidden md:table-cell">Quyền Hạn</th>
                                <th className="px-4 py-4 md:px-8 md:py-6 text-right text-[9px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-gray-500">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-serif italic">Đang truy vấn kho lưu trữ...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20 text-gray-500 italic font-serif">
                                        Không tìm thấy thành viên nào khớp với tiêu chí tìm kiếm.
                                    </td>
                                </tr>
                            ) : users.map((u: any) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-3 md:px-8 md:py-5">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <AvatarImage src={u.picture_url} alt={u.username} />
                                            <div>
                                                <p className="font-bold text-white text-xs md:text-sm tracking-wide group-hover:text-[#D4AF37] transition-colors">
                                                    {u.username}
                                                </p>
                                                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-tighter">ID: #{u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 md:px-8 md:py-5 hidden sm:table-cell">
                                        <p className="text-gray-400 text-[11px] md:text-xs">{u.email}</p>
                                        <p className="text-[9px] text-gray-600 mt-0.5">Tham gia: {new Date(u.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-4 py-3 md:px-8 md:py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-base md:text-lg font-black tracking-tighter ${(u.token_balance ?? 0) > 0 ? 'gold-gradient-text' : 'text-gray-600'
                                                }`}>
                                                {Math.floor(u.token_balance ?? 0).toLocaleString()}
                                            </span>
                                            <span className="text-[8px] md:text-[9px] text-gray-500 uppercase font-bold tracking-widest">Tokens</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 md:px-8 md:py-5 text-center hidden md:table-cell">
                                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                            {u.is_admin ? (
                                                <span className="text-[10px] font-black text-[#D4AF37] flex items-center gap-1.5 uppercase tracking-widest">
                                                    <Shield size={10} /> Quản Trị
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-500 flex items-center gap-1.5 uppercase tracking-widest">
                                                    <UserIcon size={10} /> Thành Viên
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 md:px-8 md:py-5">
                                        <div className="flex items-center justify-end gap-1.5 md:gap-2">
                                            <button
                                                onClick={() => onViewDetail(u.id)}
                                                className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all"
                                                title="Chi tiết"
                                            >
                                                <Edit3 size={12} className="md:w-[14px] md:h-[14px]" />
                                            </button>
                                            <button
                                                onClick={() => onUpdateBalance(u.id, u.token_balance)}
                                                className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-green-400 hover:border-green-400/30 transition-all"
                                                title="Điều chỉnh tài sản"
                                            >
                                                <ArrowUpCircle size={12} className="md:w-[14px] md:h-[14px]" />
                                            </button>
                                            <button
                                                onClick={() => onToggleAdmin(u.id, !!u.is_admin)}
                                                className={`p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 transition-all ${u.is_admin ? 'text-purple-400 hover:text-gray-400' : 'text-gray-400 hover:text-purple-400'
                                                    }`}
                                                title={u.is_admin ? "Hạ cấp" : "Thăng cấp"}
                                            >
                                                <Shield size={12} className="md:w-[14px] md:h-[14px]" />
                                            </button>
                                            {!u.is_admin && (
                                                <button
                                                    onClick={() => onDeleteUser(u.id)}
                                                    className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Trục xuất"
                                                >
                                                    <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.01] border-t border-white/5 px-6 py-5 md:px-8 md:py-6">
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">
                            Hiển thị từ <span className="text-white font-black">{startIdx}</span> đến <span className="text-white font-black">{endIdx}</span> trong tổng số <span className="text-white font-black">{totalUsers}</span> thành viên
                        </span>
                        
                        <div className="flex items-center gap-1.5 md:gap-2">
                            {/* Prev page button */}
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page === 1}
                                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page numbers */}
                            {getPageRange().map((pNum, index) => {
                                if (pNum === '...') {
                                    return (
                                        <span key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xs select-none">
                                            ...
                                        </span>
                                    );
                                }
                                return (
                                    <button
                                        key={`page-${pNum}`}
                                        onClick={() => onPageChange(Number(pNum))}
                                        className={`w-8 h-8 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                            page === pNum
                                                ? "btn-gold text-black shadow-lg shadow-[#D4AF37]/20"
                                                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                                        }`}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}

                            {/* Next page button */}
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page === totalPages}
                                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersTab;
