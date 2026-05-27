import React from 'react';
import { ShieldCheck, Monitor, Globe } from 'lucide-react';

interface LoginsTabProps {
  logins: any[];
}

const LoginsTab: React.FC<LoginsTabProps> = ({ logins }) => {
  return (
    <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden animate-fade">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Thời Khắc</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Thành Viên</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Địa Chỉ IP</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[3px] text-gray-500">Công Cụ Truy Cập</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logins.length === 0 ? (
               <tr>
                <td colSpan={4} className="text-center py-24">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <ShieldCheck size={48} className="text-gray-500" />
                    <p className="text-gray-500 font-serif italic tracking-widest uppercase text-xs">Chưa có bản ghi đăng nhập nào.</p>
                  </div>
                </td>
              </tr>
            ) : logins.map((log: any) => (
              <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-5 whitespace-nowrap">
                   <p className="text-gray-300 font-medium text-xs">{new Date(log.created_at).toLocaleString()}</p>
                </td>
                <td className="px-8 py-5">
                   <p className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{log.username}</p>
                   <p className="text-[10px] text-gray-500">{log.email}</p>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                      <Globe size={12} className="text-gray-600" />
                      {log.ip_address}
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-[10px] text-gray-500 max-w-md">
                      <Monitor size={12} className="text-gray-600 shrink-0" />
                      <span className="truncate italic" title={log.user_agent}>{log.user_agent}</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginsTab;
