# Pakiernia — audyt intuicyjności UX

Data: 30.10.2026. Repozytorium KenyDeploy/PAKIERNIAUX, gałąź `codex/real-progress-mobile`, PR #1. Audytowany kod: `0bb095de8d1bd2304a6cfba6649a89906300131c` — narastająca lista kart serii.

**Wniosek:** podstawowy start i zapis serii są krótkie. Najpierw należy zabezpieczyć utratę sesji i szkiców, następnie ułatwić wznowienie oraz dostęp do akcji treningu. Nie należy wracać do zakładek serii ani chować ich w rozwijanej liście. W tym etapie nie wdrożono poprawek aplikacji.

## Późniejsze wdrożenie UX01

UX01 wdrożono osobno po audycie: odrzucenie sesji zawierającej zatwierdzone serie otwiera drugi DialogSheet z jednoznacznym ostrzeżeniem, nazwą treningu, liczbą wykonanych serii oraz przyciskami „Wróć do treningu” / „Usuń trening”. Liczenie obejmuje także wyniki w pominiętych ćwiczeniach, bo odrzucenie usuwa całą sesję. Usunięcie sprawdza tożsamość sesji wskazanej przy otwieraniu potwierdzenia. Anulowanie/Escape/tło nie zmienia danych; błąd zapisu nie zamyka panelu. Puste sesje zachowują prostą ścieżkę, a zwykły zapis nadal ma tylko dotychczasowe podsumowanie.

Walidacja UX01: 7 odpowiednich testów session-discard/app/session-actions i build — PASS. Scenariusze session-discard oraz growing-series — PASS w lokalnym Chromium. Sprawdzono trzy wykonane serie, identyczność snapshotów i ID po anulowaniu oraz przypadkowym zamknięciu, reload/wznowienie, faktyczne odrzucenie, błąd pamięci/ponowienie, zachowanie wcześniejszej historii i zwykły zapis; 320/375/390/430 px, stopka od 360 px wysokości. Test fizycznego iPhone’a nie został wykonany. Regresje: tests/session-discard.test.js i tests/session-discard.mjs. Pozostałe UX02–UX10 nie zostały wdrożone. Dalsza treść i załączone obserwacje opisują historyczny stan audytu przed tą poprawką.

## Metoda i granice

- Analiza bieżącego kodu oraz istniejących IMPLEMENTATION_PLAN.md i FINAL_AUDIT_HANDOFF.md, bez ponownego audytu bazy/architektury.
- Lokalny build w Chromium/Edge, osobny pusty profil i dane testowe. Sprawdzono sześć głównych zakładek na 320/375/390/430 × 844 px, interakcje treningu, zamiany, planów, pomiarów, ustawień i odrzucenia sesji. Dodatkowo: formularze w niskich widokach 320×360, 375×500, 390×600, 430×844.
- [Surowe pomiary](docs/audit/ux-observations-0bb095d.json), [skrypt odtwarzający próbę](docs/audit/ux-audit-probe.mjs). Wykonano dwie próby; druga doprecyzowała wznowienie długiej sesji i geometrię po ustabilizowaniu widoku. Plik JSON zawiera drugą próbę.
- **K** = jedno dotknięcie przycisku/ikony/checkboxa; **P** = skupienie i uzupełnienie jednego pola, niezależnie od liczby znaków; **W** = wybór jednej wartości w select/datowniku. Nie utożsamiamy W z jednym fizycznym tapnięciem na iOS. **S** = potrzebne przewinięcie, podawane osobno, bez zgadywania liczby gestów.
- Liczby obejmują drogę od wskazanego ekranu do celu. Nie obejmują uruchomienia systemu, logowania, oczekiwania na sieć, zamykania natywnej klawiatury ani powrotu z ukończonego zadania, chyba że zaznaczono inaczej. Pola już prawidłowo wypełnione mogą obniżyć liczbę P. Są to minimalne ścieżki obsługi, nie pomiary czasu i nie wyniki badania z użytkownikami.
- **B** = zaobserwowano w tej próbie przeglądarkowej; **KOD** = wniosek z obsługi zdarzeń/komponentów; **HIP** = hipoteza o zrozumieniu lub odkrywalności, wymagająca próby z człowiekiem.
- Nie testowano fizycznego iPhone’a, Safari/WebKit, natywnej klawiatury, VoiceOver, Dynamic Type ani obsługi jedną ręką na urządzeniu. Zmniejszony viewport nie zastępuje klawiatury iOS. Nie testowano prawdziwych kont, produkcyjnej synchronizacji ani konfliktów urządzeń.
- Nie uruchamiano ponownie builda i npm test: nie zmieniono kodu produktu. Wynik 49/49 z poprzedniego etapu jest historyczny, nie nowym wynikiem tego audytu.

