// src/components/preview/PreviewPanel.jsx
import React, { memo, useState, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import PreviewToolbar from './PreviewToolbar';
import DocumentSheet from './DocumentSheet';

const ZOOM_STEP = 10;
const ZOOM_MIN  = 20;
const ZOOM_MAX  = 400;
const ZOOM_DEFAULT = 100;

// Standard A4 dimensions at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

/**
 * PreviewPanel – main canvas with A4 document scaling
 * Props:
 *   selArr          : Employee[]
 *   isSun           : boolean
 *   dateStr         : string
 *   deptName        : string
 *   otTimes         : object
 *   setEmployeeTime : (id, time) => void
 *   onZoomChange    : (zoom: number) => void  (reports zoom to parent for StatusBar)
 */
const PreviewPanel = memo(function PreviewPanel({
  selArr, isSun, dateStr, deptName,
  otTimes, setEmployeeTime,
  onZoomChange,
}) {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef(null);

  const setZoomAndReport = useCallback((newZoom) => {
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [onZoomChange]);

  const handleZoomIn    = useCallback(() => setZoomAndReport(z => Math.min(z + ZOOM_STEP, ZOOM_MAX)), [setZoomAndReport]);
  const handleZoomOut   = useCallback(() => setZoomAndReport(z => Math.max(z - ZOOM_STEP, ZOOM_MIN)), [setZoomAndReport]);
  const handleZoomReset = useCallback(() => setZoomAndReport(ZOOM_DEFAULT), [setZoomAndReport]);

  const handleZoomFitWidth = useCallback(() => {
    if (containerRef.current) {
      // Calculate based on container width minus some padding (32px each side)
      const containerWidth = containerRef.current.clientWidth;
      const padding = 64; 
      const scale = (containerWidth - padding) / A4_WIDTH;
      setZoomAndReport(Math.max(ZOOM_MIN, Math.min(Math.round(scale * 100), ZOOM_MAX)));
    }
  }, [setZoomAndReport]);

  const handleZoomFitPage = useCallback(() => {
    if (containerRef.current) {
      // Calculate based on container height minus padding
      const containerHeight = containerRef.current.clientHeight;
      const padding = 64;
      const scale = (containerHeight - padding) / A4_HEIGHT;
      setZoomAndReport(Math.max(ZOOM_MIN, Math.min(Math.round(scale * 100), ZOOM_MAX)));
    }
  }, [setZoomAndReport]);

  const handleRotate = useCallback(() => {
    setRotation(r => (r + 90) % 360);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const isRotated = rotation % 180 !== 0;
  const currentWidth = isRotated ? A4_HEIGHT : A4_WIDTH;
  const currentHeight = isRotated ? A4_WIDTH : A4_HEIGHT;

  const scaledWidth = currentWidth * (zoom / 100);
  const scaledHeight = currentHeight * (zoom / 100);

  return (
    <Box
      ref={containerRef}
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
          onZoomFitWidth={handleZoomFitWidth}
          onZoomFitPage={handleZoomFitPage}
          onRotate={handleRotate}
          onFullscreen={handleFullscreen}
        />
      </Box>

      {/* Document canvas */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 4,
          py: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          // Canvas texture – subtle dot pattern
          backgroundImage: 'radial-gradient(circle, #C9CDD3 0.75px, transparent 0.75px)',
          backgroundSize: '20px 20px',
          backgroundColor: '#E8EAED',
        }}
      >
        {/* Scale Wrapper - maintains document flow size so scrollbars work properly */}
        <Box
          className="print-area"
          sx={{
            width: scaledWidth,
            height: scaledHeight,
            flexShrink: 0, // Prevent flexbox from squishing the container
            position: 'relative',
            transition: 'width 200ms ease, height 200ms ease',
          }}
        >
          {/* Actual A4 Paper Element */}
          <Box
            sx={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              position: 'absolute',
              top: isRotated ? (A4_WIDTH - A4_HEIGHT) / 2 : 0,
              left: isRotated ? (A4_HEIGHT - A4_WIDTH) / 2 : 0,
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: isRotated ? 'center center' : 'top left',
              backgroundColor: '#fff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              '@media print': {
                transform: 'none !important',
                width: '100% !important',
                height: 'auto !important',
                position: 'static !important',
                boxShadow: 'none !important',
              }
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
    </Box>
  );
});

export default PreviewPanel;
