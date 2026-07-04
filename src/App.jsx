// src/App.jsx
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import './index.css';
import { useEmployeeManager } from './hooks/useEmployeeManager';

import AppShell from './components/layout/AppShell';
import SidebarPanel from './components/sidebar/SidebarPanel';
import PreviewPanel from './components/preview/PreviewPanel';
import EmployeeFormDialog from './components/dialogs/EmployeeFormDialog';
import ConfirmDialog from './components/dialogs/ConfirmDialog';

function App() {
  const {
    // state
    employees,
    selectedIds,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    otDate, setOtDate,
    otType, setOtType,
    otTimes, setEmployeeTime,
    otHistory, saveHistory, loadHistory, deleteHistory,
    modalOpen,
    editingId,
    modalData, setModalData,
    confirmOpen,
    deletingId,
    snackbar, closeSnackbar,
    // derived
    filteredEmployees,
    isSun,
    getDateStr,
    deptName,
    selArr,
    // handlers
    toggleEmp,
    toggleAll,
    requestDelete,
    confirmDelete,
    cancelDelete,
    openAdd,
    openEdit,
    closeModal,
    saveEmp,
    doPrint,
    resetSelection,
  } = useEmployeeManager();

  const dateStr = getDateStr();

  // Name of the employee being deleted (for confirmation message)
  const deletingEmployee = deletingId ? employees.find(e => e.id === deletingId) : null;

  return (
    <>
      <AppShell
        topBarProps={{
          onPrint: doPrint,
          onReset: resetSelection,
          selectedCount: selectedIds.size,
        }}
        sidebar={
          <SidebarPanel
            // Form info
            otDate={otDate}
            setOtDate={setOtDate}
            otType={otType}
            setOtType={setOtType}
            selectedCount={selectedIds.size}
            // Employee list & History
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredEmployees={filteredEmployees}
            employees={employees}
            selectedIds={selectedIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggle={toggleEmp}
            onToggleAll={toggleAll}
            onEdit={openEdit}
            onDelete={requestDelete}
            onAdd={openAdd}
            otHistory={otHistory}
            loadHistory={loadHistory}
            deleteHistory={deleteHistory}
          />
        }
      >
        <PreviewPanel
          selArr={selArr}
          isSun={isSun}
          dateStr={dateStr}
          deptName={deptName}
          onPrint={doPrint}
          onSave={saveHistory}
          otTimes={otTimes}
          setEmployeeTime={setEmployeeTime}
        />
      </AppShell>

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={modalOpen}
        editingId={editingId}
        modalData={modalData}
        onChange={setModalData}
        onSave={saveEmp}
        onClose={closeModal}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xóa nhân viên"
        description={
          deletingEmployee
            ? `Bạn có chắc chắn muốn xóa nhân viên "${deletingEmployee.name}" (${deletingId})? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa nhân viên này không?'
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Snackbar Toast Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2400}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.875rem',
            minWidth: 240,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
