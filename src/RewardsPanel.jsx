import { Award, Flame, Ruler, Trophy, Zap } from "lucide-react";
import "./PremiumDashboard.css";
const icons={first:Zap,five:Award,ten:Award,twentyfive:Trophy,streak:Flame,record:Trophy,measure:Ruler};
export function RewardsPanel({ rewards, expanded = false }) {
 return <section className="rewards-panel" aria-label="Poziom i odznaki">
  <div className="rewards-heading"><span className="rewards-emblem"><Zap size={22}/></span><div><small>TWÓJ RYTM</small><h2>Poziom {rewards.level}</h2></div><b data-testid="total-xp">{rewards.xp} XP</b></div>
  <div className="xp-track" role="progressbar" aria-label="Postęp do następnego poziomu" aria-valuemin={0} aria-valuemax={rewards.nextLevelXp} aria-valuenow={rewards.levelXp}><span style={{width:`${rewards.levelXp/rewards.nextLevelXp*100}%`}}/></div>
  <p className="xp-caption">{rewards.levelXp} / {rewards.nextLevelXp} XP · do poziomu {rewards.level+1}</p>
  <details open={expanded || undefined}><summary>Odznaki <b>{rewards.badges.filter(b=>b.earned).length} / {rewards.badges.length}</b></summary><div className="reward-badges">{rewards.badges.map(b=>{const Icon=icons[b.id];return <div key={b.id} className={`reward-badge${b.earned?' earned':''}`} data-badge={b.id}><Icon size={21}/><div><b>{b.label}</b><small>{b.hint}</small><span>{b.earned?'Zdobyta':'Do zdobycia'}</span></div></div>;})}</div><p className="xp-rules">100 XP za zapisany trening, 20 XP za ręcznie oznaczony dzień bez sesji, 15 XP za dzień z pomiarem. Punkty wynikają z historii; usunięcie zapisu aktualizuje wynik.</p></details>
 </section>;
}
