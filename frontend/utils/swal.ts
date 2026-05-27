import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Common styles for premium gold theme
const premiumTheme = {
  background: '#1A1A20',
  color: '#D4AF37',
  confirmButtonColor: '#D4AF37',
  cancelButtonColor: '#4b5563',
  customClass: {
    popup: 'border border-[#D4AF37]/30 rounded-[24px] shadow-2xl',
    title: 'font-cinzel font-black gold-gradient-text tracking-wide',
    confirmButton: 'rounded-xl font-black uppercase tracking-widest text-[10px] text-black px-6 py-3',
    cancelButton: 'rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-3'
  }
};

export const confirmDestructive = async (title: string, text: string) => {
  const result = await MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận xóa',
    cancelButtonText: 'Hủy bỏ',
    ...premiumTheme,
    confirmButtonColor: '#ef4444',
  });
  return result.isConfirmed;
};

export const promptInput = async (title: string, text: string, defaultValue: string = '', type: any = 'text') => {
  const result = await MySwal.fire({
    title,
    text,
    input: type === 'password' ? 'password' : 'text',
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonText: 'Lưu thay đổi',
    cancelButtonText: 'Hủy bỏ',
    ...premiumTheme,
  });
  return result.isConfirmed ? result.value : null;
};

export const promptTokenAdjustment = async (title: string, username: string) => {
  const result = await MySwal.fire({
    title,
    html: `
      <div class="space-y-4 mt-4">
         <p class="text-sm text-gray-400">Điều chỉnh Token cho thành viên <b class="text-white">${username}</b></p>
         <div class="flex gap-4 justify-center my-4">
           <label class="flex items-center gap-2 cursor-pointer text-green-400">
             <input type="radio" name="swal-token-type" value="in" checked class="accent-green-500 w-4 h-4"> Cộng thêm
           </label>
           <label class="flex items-center gap-2 cursor-pointer text-red-400">
             <input type="radio" name="swal-token-type" value="out" class="accent-red-500 w-4 h-4"> Trừ đi
           </label>
         </div>
         <input id="swal-token-amount" type="number" min="1" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" placeholder="Nhập số lượng token..." />
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Thực thi',
    cancelButtonText: 'Hủy bỏ',
    ...premiumTheme,
    preConfirm: () => {
      const typeInput = document.querySelector('input[name="swal-token-type"]:checked') as HTMLInputElement;
      const amountInput = document.getElementById('swal-token-amount') as HTMLInputElement;
      if (!amountInput.value || parseInt(amountInput.value) <= 0) {
        MySwal.showValidationMessage('Vui lòng nhập số lượng hợp lệ lớn hơn 0');
        return false;
      }
      return {
        type: typeInput.value,
        amount: parseInt(amountInput.value)
      };
    }
  });

  return result.isConfirmed ? result.value : null;
};