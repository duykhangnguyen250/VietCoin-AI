export const BASE_URL = `http://${window.location.hostname}:2643/api/v1`;
export const API_ROOT = BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  checkAuth: async () => {
    const res = await fetch(`${BASE_URL}/auth/check`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },
  login: async (data: FormData) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: data,
    });
    if (!res.ok) throw res;
    return res.json();
  },
  register: async (data: FormData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: data,
    });
    if (!res.ok) throw res;
    return res.json();
  },
  getGoogleLoginUrl: async () => {
    const res = await fetch(`${BASE_URL}/auth/google/login`);
    const data = await res.json();
    return data.auth_url;
  },
  userProfileUpdate: async (data: any) => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload-file/upload/`, {
      method: 'POST',
      headers: getHeaders(), // Fix: was using 'token', now uses getHeaders() which uses 'access_token'
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Coin Identification
  predictCoin: async (formData: FormData) => {
    const res = await fetch(`${BASE_URL}/coin/predict`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    if (!res.ok) throw res;
    return res.json();
  },

  // Payment
  getPackages: async () => {
    const res = await fetch(`${BASE_URL}/payment/packages`, { headers: getHeaders() });
    return res.json();
  },
  createInvoice: async (packageId: number) => {
    const form = new FormData();
    form.append('package_id', packageId.toString());
    const res = await fetch(`${BASE_URL}/payment/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: form,
    });
    if (!res.ok) throw res;
    return res.json();
  },
  getPaymentStatus: async (paymentId: number) => {
    const res = await fetch(`${BASE_URL}/payment/status/${paymentId}`, { headers: getHeaders() });
    if (!res.ok) throw res;
    return res.json();
  },
  markPaymentFailed: async (paymentId: number) => {
    const res = await fetch(`${BASE_URL}/payment/${paymentId}/fail`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw res;
    return res.json();
  },
  createPaymentReport: async (paymentId: number, description: string) => {
    const form = new FormData();
    form.append('payment_id', paymentId.toString());
    form.append('description', description);
    const res = await fetch(`${BASE_URL}/payment/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: form,
    });
    if (!res.ok) throw res;
    return res.json();
  },
 
  claimGameTokens: async (payload: { game_type: string; reward_amount: number; description: string }) => {
    const res = await fetch(`${BASE_URL}/coin/claim-game-tokens`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw res;
    return res.json();
  },
 
  getConfig: async () => {
    const res = await fetch(`${BASE_URL}/admin/config`);
    return res.json();
  },

  // Admin Endpoints
  adminGetUsers: async (page?: number, limit?: number, search?: string) => {
    let url = `${BASE_URL}/admin/users`;
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (search !== undefined && search !== '') params.append('search', search);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },
  adminGetUserDetail: async (userId: number) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, { headers: getHeaders() });
    return res.json();
  },
  adminUpdateUser: async (userId: number, data: any) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  adminDeleteUser: async (userId: number) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Xóa thất bại");
    }
    return res.json();
  },
  adminUpdateBalance: async (userId: number, data: any) => {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/balance`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  adminGetPackages: async () => {
    const res = await fetch(`${BASE_URL}/admin/packages`, { headers: getHeaders() });
    return res.json();
  },
  adminCreatePackage: async (data: any) => {
    const res = await fetch(`${BASE_URL}/admin/packages`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  adminUpdatePackage: async (packageId: number, data: any) => {
    const res = await fetch(`${BASE_URL}/admin/packages/${packageId}`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  adminDeletePackage: async (packageId: number) => {
    const res = await fetch(`${BASE_URL}/admin/packages/${packageId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
  adminGetTokenHistory: async () => {
    const res = await fetch(`${BASE_URL}/admin/token-history`, { headers: getHeaders() });
    return res.json();
  },
  getTokenHistory: async () => {
    const res = await fetch(`${BASE_URL}/auth/history`, { headers: getHeaders() });
    return res.json();
  },
  adminGetPayments: async () => {
    const res = await fetch(`${BASE_URL}/admin/payments`, { headers: getHeaders() });
    return res.json();
  },
  adminGetSettings: async () => {
    const res = await fetch(`${BASE_URL}/admin/settings`, { headers: getHeaders() });
    return res.json();
  },
  adminUpdateSettings: async (data: any) => {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Không thể lưu cấu hình");
    }
    return res.json();
  },
  adminUploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/admin/upload-logo`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    });
    return res.json();
  },
  adminGetLogins: async () => {
    const res = await fetch(`${BASE_URL}/admin/logins`, { headers: getHeaders() });
    return res.json();
  },
  adminGetReports: async () => {
    const res = await fetch(`${BASE_URL}/admin/reports`, { headers: getHeaders() });
    return res.json();
  },
  adminUpdateReportStatus: async (id: number, status: string) => {
    const res = await fetch(`${BASE_URL}/admin/reports/${id}/status`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
