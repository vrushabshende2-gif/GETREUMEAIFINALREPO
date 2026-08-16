const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;
const USER_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user`;

// Custom wrapper to automate cross-site credentials transmission.
// The auth token lives in an httpOnly cookie — it is sent automatically
// with every request via credentials:'include'. No manual Authorization
// header is needed or used anywhere in this file.
const customFetch = async (url, options = {}) => {
  const mergedOptions = {
    ...options,
    credentials: 'include',
    headers: { ...options.headers },
  };
  return fetch(url, mergedOptions);
};

export const register = async (name, email, password) => {
  const response = await customFetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  localStorage.setItem('pendingEmail', email);
  return data;
};

export const verifyOTP = async (email, otp) => {
  const response = await customFetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }

  localStorage.removeItem('pendingEmail');
  return data;
};

export const resendOTP = async (email) => {
  const response = await customFetch(`${API_URL}/resend-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }

  return data;
};

export const login = async (email, password) => {
  const response = await customFetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.needsVerification) {
      localStorage.setItem('pendingEmail', data.email);
    }
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

export const logout = async () => {
  try {
    await customFetch(`${API_URL}/logout`, { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }
  // Token is in an httpOnly cookie — the server clears it above.
  // We only clear non-sensitive localStorage keys here.
  localStorage.removeItem('user');
  localStorage.removeItem('pendingEmail');
};

export const isAuthenticated = () => {
  // Relies on user object stored by AuthContext after successful login.
  // Token auth is cookie-based and invisible to JS.
  return !!localStorage.getItem('user');
};

export const getCurrentUser = async (options = {}) => {
  try {
    // Cookie is sent automatically; no Authorization header needed.
    const response = await customFetch(`${API_URL}/me`, options);

    if (!response.ok) {
      await logout();
      return null;
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') return null;
    await logout();
    return null;
  }
};

export const getAllUsers = async () => {
  const response = await customFetch(`${USER_API_URL}/all`);

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

export const getUserById = async (id) => {
  const response = await customFetch(`${USER_API_URL}/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
};

export const forgotPassword = async (email) => {
  const response = await customFetch(`${API_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.needsVerification) {
      localStorage.setItem('pendingEmail', data.email);
    }
    throw new Error(data.message || 'Failed to send reset OTP');
  }

  localStorage.setItem('pendingEmail', email);
  return data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await customFetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Password reset failed');
  }

  localStorage.removeItem('pendingEmail');
  return data;
};

// Profile Services
export const isLiveSession = () => {
  // Session is cookie-based; check user object as a proxy for active session.
  return !!localStorage.getItem('user');
};

export const getUserProfile = async (options = {}) => {
  const response = await customFetch(`${USER_API_URL}/profile`, options);

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
};

export const updateUserProfile = async (profileData) => {
  const response = await customFetch(`${USER_API_URL}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data;
};
