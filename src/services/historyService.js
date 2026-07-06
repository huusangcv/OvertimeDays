// src/services/historyService.js
// Quản lý lịch sử in biểu tăng ca bằng LocalStorage

const HISTORY_KEY = 'overtime-history';

/**
 * Lưu 1 bản ghi vào lịch sử
 * @param {Object} snapshotData
 */
export function saveHistory(snapshotData) {
  try {
    const history = getRawHistory();
    // Thêm vào đầu mảng (mới nhất lên trên)
    const newHistory = [snapshotData, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử:', error);
    return false;
  }
}

/**
 * Lấy lịch sử của 1 bộ phận (đã lọc theo departmentId)
 * @param {string} departmentId
 * @returns {Array} Mảng các bản ghi
 */
export function getHistory(departmentId) {
  const history = getRawHistory();
  return history.filter((item) => item.departmentId === departmentId);
}

/**
 * Xóa 1 bản ghi lịch sử
 * @param {string} id
 */
export function deleteHistory(id) {
  try {
    const history = getRawHistory();
    const newHistory = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử:', error);
    return false;
  }
}

/**
 * Xóa toàn bộ lịch sử của 1 bộ phận
 * @param {string} departmentId
 */
export function clearHistory(departmentId) {
  try {
    const history = getRawHistory();
    // Giữ lại những bản ghi KHÔNG thuộc bộ phận này
    const newHistory = history.filter((item) => item.departmentId !== departmentId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa tất cả lịch sử:', error);
    return false;
  }
}

/**
 * Hàm nội bộ: Lấy toàn bộ lịch sử từ LocalStorage
 */
function getRawHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Lỗi khi đọc lịch sử từ LocalStorage:', error);
    return [];
  }
}
