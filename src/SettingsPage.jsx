import { useState } from "react";
import { ArrowLeft, Palette, UserRound, Bell, Ruler, Volume2, Shield, Info } from "lucide-react";
import { themes, themeFor, saveTheme, exportSnapshot } from "./preferences.js";
import "./Settings.css";

export function SettingsPage({data,user,cloud,syncStatus,onSync,onSignOut,onPersist,onPreview,onBack,onProfile}) {
  const [draft,setDraft]=useState(themeFor(data.preferences?.theme).id);
  const [error,setError]=useState("");
  const [saved,setSaved]=useState("");
  const choose=id=>{setDraft(id);onPreview(id);setSaved("");setError("");};
  const save=()=>{try{if(onPersist(current=>saveTheme(current,draft))){onPreview(null);setSaved("Motyw zapisany.");setError("");}else setError("Nie zapisano motywu. Podgląd pozostaje aktywny; spróbuj ponownie.");}catch(cause){setError(cause.message);}};
  const reset=()=>{const id=themeFor(data.preferences?.theme).id;setDraft(id);onPreview(null);setError("");setSaved("Przywrócono zapisany motyw.");};
  const download=()=>{try{const blob=new Blob([exportSnapshot(data)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="pakiernia-dane.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setSaved("Przygotowano eksport danych. Sprawdź pobrane pliki.");}catch{setError("Nie udało się przygotować eksportu.");}};
  return <div className="settings-page">
    <header className="settings-heading"><button type="button" aria-label="Wróć z ustawień" onClick={onBack}><ArrowLeft size={20}/></button><h1>Ustawienia</h1></header>
    <section className="settings-section"><h2><Palette size={19}/>Motyw kolorystyczny</h2><p>Wybierz podgląd, następnie zapisz. Wyjście przywraca zapisany motyw.</p>
      <div className="theme-grid" role="group" aria-label="Podgląd motywu">{themes.map(theme=><button type="button" className="theme-choice" aria-pressed={draft===theme.id} aria-label={theme.name} key={theme.id} style={{"--preview-accent":theme.accent}} onClick={()=>choose(theme.id)}><span className="theme-preview" aria-hidden="true"><b>ϟ</b><i>PAKIERNIA</i><em/></span><strong>{theme.name}</strong><small>{theme.accent}{draft===theme.id?" · podgląd":""}</small></button>)}</div>
      <div className="theme-actions"><button type="button" className="primary-cta" onClick={save}>Zapisz motyw</button><button type="button" onClick={reset}>Cofnij podgląd</button></div>
    </section>
    {error&&<p className="form-error" role="alert">{error}</p>}{saved&&<p role="status">{saved}</p>}
    <section className="settings-section"><h2><UserRound size={19}/>Konto i synchronizacja</h2><p>{cloud?user?.email || "Zalogowane konto":"Tryb lokalny — dane zapisane w tej przeglądarce."}</p><p>{syncStatus}</p>{cloud&&<div className="settings-actions"><button type="button" onClick={onSync}>Synchronizuj teraz</button><button type="button" onClick={onSignOut}>Wyloguj</button></div>}<button type="button" onClick={onProfile}>Otwórz profil sylwetki i pomiary</button></section>
    <section className="settings-section"><h2><Bell size={19}/>Powiadomienia</h2><p>Przypomnienia i powiadomienia systemowe nie są jeszcze dostępne. Aplikacja nie prosi o uprawnienia.</p></section>
    <section className="settings-section"><h2><Ruler size={19}/>Jednostki</h2><p>Obciążenia i masa: kg · obwody i wzrost: cm · nawodnienie: l.</p><small>Zmiana jednostek nie jest jeszcze dostępna.</small></section>
    <section className="settings-section"><h2><Volume2 size={19}/>Dźwięki</h2><p>Alarm końca przerwy nie jest jeszcze dostępny. Pozostały czas jest widoczny w treningu.</p></section>
    <section className="settings-section"><h2><Shield size={19}/>Dane i prywatność</h2><p>Eksport obejmuje zapisane treningi, plany, pomiary i ustawienia bieżącego konta. Zawiera dane osobiste — przechowuj go prywatnie.</p><button type="button" onClick={download}>Pobierz moje dane (JSON)</button><p>Dane są przechowywane w pamięci tej przeglądarki{cloud?" i synchronizowane z kontem":""}. Eksport nie zawiera hasła ani tokenów logowania.</p><small>Usuwanie konta i import danych nie są jeszcze dostępne w aplikacji.</small></section>
    <section className="settings-section"><h2><Info size={19}/>O aplikacji</h2><p>Pakiernia u Matiego · PWA · wersja 1.0.0</p><p>Wyniki pochodzą z zapisów użytkownika. Wizualizacja sylwetki pozostaje orientacyjna; zatwierdzone grafiki i deformacje nie są jeszcze dostępne.</p></section>
  </div>;
}
