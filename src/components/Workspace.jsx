import { useRef, useState, useCallback, useEffect } from 'react'
import { animate } from 'animejs'

const ATOM_CONFIG = {
  H: { fill: '#f8fafc', stroke: '#cbd5e1', labelFill: '#0f172a', r: 22 },
  O: { fill: '#f43f5e', stroke: '#e11d48', labelFill: '#ffffff', r: 26 },
  N: { fill: '#3b82f6', stroke: '#2563eb', labelFill: '#ffffff', r: 27 },
  C: { fill: '#1e293b', stroke: '#0f172a', labelFill: '#f8fafc', r: 28 },
  S: { fill: '#f59e0b', stroke: '#d97706', labelFill: '#ffffff', r: 29 },
  P: { fill: '#ec4899', stroke: '#db2777', labelFill: '#ffffff', r: 27 },
  Cl: { fill: '#22c55e', stroke: '#16a34a', labelFill: '#ffffff', r: 26 },
  F: { fill: '#fbbf24', stroke: '#f59e0b', labelFill: '#ffffff', r: 24 },
}

export default function Workspace({ atoms, bonds, bondingFrom, mode, onWorkspaceClick, onAtomClick, onAtomMove }) {
  const svgRef = useRef(null)
  const [draggingAtom, setDraggingAtom] = useState(null)

  // Animate new atoms
  useEffect(() => {
    if (atoms.length > 0) {
      const lastAtom = atoms[atoms.length - 1];
      animate({
        targets: `#atom-${lastAtom.id}`,
        scale: [0, 1],
        opacity: [0, 1],
        easing: 'easeOutElastic(1, .5)',
        duration: 800
      });
    }
  }, [atoms.length]);

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

  useEffect(() => {
    const wrapper = svgRef.current?.parentElement
    if (wrapper) {
      const scrollX = 2500 - wrapper.clientWidth / 2
      const scrollY = 2500 - wrapper.clientHeight / 2
      requestAnimationFrame(() => {
        wrapper.scrollLeft = scrollX
        wrapper.scrollTop = scrollY
      })
    }
  }, [])


  const renderBond = (bond) => {
    const src = atoms.find(a => a.id === bond.source)
    const tgt = atoms.find(a => a.id === bond.target)
    if (!src || !tgt) return null

    const strength = bond.strength || 1
    const dx = tgt.x - src.x
    const dy = tgt.y - src.y
    const angle = Math.atan2(dy, dx)
    
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
    <div className={`workspace-wrapper mode-${mode}`}>
      <svg
        ref={svgRef}
        className="workspace-svg"
        onClick={handleSvgClick}
        width="5000"
        height="5000"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1"/>
          </pattern>
        </defs>

        <rect className="workspace-grid workspace-bg" width="5000" height="5000" fill="url(#grid)" />

        {bonds.map(renderBond)}

        {atoms.map(atom => {
          const cfg = ATOM_CONFIG[atom.type]
          const isSelected = bondingFrom === atom.id
          const isDragging = draggingAtom === atom.id

          return (
            <g
              key={atom.id}
              id={`atom-${atom.id}`}
              className={`atom-group ${isDragging ? 'dragging' : ''}`}
              transform={`translate(${atom.x},${atom.y})`}
              onClick={(e) => { e.stopPropagation(); onAtomClick(atom.id) }}
              onMouseDown={(e) => handleMouseDown(e, atom.id)}
            >
              {isSelected && (
                <circle
                  className="bonding-indicator"
                  r={cfg.r + 10}
                />
              )}

              <circle
                className="atom-circle"
                r={cfg.r}
                fill={cfg.fill}
                stroke={isSelected || isDragging ? '#facc15' : cfg.stroke}
                strokeWidth={isSelected || isDragging ? 4 : 2}
              />

              <text
                className="atom-label"
                style={{ fill: cfg.labelFill }}
                fontSize={atom.type === 'C' ? 16 : 14}
                fontWeight="800"
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
            fill="rgba(148,163,184,0.3)"
            fontSize="24"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="600"
          >
            ATOM TİPİ SEÇİN VE BAŞLAYIN ✦
          </text>
        )}
      </svg>
    </div>
  )
}
