import { useState, useRef, useCallback } from 'react'
import './App.css'
import Toolbar from './components/Toolbar'
import Workspace from './components/Workspace'
import Feedback from './components/Feedback'
import ThreeScene from './components/ThreeScene'
import Encyclopedia from './components/Encyclopedia'

const VALENCY = { H: 1, O: 2, C: 4, N: 3, S: 6, P: 5, Cl: 1, F: 1 }

const LEVELS = [
  { id: 'water', target: 'H₂O', hint: '1 Oksijen + 2 Hidrojen', atoms: ['O', 'H', 'H'] },
  { id: 'ammonia', target: 'NH₃', hint: '1 Azot + 3 Hidrojen', atoms: ['N', 'H', 'H', 'H'] },
  { id: 'co2', target: 'CO₂', hint: '1 Karbon + 2 Oksijen (Çift Bağ!)', atoms: ['C', 'O', 'O'] },
  { id: 'methane', target: 'CH₄', hint: '1 Karbon + 4 Hidrojen', atoms: ['C', 'H', 'H', 'H', 'H'] },
  { id: 'oxygen', target: 'O₂', hint: '2 Oksijen (Çift Bağ!)', atoms: ['O', 'O'] },
  { id: 'nitrogen', target: 'N₂', hint: '2 Azot (Üçlü Bağ!)', atoms: ['N', 'N'] },
  { id: 'so2', target: 'SO₂', hint: '1 Kükürt + 2 Oksijen (Çift Bağlar!)', atoms: ['S', 'O', 'O'] },
  { id: 'ph3', target: 'PH₃', hint: '1 Fosfor + 3 Hidrojen', atoms: ['P', 'H', 'H', 'H'] },
  { id: 'hcl', target: 'HCl', hint: '1 Hidrojen + 1 Klor', atoms: ['H', 'Cl'] },
  { id: 'ch2o', target: 'CH₂O', hint: '1 Karbon + 2 Hidrojen + 1 Oksijen (C=O Çift Bağ!)', atoms: ['C', 'H', 'H', 'O'] },
  { id: 'c2h2', target: 'C₂H₂', hint: 'Asetilen: 2 Karbon + 2 Hidrojen (Üçlü Bağ!)', atoms: ['C', 'C', 'H', 'H'] },
  { id: 'c2h4', target: 'C₂H₄', hint: 'Etilen: 2 Karbon + 4 Hidrojen (Çift Bağ!)', atoms: ['C', 'C', 'H', 'H', 'H', 'H'] },
  { id: 'chcl3', target: 'CHCl₃', hint: 'Kloroform: 1 Karbon + 1 Hidrojen + 3 Klor', atoms: ['C', 'H', 'Cl', 'Cl', 'Cl'] },
  { id: 'c2h6o', target: 'C₂H₆O', hint: 'Etanol: 2 Karbon + 6 Hidrojen + 1 Oksijen', atoms: ['C', 'C', 'O', 'H', 'H', 'H', 'H', 'H', 'H'] },
  { id: 'sf6', target: 'SF₆', hint: 'Kükürt Hekzaflorür: 1 Kükürt + 6 Flor', atoms: ['S', 'F', 'F', 'F', 'F', 'F', 'F'] },
  { id: 'pcl5', target: 'PCl₅', hint: 'Fosfor Pentaklorür: 1 Fosfor + 5 Klor', atoms: ['P', 'Cl', 'Cl', 'Cl', 'Cl', 'Cl'] },
  { id: 'h2o2', target: 'H₂O₂', hint: 'Hidrojen Peroksit: 2 Hidrojen + 2 Oksijen', atoms: ['H', 'H', 'O', 'O'] },
  { id: 'o3', target: 'O₃', hint: 'Ozon: 3 Oksijen', atoms: ['O', 'O', 'O'] },
  { id: 'ch2o2', target: 'CH₂O₂', hint: 'Formik Asit: 1 Karbon + 2 Hidrojen + 2 Oksijen', atoms: ['C', 'H', 'H', 'O', 'O'] },
  { id: 'c3h6o', target: 'C₃H₆O', hint: 'Aseton: 3 Karbon + 6 Hidrojen + 1 Oksijen', atoms: ['C', 'C', 'C', 'O', 'H', 'H', 'H', 'H', 'H', 'H'] },
]