Odtworzenie próby: uruchomić istniejący lokalny preview, ustawić APP_URL, PLAYWRIGHT_MODULE i CHROMIUM_PATH dla dostępnego środowiska, następnie `node docs/audit/ux-audit-probe.mjs`. Opcjonalny UX_AUDIT_OUTPUT zapisuje JSON. Skrypt tworzy własny profil przeglądarki, nie używa sesji zalogowanego użytkownika; próby quota i odrzucenia dotyczą wyłącznie jego lokalnych danych testowych. Playwright nie został dodany do zależności projektu.

## Fakty z przeglądarki

Pomiary są w pikselach CSS. `visibleWithoutScroll` w JSON oznacza widoczność przy aktualnym `scrollY`; po automatycznym przewinięciu nie oznacza położenia na początku dokumentu.

| Obserwacja | Wynik | Znaczenie |
| --- | --- | --- |
| Start na pulpicie, cztery szerokości | przycisk 48 px wysokości, y≈288–289; widoczny bez ręcznego przewijania | Zachować obecną hierarchię startu |
| Pierwszy zapis serii, 390×844 | y≈627, wysokość 48, widoczny | Podstawowa akcja działa bez szukania w menu |
| Pięć wierszy: 1 wykonany + 4 otwarte | po dodaniu automatyczny scroll do końca; Dodaj i Następne widoczne | Nie zgłaszać błędu „dodanie zawsze chowa przyciski” — automat pomaga |
| Te same pięć wierszy po reload → Wznów | ostatnia karta y≈1276, Dodaj y≈1501, nawigacja y≈1618 przy wysokości 844 | Wznowienie wraca do nagłówka, nie do miejsca pracy |
| Zamiana nieruszonego ćwiczenia | ciężar pusty, ale checkbox potwierdzenia obecny | Sam cel powtórzeń traktowany jak wpisane dane |
| Utwórz plan → wpisz nazwę → Zamknij | liczba planów 2 → 3, pozostaje „Nowy plan 3” | Anulowanie tworzy domyślny plan |
| Błąd localStorage przy Zapisz plan | formularz zamknięty, stara nazwa w danych; komunikat błędu tylko globalnie | Utrata szkicu mimo nieudanego zapisu |
| Pomiar masy 81 → tapnięcie tła | dialog zamknięty, 0 zapisanych pomiarów | Wartość szkicu znika bez pytania |
| Ustawienia, 390×844 | nagłówek Konto i synchronizacja y≈872; cała strona ≈2099 px | Motywy spychają konto i pozostałe opcje niżej |
| Ikona ustawień na tym ekranie | 40×40 px | Mniejsza od przyjętego celu dotykowego 44×44 |
| Zapis planu, 320×360 | y=412, wysokość 50; poza widokiem | Brak stałej stopki, potrzebny scroll w formularzu |
| Stopka profilu po 250 ms od resize/fokusu | widoczna na wszystkich czterech niskich widokach | Nie potwierdzono trwałego nachodzenia tej stopki. Dawny czerwony settings.mjs nie rozstrzyga przyczyny |
| Odrzuć bez zapisu przy zatwierdzonej serii | brak kolejnego potwierdzenia, activeSession=null, historia 0 → 0 | Możliwa nieodwracalna utrata całej rozpoczętej sesji |
| Przepełnienie dokumentu / błędy JS | 0 w 24 sprawdzonych kombinacjach zakładek; 0 pageerror/console.error w próbie | Nie dowodzi poprawności wszystkich modalów, danych i ustawień iOS |

Pomiar wysokości samego inputa wyszukiwarki nie jest pomiarem całej strefy dotykowej jego obudowy. Nie klasyfikowano go automatycznie jako zbyt małego celu.

## 14 scenariuszy — kroki i konkretne uproszczenia

### 1. Otwieram aplikację i rozpoczynam dzisiejszy trening

- **Start/akcje:** gotowy pulpit po odczycie danych → Rozpocznij: **1K**. Alternatywny plan: karta planu lub Plany → Rozpocznij: **2K**. Trening rozpoczęty: Wznów **1K**. Przy braku planu potrzebna osobna ścieżka tworzenia.
- **Zbędne kroki:** brak w podstawowej ścieżce. Nie dodawać wyboru potwierdzającego plan, który już widać na karcie.
- **Zrozumienie:** nazwa i liczba ćwiczeń są czytelne. „Wybrany plan”, „Dzisiaj na planie” i fallback „wybierz na dziś” nie oznaczają tego samego. Użytkownik może uznać fallback za harmonogram (HIP).
- **Telefon:** Start widoczny na wszystkich czterech szerokościach (B). Wznowienie długiego treningu nie prowadzi do ostatniej karty (B).
- **Uproszczenie:** zachować jeden CTA; nazwać fallback „Brak zaplanowanego treningu na dziś — wybierz plan”. Wznów powinno otwierać ostatnią pracę, z widocznym numerem ćwiczenia i podglądem ostatniej serii. **UX03/UX06.**

