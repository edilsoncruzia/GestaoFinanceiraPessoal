import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { COLORS } from '../../constants/tokens';
import { X } from 'lucide-react';

let counter = 0;

export function CodeScanner({ onResult, onClose }) {
  const [id] = useState(() => "qr-scanner-" + (++counter));
  const [error, setError] = useState("");
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let active = true;
    let scanner;
    let stopped = false;
    async function start() {
      try {
        scanner = new Html5Qrcode(id, { verbose: false });
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => { if (active) onResultRef.current(decodedText); },
          () => {}
        );
      } catch (err) {
        if (active) setError("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
      }
    }
    async function stop() {
      if (stopped) return;
      stopped = true;
      if (scanner && scanner.isScanning) {
        try { await scanner.stop(); await scanner.clear(); } catch (e) {}
      }
    }
    start();
    return () => { active = false; stop(); };
  }, [id]);

  return (
    <div style={{ marginBottom: 8 }}>
      {error ? (
        <p style={{ fontSize: 12, color: COLORS.rust, margin: "0 0 8px" }}>{error}</p>
      ) : (
        <div id={id} style={{ width: "100%", borderRadius: 10, overflow: "hidden", background: "#222" }} />
      )}
      <button onClick={onClose} aria-label="Fechar leitor" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 0" }}><X size={14} />Fechar leitor</button>
    </div>
  );
}