function getTotalValency(atomId, bonds) {
  return bonds
    .filter(b => b.source === atomId || b.target === atomId)
    .reduce((sum, b) => sum + (b.strength || 1), 0)
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function validateMolecule(atoms, bonds) {
  const hCount = atoms.filter(a => a.type === 'H').length
  const oCount = atoms.filter(a => a.type === 'O').length
  const cCount = atoms.filter(a => a.type === 'C').length
  const nCount = atoms.filter(a => a.type === 'N').length
  const sCount = atoms.filter(a => a.type === 'S').length
  const pCount = atoms.filter(a => a.type === 'P').length
  const total = atoms.length
  const bondCount = bonds.length

  if (total < 2 || bondCount === 0) return null

  const getStrength = (id1, id2) => {
    const bond = bonds.find(b => 
      (b.source === id1 && b.target === id2) || (b.source === id2 && b.target === id1)
    )
    return bond ? (bond.strength || 1) : 0
  }

  // --- Water: H2O (2H + 1O) ---
  if (hCount === 2 && oCount === 1 && cCount === 0 && nCount === 0 && total === 3) {
    const oAtom = atoms.find(a => a.type === 'O')
    const hAtoms = atoms.filter(a => a.type === 'H')
    if (hAtoms.every(h => getStrength(oAtom.id, h.id) === 1)) return 'H₂O'
  }

  // --- Methane: CH4 (1C + 4H) ---
  if (cCount === 1 && hCount === 4 && oCount === 0 && nCount === 0 && total === 5) {
    const cAtom = atoms.find(a => a.type === 'C')
    const hAtoms = atoms.filter(a => a.type === 'H')
    if (hAtoms.every(h => getStrength(cAtom.id, h.id) === 1)) return 'CH₄'
  }

  // --- Carbon Dioxide: CO2 (1C + 2O, Double Bonds Required) ---
  if (cCount === 1 && oCount === 2 && hCount === 0 && nCount === 0 && total === 3) {
    const cAtom = atoms.find(a => a.type === 'C')
    const oAtoms = atoms.filter(a => a.type === 'O')
    if (oAtoms.every(o => getStrength(cAtom.id, o.id) === 2)) return 'CO₂'
  }

  // --- Ammonia: NH3 (1N + 3H) ---
  if (nCount === 1 && hCount === 3 && oCount === 0 && cCount === 0 && total === 4) {
    const nAtom = atoms.find(a => a.type === 'N')
    const hAtoms = atoms.filter(a => a.type === 'H')
    if (hAtoms.every(h => getStrength(nAtom.id, h.id) === 1)) return 'NH₃'
  }

  // --- Sulfur Dioxide: SO2 (1S + 2O, Double Bonds) ---
  if (sCount === 1 && oCount === 2 && total === 3) {
    const sAtom = atoms.find(a => a.type === 'S')
    const oAtoms = atoms.filter(a => a.type === 'O')
    if (oAtoms.every(o => getStrength(sAtom.id, o.id) === 2)) return 'SO₂'
  }

  // --- Phosphine: PH3 ---
  if (pCount === 1 && hCount === 3 && total === 4) {
    const pAtom = atoms.find(a => a.type === 'P')
    const hAtoms = atoms.filter(a => a.type === 'H')
    if (hAtoms.every(h => getStrength(pAtom.id, h.id) === 1)) return 'PH₃'
  }

  // --- Oxygen Gas: O2 ---
  if (oCount === 2 && total === 2) {
    if (getStrength(atoms[0].id, atoms[1].id) === 2) return 'O₂'
  }

  // --- Nitrogen Gas: N2 ---
  if (nCount === 2 && total === 2) {
    if (getStrength(atoms[0].id, atoms[1].id) === 3) return 'N₂'
  }

  // --- Hydrogen Chloride: HCl ---
  const clCount = atoms.filter(a => a.type === 'Cl').length
  if (hCount === 1 && clCount === 1 && total === 2) {
    if (getStrength(atoms.find(a => a.type === 'H').id, atoms.find(a => a.type === 'Cl').id) === 1) return 'HCl'
  }

  // --- Hydrogen Fluoride: HF ---
  const fCount = atoms.filter(a => a.type === 'F').length
  if (hCount === 1 && fCount === 1 && total === 2) {
    if (getStrength(atoms.find(a => a.type === 'H').id, atoms.find(a => a.type === 'F').id) === 1) return 'HF'
  }

  // --- Formaldehyde: CH2O ---
  if (cCount === 1 && hCount === 2 && oCount === 1 && total === 4) {
    const cAtom = atoms.find(a => a.type === 'C')
    const hAtoms = atoms.filter(a => a.type === 'H')
    const oAtom = atoms.find(a => a.type === 'O')
    if (hAtoms.every(h => getStrength(cAtom.id, h.id) === 1) && getStrength(cAtom.id, oAtom.id) === 2) return 'CH₂O'
  }

  // --- Acetylene: C2H2 ---
  if (cCount === 2 && hCount === 2 && total === 4) {
    const cAtoms = atoms.filter(a => a.type === 'C')
    if (getStrength(cAtoms[0].id, cAtoms[1].id) === 3) return 'C₂H₂'
  }

  // --- Ethylene: C2H4 ---
  if (cCount === 2 && hCount === 4 && total === 6) {
    const cAtoms = atoms.filter(a => a.type === 'C')
    if (getStrength(cAtoms[0].id, cAtoms[1].id) === 2) return 'C₂H₄'
  }

  // --- Chloroform: CHCl3 ---
  if (cCount === 1 && hCount === 1 && clCount === 3 && total === 5) return 'CHCl₃'

  // --- Ethanol: C2H6O ---
  if (cCount === 2 && hCount === 6 && oCount === 1 && total === 9) return 'C₂H₆O'

  // --- Sulfur Hexafluoride: SF6 ---
  const fCountLocal = atoms.filter(a => a.type === 'F').length
  if (sCount === 1 && fCountLocal === 6 && total === 7) return 'SF₆'

  // --- Phosphorus Pentachloride: PCl5 ---
  if (pCount === 1 && clCount === 5 && total === 6) return 'PCl₅'

  // --- Hydrogen Peroxide: H2O2 ---
  if (hCount === 2 && oCount === 2 && total === 4) return 'H₂O₂'

  // --- Ozone: O3 ---
  if (oCount === 3 && total === 3 && bondCount >= 2) return 'O₃'

  // --- Formic Acid: CH2O2 ---
  if (cCount === 1 && hCount === 2 && oCount === 2 && total === 5) return 'CH₂O₂'

  // --- Acetone: C3H6O ---
  if (cCount === 3 && hCount === 6 && oCount === 1 && total === 10) return 'C₃H₆O'

  return null
}

export default function App() {
  const [selectedAtomType, setSelectedAtomType] = useState('H')
  const [atoms, setAtoms] = useState([])
  const [bonds, setBonds] = useState([])
  const [bondingFrom, setBondingFrom] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [discoveries, setDiscoveries] = useState([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [show3D, setShow3D] = useState(false)
  const [showEncyclopedia, setShowEncyclopedia] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const [mode, setMode] = useState('place') // 'place' | 'bond' | 'delete' | 'drag'
  const feedbackTimer = useRef(null)

  const showFeedback = useCallback((msg, type = 'success') => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    setFeedback({ msg, type })
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3000)
  }, [])

  const level = LEVELS[currentLevel]

  const tidyUp = useCallback(() => {
    if (atoms.length === 0) return
    
    setAtoms(prev => {
      const newAtoms = prev.map(a => ({ ...a }))
      const iterations = 50
      const k = 120 // ideal distance

      for (let i = 0; i < iterations; i++) {
        for (let j = 0; j < newAtoms.length; j++) {
          for (let l = j + 1; l < newAtoms.length; l++) {
            const a1 = newAtoms[j]
            const a2 = newAtoms[l]
            const dx = a1.x - a2.x
            const dy = a1.y - a2.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = (k * k) / dist
            const fx = (dx / dist) * force * 0.1
            const fy = (dy / dist) * force * 0.1
            a1.x += fx; a1.y += fy
            a2.x -= fx; a2.y -= fy
          }
        }
        bonds.forEach(bond => {
          const a1 = newAtoms.find(a => a.id === bond.source)
          const a2 = newAtoms.find(a => a.id === bond.target)
          if (!a1 || !a2) return
          const dx = a1.x - a2.x
          const dy = a1.y - a2.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = (dist * dist) / k
          const fx = (dx / dist) * force * 0.1
          const fy = (dy / dist) * force * 0.1
          a1.x -= fx; a1.y -= fy
          a2.x += fx; a2.y += fy
        })
      }
      return newAtoms
    })
    showFeedback('✨ Çalışma alanı düzenlendi!', 'success')
  }, [atoms.length, bonds, showFeedback])

  const handleWorkspaceClick = useCallback((x, y) => {
    if (mode !== 'place') return
    const newAtom = { id: generateId(), type: selectedAtomType, x, y }
    setAtoms(prev => [...prev, newAtom])
  }, [mode, selectedAtomType])

  const handleAtomMove = useCallback((id, x, y) => {
    setAtoms(prev => prev.map(a => a.id === id ? { ...a, x, y } : a))
  }, [])

  const handleAtomClick = useCallback((atomId) => {
    if (mode === 'delete') {
      setAtoms(prev => prev.filter(a => a.id !== atomId))
      setBonds(prev => prev.filter(b => b.source !== atomId && b.target !== atomId))
      setBondingFrom(null)
      return
    }
    
    if (mode !== 'bond') return

    if (!bondingFrom) {
      setBondingFrom(atomId)
      return
    }

    if (bondingFrom === atomId) {
      setBondingFrom(null)
      return
    }

    const existingBondIdx = bonds.findIndex(b =>
      (b.source === bondingFrom && b.target === atomId) ||
      (b.source === atomId && b.target === bondingFrom)
    )

    const updatedBonds = [...bonds]
    const srcAtom = atoms.find(a => a.id === bondingFrom)
    const tgtAtom = atoms.find(a => a.id === atomId)
    
    if (existingBondIdx !== -1) {
      const bond = updatedBonds[existingBondIdx]
      if (
        getTotalValency(bondingFrom, bonds) < VALENCY[srcAtom.type] &&
        getTotalValency(atomId, bonds) < VALENCY[tgtAtom.type]
      ) {
        updatedBonds[existingBondIdx] = { ...bond, strength: (bond.strength || 1) + 1 }
        setBonds(updatedBonds)
        showFeedback('Bağ yükseltildi!', 'success')
        
        const result = validateMolecule(atoms, updatedBonds)
        if (result === level.target) {
          showFeedback(`🏆 Seviye Tamamlandı: ${result}!`, 'success')
          setDiscoveries(prev => prev.includes(result) ? prev : [...prev, result])
          setShowEncyclopedia(result)
          if (currentLevel < LEVELS.length - 1) {
            setTimeout(() => {
              setCurrentLevel(prev => prev + 1)
              setAtoms([])
              setBonds([])
            }, 3000)
          } else {
            setTimeout(() => setIsFinished(true), 3000)
          }
        }
      } else {
        showFeedback('Değerlik sınırına ulaşıldı.', 'error')
      }
      setBondingFrom(null)
    } else {
      if (getTotalValency(bondingFrom, bonds) >= VALENCY[srcAtom.type]) {
        showFeedback(`${srcAtom.type} değerlik sınırına ulaşıldı!`, 'error')
        setBondingFrom(null)
        return
      }
      if (getTotalValency(atomId, bonds) >= VALENCY[tgtAtom.type]) {
        showFeedback(`${tgtAtom.type} değerlik sınırına ulaşıldı!`, 'error')
        setBondingFrom(null)
        return
      }

      const newUpdatedBonds = [...bonds, { id: generateId(), source: bondingFrom, target: atomId, strength: 1 }]
      setBonds(newUpdatedBonds)
      setBondingFrom(null)

      const result = validateMolecule(atoms, newUpdatedBonds)
      if (result === level.target) {
        showFeedback(`🏆 Seviye Tamamlandı: ${result}!`, 'success')
        setDiscoveries(prev => prev.includes(result) ? prev : [...prev, result])
        setShowEncyclopedia(result)
        if (currentLevel < LEVELS.length - 1) {
          setTimeout(() => {
            setCurrentLevel(prev => prev + 1)
            setAtoms([])
            setBonds([])
          }, 3000)
        }
      }
    }
  }, [mode, bondingFrom, bonds, atoms, showFeedback, currentLevel, level.target])

  const handleClear = useCallback(() => {
    setAtoms([])
    setBonds([])
    setBondingFrom(null)
    setFeedback(null)
  }, [])

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-title">
          <span className="header-icon">⚗️</span>
          <h1>Molekül Oluşturucu</h1>
        </div>
        <div className="level-hud">
          <div className="level-info">
            <span className="level-label">Hedef:</span>
            <span className="level-target">{level.target}</span>
          </div>
          <p className="level-hint">{level.hint}</p>
        </div>
        <div className="header-actions">
          <button className={`view-toggle ${show3D ? 'active' : ''}`} onClick={() => setShow3D(!show3D)}>
            {show3D ? '✨ 2D Düzenle' : '🌐 3D Görüntüle'}
          </button>
          <button className="tidy-btn" onClick={tidyUp}>🪄 Düzenle</button>
        </div>
      </header>

      <div className="main-layout">
        <Toolbar
          selectedAtomType={selectedAtomType}
          setSelectedAtomType={setSelectedAtomType}
          mode={mode}
          setMode={setMode}
          onClear={handleClear}
        />

        <div className="workspace-container">
          {show3D ? (
            <ThreeScene atoms={atoms} bonds={bonds} />
          ) : (
            <Workspace
              atoms={atoms}
              bonds={bonds}
              bondingFrom={bondingFrom}
              mode={mode}
              onWorkspaceClick={handleWorkspaceClick}
              onAtomClick={handleAtomClick}
              onAtomMove={handleAtomMove}
            />
          )}
        </div>

        <div className="legend glass-panel">
          <h3>İlerleme</h3>
          <div className="level-progress">
            <div className="progress-fill" style={{ width: `${(currentLevel / LEVELS.length) * 100}%` }}></div>
          </div>
          <p className="level-text">Seviye {currentLevel + 1} / {LEVELS.length}</p>
          
          <hr className="divider" style={{ margin: '12px 0' }} />
          
          <h3>Keşifler</h3>
          <div className="gallery">
            {discoveries.length === 0 ? <span className="empty">Henüz yok</span> : discoveries.join(', ')}
          </div>
          <hr className="divider" style={{ margin: '12px 0' }} />
          
          <h3>Değerlik Kuralları</h3>
          <ul>
            <li><span className="legend-dot h-dot"></span><strong>H</strong> (Hidrojen) — 1</li>
            <li><span className="legend-dot n-dot"></span><strong>N</strong> (Azot) — 3</li>
            <li><span className="legend-dot o-dot"></span><strong>O</strong> (Oksijen) — 2</li>
            <li><span className="legend-dot c-dot"></span><strong>C</strong> (Karbon) — 4</li>
          </ul>
        </div>
      </div>

      {feedback && <Feedback msg={feedback.msg} type={feedback.type} />}
      
      {showEncyclopedia && (
        <Encyclopedia 
          moleculeId={showEncyclopedia} 
          onClose={() => setShowEncyclopedia(null)} 
        />
      )}

      {isFinished && (
        <div className="finish-overlay">
          <div className="finish-card glass-panel">
            <span className="finish-emoji">🏆</span>
            <h2>Tebrikler!</h2>
            <p>Tüm molekülleri başarıyla oluşturdun ve kimya dünyasını keşfettin.</p>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{discoveries.length}</span>
                <span className="stat-label">Keşif</span>
              </div>
            </div>
            <button className="reset-game-btn" onClick={() => window.location.reload()}>
              Yeniden Başla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
