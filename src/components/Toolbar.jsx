import React from 'react';

const ATOMS = [
  { type: 'H', name: 'Hidrojen', colorClass: 'atom-preview-h' },
  { type: 'O', name: 'Oksijen', colorClass: 'atom-preview-o' },
  { type: 'N', name: 'Azot', colorClass: 'atom-preview-n' },
  { type: 'C', name: 'Karbon', colorClass: 'atom-preview-c' },
  { type: 'S', name: 'Kükürt', colorClass: 'atom-preview-s' },
  { type: 'P', name: 'Fosfor', colorClass: 'atom-preview-p' },
  { type: 'Cl', name: 'Klor', colorClass: 'atom-preview-cl' },
  { type: 'F', name: 'Flor', colorClass: 'atom-preview-f' },
];

const MODES = [
  { id: 'place', name: 'Atom Yerleştir', icon: '📍' },
  { id: 'drag', name: 'Taşı / Sürükle', icon: '✋' },
  { id: 'bond', name: 'Bağ Oluştur', icon: '🔗' },
  { id: 'delete', name: 'Sil / Kaldır', icon: '🗑️' },
];


export default function Toolbar({ selectedAtomType, setSelectedAtomType, mode, setMode, onClear }) {
  return (
    <aside className="toolbar glass-panel">
      <div className="tool-section">
        <h3>Atomlar</h3>
        {ATOMS.map((atom) => (
          <button
            key={atom.type}
            className={`atom-btn ${selectedAtomType === atom.type ? 'active' : ''}`}
            onClick={() => {
              setSelectedAtomType(atom.type);
              if (mode !== 'place') setMode('place');
            }}
          >
            <div className={`atom-preview ${atom.colorClass}`}>{atom.type}</div>
            {atom.name}
          </button>
        ))}
      </div>

      <hr className="divider" />

      <div className="tool-section">
        <h3>Mod</h3>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? (m.id === 'delete' ? 'active-delete' : 'active') : ''}`}
            onClick={() => setMode(m.id)}
          >
            <span role="img" aria-label={m.name}>
              {m.icon}
            </span>
            {m.name}
          </button>
        ))}
      </div>

      <button className="clear-btn" onClick={onClear}>
        TUVALİ TEMİZLE
      </button>
    </aside>
  );
}