### 2. Wybieram ćwiczenie i zapisuję serię

- **Start/akcje:** aktywna karta bieżącego ćwiczenia → ciężar + powtórzenia + Zapisz: **1K+2P**; przy poprawnej sugestii powtórzeń **1K+1P**. Sąsiednie ćwiczenie dodaje **1K** Następne. Dowolne ćwiczenie przez menu i select dodaje **1K+1W**.
- **Zbędne kroki:** wybór dowolnej pozycji jest schowany w menu. Nie wymagać dodatkowego potwierdzania zwykłego zapisu.
- **Zrozumienie:** zwarte wykonane wiersze i jawne pola są dobre. „Zapisz serię” może być rozumiane jako ostateczny zapis w historii, choć ukończony trening powstaje dopiero później (HIP).
- **Telefon/nieczytelność:** pierwszy przycisk widoczny (B). Po wznowieniu wiele otwartych kart wymaga szukania; status synchronizacji znajduje się nad przewijaną zawartością.
- **Uproszczenie:** zachować narastającą listę. Pokazywać „Seria zatwierdzona w bieżącym treningu”; nawigacja do innego ćwiczenia ma być dostępna wprost i zachowywać wpisy. **UX03/UX09.**

### 3. Dodaję lub usuwam serię

- **Start/akcje:** Dodaj **1K**; usuń pustą nową kartę **1K**; usuń wykonaną albo wypełnioną **2K** (Usuń → potwierdzenie). Anulowanie potwierdzenia to **1K** w otwartym dialogu.
- **Zbędne kroki:** potwierdzenie rzeczywistego usunięcia nie jest zbędne. Nie przywracać wcześniejszego zachowania „Dodaj wznawia istniejącą serię”.
- **Zrozumienie:** ikona kosza bez tekstu wymaga rozpoznania, lecz ma aria-label. Po usunięciu numery się zmieniają — warto nazwać usuwany wynik w dialogu, nie tylko numer (HIP).
- **Telefon:** przyciski przy każdej karcie i automat przewijania po dodaniu działają; po wznowieniu CTA może być daleko (B).
- **Uproszczenie:** zachować obecne 1/2K. W potwierdzeniu podać „20 kg × 8” i ćwiczenie; po usunięciu krótki komunikat o wyniku operacji. Utrzymać stabilne ID. **UX03/UX10.**

### 4. Zmieniam ciężar i powtórzenia

- **Start/akcje:** otwarta karta: **2P+1K** do zatwierdzenia; wykonany wiersz: Edytuj + dwa pola + Zapisz = **2K+2P**. Przycisk ± to **1K za zmianę**; n kliknięć dla n kroków.
- **Zbędne kroki:** po potwierdzeniu nie przenosić użytkownika do innej, automatycznie utworzonej karty. Wiele kliknięć ± przy dużej różnicy jest zbędne — pole tekstowe pozostaje skrótem.
- **Zrozumienie:** krok ciężaru 2,5 kg nie jest widoczny w samym znaku „+”; po zmianie wykonanego wyniku znika jego stan wykonania aż do ponownego zapisu (KOD).
- **Telefon:** 320 px ma pola jedno pod drugim; pozostałe rozmiary dwa obok. Zachować strefy ± 44 px. Natywnej klawiatury iOS i kropki/przecinka w tym audycie nie sprawdzono.
- **Uproszczenie:** subtelny opis kroku, wyraźne „Zmiany do zatwierdzenia”, przywrócenie fokusu w tej samej karcie. Nie dodawać pełnego dialogu do każdej zmiany. **UX09/UX10.**

### 5. Sprawdzam poprzednie wyniki

- **Start/akcje:** aktywny trening → karta Ostatni trening **1K**; wybór wcześniejszej sesji **+1K**; pełny progres z panelu **+1K**. Zamknięcie i powrót do pracy **+1K**.
- **Zbędne kroki:** dla samego przypomnienia jednego wyniku otwieranie i zamykanie panelu bywa zbędne; obecny zwięzły podgląd na karcie warto zachować.
- **Zrozumienie:** odróżnienie dat i zatwierdzonych wyników jest dobre. „Pełna historia / progres” prowadzi do ogólnego ekranu Postępu z ustawionym ćwiczeniem, nie osobnej historii listy sesji.
- **Telefon:** karta pod zdjęciem jest widoczna na początku, ale daleko od późniejszych serii; pięć sesji i wyniki mogą wymagać S wewnątrz sheetu.
- **Uproszczenie:** krótki poprzedni wynik przy danej karcie/sekcji serii, bez kopiowania danych; dokładniej nazwać docelowy przycisk „Wykres tego ćwiczenia”. **UX03/UX08.**

