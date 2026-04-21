import { useRef, useState, useCallback, useEffect } from 'react'

const ATOM_CONFIG = {
  H: { fill: '#f1f5f9', stroke: '#cbd5e1', glowColor: 'rgba(241, 245, 249, 0.5)', labelFill: '#1e293b', r: 22 },
  O: { fill: '#ef4444', stroke: '#dc2626', glowColor: 'rgba(239, 68, 68, 0.6)', labelFill: '#ffffff', r: 26 },
  N: { fill: '#3b82f6', stroke: '#2563eb', glowColor: 'rgba(59, 130, 246, 0.5)', labelFill: '#ffffff', r: 27 },
  C: { fill: '#1e1e1e', stroke: '#525252', glowColor: 'rgba(255,255,255,0.15)', labelFill: '#e2e8f0', r: 28 },
  S: { fill: '#facc15', stroke: '#ca8a04', glowColor: 'rgba(250, 204, 21, 0.4)', labelFill: '#422006', r: 29 },
  P: { fill: '#f97316', stroke: '#ea580c', glowColor: 'rgba(249, 115, 22, 0.4)', labelFill: '#ffffff', r: 27 },
}

export default function Workspace({ atoms, bonds, bondingFrom, mode, onWorkspaceClick, onAtomClick, onAtomMove }) {
  const svgRef = useRef(null)
  const [draggingAtom, setDraggingAtom] = useState(null)

  const handleSvgClick = (e) => {
    if (draggingAtom) return
    if (e.target !== svgRef.current && !e.target.classList.contains('workspace-bg')) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    onWorkspaceClick(x, y)
  }

  const handleMouseDown = (e, atomId) => {
    if (mode === 'drag') {
      e.stopPropagation()
      setDraggingAtom(atomId)
    }
  }

  const handleMouseMove = useCallback((e) => {
    if (!draggingAtom || mode !== 'drag') return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    onAtomMove(draggingAtom, x, y)
  }, [draggingAtom, mode, onAtomMove])

  const handleMouseUp = useCallback(() => {
    setDraggingAtom(null)
  }, [])

  useEffect(() => {
    if (draggingAtom) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingAtom, handleMouseMove, handleMouseUp])

  const bondedAtomIds = bondingFrom
    ? bonds.filter(b => b.source === bondingFrom || b.target === bondingFrom)
        .map(b => b.source === bondingFrom ? b.target : b.source)
    : []

  const renderBond = (bond) => {
    const src = atoms.find(a => a.id === bond.source)
    const tgt = atoms.find(a => a.id === bond.target)
    if (!src || !tgt) return null

    const strength = bond.strength || 1
    const dx = tgt.x - src.x
    const dy = tgt.y - src.y
    const angle = Math.atan2(dy, dx)
    Math.sqrt(dx * dx + dy * dy)
    
    // Offset for multiple lines
    const offset = 6
    
    if (strength === 1) {
      return (
        <line
          key={bond.id}
          className="bond-line"
          x1={src.x} y1={src.y}
          x2={tgt.x} y2={tgt.y}
        />
      )
    } else if (strength === 2) {
      return (
        <g key={bond.id}>
          <line
            className="bond-line"
            x1={src.x + Math.sin(angle) * offset} y1={src.y - Math.cos(angle) * offset}
            x2={tgt.x + Math.sin(angle) * offset} y2={tgt.y - Math.cos(angle) * offset}
          />
          <line
            className="bond-line"
            x1={src.x - Math.sin(angle) * offset} y1={src.y + Math.cos(angle) * offset}
            x2={tgt.x - Math.sin(angle) * offset} y2={tgt.y + Math.cos(angle) * offset}
          />
        </g>
      )
    } else if (strength === 3) {
      return (
        <g key={bond.id}>
          <line className="bond-line" x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y} />
          <line
            className="bond-line"
            x1={src.x + Math.sin(angle) * offset * 1.5} y1={src.y - Math.cos(angle) * offset * 1.5}
            x2={tgt.x + Math.sin(angle) * offset * 1.5} y2={tgt.y - Math.cos(angle) * offset * 1.5}
          />
          <line
            className="bond-line"
            x1={src.x - Math.sin(angle) * offset * 1.5} y1={src.y + Math.cos(angle) * offset * 1.5}
            x2={tgt.x - Math.sin(angle) * offset * 1.5} y2={tgt.y + Math.cos(angle) * offset * 1.5}
          />
        </g>
      )
    }
  }

  return (
    <div className={`workspace-wrapper glass-panel mode-${mode}`}>
      <svg
        ref={svgRef}
        className="workspace-svg"
        onClick={handleSvgClick}
      >
        <defs>
          <filter id="glow-h">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-o">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-n">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-c">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-s">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-p">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
          </pattern>
        </defs>

        <rect className="workspace-bg" width="100%" height="100%" fill="url(#grid)" className="workspace-grid workspace-bg" />

        {bonds.map(renderBond)}

        {atoms.map(atom => {
          const cfg = ATOM_CONFIG[atom.type]
          const isSelected = bondingFrom === atom.id
          const isBonded = bondedAtomIds.includes(atom.id)
          const isDragging = draggingAtom === atom.id

          return (
            <g
              key={atom.id}
              className={`atom-group ${isDragging ? 'dragging' : ''}`}
              transform={`translate(${atom.x},${atom.y})`}
              onClick={(e) => { e.stopPropagation(); onAtomClick(atom.id) }}
              onMouseDown={(e) => handleMouseDown(e, atom.id)}
            >
              <circle
                r={cfg.r + 8}
                fill={cfg.glowColor}
                style={{ filter: 'blur(8px)', opacity: isSelected || isDragging ? 1 : 0.4 }}
              />

              {isSelected && (
                <circle
                  className="bonding-indicator"
                  r={cfg.r + 14}
                />
              )}

              {isBonded && !isSelected && (
                <circle r={cfg.r + 6} fill="none" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
              )}

              <circle
                className="atom-circle"
                r={cfg.r}
                fill={cfg.fill}
                stroke={isSelected || isDragging ? '#facc15' : cfg.stroke}
                strokeWidth={isSelected || isDragging ? 2.5 : 1.5}
                style={{ filter: `url(#glow-${atom.type.toLowerCase()})` }}
              />

              <text
                className="atom-label"
                style={{ fill: cfg.labelFill }}
                fontSize={atom.type === 'C' ? 15 : 13}
                fontWeight="700"
              >
                {atom.type}
              </text>
            </g>
          )
        })}

        {atoms.length === 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(148,163,184,0.35)"
            fontSize="18"
            fontFamily="Outfit, sans-serif"
          >
            Bir atom tipi seçin ve yerleştirmek için tıklayın ✦
          </text>
        )}
      </svg>
    </div>
  )
}
