// src/pages/Landing/index.jsx
// Trang chọn bộ phận dạng TAB — Thiết kế công cụ nội bộ nhà máy: gọn, chắc, dễ đọc, không scroll dài.

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Landing.css';

import { getDepartments } from '../../services/departmentService';
import { DEPARTMENT_DESCRIPTIONS } from '../../components/common/DepartmentIcon';

// Cấu hình dự phòng 24 bộ phận mặc định
const FALLBACK_DEPARTMENTS = [
  { id: 'sap', code: 'SAP', name: 'Sáp', path: '/dept/sap', description: 'Tạo mẫu sáp, lắp ráp cây sáp và sửa mẫu.' },
  { id: 'nhung-ho', code: 'NH', name: 'Nhúng Hồ', path: '/dept/nhung-ho', description: 'Nhúng hồ, rắc cát và tạo vỏ gốm.' },
  { id: 'furnace', code: 'LO', name: 'Lò', path: '/furnace', description: 'Nấu chảy hợp kim và rót kim loại.' },
  { id: 'pre-processing', code: 'TXL', name: 'Trước Xử Lý', path: '/pre-processing', description: 'Các công đoạn chuẩn bị và xử lý trước khi hoàn thiện.' },
  { id: 'post-processing', code: 'HXL', name: 'Hậu Xử Lý', path: '/post-processing', description: 'Các công đoạn xử lý, hoàn thiện sau đúc.' },
  { id: 'van-cau', code: 'VC', name: 'Van Cầu', path: '/dept/van-cau', description: 'Gia công hoặc xử lý sản phẩm van cầu theo nhiệm vụ thực tế của bộ phận.' },
  { id: 'taro', code: 'TARO', name: 'Taro', path: '/dept/taro', description: 'Gia công lỗ ren và taro chi tiết.' },
  { id: 'cnc', code: 'CNC', name: 'CNC', path: '/dept/cnc', description: 'Gia công cơ khí chính xác.' },
  { id: 'chat-luong', code: 'QC', name: 'Chất Lượng', path: '/dept/chat-luong', description: 'Kiểm tra và kiểm soát chất lượng sản phẩm.' },
  { id: 'cong-nghe', code: 'CNG', name: 'Công Nghệ', path: '/dept/cong-nghe', description: 'Kỹ thuật công nghệ và hỗ trợ hệ thống sản xuất.' },
  { id: 'to-ky-thuat', code: 'TKT', name: 'Tổ Kỹ Thuật', path: '/dept/to-ky-thuat', description: 'Bảo trì, sửa chữa và hỗ trợ kỹ thuật thiết bị.' },
  { id: 'khuon', code: 'KHUON', name: 'Khuôn', path: '/dept/khuon', description: 'Chế tạo, hiệu chỉnh và bảo dưỡng khuôn.' },
  { id: 'ho-tro-san-xuat', code: 'HTSX', name: 'Hỗ Trợ Sản Xuất', path: '/dept/ho-tro-san-xuat', description: 'Hỗ trợ vật tư và hoạt động sản xuất.' },
  { id: 'cong-trinh', code: 'CT', name: 'Công Trình', path: '/dept/cong-trinh', description: 'Thi công, sửa chữa và xây dựng.' },
  { id: 'an-toan', code: 'AT', name: 'An Toàn', path: '/dept/an-toan', description: 'An toàn lao động, phòng cháy chữa cháy và môi trường.' },
  { id: 'kho', code: 'KHO', name: 'Kho', path: '/dept/kho', description: 'Quản lý nguyên liệu, vật tư và thành phẩm.' },
  { id: 'thu-mua', code: 'TM', name: 'Thu Mua', path: '/dept/thu-mua', description: 'Mua hàng và cung ứng.' },
  { id: 'dong-goi', code: 'DG', name: 'Đóng Gói', path: '/dept/dong-goi', description: 'Đóng gói sản phẩm, dán nhãn và chuẩn bị xuất hàng.' },
  { id: 'sinh-quan', code: 'SQ', name: 'Sinh Quản', path: '/dept/sinh-quan', description: 'Quản lý kế hoạch, tiến độ và điều độ sản xuất.' },
  { id: 'thong-ke', code: 'TK', name: 'Thống Kê', path: '/dept/thong-ke', description: 'Tổng hợp sản lượng, dữ liệu và báo cáo.' },
  { id: 'ke-toan', code: 'KT', name: 'Kế Toán', path: '/dept/ke-toan', description: 'Quản lý kế toán, tài chính và chi phí.' },
  { id: 'tong-vu', code: 'TV', name: 'Tổng Vụ', path: '/dept/tong-vu', description: 'Hành chính và quản lý dịch vụ nội bộ.' },
  { id: 'nhan-su', code: 'NS', name: 'Nhân Sự', path: '/dept/nhan-su', description: 'Tuyển dụng, hồ sơ và quản trị nhân sự.' },
  { id: 'lop-hoc', code: 'LH', name: 'Lớp Học', path: '/dept/lop-hoc', description: 'Đào tạo và hướng dẫn quy trình công việc.' },
];

