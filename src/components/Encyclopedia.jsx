import React from 'react';

const MOLECULE_DATA = {
  'H₂O': {
    name: 'Su',
    description: 'Dünya üzerindeki yaşamın temel taşıdır. İnsan vücudunun yaklaşık %60-70\'i sudur.',
    facts: [
      'Sıvı hali katı halinden (buz) daha yoğundur.',
      'Evrensel çözücü olarak bilinir.',
      'Dünya yüzeyinin %71\'ini kaplar.'
    ],
    usage: 'İçme, tarım, enerji üretimi ve temizlik.'
  },
  'NH₃': {
    name: 'Amonyak',
    description: 'Keskin kokulu, renksiz bir gazdır. Azot döngüsünün önemli bir parçasıdır.',
    facts: [
      'Gezegenlerin atmosferinde (Jüpiter gibi) bolca bulunur.',
      'Gübre üretiminde ana bileşendir.',
      'Çok iyi bir soğutucudur.'
    ],
    usage: 'Gübre, endüstriyel temizleyiciler ve patlayıcı yapımı.'
  },
  'CO₂': {
    name: 'Karbon Dioksit',
    description: 'Atmosferdeki doğal bir sera gazıdır. Bitkilerin hayatı için kritiktir.',
    facts: [
      'Fotosentezin ana bileşenlerindendir.',
      'Kuru buz, CO2\'nin dondurulmuş halidir.',
      'Yangın söndürücülerde kullanılır.'
    ],
    usage: 'Meşrubat gazı, yangın söndürme ve bitki yetiştiriciliği.'
  },
  'CH₄': {
    name: 'Metan',
    description: 'En basit organik bileşiktir. Doğalgazın ana bileşenidir.',
    facts: [
      'Bataklık gazı olarak da bilinir.',
      'Güneş sistemindeki birçok buz devinde bulunur.',
      'Kokusuzdur; biz kokusunu içine eklenen maddelerden alırız.'
    ],
    usage: 'Isınma, elektrik üretimi ve yakıt.'
  }
};

export default function Encyclopedia({ moleculeId, onClose }) {
  const data = MOLECULE_DATA[moleculeId];
  if (!data) return null;

  return (
    <div className="encyclopedia-overlay" onClick={onClose}>
      <div className="encyclopedia-card glass-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="card-header">
          <span className="formula-tag">{moleculeId}</span>
          <h2>{data.name}</h2>
        </div>
        
        <div className="card-body">
          <section className="info-section">
            <h3>Nedir?</h3>
            <p>{data.description}</p>
          </section>

          <section className="info-section">
            <h3>İlginç Bilgiler</h3>
            <ul>
              {data.facts.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </section>

          <section className="usage-section">
            <h3>Kullanım Alanları</h3>
            <p>{data.usage}</p>
          </section>
        </div>

        <div className="card-footer">
          <button className="got-it-btn" onClick={onClose}>Anladım!</button>
        </div>
      </div>
    </div>
  );
}