### 6. Zamieniam zajęte ćwiczenie

- **Start/akcje:** menu → Zamień → wybierz ćwiczenie → zatwierdź: **4K**; obecnie zwykle **5K**, bo dochodzi checkbox. Szukanie **+1P**, kategoria **+1K**, zmiana trzech celów **+3P** tylko jeśli potrzebna.
- **Zbędne kroki:** menu dla częstej akcji; checkbox również przy nieruszonej karcie z pustym ciężarem i zasugerowanymi powtórzeniami (B). Przy prawdziwych wpisach/wykonaniach potwierdzenie jest konieczne.
- **Zrozumienie:** „tylko bieżący trening” i informacja o zachowaniu planu są dobre. Ostrzeżenie o utracie „podpowiedzianych” wartości przy pustym ćwiczeniu może uczyć bezmyślnego zatwierdzania (HIP).
- **Telefon:** główna ścieżka zaczyna się od górnego menu. Wybór jest rozdzielony na listę i drugi widok z parametrami; późniejsza stopka jest stała.
- **Uproszczenie:** widoczny przycisk Zamień przy ćwiczeniu, utrzymanie celu w podsumowaniu wyboru; potwierdzenie wyłącznie dla rzeczywistych danych. Cel: **2K bez danych / 3K z potwierdzeniem**, plus opcjonalne wyszukiwanie. **UX04.**

### 7. Pomijam ćwiczenie

- **Start/akcje:** menu → Pomiń: **2K**. Przejście do następnego **+1K**. Cofnięcie z widocznego banera **1K**.
- **Zbędne kroki:** szukanie w menu i osobne Następne po świadomym pominięciu.
- **Zrozumienie:** baner mówi, że wyniki nie trafią do zapisu; dane do cofnięcia pozostają. To zabezpieczenie należy zachować.
- **Telefon:** wyłączone formularze nadal zajmują miejsce. Nawigacja może być pod długą listą kart.
- **Uproszczenie:** jawne Pomiń z bezpośrednią możliwością przejścia dalej i Cofnij; zachować wartości, nie usuwać ćwiczenia z planu. Docelowo pomiń i kontynuuj w **1K**, cofnięcie **1K**. **UX03/UX04.**

### 8. Uruchamiam przerwę

- **Start/akcje:** po zatwierdzeniu serii przerwa startuje automatycznie: **0 dodatkowych K**. Ręcznie: zegar → Rozpocznij **2K**; z wyborem presetu **3K**; własny czas **3K+1P**. Powrót do pól wymaga jeszcze zamknięcia panelu **+1K**.
- **Zbędne kroki:** otwieranie zegara i zamykanie panelu dla zwykłej przerwy. Dwa przedstawienia tej samej przerwy: wskaźnik nad seriami i duża karta pod nawigacją.
- **Zrozumienie:** rozdzielenie czasu całego treningu i przerwy jest opisane poprawnie. „Rozpocznij od nowa” podczas aktywnej przerwy resetuje ją; to inna akcja niż wznów.
- **Telefon:** widoczny zegar jest wysoko; sterowanie przerwą na dole jest daleko od ostatniej czynności. Brak dźwięku/powiadomień pozostaje funkcjonalnym ograniczeniem, nie działającą opcją.
- **Uproszczenie:** jeden kompaktowy moduł przerwy blisko serii z jawnym Start/Wznów/+15/Pomiń; ustawienia czasu w sheet. Ręczny start zwykłej przerwy **1K**, bez zamykania dodatkowego okna. Nie łączyć obu zegarów. **UX05.**

### 9. Kończę trening i czytam podsumowanie

- **Start/akcje:** z dowolnego ćwiczenia: zegar lub menu → Zakończ → Zapisz: **3K**. Z ostatniego: Zakończ na dole → Zapisz **2K**. Opcjonalnie Sprawdź serie **+1K**, jawne potwierdzenie niewykonanych wpisanych pól **+1K**.
- **Zbędne kroki:** szukanie zakończenia pod zegarem; nie usuwać potrzebnego podsumowania i zatwierdzenia.
- **Zrozumienie:** zatwierdzone/niezatwierdzone są rozróżnione. Odrzuć bez zapisu jest destrukcją całej sesji, choć pytanie nagłówka dotyczy zakończenia, nie usunięcia danych.
- **Telefon:** stopka podsumowania jest stała; przyciski treningu poza ostatnim ćwiczeniem są ukryte w panelach. Duża liczba serii wydłuża dojście do dolnej nawigacji.
- **Uproszczenie:** widoczne Zakończ zawsze prowadzące do istniejącego podsumowania, **2K łącznie**. Odrzucenie wykonanych danych oddzielić dodatkowym świadomym potwierdzeniem; zwykły zapis nie potrzebuje kolejnego dialogu. **UX01/UX03/UX09.**

