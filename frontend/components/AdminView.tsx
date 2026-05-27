import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { confirmDestructive, promptInput, promptTokenAdjustment } from '../utils/swal';
import { API_ROOT } from '../api';
import UsersTab from './admin/UsersTab';
import PackagesTab from './admin/PackagesTab';
import HistoryTab from './admin/HistoryTab';
import PaymentsTab from './admin/PaymentsTab';
import SettingsTab from './admin/SettingsTab';
import LoginsTab from './admin/LoginsTab';
import ReportsTab from './admin/ReportsTab';
import UserDetailModal from './admin/UserDetailModal';
const fixUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/api/v1")) {
    const origin = API_ROOT.replace("/api/v1", "");
    return `${origin}${url}`;
  }
  return url.startsWith("/") ? `${API_ROOT}${url}` : `${API_ROOT}/${url}`;
};
type AdminTab = 'users' | 'packages' | 'history' | 'payments' | 'settings' | 'logins' | 'reports';

const AdminView: React.FC = () => {

  const [activeTab, setActiveTab] = useState<AdminTab>(
    (localStorage.getItem('adminActiveTab') as AdminTab) || 'users'
  );

  const [paymentFilter, setPaymentFilter] = useState<'completed' | 'pending' | 'failed'>('completed');

  const [data, setData] = useState<any>({
    users: [], packages: [], history: [], payments: [],
    rate: 1.0, logins: [], reports: [],
    logo_url: '', background_url: '', site_title: '',
    seo_description: '', seo_keywords: '', seo_author: '',
    favicon_url: '', no_answer_fallback: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // States for Pagination and Search in Admin Users list
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);

  useEffect(() => {
    fetchData();
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab, usersPage, usersLimit, usersSearch]);

  // ================= FETCH =================
  const fetchData = async () => {
    setIsLoading(true);
    try {

      if (activeTab === 'users') {
        const res = await api.adminGetUsers(usersPage, usersLimit, usersSearch);
        setData((p: any) => ({ ...p, users: res?.users || [] }));
        setUsersTotalPages(res?.total_pages || 1);
        setUsersTotal(res?.total || 0);
      }

      else if (activeTab === 'packages') {
        const res = await api.adminGetPackages();
        setData((p: any) => ({ ...p, packages: res?.packages || [] }));
      }

      else if (activeTab === 'history') {
        const res = await api.adminGetTokenHistory();
        setData((p: any) => ({ ...p, history: res?.history || [] }));
      }

      else if (activeTab === 'payments') {
        const res = await api.adminGetPayments();
        setData((p: any) => ({ ...p, payments: res?.payments || [] }));
      }

      else if (activeTab === 'settings') {
        const res = await api.adminGetSettings();



        setData((p: any) => ({
          ...p,
          rate: Number(res.rate_per_1000),
          logo_url: fixUrl(res.logo_url),
          background_url: fixUrl(res.background_url),
          site_title: res.site_title,
          seo_description: res.seo_description,
          seo_keywords: res.seo_keywords,
          seo_author: res.seo_author,
          favicon_url: fixUrl(res.favicon_url),
          no_answer_fallback: res.no_answer_fallback
        }));
      }

      else if (activeTab === 'logins') {
        const res = await api.adminGetLogins();
        setData((p: any) => ({ ...p, logins: res?.logins || [] }));
      }

      else if (activeTab === 'reports') {
        const res = await api.adminGetReports();
        setData((p: any) => ({ ...p, reports: res?.reports || [] }));
      }

    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= USERS =================
  const handleViewUserDetail = async (userId: number) => {
    const res = await api.adminGetUserDetail(userId);
    setSelectedUserDetail(res);
  };

  const handleUpdateBalance = async (userId: number) => {
    const user = data.users.find((u: any) => u.id === userId);

    const adj = await promptTokenAdjustment('Điều chỉnh token', user?.username || '');

    if (adj) {
      await api.adminUpdateBalance(userId, {
        type: adj.type,     // "in" hoặc "out"
        amount: Number(adj.amount)
      });

      toast.success('Đã cập nhật');
      fetchData();
    }
  };

  const handleDeleteUser = async (id: number) => {
    const ok = await confirmDestructive("Xóa user", "Chắc chưa?");
    if (!ok) return;

    try {
      await api.adminDeleteUser(id);
      toast.success("Đã xóa");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa người dùng");
    }
  };

  const handleToggleAdmin = async (id: number, isAdmin: boolean) => {
    await api.adminUpdateUser(id, { is_admin: isAdmin ? 0 : 1 });
    fetchData();
  };

  // ================= PACKAGES =================
  const handleCreatePackage = async () => {
    const name = await promptInput("Tên gói", "");
    const tokens = await promptInput("Tokens", "");
    const amount = await promptInput("VNĐ", "");

    if (!name || !tokens || !amount) return;

    await api.adminCreatePackage({
      name,
      tokens: parseInt(tokens),
      amount_vnd: parseInt(amount)
    });

    fetchData();
  };

  const handleDeletePackage = async (id: number) => {
    await api.adminDeletePackage(id);
    fetchData();
  };

  const handleUpdatePackage = async (pkg: any) => {
    const name = await promptInput("Tên gói", pkg.name);
    const tokens = await promptInput("Tokens", pkg.tokens.toString());
    const amount = await promptInput("VNĐ", pkg.amount_vnd.toString());

    if (!name || !tokens || !amount) return;

    await api.adminUpdatePackage(pkg.id, {
      name,
      tokens: parseInt(tokens),
      amount_vnd: parseInt(amount)
    });

    fetchData();
  };

  // ================= SETTINGS =================
  const handleSaveSettings = async (e: any) => {
    e.preventDefault();
    try {
      const makeRelative = (url: string) => {
        if (!url) return "";
        if (url.includes("/api/v1/")) {
          return url.substring(url.indexOf("/api/v1/"));
        }
        return url;
      };

      const payload = {
        rate_per_1000: Number(data.rate),
        logo_url: makeRelative(data.logo_url),
        background_url: makeRelative(data.background_url),
        site_title: data.site_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords,
        seo_author: data.seo_author,
        favicon_url: makeRelative(data.favicon_url),
        no_answer_fallback: data.no_answer_fallback
      };

      await api.adminUpdateSettings(payload);
      toast.success("Lưu thành công ✅");
      
      // 🔥 TRIGGER UPDATE TOÀN APP
      window.dispatchEvent(new Event("update_config"));
      
      // 🔥 QUAN TRỌNG: Đợi 1 chút để DB cập nhật xong rồi mới fetch
      setTimeout(() => fetchData(), 500);

    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">


      <header className="px-4 py-4 md:px-8 md:py-6 glass-card border-b border-white/5 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-cinzel font-black gold-gradient-text tracking-[2px] flex items-center gap-3">
              <Shield className="text-[#D4AF37] w-5 h-5 md:w-6 md:h-6" />
              HỆ THỐNG QUẢN TRỊ
            </h2>
            <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-[2px] md:tracking-[3px] mt-1 font-bold">
              Bảng Điều Khiển VietCoin AI
            </p>
          </div>

          <div className="flex overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 gap-2 no-scrollbar">
            {(['users','packages','history','payments','settings','logins','reports'] as AdminTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab
                    ? "btn-gold shadow-lg shadow-[#D4AF37]/20 text-black"
                    : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {tab === 'users' ? 'Người Dùng' :
                 tab === 'packages' ? 'Gói Tokens' :
                 tab === 'history' ? 'Lịch Sử' :
                 tab === 'payments' ? 'Giao Dịch' :
                 tab === 'settings' ? 'Cấu Hình' :
                 tab === 'logins' ? 'Đăng Nhập' :
                 tab === 'reports' ? 'Báo Cáo' : tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6 md:space-y-8 z-0">

        {activeTab === 'users' && (
          <UsersTab
            users={data.users}
            isLoading={isLoading}
            onViewDetail={handleViewUserDetail}
            onUpdateBalance={handleUpdateBalance}
            onDeleteUser={handleDeleteUser}
            onToggleAdmin={handleToggleAdmin}
            page={usersPage}
            limit={usersLimit}
            search={usersSearch}
            totalPages={usersTotalPages}
            totalUsers={usersTotal}
            onPageChange={setUsersPage}
            onLimitChange={(lim) => { setUsersLimit(lim); setUsersPage(1); }}
            onSearch={(str) => { setUsersSearch(str); setUsersPage(1); }}
          />
        )}

        {activeTab === 'packages' && (
          <PackagesTab
            packages={data.packages}
            onCreatePackage={handleCreatePackage}
            onDeletePackage={handleDeletePackage}
            onUpdatePackage={handleUpdatePackage}
          />
        )}

        {activeTab === 'history' && <HistoryTab history={data.history} />}

        {activeTab === 'payments' && (
          <PaymentsTab
            payments={data.payments}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            data={data}
            onSave={handleSaveSettings}
            onChange={(e: any) =>
              setData((p: any) => ({ ...p, [e.target.name]: e.target.value }))
            }

            // 🔥 thêm đủ props
            onSync={() => fetchData()}

            onUploadLogo={async (file: File) => {
              const res = await api.adminUploadLogo(file);
              setData((p: any) => ({ ...p, logo_url: fixUrl(res.logo_url) }));
            }}

            onUploadFavicon={async (file: File) => {
              const res = await api.adminUploadLogo(file);
              setData((p: any) => ({ ...p, favicon_url: fixUrl(res.logo_url) }));
            }}

            onUploadBackground={async (file: File) => {
              const res = await api.adminUploadLogo(file);
              setData((p: any) => ({ ...p, background_url: fixUrl(res.logo_url) }));
            }}
          />
        )}

        {activeTab === 'logins' && <LoginsTab logins={data.logins} />}
        {activeTab === 'reports' && (
          <ReportsTab 
            reports={data.reports} 
            onUpdateStatus={async (id: number, status: string) => {
              await api.adminUpdateReportStatus(id, status);
              fetchData();
            }}
          />
        )}

      </div>

      {selectedUserDetail && (
        <UserDetailModal
          userDetail={selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
          onEditUser={() => {}}
          onViewChatDetail={() => {}}
        />
      )}

    </div>
  );
};

export default AdminView;
