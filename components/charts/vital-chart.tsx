export function VitalChart({ patient = false }: { patient?: boolean }) {
  return <div className={`chart ${patient ? "patient-chart" : ""}`}>
    <div className="chart-y"><span>140</span><span>120</span><span>100</span><span>80</span></div>
    <svg viewBox="0 0 560 160" preserveAspectRatio="none" role="img" aria-label="Évolution de la tension artérielle">
      <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0284c7" stopOpacity=".2"/><stop offset="1" stopColor="#0284c7" stopOpacity="0"/></linearGradient></defs>
      <g className="grid-lines"><path d="M0 20H560M0 60H560M0 100H560M0 140H560"/></g>
      <path className="area" d="M0 88 C40 82 55 55 95 62 S145 96 190 81 S245 50 280 59 S330 86 375 68 S430 35 470 52 S520 72 560 44 L560 160H0Z"/>
      <path className="line-main" d="M0 88 C40 82 55 55 95 62 S145 96 190 81 S245 50 280 59 S330 86 375 68 S430 35 470 52 S520 72 560 44"/>
      <path className="line-secondary" d="M0 122 C45 118 55 105 95 109 S150 128 190 118 S245 101 280 106 S330 121 375 112 S430 94 470 101 S520 112 560 96"/>
      {[0,95,190,280,375,470,560].map((x,i)=><circle key={i} cx={x} cy={[88,62,81,59,68,52,44][i]} r="4" className="point"/>)}
    </svg>
    <div className="chart-x"><span>12 mai</span><span>19 mai</span><span>26 mai</span><span>2 juin</span><span>9 juin</span></div>
  </div>;
}
