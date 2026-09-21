const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const apiRequest = async (endpoint, method = 'GET', body = null) => {
    try {
        const headers = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Could not connect to the backend server. Is it running?' };
    }
};

const registerUser = (userData) => apiRequest('/auth/register', 'POST', userData);
const loginUser = (userData) => apiRequest('/auth/login', 'POST', userData);
const getProfile = () => apiRequest('/auth/profile');

const getNews = (category = '', search = '') => {
    let query = '';
    if (category && category !== 'All') query += `?category=${category}`;
    if (search) query += query ? `&search=${search}` : `?search=${search}`;
    return apiRequest(`/news${query}`);
};
const getArticle = (id) => apiRequest(`/news/${id}`);

const getPreferences = () => apiRequest('/preferences');
const addPreferences = (categories) => apiRequest('/preferences', 'POST', { categories });
const updatePreferences = (categories) => apiRequest('/preferences', 'PUT', { categories });

const getRecommendations = () => apiRequest('/recommendations');
const getDigest = () => apiRequest('/digest');

const getBookmarks = () => apiRequest('/bookmarks');
const addBookmark = (articleId) => apiRequest(`/bookmarks/${articleId}`, 'POST');
const removeBookmark = (articleId) => apiRequest(`/bookmarks/${articleId}`, 'DELETE');

const likeArticle = (articleId) => apiRequest(`/news/${articleId}/like`, 'POST');
const unlikeArticle = (articleId) => apiRequest(`/news/${articleId}/like`, 'DELETE');
const getLikeStatus = (articleId) => apiRequest(`/news/${articleId}/like-status`);

const getHistory = () => apiRequest('/history');
const addHistory = (articleId) => apiRequest(`/history/${articleId}`, 'POST');
const clearHistory = () => apiRequest('/history', 'DELETE');

// New AI & Analytics Endpoints
const getTranslation = (articleId, language) => apiRequest(`/news/${articleId}/translation?language=${language}`);
const updateProfileLanguage = (language) => apiRequest('/auth/profile/language', 'PUT', { language });
const getReadingAnalytics = () => apiRequest('/analytics/reading');
const getCategoryAnalytics = () => apiRequest('/analytics/categories');

const logout = () => {
    removeToken();
    window.location.href = 'login.html';
};

