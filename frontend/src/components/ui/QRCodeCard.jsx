import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { DownloadIcon, RefreshCwIcon } from 'lucide-react';

/**
 * QRCodeCard — renders a real, scannable QR code for the given URL using the
 * `qrcode` library.  Includes a download button that saves the canvas as a PNG.
 */
export function QRCodeCard({ url, size = 200 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);
  const [rendered, setRendered] = useState(false);

  const render = useCallback(() => {
    if (!canvasRef.current || !url) return;
    setError(false);
    setRendered(false);
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a',   // ink
        light: '#ffffff',  // white
      },
      errorCorrectionLevel: 'M',
    })
      .then(() => setRendered(true))
      .catch(() => setError(true));
  }, [url, size]);

  useEffect(() => {
    render();
  }, [render]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `livepoll-qr-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <figure className="flex flex-col items-center gap-4 rounded-xl border border-line bg-white p-5">
      {/* Canvas — always present so the ref is stable */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          aria-label={`QR code for ${url}`}
          role="img"
          className={[
            'rounded-lg border border-line transition-opacity duration-300',
            rendered ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{ width: size, height: size }}
        />

        {/* Skeleton shown while rendering */}
        {!rendered && !error && (
          <div
            className="absolute inset-0 rounded-lg bg-canvas animate-skeleton-sweep"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #f6f7f9 25%, #eceef2 50%, #f6f7f9 75%)',
              backgroundSize: '200% 100%',
            }}
          />
        )}

        {/* Error state */}
        {error && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-danger-100 bg-danger-50 text-danger-600"
            style={{ width: size, height: size }}
          >
            <RefreshCwIcon className="h-5 w-5" />
            <button
              type="button"
              onClick={render}
              className="text-xs font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <figcaption className="flex w-full flex-col items-center gap-3">
        {/* URL label — truncated */}
        <p className="max-w-full truncate text-center text-xs text-ink-muted" title={url}>
          {url}
        </p>

        {/* Download button */}
        {rendered && (
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-card transition-colors duration-150 ease-swift hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700"
          >
            <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Download PNG
          </button>
        )}

        <p className="text-center text-xs text-ink-subtle">
          Scan with any phone camera to open the poll
        </p>
      </figcaption>
    </figure>
  );
}