### 10. Tworzę lub edytuję plan

- **Start/akcje:** z pulpitu: Plany → Utwórz → Zapisz **3K+2P** dla własnej nazwy i dni; domyślne ćwiczenie już dodane. Techniczne minimum to **3K**, jeśli zostawić wszystkie wartości domyślne. Każde dodatkowe ćwiczenie **+1W**, zmiana celów do **+3P na ćwiczenie**. Edycja: Plany → Edytuj → Zapisz **3K+P dla zmienianych pól**. Sama nazwa to 1P; nie trzeba zmieniać dni.
- **Zbędne kroki:** usuwanie automatycznie wstawionego pierwszego ćwiczenia, przewijanie natywnej listy 72 nazw bez wyszukiwarki. Anulowanie tworzenia pozostawia domyślny plan (B), więc może wymagać późniejszego porządkowania.
- **Zrozumienie:** karta planu skraca nazwy ćwiczeń do pierwszego słowa. Dni są swobodnym tekstem; brak przykładów formatu zgodnego z rozpoznawaniem harmonogramu.
- **Telefon:** Zapisz plan poza widokiem 320×360 (B); formularz nie korzysta z DialogSheet. Nazwa ćwiczenia w edytorze jest też przyciskiem jego usuwania, co nie jest oczywiste (KOD/HIP).
- **Uproszczenie:** szkic lokalny do Zapisz; przenieść formularz do istniejącego DialogSheet; jawny kosz; ponownie użyć wyszukiwarki ćwiczeń; wybór dni zamiast swobodnego tekstu, bez migracji bazy. Minimalna liczba K może pozostać 3 — zysk to bezpieczeństwo i mniej przewijania. **UX02/UX06.**

### 11. Szukam ćwiczenia w bazie

- **Start/akcje:** Baza → wpisanie frazy **1K+1P**, wyniki na żywo. Kategoria **+1K**, sprzęt **+1W**. Otwarcie wyniku **+1K**.
- **Zbędne kroki:** nie dodawać przycisku Szukaj do działającego filtrowania na żywo. Brak jednego resetu trzech filtrów wymaga nawet P+K+W do ich ręcznego wyczyszczenia.
- **Zrozumienie:** tapnięcie nazwy otwiera edycję przerwy, nie kartę informacji/zdjęcia ćwiczenia. To rozbieżność z typowym oczekiwaniem po tytule wyniku (HIP).
- **Telefon:** miniatury pomagają, ale pełna niefiltrowana lista jest bardzo długa. Kategorie wymagają przewijania poziomego, a sekcja narzędzi katalogu stoi przed wyszukiwaniem.
- **Uproszczenie:** wyszukiwarka jako pierwsza kontrolka, Wyczyść filtry **1K**, tapnięcie wyniku otwiera jawnie nazwane szczegóły; edycja przerwy jako akcja w tej karcie. Użyć istniejącej listy/zdjęć i edytora, bez nowej bazy. **UX08/UX10.**

### 12. Dodaję pomiar ciała

- **Start/akcje:** Pomiary → Dodaj → jedna rzeczywista wartość → Zapisz **3K+1P**. Inna data **+1W**, notatka **+1P**, każde kolejne pole **+1P**.
- **Zbędne kroki:** masa jest pierwszym polem i nie wymaga szukania. Pojedynczy wybrany obwód trzeba jednak odnaleźć wśród 12 opcjonalnych miar. Nie wymagać przejścia przez profil lub wyboru modelu przed zapisem.
- **Zrozumienie:** informacja o pustych polach i stronach ciała jest dobra. Domyślna zakładka Sylwetka pokazuje brak grafiki zamiast szybko prowadzić do rzeczywistych zapisów.
- **Telefon:** Dodaj pomiar jest widoczne od początku (B), ale formularz jest długi; tapnięcie tła porzuca wpisany szkic (B). Stopka profilu po ustabilizowaniu rozmiaru była widoczna; natywna klawiatura pomiaru pozostaje do próby.
- **Uproszczenie:** zachować główne Dodaj, na starcie wybrać miarę lub podać popularne pola i rozwinąć pozostałe; domyślnie lista realnych wyników, sylwetka jako opcja z jasnym statusem braku zasobu. Ochrona szkicu przed przypadkowym zamknięciem. **UX02/UX07.**

### 13. Sprawdzam progres

