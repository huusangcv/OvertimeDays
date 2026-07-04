// src/components/sidebar/SidebarPanel.jsx
import React, { memo } from 'react';
import Box from '@mui/material/Box';
import FormInfoSection from './FormInfoSection';
import EmployeeListSection from './EmployeeListSection';

/**
 * SidebarPanel – Fixed-width left sidebar Card
 * Composes FormInfoSection + EmployeeListSection
 */
const SidebarPanel = memo(function SidebarPanel({
  // Form info props
  otDate, setOtDate,
  otType, setOtType,
  selectedCount,
  // Employee list props
  activeTab, setActiveTab,
  filteredEmployees, employees,
  selectedIds,
  searchQuery, onSearchChange,
  onToggle, onToggleAll,
  onEdit, onDelete, onAdd,
}) {
  return (
    <Box
      component="aside"
      className="no-print"
      aria-label="Bảng điều khiển"
      sx={{
        width: 352,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <FormInfoSection
        otDate={otDate}
        setOtDate={setOtDate}
        otType={otType}
        setOtType={setOtType}
        selectedCount={selectedCount}
      />

      <EmployeeListSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredEmployees={filteredEmployees}
        employees={employees}
        selectedIds={selectedIds}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onToggle={onToggle}
        onToggleAll={onToggleAll}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onAdd}
      />
    </Box>
  );
});

export default SidebarPanel;
