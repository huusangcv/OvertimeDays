// src/components/preview/PreviewPanel.jsx
import React, { memo, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import PreviewToolbar from './PreviewToolbar';
import DocumentSheet from './DocumentSheet';

const ZOOM_STEP = 10;
const ZOOM_MIN  = 50;
const ZOOM_MAX  = 200;
const ZOOM_DEFAULT = 100;

/**
 * PreviewPanel – main content area with zoom state + document
 * Props:
 *   selArr   : Employee[]
 *   isSun    : boolean
 *   dateStr  : string
 *   deptName : string
 *   onPrint         : () => void
 *   onSave          : () => void
 *   otTimes         : object
 *   setEmployeeTime : (id, time) => void
 */
const PreviewPanel = memo(function PreviewPanel({ selArr, isSun, dateStr, deptName, onPrint, onSave, otTimes, setEmployeeTime }) {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  const handleZoomIn    = useCallback(() => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX)), []);
  const handleZoomOut   = useCallback(() => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN)), []);
  const handleZoomReset = useCallback(() => setZoom(ZOOM_DEFAULT), []);
  const handleZoomFit   = useCallback(() => setZoom(85), []); // 85% fits A4 in most viewports

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {/* Toolbar */}
      <Box sx={{ px: 3, pt: 2.5 }} className="no-print">
        <PreviewToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onZoomFit={handleZoomFit}
          onPrint={onPrint}
          onSave={onSave}
          selectedCount={selArr.length}
        />
      </Box>

      {/* Document viewport */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          px: 3,
          pb: 4,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* Zoom wrapper */}
        <Box
          className="print-area"
          sx={{
            width: `${zoom}%`,
            maxWidth: '100%',
            transformOrigin: 'top center',
            transition: 'width 150ms ease',
          }}
        >
          <DocumentSheet
            selArr={selArr}
            isSun={isSun}
            dateStr={dateStr}
            deptName={deptName}
            otTimes={otTimes}
            setEmployeeTime={setEmployeeTime}
          />
        </Box>
      </Box>
    </Box>
  );
});

export default PreviewPanel;