- **Start/akcje:** Postęp **1K**; inne ćwiczenie i okres **+2W**. Punkt na wykresie **+1K**, tabela wartości **+1K**. Dla obwodu: Pomiary → wybór miary → Lista **2K+1W**. Pełny wykres z historii aktywnego ćwiczenia **2K** z zachowanym kontekstem ćwiczenia.
- **Zbędne kroki:** karty Serie i Objętość z pulpitu otwierają ten sam ogólny Postęp, bez własnego kontekstu. Miary ciała i wyniki siłowe są w różnych miejscach.
- **Zrozumienie:** wykres pokazuje największy zapisany ciężar, nie dowód postępu w każdej sesji. Sama etykieta „Ciężar w ćwiczeniu” jest zbyt ogólna. Nie należy dopowiadać postępu mięśni lub prognoz sylwetki.
- **Telefon:** początkowy ekran ma objętość przed wyborem ćwiczenia; dojście do właściwego wykresu wymaga S, zwłaszcza po wejściu z karty serii. Puste dane potrzebują wskazania następnej czynności.
- **Uproszczenie:** przekazywać kontekst klikniętej metryki do istniejącego Postępu; doprecyzować tytuły i okres; dodać prosty odnośnik Pomiary zamiast powielania danych. **UX08.**

### 14. Zmieniam motyw i ustawienia

- **Start/akcje:** ustawienia → motyw → Zapisz **3K**. Synchronizacja, jeśli dostępna: ustawienia → Synchronizuj **2K+S**. Profil z ustawień: ustawienia → Otwórz profil i pomiary → ikona profilu **3K**, potem pola i Zapisz **+1K+P**.
- **Zbędne kroki:** przejście do profilu przez pośredni ekran pomiarów. Sześć dużych kart motywu przed pozostałymi ustawieniami. Powiadomienia, jednostki i dźwięki nie mają działających preferencji — nie można policzyć „zmiany” jako ukończonego zadania.
- **Zrozumienie:** podgląd i zapis motywu są rozróżnione, wyjście przywraca zapisany kolor. Konto/synchronizacja ma mniejszy priorytet wizualny niż wygląd aplikacji.
- **Telefon:** Konto i synchronizacja zaczynało się pod pierwszym widokiem 390×844 (B); przycisk ustawień miał 40×40 px (B). Dostęp do ustawień w trakcie treningu wymaga wyjścia na pulpit; nie zastępować nim ważnych akcji treningu.
- **Uproszczenie:** ekran krótkich pozycji jak na referencji, Motyw jako osobny panel z obecnym podglądem; konto i stan zapisu wyżej; profil otwierany wprost. Funkcje niedostępne jako małe etykiety, bez pozornych przełączników. **UX09/UX10.**

## Problemy i zalecana kolejność — maksymalnie 10

Priorytet oznacza rekomendację kolejności, nie deklarację awarii na każdym iPhonie. Kwestie czytelności/odkrywalności są hipotezami aż do próby użytkownika.

### Krytyczne — bezpieczeństwo danych

**1. UX01 — nieodwracalne odrzucenie całej sesji z wynikami.** Potwierdzone B: jeden tap w Odrzuć w podsumowaniu usuwa activeSession, bez kolejnego pytania lub cofnięcia; historia nie dostaje wyniku. Podsumowanie „Zakończyć trening?” nie opisuje osobno utraty wszystkich serii. Rozwiązanie: pozostawić podsumowanie zapisu, dodać odrębne potwierdzenie destrukcji z liczbą zatwierdzonych serii; bez dodatkowego dialogu przy zwykłym Zapisz. Komponenty: App.jsx (stopka finish-review), istniejący DialogSheet. **Akceptacja:** przy sesji z trzema zapisanymi seriami anulowanie odrzucenia zachowuje identyczny snapshot i ID; dopiero jawne „Usuń cały rozpoczęty trening” odrzuca. Odrzucenie pustej sesji pozostaje proste.

**2. UX02 — niespójne bezpieczeństwo szkiców i błędu zapisu.** Potwierdzone B/KOD: savePlan wywołuje setPlans, ignoruje wynik, zamyka edytor; update w useTrainingData nie zwraca boolean. addPlan zapisuje placeholder przed zgodą użytkownika. Tło formularza pomiaru zamyka szkic bez ostrzeżenia. Rozwiązanie: wykorzystać istniejące updateData i jego wynik w zapisie planu, nie zmieniać kolejki synchronizacji; nowy plan trzymać w szkicu do zatwierdzenia; ochrona dirty formularzy przed przypadkowym tłem/gestem zamknięcia. Komponenty: App.jsx (addPlan/savePlan/planEditor), DialogSheet, BodyMeasurementEditor, BodyProfileEditor. **Akceptacja:** quota nie zamyka formularza, zachowuje wszystkie wpisy i pokazuje błąd przy akcji; anulowanie nowego planu nie zmienia liczby planów; zamknięcie brudnego szkicu wymaga świadomej decyzji. Wystarczy jeden spójny mechanizm ochrony, bez mnożenia modalów zwykłego zapisu.