// Cấu hình 6 nhóm bộ phận theo quy trình nhà máy
export const DEPARTMENT_GROUPS = [
  {
    id: 'casting',
    code: 'NHÓM 01',
    shortLabel: 'ĐÚC',
    title: 'Bộ phận Đúc',
    description: 'Quy trình tạo mẫu sáp, nhúng vỏ khuôn và đúc rót kim loại.',
    deptIds: ['sap', 'nhung-ho', 'furnace', 'pre-processing', 'post-processing'],
  },
  {
    id: 'machining',
    code: 'NHÓM 02',
    shortLabel: 'GIA CÔNG',
    title: 'Bộ phận Gia công',
    description: 'Gia công cơ khí, tiện, phay CNC và hoàn thiện chi tiết.',
    deptIds: ['van-cau', 'taro', 'cnc'],
  },
  {
    id: 'quality',
    code: 'NHÓM 03',
    shortLabel: 'CHẤT LƯỢNG',
    title: 'Chất lượng',
    description: 'Kiểm tra, đo lường và kiểm soát chất lượng sản phẩm (QC/KCS).',
    deptIds: ['chat-luong'],
  },
  {
    id: 'engineering',
    code: 'NHÓM 04',
    shortLabel: 'KỸ THUẬT',
    title: 'Kỹ thuật và Hỗ trợ Sản xuất',
    description: 'Công nghệ khuôn mẫu, cơ điện bảo trì và an toàn lao động.',
    deptIds: ['cong-nghe', 'to-ky-thuat', 'khuon', 'ho-tro-san-xuat', 'cong-trinh', 'an-toan'],
  },
  {
    id: 'logistics',
    code: 'NHÓM 05',
    shortLabel: 'KHO VẬN',
    title: 'Kho vận và Cung ứng',
    description: 'Quản lý kho nguyên vật liệu, thu mua và đóng gói xuất xưởng.',
    deptIds: ['kho', 'thu-mua', 'dong-goi'],
  },
  {
    id: 'management',
    code: 'NHÓM 06',
    shortLabel: 'VĂN PHÒNG',
    title: 'Văn phòng và Quản lý',
    description: 'Kế hoạch sản xuất, tài chính, nhân sự và hành chính.',
    deptIds: ['sinh-quan', 'thong-ke', 'ke-toan', 'tong-vu', 'nhan-su', 'lop-hoc'],
  },
];

