import React from 'react';
import { API_ROOT } from '../../api';
import { Globe, RefreshCw, Upload, Image as ImageIcon, Type, Link as LinkIcon, MessageSquare, Save, Palette } from 'lucide-react';

interface SettingsTabProps {
   data: any;
   onSave: (e: React.FormEvent) => void;
   onSync: () => void;
   onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
   onUploadLogo: (file: File) => Promise<void>;
   onUploadFavicon: (file: File) => Promise<void>;
   onUploadBackground: (file: File) => Promise<void>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
   data,
   onSave,
   onSync,
   onChange,
   onUploadLogo,
   onUploadFavicon,
   onUploadBackground
}) => {
   return (
      <div className="space-y-8 animate-fade pb-20">
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-2xl font-cinzel font-black gold-gradient-text tracking-[2px]">CẤU HÌNH HỆ THỐNG</h2>
               <p className="text-[10px] text-gray-500 uppercase tracking-[3px] mt-1 font-bold">Quản lý thông tin và diện mạo ứng dụng</p>
            </div>
            <button
               type="button"
               onClick={onSync}
               className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-[2px] hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all"
            >
               <RefreshCw size={14} />
               Làm mới dữ liệu
            </button>
         </div>

         <form onSubmit={onSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: IDENTITY */}
            <div className="lg:col-span-8 space-y-8">
               <div className="glass-card p-10 rounded-[40px] border border-white/5 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Type size={18} />
                     </div>
                     <h3 className="text-lg font-bold text-white tracking-wide">Thông Tin & SEO</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block">Tiêu Đề Trang Web (SEO Title)</label>
                        <div className="relative">
                           <input
                              name="site_title"
                              value={data.site_title || ''}
                              onChange={onChange}
                              className="w-full premium-input premium-input-icon h-14"
                              placeholder="VietCoin AI - Giám định tiền cổ Việt Nam"
                           />
                           <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block">Tác Giả / Đơn Vị Phát Hành</label>
                        <div className="relative">
                           <input
                              name="seo_author"
                              value={data.seo_author || ''}
                              onChange={onChange}
                              className="w-full premium-input premium-input-icon h-14"
                              placeholder="VietCoin AI Team"
                           />
                           <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block">Mô Tả Ứng Dụng (SEO Description)</label>
                     <textarea
                        name="seo_description"
                        value={data.seo_description || ''}
                        onChange={onChange}
                        rows={3}
                        className="w-full premium-input p-5 min-h-[120px] resize-none"
                        placeholder="Hệ thống trí tuệ nhân tạo chuyên sâu về giám định tiền cổ..."
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block">Từ Khóa Tìm Kiếm (Keywords)</label>
                     <input
                        name="seo_keywords"
                        value={data.seo_keywords || ''}
                        onChange={onChange}
                        className="w-full premium-input h-14"
                        placeholder="tiền cổ, xu cổ, triều đại việt nam, giám định..."
                     />
                  </div>
               </div>

               <div className="glass-card p-10 rounded-[40px] border border-white/5 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <MessageSquare size={18} />
                     </div>
                     <h3 className="text-lg font-bold text-white tracking-wide">Cấu Hình Trí Tuệ Nhân Tạo</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block">Định Mức Tiêu Hao (Rate / 1k Tokens)</label>
                        <div className="relative">
                           <input
                              name="rate"
                              type="number"
                              step="0.01"
                              value={data.rate || 0}
                              onChange={onChange}
                              className="w-full premium-input premium-input-icon h-14 font-black text-[#D4AF37]"
                           />
                           <RefreshCw size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block">Nội dung phản hồi khi không nhận diện được xu</label>
                     <textarea
                        name="no_answer_fallback"
                        value={data.no_answer_fallback || ''}
                        onChange={onChange}
                        rows={3}
                        className="w-full premium-input p-5 min-h-[120px] resize-none"
                        placeholder="Lời cáo lỗi khi hệ thống không thể định danh mẫu vật..."
                     />
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: VISUALS */}
            <div className="lg:col-span-4 space-y-8">
               <div className="glass-card p-10 rounded-[40px] border border-white/5 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>

                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                        <Palette size={18} />
                     </div>
                     <h3 className="text-lg font-bold text-white tracking-wide">Giao Diện Ứng Dụng</h3>
                  </div>

                  {/* LOGO */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block text-center">Biểu Tượng (Logo)</label>
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center p-4 relative group shadow-2xl">
                           {data.logo_url ? (
                              <img src={data.logo_url} className="w-full h-full object-contain" alt="Logo" />
                           ) : <ImageIcon size={32} className="text-gray-700" />}
                           <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                              <Upload size={24} className="text-white" />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onUploadLogo(e.target.files[0])} />
                           </label>
                        </div>
                        <input
                           name="logo_url"
                           value={data.logo_url || ''}
                           onChange={onChange}
                           className="w-full premium-input h-10 text-[10px] px-3 text-center"
                           placeholder="Đường dẫn biểu tượng..."
                        />
                     </div>
                  </div>

                  {/* BACKGROUND */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block text-center">Hình Nền Hệ Thống</label>
                     <div className="w-full h-32 rounded-2xl bg-black/40 border border-white/10 overflow-hidden relative group shadow-2xl">
                        {data.background_url ? (
                           <img src={data.background_url} className="w-full h-full object-cover" alt="BG" />
                        ) : <div className="w-full h-full flex items-center justify-center text-gray-700 font-serif italic text-xs">Chưa có hình nền</div>}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                           <Upload size={24} className="text-white" />
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onUploadBackground(e.target.files[0])} />
                        </label>
                     </div>
                     <input
                        name="background_url"
                        value={data.background_url || ''}
                        onChange={onChange}
                        className="w-full premium-input h-10 text-[10px] px-3 text-center"
                        placeholder="Đường dẫn hình nền..."
                     />
                  </div>

                  {/* FAVICON */}
                  <div className="space-y-4 pt-4 border-t border-white/5 text-center">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] block">Biểu Tượng Tab (Favicon)</label>
                     <div className="justify-center flex">
                        <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center relative group shadow-2xl">
                           {data.favicon_url ? (
                              <img src={data.favicon_url} className="w-8 h-8 object-contain" alt="Fav" />
                           ) : <ImageIcon size={16} className="text-gray-700" />}
                           <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                              <Upload size={16} className="text-white" />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onUploadFavicon(e.target.files[0])} />
                           </label>
                        </div>
                     </div>
                  </div>

                  <button
                     type="submit"
                     className="w-full btn-premium btn-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[3px] shadow-2xl mt-10"
                  >
                     <Save size={18} />
                     Lưu Cấu Hình
                  </button>
               </div>
            </div>
         </form>
      </div>
   );
};

export default SettingsTab;