### Średnie — przepływ najczęstszych zadań

**3. UX03 — wznowienie nie wraca do miejsca pracy; główne akcje zależą od długości listy.** B: przy pięciu wierszach ostatnia karta po wznowieniu była poniżej y=1275, nawigacja poniżej y=1617. Zakończenie przed ostatnim ćwiczeniem ukryte pod zegarem/menu. Rozwiązanie: wskazać ostatnią edytowaną/niewykonaną kartę przy wznowieniu i zachować pozycję; umieścić jawne Zakończ i przejście do ćwiczeń w zasięgu kciuka. Jeśli pasek ma być przyklejony, zarezerwować jego realną wysokość i chować/przenosić go przy klawiaturze. Komponenty: App.jsx, ActiveSetEditor, ActiveSetEditor.css, WorkoutHistory.css. **Akceptacja:** po reload sesji z 10 seriami ostatni szkic jest od razu odnaleziony, wszystkie wcześniejsze wiersze pozostają widoczne w liście; zakończenie maksymalnie 2K; żaden pasek nie przykrywa aktywnego pola. Nie wprowadzać zakładek serii ani głównego dropdownu.

**4. UX04 — zamiana i pominięcie ukryte, ostrzeżenia także dla samych sugestii.** B/KOD: hasSessionSets liczy niepuste domyślne reps, nie uwzględnia repsSuggested. Rozwiązanie: jawne Zamień/Pomiń przy ćwiczeniu; potwierdzenie opierać na rzeczywistych wpisach i wykonanych seriach, korzystając z istniejących informacji o sugestiach. Komponenty: App.jsx, SessionExerciseMenu, SessionExerciseEditor, sessionActions.js. **Akceptacja:** nieruszona karta nie wymaga potwierdzania utraty danych; wpisany lub wykonany wynik zawsze wymaga potwierdzenia przed zamianą; 2/3K dla podstawowej zamiany, pominięcie z kontynuacją 1K i Cofnij 1K; oryginalny plan/ID historii bez zmian.

**5. UX05 — przerwa ma dwa widoki, a prosty start chowa się pod zegarem.** KOD/HIP: kompaktowy wskaźnik + duża karta + sheet; wybór presetu nie uruchamia, a po starcie sheet zostaje. Rozwiązanie: jeden kompaktowy moduł blisko serii z szybkimi akcjami, sheet do szczegółów. Komponenty: App.jsx, WorkoutTimerSheet, RestControls, WorkoutMedia.css. **Akceptacja:** ręczna zwykła przerwa 1K i bez zamykania panelu; dwa zegary nadal niezależne i trwałe po odświeżeniu; reset ma inną etykietę niż wznów. Brak udawanego dźwięku/powiadomienia.

**6. UX06 — tworzenie planu wymaga porządkowania i przeszukiwania długiego selecta.** B/KOD: domyślne pierwsze ćwiczenie, nazwy skrócone do pierwszego słowa, swobodny tekst dni, zapis poza krótkim widokiem. Rozwiązanie: istniejący DialogSheet ze stałą stopką, wspólny picker z wyszukiwaniem i kategoriami, jawne usuwanie z planu i wybór dni. Komponenty: App.jsx (plan-editor, karty planów), SessionExerciseEditor jako wzór listy, DialogSheet, dashboard.js tylko przy koniecznym dopasowaniu formatu dni. **Akceptacja:** 10 ćwiczeń w edytorze nie ukrywa Zapisz; wyszukanie ćwiczenia nie wymaga przewijania 72 opcji; rozróżnialne nazwy; wszystkie cele i stare formaty dni zachowane. Nie przepisywać schematu planów.

**7. UX07 — pomiary zaczynają się od niedostępnej sylwetki i dużego formularza.** KOD/HIP: brak zasobów jest uczciwie oznaczony, ale domyślnie zajmuje główną przestrzeń. Rozwiązanie: dane/lista jako punkt startu, skrót „Dodaj masę/obwód”, sylwetka opcjonalnie ze statusem; możliwość wpisania kilku miar zachować. Komponenty: MeasurementsPage, BodyMeasurementEditor, BodyModelView, Measurements.css. **Akceptacja:** pojedynczy pomiar pozostaje 3K+1P od pulpitu, bez wyboru modelu; popularna miara bez szukania między 12 polami; brakujące wartości nadal puste, legacy bez dopisywania stron; brak fałszywej anatomii.