const TAB_STORAGE_KEY = 'ot_landing_active_tab';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);

  // Khởi tạo tab từ query ?nhom= hoặc sessionStorage hoặc mặc định nhóm đầu tiên
  const [activeTab, setActiveTab] = useState(() => {
    const urlTab = searchParams.get('nhom');
    if (urlTab) return urlTab;
    try {
      const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
      if (saved) return saved;
    } catch (e) { }
    return DEPARTMENT_GROUPS[0].id;
  });

  // Tải danh sách bộ phận từ Firestore
  useEffect(() => {
    document.title = 'Hệ Thống Đăng Ký Tăng Ca – Kingdom Vietnam';

    let isMounted = true;
    async function fetchActiveDepts() {
      try {
        const remote = await getDepartments({ activeOnly: true });
        if (isMounted && remote && remote.length > 0) {
          const mapped = remote.map((d) => {
            let path = '/dept/' + d.id;
            if (d.id === 'furnace') path = '/furnace';
            else if (d.id === 'pre-processing') path = '/pre-processing';
            else if (d.id === 'post-processing') path = '/post-processing';

            return {
              id: d.id,
              path,
              name: d.name,
              description: DEPARTMENT_DESCRIPTIONS[d.id] || d.description || `Bộ phận ${d.name}`,
            };
          });
          setDepartments(mapped);
        }
      } catch (err) {
        console.warn('Could not load remote departments, using fallback:', err);
      }
    }

    fetchActiveDepts();
    return () => { isMounted = false; };
  }, []);

  // Gom nhóm các bộ phận theo cấu hình
  const groupedSections = useMemo(() => {
    const deptMap = new Map(departments.map((d) => [d.id, d]));
    const usedIds = new Set();

    const result = DEPARTMENT_GROUPS.map((group, gIdx) => {
      const items = [];
      group.deptIds.forEach((id, iIdx) => {
        if (deptMap.has(id)) {
          items.push({
            ...deptMap.get(id),
            itemCode: `${gIdx + 1}.${iIdx + 1}`,
          });
          usedIds.add(id);
        }
      });

      return {
        ...group,
        items,
        groupIndex: gIdx + 1,
      };
    }).filter((group) => group.items.length > 0);

    // Bổ sung các bộ phận chưa phân loại
    const otherItems = departments
      .filter((d) => !usedIds.has(d.id))
      .map((d, iIdx) => ({
        ...d,
        itemCode: `+.${iIdx + 1}`,
      }));

    if (otherItems.length > 0) {
      result.push({
        id: 'other',
        code: 'KHÁC',
        shortLabel: 'KHÁC',
        title: 'Bộ phận khác',
        description: 'Các bộ phận bổ sung trong hệ thống.',
        items: otherItems,
        groupIndex: result.length + 1,
      });
    }

    return result;
  }, [departments]);

  const totalGroups = groupedSections.length;
  const totalDepts = useMemo(() => {
    return groupedSections.reduce((sum, g) => sum + g.items.length, 0);
  }, [groupedSections]);

  // Đảm bảo activeTab luôn hợp lệ
  useEffect(() => {
    if (groupedSections.length > 0) {
      const exists = groupedSections.some((g) => g.id === activeTab);
      if (!exists) {
        setActiveTab(groupedSections[0].id);
      }
    }
  }, [groupedSections, activeTab]);

  // Chuyển tab và lưu vào sessionStorage + URL query
  const handleSelectTab = (groupId) => {
    setActiveTab(groupId);
    try {
      sessionStorage.setItem(TAB_STORAGE_KEY, groupId);
    } catch (e) { }
    setSearchParams({ nhom: groupId }, { replace: true });
  };

  // Nhóm đang được chọn
  const currentGroup = useMemo(() => {
    return groupedSections.find((g) => g.id === activeTab) || groupedSections[0] || null;
  }, [groupedSections, activeTab]);

  return (
    <div className="landing-page">
      <main className="landing-container">
        {/* Header */}
        <header className="landing-header">
          <div className="landing-header-meta">
            {totalGroups} nhóm · {totalDepts} bộ phận
          </div>
          <h1 className="landing-header-title">
            HỆ THỐNG ĐĂNG KÝ TĂNG CA
          </h1>
          <p className="landing-header-sub">
            Vui lòng chọn bộ phận để tiếp tục.
          </p>
        </header>

        {/* Thanh Tab chuyển nhóm */}
        <div className="landing-tab-bar" role="tablist" aria-label="Danh sách nhóm bộ phận">
          {groupedSections.map((group) => {
            const isSelected = group.id === currentGroup?.id;
            return (
              <button
                key={group.id}
                role="tab"
                type="button"
                id={`tab-${group.id}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${group.id}`}
                tabIndex={isSelected ? 0 : -1}
                className="landing-tab-btn"
                onClick={() => handleSelectTab(group.id)}
              >
                <span>{group.shortLabel || group.title}</span>
                <span className="landing-tab-count">{group.items.length}</span>
              </button>
            );
          })}
        </div>

        {/* Nội dung tab đang chọn */}
        {currentGroup && (
          <div
            key={currentGroup.id}
            id={`tabpanel-${currentGroup.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${currentGroup.id}`}
            className="landing-tabpanel"
          >
            {/* Cột trái */}
            <div className="landing-left-col">
              <div className="landing-group-label">
                {currentGroup.code || `NHÓM ${String(currentGroup.groupIndex).padStart(2, '0')}`}
              </div>
              <h2 className="landing-group-title">
                {currentGroup.title}
              </h2>
              <p className="landing-group-desc">
                {currentGroup.description}
              </p>
              <div className="landing-group-count">
                {currentGroup.items.length} bộ phận
              </div>
            </div>

            {/* Cột phải: Panel danh sách */}
            <div className="landing-right-col">
              <div className="landing-panel" role="list">
                {currentGroup.items.map((dept) => (
                  <a
                    key={dept.id}
                    href={dept.path}
                    className="landing-row"
                    role="listitem"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(dept.path);
                    }}
                  >
                    {/* 1) Mã mono 13px */}
                    <span className="landing-dept-code">
                      {dept.itemCode}
                    </span>

                    {/* 2) Khối chữ: Tên 18px/600 + Mô tả 14px */}
                    <div className="landing-dept-info">
                      <span className="landing-dept-name-wrap">
                        <span className="landing-dept-name">
                          {dept.name}
                        </span>
                      </span>
                      <span className="landing-dept-desc">
                        {dept.description}
                      </span>
                    </div>

                    {/* 3) Nút giả Vào hệ thống + mũi tên SVG 16px */}
                    <span className="landing-btn" tabIndex={-1}>
                      Vào hệ thống
                      <svg
                        className="landing-btn-arrow"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="landing-footer">
          <span>Kingdom Vietnam · Hệ thống quản lý tăng ca nội bộ</span>
          <a href="/admin/login" className="landing-admin-link">
            Quản trị hệ thống
          </a>
        </footer>
      </main>
    </div>
  );
}
