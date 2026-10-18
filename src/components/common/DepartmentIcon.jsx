// src/components/common/DepartmentIcon.jsx
// Hiển thị icon chuẩn Lucide cho 24 bộ phận với fallback an toàn
import React from 'react';
import {
  Cpu,
  CalendarDays,
  ChartNoAxesCombined,
  Settings,
  ClipboardList,
  Layers3,
  Wrench,
  Calculator,
  Drill,
  Gauge,
  ShieldCheck,
  HandHelping,
  HardHat,
  Flame,
  Layers,
  Warehouse,
  PackageCheck,
  Cog,
  ShoppingCart,
  Users,
  GraduationCap,
  Ruler,
  Factory,
  Building2,
  HelpCircle,
} from 'lucide-react';

export const LUCIDE_ICONS_MAP = {
  Cpu,
  CalendarDays,
  ChartNoAxesCombined,
  Settings,
  ClipboardList,
  Layers3,
  Wrench,
  Calculator,
  Drill,
  Gauge,
  ShieldCheck,
  HandHelping,
  HardHat,
  Flame,
  Layers,
  Warehouse,
  PackageCheck,
  Cog,
  ShoppingCart,
  Users,
  GraduationCap,
  Ruler,
  Factory,
  Building2,
  HelpCircle,
};

// Ánh xạ tên icon Lucide chuẩn cho 24 bộ phận
export const DEPARTMENT_ICON_NAMES = {
  'cong-nghe': 'Cpu',
  'sinh-quan': 'CalendarDays',
  'thong-ke': 'ChartNoAxesCombined',
  'post-processing': 'Settings',
  'pre-processing': 'ClipboardList',
  'nhung-ho': 'Layers3',
  'to-ky-thuat': 'Wrench',
  'ke-toan': 'Calculator',
  'taro': 'Drill',
  'van-cau': 'Gauge',
  'chat-luong': 'ShieldCheck',
  'ho-tro-san-xuat': 'HandHelping',
  'cong-trinh': 'HardHat',
  'furnace': 'Flame',
  'sap': 'Layers',
  'kho': 'Warehouse',
  'dong-goi': 'PackageCheck',
  'cnc': 'Cog',
  'thu-mua': 'ShoppingCart',
  'tong-vu': 'ClipboardList',
  'an-toan': 'HardHat',
  'nhan-su': 'Users',
  'lop-hoc': 'GraduationCap',
  'khuon': 'Ruler',
};

// Mô tả chuẩn theo chức năng thực tế của từng bộ phận
export const DEPARTMENT_DESCRIPTIONS = {
  'cong-nghe': 'Kỹ thuật công nghệ và hỗ trợ hệ thống sản xuất.',
  'sinh-quan': 'Quản lý kế hoạch, tiến độ và điều độ sản xuất.',
  'thong-ke': 'Tổng hợp sản lượng, dữ liệu và báo cáo.',
  'post-processing': 'Các công đoạn xử lý, hoàn thiện sau đúc.',
  'pre-processing': 'Các công đoạn chuẩn bị và xử lý trước khi hoàn thiện.',
  'nhung-ho': 'Nhúng hồ, rắc cát và tạo vỏ gốm.',
  'to-ky-thuat': 'Bảo trì, sửa chữa và hỗ trợ kỹ thuật thiết bị.',
  'ke-toan': 'Quản lý kế toán, tài chính và chi phí.',
  'taro': 'Gia công lỗ ren và taro chi tiết.',
  'van-cau': 'Gia công hoặc xử lý sản phẩm van cầu theo nhiệm vụ thực tế của bộ phận.',
  'chat-luong': 'Kiểm tra và kiểm soát chất lượng sản phẩm.',
  'ho-tro-san-xuat': 'Hỗ trợ vật tư và hoạt động sản xuất.',
  'cong-trinh': 'Thi công, sửa chữa và xây dựng.',
  'furnace': 'Nấu chảy hợp kim và rót kim loại.',
  'sap': 'Tạo mẫu sáp, lắp ráp cây sáp và sửa mẫu.',
  'kho': 'Quản lý nguyên liệu, vật tư và thành phẩm.',
  'dong-goi': 'Đóng gói, dán nhãn và chuẩn bị xuất hàng.',
  'cnc': 'Gia công cơ khí chính xác.',
  'thu-mua': 'Mua hàng và cung ứng.',
  'tong-vu': 'Hành chính và quản lý dịch vụ nội bộ.',
  'an-toan': 'An toàn lao động, phòng cháy chữa cháy và môi trường.',
  'nhan-su': 'Tuyển dụng, hồ sơ và quản trị nhân sự.',
  'lop-hoc': 'Đào tạo và hướng dẫn quy trình công việc.',
  'khuon': 'Chế tạo, hiệu chỉnh và bảo dưỡng khuôn.',
};

/**
 * Component hiển thị Icon cho Bộ phận:
 * - Ưu tiên render Lucide Icon component.
 * - Nếu icon trong DB là emoji, tự động ánh xạ theo deptId sang Lucide icon chuẩn.
 * - Tuyệt đối không hiển thị chuỗi tên raw như "Flame" hay "Settings".
 * - Fallback về Building2 nếu không tìm thấy.
 */
export default function DepartmentIcon({
  icon,
  deptId,
  size = 28,
  color = 'currentColor',
  strokeWidth = 2,
  style = {},
}) {
  // 1. Kiểm tra nếu `icon` chính là tên Lucide Icon (ví dụ 'Flame', 'Cpu'...)
  let IconComponent = icon && LUCIDE_ICONS_MAP[icon];

  // 2. Nếu không tìm thấy hoặc icon là emoji cũ, tra cứu theo deptId
  if (!IconComponent && deptId && DEPARTMENT_ICON_NAMES[deptId]) {
    const mappedName = DEPARTMENT_ICON_NAMES[deptId];
    IconComponent = LUCIDE_ICONS_MAP[mappedName];
  }

  // 3. Render Lucide Icon Component nếu có
  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        aria-hidden="true"
      />
    );
  }

  // 4. Nếu là emoji hợp lệ
  const isEmojiOrSymbol =
    typeof icon === 'string' &&
    icon.trim().length > 0 &&
    (icon.length <= 4 || /\p{Extended_Pictographic}/u.test(icon)) &&
    !/^[A-Za-z]+$/.test(icon.trim());

  if (isEmojiOrSymbol) {
    return (
      <span
        style={{
          fontSize: `${size}px`,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
        role="img"
      >
        {icon}
      </span>
    );
  }

  // 5. Fallback an toàn
  return (
    <Building2
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  );
}