**8. UX08 — destination/context nie zawsze pasują do klikniętej informacji.** KOD/HIP: nazwa ćwiczenia w bazie otwiera przerwę, Serie/Objętość otwierają ten sam ogólny Postęp, „historia/progres” łączy dwa znaczenia; brak jednego resetu filtrów. Rozwiązanie: jawne szczegóły ćwiczenia z istniejących danych, nazwy odpowiadające celowi, przekazanie kontekstu metryki i Wyczyść filtry. Komponenty: App.jsx (baza/stats), HomeDashboard, ExerciseHistorySheet, Visuals. **Akceptacja:** z karty metryki użytkownik dostaje jej okres/typ lub jasne wyjaśnienie ograniczenia; wynik wyszukiwania nie udaje innego ekranu; reset filtrów 1K; wykres nazwany „Największy zapisany ciężar”, bez automatycznej oceny wzrostu jako postępu.

**9. UX09 — stan zapisu i konto przegrywają z wyglądem/wyjściem z ekranu.** B/KOD/HIP: status globalny jest nad treścią; „Zapisz serię” i „Zapisz trening” to różne poziomy zapisu; sekcja konta poniżej dużego wyboru motywu. Rozwiązanie: krótkie potwierdzenia przy akcji i rozróżnienie zatwierdzenia serii, lokalnego zapisu oraz oczekiwania na chmurę; lista ustawień z Motywem w osobnym panelu i kontem wysoko. Komponenty: App.jsx, ActiveSetEditor, SettingsPage, Settings.css; użyć istniejącego syncStatus, bez przebudowy useTrainingData. **Akceptacja:** na długiej liście wiadomo, czy seria zatwierdzona i czy sesja czeka na synchronizację; brak sukcesu po błędzie; temat podglądu wyraźnie różny od zapisu; niedostępne opcje oznaczone, nie zajmują głównej części widoku. Rezygnacja z podglądu nie zmienia zapisanego koloru.

### Kosmetyczne — na końcu, poza bezpieczeństwem celu dotykowego

**10. UX10 — drobne kontrole i nazwy wymagają ujednolicenia.** B/KOD/HIP: ustawienia 40×40 zamiast przyjętych 44×44, ikony bez widocznych podpisów, krok ± nieopisany, długie instrukcje i różne nazwy zakończenia/edycji. Rozwiązanie: większe hit-area bez powiększania całego artworku, spójne krótkie etykiety i pomoc przy polu. Komponenty: styles.css, ActiveSetEditor.css, Settings.css, SessionExerciseMenu, HomeDashboard. **Akceptacja:** główne dotykowe akcje minimum 44×44, tekst nie nachodzi przy powiększeniu, destrukcja odróżniona od nawigacji i nie polega wyłącznie na kolorze. Nie traktować całego ujednolicenia CSS jako warunku wdrożenia wcześniejszych poprawek.

## Co pozostawić i jak wdrażać

- Zachować 1K start na pulpicie, narastające karty, widoczne zwarte wyniki, potwierdzanie usunięcia wykonanej serii, zwykłe bezpośrednie wpisywanie liczb i ±, historię po ID, odwracalne pominięcie oraz rozróżnienie danych ręcznych od wyników.
- Zachować istniejący snapshot, konta, kolejkę synchronizacji, identyfikatory i format starych danych. Do większości rekomendacji wystarczy UI i poprawna obsługa wyniku updateData. Nie projektować w tym etapie migracji bazy.
- Kolejność prac: **UX01 → UX02 → UX03 → UX04 → UX05 → UX06 → UX07 → UX08 → UX09 → UX10**. Każdy krok jako mały, osobno weryfikowalny zakres. Wyjątek: hit-area krytycznych przycisków można poprawiać wraz z dotykanym komponentem.
- Testy następnych poprawek: utrata pamięci/nieudany zapis, odrzucenie/anulowanie, długi trening i wznowienie, poprawki/ID, puste stany i dwa konta na atrapie; odpowiednie scenariusze przeglądarkowe. Nie pomijać potwierdzeń tylko po to, by obniżyć liczbę K.
- Próba człowieka na iPhonie: rozpocznij → 3 serie → korekta → 5 kart → klawiatura → zamiana → przerwa → zapis; potem nowy plan z anulowaniem, pomiar i motyw. Zanotować rzeczywiste tapnięcia/gesty, nie znalezioną akcję, przypadkowe tapnięcia i zasłonięcie pola. Osobno Safari i zainstalowana PWA, bezpieczne dane testowe, powrót z tła i większy tekst.

To jest lista rekomendacji do uzgodnienia kolejnych małych poprawek, nie implementacja ani potwierdzenie poprawności całej aplikacji na iPhonie.
