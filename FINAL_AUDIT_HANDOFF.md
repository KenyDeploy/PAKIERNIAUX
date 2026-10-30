# Pakiernia u Matiego — przekazanie do niezależnego audytu

Data: 30.10.2026. Ten dokument opisuje stan przekazywany do audytu, a nie deklarację gotowości produkcyjnej. Nie dodawano w tym kroku funkcji, poprawek UI ani zmian schematu. „Ukończona” oznacza wskazany zakres działania; nie oznacza weryfikacji na fizycznym iPhonie ani kompletnej zgodności pikselowej z planszą.

## A. Stan projektu

- Repozytorium: [KenyDeploy/PAKIERNIAUX](https://github.com/KenyDeploy/PAKIERNIAUX).
- Gałąź: [codex/real-progress-mobile](https://github.com/KenyDeploy/PAKIERNIAUX/tree/codex/real-progress-mobile).
- Istniejący [PR #1](https://github.com/KenyDeploy/PAKIERNIAUX/pull/1), do main, otwarty i draft. Nie scalono.
- Ostatni commit audytowanego kodu i testów: `9fc52bdc3ed8f6c1bc456c1e09f6bb263a7cbc4d`. Commit zawierający niniejszy dokument jest późniejszy. Dokładny końcowy SHA przekazania jest w opisie PR oraz wyniku `git rev-parse HEAD`; plik nie może zawierać własnego SHA, ponieważ zmieniłoby to jego hash.
- W chwili rozpoczęcia przekazania istniało 7 lokalnych commitów ponad zdalną gałęzią, HEAD `9f8b2c6`. Przejrzane pozostałe lokalne zmiany Pakierni zapisano oddzielnie: `c5da1be` (istniejąca integracja i CSS treningu) i `9fc52bd` (istniejące testy i historyczny AUDIT.md). Nie stosowano resetu ani zbiorczego dodawania całego katalogu.
- Wdrożenie: lokalny build i lokalny preview; w tym przekazaniu nie wykonywano deploy, promocji ani zmiany produkcji. Push aktualizuje gałąź PR; ewentualny automatyczny preview GitHub/Vercel nie jest dowodem wdrożenia produkcyjnego. Obecnej wersji produkcyjnej nie identyfikowano przez panel Vercel.
- Zależności i schemat: React/Vite/lucide i istniejący klient Supabase; bez nowych zależności i migracji SQL na etapach UI/profilu/motywów.
- Audytować tę gałąź/HEAD PR, nie main i nie historyczny zdalny d9896c7.

### Wykonane etapy i granice

| Etap | Zapis prac |
| --- | --- |
| Przygotowanie i plan | 331d815: IMPLEMENTATION_PLAN.md, inwentaryzacja istniejącej aplikacji i lokalnych zmian |
| 2 — pojedyncza aktywna seria | 7f40d1b: edytor, przejście do kolejnej niewykonanej, ręczne dodanie, korekty |
| 3 — historia i zarządzanie ćwiczeniami | 2c9c491: rzeczywista historia po ID, menu i operacje tylko w sesji |
| 4 — timer i zdjęcia | f123e83: niezależne trwałe zegary, podsumowanie, pełny ekran zdjęcia |
| 5 — pulpit | 3f1deae: rzeczywiste metryki, plan, tydzień, kalendarz, nawodnienie |
| 6 — profil i pomiary | aa73cb3: profil/cele, obwody obustronne, edycja/usuwanie, wykresy/porównanie; brak grafiki i deformacji |
| 7 — ustawienia, motywy i audyt | 9f8b2c6: ustawienia, 6 akcentów, eksport i testy; funkcje niedostępne jawnie opisane |
| Przygotowanie przekazania | c5da1be i 9fc52bd: zapis wcześniej istniejących, powiązanych zmian; następnie ten dokument i referencja |

Starsze AUDIT.md i ROADMAP.md są historyczne. Zawierają poprzednie nazwy/numerację etapów i wyniki testów, których nie wolno traktować jako bieżących. Niniejsza sekcja D zastępuje wcześniejsze deklaracje „wszystko przechodzi”.

## B. Funkcjonalność

Statusy: **ukończona**, **częściowa**, **niewykonana**. Przy ukończonych funkcjach zawsze obowiązują ograniczenia testów z sekcji D.

| Funkcja | Status | Faktyczny zakres / ograniczenie |
| --- | --- | --- |
| Pulpit | ukończona | Plan na dziś według rozpoznanego harmonogramu, start/wznowienie, cztery metryki, tydzień i skróty; niżej kalendarz i zwijane nawodnienie |
| Aktywny trening | częściowa | Działa zapis, nawigacja, zdjęcie, postęp i menu. Brak notatki serii z planszy; pozostały elementy starego CSS |
| Jedna aktywna seria | ukończona | Jeden formularz. Zatwierdzenie wybiera następną, bez jej automatycznego wykonania; wykonane/pozostałe w zwijanych listach |
| Dodawanie serii | ukończona | Ręcznie, bez dopisywania wyniku; prawidłowe cele i zapis parametrów |
| Historia wyników ćwiczenia | ukończona | Stabilne ID, rzeczywiste ukończenia, pięć wykonań, serie i objętość, pełny progres. Czas ćwiczenia tylko jeśli zapisany; bieżący UI go osobno nie mierzy |
| Dodanie i zamiana w sesji | ukończona | Baza/wyszukiwanie/grupy/miniatury/cele, potwierdzenie zamiany; wyniki nie trafiają do innego ID, oryginalny plan pozostaje |
| Pomijanie ćwiczenia | ukończona | Pominięcie/cofnięcie, zachowanie wpisów do wznowienia, wykluczenie z wyników przy zakończeniu |
| Usunięcie z sesji i cele | ukończona | Odrębne od biblioteki, potwierdzane; edycja nie usuwa istniejących serii po zmniejszeniu celu |
| Timer i przerwy | częściowa | Dwa niezależne zegary, pauza/wznowienie, przerwy 60/90/120/150 s i własne, wydłużenie/pominięcie, odtworzenie. Brak alarmu dźwiękowego/systemowego |
| Podgląd zdjęć | ukończona | Istniejące zdjęcie pełnoekranowo; przycisk/Escape i pojedynczy gest zamknięcia. Bez sztucznej galerii |
| Statystyki | częściowa | Rzeczywista frekwencja, objętość, największe zapisane ciężary, wykres ciężaru i odznaki. Brak pełnych wykresów powtórzeń/objętości per ćwiczenie, RIR/RPE i 1RM z planszy |
| Kalendarz | ukończona | Ręczne dni liczą frekwencję bez fikcyjnych serii/objętości; dni sesji nie są podwajane |
| Pomiary ciała | ukończona | Masa, klatka, barki, talia, biodra, biceps/udo/łydka L/P, ręczny % tłuszczu; daty, notatki, edycja i potwierdzane usunięcie; legacy zachowane |
| Model męski/kobiecy/neutralny | niewykonana | Wybór wariantu w profilu i adapter istnieją; brak zatwierdzonych zasobów. To nie jest działający model anatomiczny |
| Wizualna zmiana proporcji | niewykonana | Brak renderera i deformowalnego zasobu; żaden pomiar nie zmienia obrysu ciała |
| Porównanie w czasie | częściowa | Działają liczby, tabela, wykresy, wybór dat i Wtedy/Teraz wartości punktów. Brak porównania wyglądu i suwaka modeli |
| Profil sylwetki i cele | ukończona | Model jako preferencja grafiki, wzrost, budowa, cel, data i opcjonalna masa docelowa, historia celu; masa/tłuszcz odczytywane z pomiarów, bez wnioskowania o płci |
| Ustawienia | częściowa | Siedem sekcji, konto/status/retry/wylogowanie, profil, eksport JSON, informacje. Jednostki tylko kg/cm/l; brak zmiany jednostek, powiadomień, dźwięków, importu i usuwania konta |
| Sześć motywów | częściowa | Wszystkie żądane wartości, podgląd/zapis/cofnięcie, osobne konto, odtworzenie; główne kontrolki i wykresy na tokenach. Stary CSS nadal zawiera zielone dekoracyjne powierzchnie |
| Konta i synchronizacja | częściowa | Istniejący prywatny snapshot user_data, osobny cache kont, blokada zapisu przed odczytem i kolejka/retry; testy atrap A/B. Bez potwierdzenia dwóch prawdziwych kont/urządzeń, brak rozwiązywania konfliktów całych snapshotów |
| Offline | częściowa | Lokalna powłoka i zdjęcia w cache, lokalna sesja i zapis offline sprawdzane po rozgrzaniu cache. Ponowny odczyt konta wymaga sieci; nie jest to pełny offline kont |
| Notatki serii, alarm, przypomnienia, import, usuwanie konta | niewykonana | Nie udajemy działania przełącznikami. Edycja/usuwanie pomiarów i notatki pomiarów to inne, działające funkcje |

## C. Zgodność z zaakceptowaną planszą

Referencja jest dołączona do repo: [approved-ui-reference.png](docs/audit/approved-ui-reference.png). To plansza dostarczona przez użytkownika w tej rozmowie (oryginalna nazwa 8436c1c4-738b-4dd1-8367-d3d1241bab0f.png), nie zasób graficzny aplikacji. Widoczne na niej daty i wyniki są przykładami. Nie są importowane do danych kont. Paleta z późniejszego polecenia ma pierwszeństwo nad próbkami koloru na planszy.

Porównanie jakościowe układu i istniejących ekranów; nie wykonano automatycznego porównania pikselowego ani badania użyteczności.

| Ekran | Zgodne | Inne / brakujące / uproszczone |
| --- | --- | --- |
| Pulpit | Ciemny motyw, logo, powitanie, mocna akcja startu, 4 małe metryki, tydzień i dolna nawigacja | Logo jako istniejący znak SVG/ikona zamiast dokładnego artworku; zegar nagłówka tylko podczas treningu; niżej zachowano kalendarz i nawodnienie; wartości i harmonogram rzeczywiste |
| Aktywny trening | Kompaktowy nagłówek z czasem, pasek, nazwa/grupa, ograniczone zdjęcie, historia, jedna seria, ± i duży zapis, poprzednie/następne | Inny istniejący kadr ćwiczenia; dodatkowy opis celów i ręczne dodawanie pod formularzem; historia serii zwijana zamiast identycznego paska zakładek; brak notatki serii i karty „następne ćwiczenie” z miniaturą |
| Szczegóły ostatniego wyniku | Bottom sheet, faktyczne serie, objętość, pięć wykonań i pełna historia | Bez wymyślonego czasu, RIR i 1RM. Czas pokazywany tylko przy zapisanym polu; daty/ciężary z danych, pusty stan bez przykładów |
| Opcje ćwiczenia | Menu z miniaturą, seria, inne ćwiczenie, zamiana, pominięcie/cofnięcie, cele, usunięcie z sesji | Oddzielne formularze i potwierdzenia; lista/kategorie na istniejącej bazie, nie identyczna kompozycja planszy; bez trwałej zmiany oryginalnego planu |
| Timer | Wspólny panel, duży licznik, szybkie przerwy, własny czas, pauza i wyraźne zakończenie | Pauza licznika jest osobna od startu przerwy; brak przełącznika dźwięku, bo alarmu nie ma; dodatkowy widok pozostałej przerwy i stała stopka |
| Pełny ekran zdjęcia | Istniejące zdjęcie, zamknięcie i safe-area | Jeden prawdziwy obraz; bez strzałek, wskaźnika 1/3 ani dodatkowych slajdów |
| Sylwetka przód/tył | Przełącznik, interaktywne pola i wartości, akcent wybranego punktu | Największa luka względem planszy: brak naturalnej anatomii. Jawny komunikat i siatka punktów zamiast człowieka; brak lokalnej zmiany kształtu |
| Szczegóły/dodawanie pomiaru | Rzeczywista wartość, data, wykres, tabela, porównanie, notatka i duży zapis | Wybór miary na wspólnym ekranie, formularz wielu opcjonalnych miar w sheet zamiast osobnego ekranu jednego obwodu. Liczbowa różnica nie jest automatycznie sukcesem |
| Profil sylwetki | Osobny formularz danych, celu i historii | Rozszerzenie późniejszego polecenia; wybór modelu nie tworzy obrazu ani danych biologicznych |
| Ustawienia | Siedem wymaganych sekcji, ikony, ciemne karty, konto/synchronizacja, dane i informacje | Sekcje rozwinięte na jednym ekranie, zamiast wyłącznie listy odnośników. Funkcje niezaimplementowane opisane tekstem, bez atrap przełączników |
| Motywy | Sześć kart z logo/progresem, podgląd i zaznaczenie | Dokładne kolory z ostatniego polecenia: Lime #C9FF31, Magenta #F43CB6, Blue #4EA5FF, Violet #A879FF, Orange #FF9B42, Teal #34DDBB. Układ 2 kolumny na telefonie; pełne oczyszczenie starego CSS niewykonane |
| Plany, baza, historia, postęp | Zachowane funkcje i wspólne akcenty, prawdziwe dane, istniejące zdjęcia | Plansza nie określa pełnego projektu tych ekranów; nie przepisano ich dla sztucznej zgodności. Statystyki nadal prostsze od pełnego panelu analitycznego |

## D. Rzeczywiste testy przekazania

Środowisko: Windows, Node 24.20.0, npm 11.19.0, Edge/Chromium 156.0.4314.50 przez istniejący runtime Playwright. Tryb headless, emulacja dotyku/telefonu; NIE fizyczny iPhone, NIE Safari/WebKit.

- `npm run build`: PASS, Vite 8.2.2, 1884 moduły; JS 316,17 kB (gzip 96,02 kB), CSS 76,46 kB (gzip 14,76 kB).
- `npm test`: PASS, 45 testów, 0 fail, 0 skip. Obejmuje logikę serii/sesji/czasu/pomiarów/motywów oraz interfejs Happy DOM i atrapy synchronizacji. To nie jest test produkcyjnego Supabase.
- Przeglądarki: wynik bieżącej serii uzupełniony poniżej. Wyniki historyczne w IMPLEMENTATION_PLAN.md nie zastępują tej próby.
- Pierwsza seria na 5173: settings nie przeszedł sprawdzenia stopki; dashboard, single-series, exercise-panels i timer-photo przeszły. Następnie istniejący serwer developerski przestał odpowiadać: body-measurements zatrzymał się przy reload, kolejne próby miały ERR_CONNECTION_REFUSED. PWA na 4173 przeszedł. Te błędy połączenia nie są dowodem błędu aplikacji; odpowiednie scenariusze powtórzono na świeżym buildzie.
- Świeży preview: `npm run preview -- --host 127.0.0.1 --port 4180 --strictPort`. Nowy, izolowany profil przeglądarki dla każdego skryptu. Bez użycia danych prawdziwego konta.

### Wynik 12 dostępnych skryptów przeglądarkowych: 9 PASS / 3 FAIL

Nie pominięto żadnego pliku .mjs w tests. Każdy był uruchomiony; zatrzymanie przy pierwszym błędzie oznacza niewykonanie jego dalszych kroków.

| Skrypt | Wynik bieżący | Co rzeczywiście potwierdzono / miejsce zatrzymania |
| --- | --- | --- |
| settings.mjs | FAIL, powtórzony 2 razy | Podglądy 6 motywów, zapis/cofnięcie/reload, quota i eksport dochodzą do kroku formularza profilu. Linia 17: po zmianie rozmiaru/fokusie test nie potwierdza, że .sheet-footer button kończy się przed innerHeight. Pierwsza próba 5173, druga 4180. Nie ustalono, czy przyczyną jest układ czy synchronizacja zmiany visualViewport; nie nazywamy tego PASS |
| dashboard.mjs | PASS, 5173 | Rzeczywiste metryki, ręczny kalendarz, nawodnienie, plany/start/wznowienie, puste stany, przejścia, 320–430 px |
| single-series.mjs | PASS, 5173 | Jeden formularz, ±, kolejna niewykonana, jawne dodanie, korekta, reload, błąd pamięci i wynik wyłącznie zatwierdzonych serii |
| exercise-panels.mjs | PASS, 5173 | Historia/ostatnie 5/rzeczywisty czas, dodanie, zamiana, pominięcie/cofnięcie, usunięcie, pusta sesja i wznowienie |
| timer-photo.mjs | PASS, 5173 | Pauzy/zegary, odświeżenie i symulowany skok czasu/tło, podgląd zdjęcia/gest, krótkie modale, potwierdzenie zakończenia, błędy zapisu |
| body-measurements.mjs | PASS, 4180 | Profil/historia celu, wszystkie miary, punkty, dokładne porównanie, wykres/tabela, edycja/usuwanie, quota/reload, 4 szerokości. Pierwsza próba przerwana awarią starego serwera, powtórzona na buildzie |
| mobile-forms.mjs | PASS, 4180 | Długie podsumowanie, widoczna stopka na 6 widokach od 320×360, fokus/Escape, własne zdjęcia i błędny plik, błąd pamięci, zapis tylko zatwierdzonych |
| final-audit.mjs | PASS, 4180 | Realny zapis → historia/progres/pomiary; 6 motywów × 4 szerokości × 6 zakładek, bez poziomego overflow, zbyt małych pól i błędów konsoli |
| browser.mjs | PASS, 4180 | Plan → trening → podsumowanie → zapis → historia → wykres → reload, kalendarz/ręczne wpisy, świadome potwierdzenie wpisanych serii, odrzucenie pustej sesji i zerowa przerwa; 36 widoków zakładek i 4 modalu |
| workout-ui.mjs | FAIL, 4180 | Kontrola geometrii na 320/375/390/430 przechodzi. Linia 31: stary test oczekuje osobnego .set-row.completed (1), a pojedynczy edytor ma go 0. Dalsze kroki nie wykonane; podobny zakres pokrywa single-series/exercise-panels, lecz to nie naprawia tego pliku |
| session-management.mjs | FAIL, 4180 | Początek sesji, serie, timer i zdjęcie wykonane. Linia 29: timeout na przycisku „Dodaj ćwiczenie”; aktualne menu ma „Dodaj inne ćwiczenie”. Dalsze kroki nie wykonane; aktualny exercise-panels przechodzi |
| pwa.mjs | PASS, 4173 i 4180 | Lokalny build: cache powłoki i zdjęć → offline → odtworzenie sesji/pauzy → lokalny zapis → ponowne otwarcie. To nie jest pełny offline kont |

Testy dodatnie kontrolują brak błędów zgodnie z własnymi nasłuchami pageerror/console. Nie jest to dowód braku błędów w ścieżkach, do których czerwone testy nie dotarły. Zestaw nie ma pojedynczego npm-skryptu uruchamiającego wszystkie próby .mjs; uruchamiano je osobno w pętli, zapisując każdy exit code.

Wniosek dla audytora: nie zatwierdzać całości jako w pełni przetestowanej. W pierwszej kolejności rozstrzygnąć wynik stopki ustawień; potem odświeżyć stare scenariusze bez osłabiania asercji logiki danych.


### Reprodukcja

1. `npm ci` (jeśli potrzebne), potem `npm test` i `npm run build`.
2. Uruchomić podgląd builda jak wyżej.
3. Wskazać istniejącą instalację Playwright zmienną PLAYWRIGHT_MODULE (albo mieć ją dostępną w środowisku), CHROMIUM_PATH do przeglądarki oraz APP_URL=http://127.0.0.1:4180.
4. Uruchomić `node tests/<nazwa>.mjs` dla wierszy tabeli. Playwright nie jest nową zależnością npm projektu. Nie zakładać, że samo npm test uruchamia te skrypty.
5. Skrypty używają lokalnych danych testowych/fixtures. Wyniki i daty w tych profilach nie są produkcyjnymi rekordami.

Nie wykonano: fizycznego iPhone Safari/zainstalowanej PWA, natywnej klawiatury iOS, rzeczywistego tła/uśpienia telefonu, produkcyjnego Auth/RLS na dwóch kontach, zapisu między urządzeniami i równoległych konfliktów, chłodnego pełnego offline konta, powiadomień/dźwięku, weryfikacji produkcyjnego wdrożenia, pełnego audytu WCAG ani zgodności pikselowej. Test „klawiatury” w Chromium to fokus/Tab/Escape i zmiana viewportu, nie rzeczywista klawiatura iOS. Nie ma testu działającej deformacji, bo funkcja nie istnieje.

## E. Znane problemy, luki i ograniczenia

1. Brak naturalnych modeli męskiego/kobiecego/neutralnego, miejscowych deformacji i suwaka porównania wyglądu; sam interfejs adaptera nie zamyka tej funkcji.
2. Bieżące wyniki nie są kompletem zielonych testów przeglądarkowych — szczegóły w D. Nie poprawiano teraz aplikacji ani starych testów, zgodnie z poleceniem niezależnego audytu.
3. Brak notatek do serii, alarmu przerwy, powiadomień, zmiany jednostek, importu, usunięcia konta i dedykowanej polityki prywatności. Opis danych w ustawieniach nie zastępuje polityki.
4. Pozostałe zielone powierzchnie/obramowania starszego CSS nie reagują w pełni na nowy akcent. Tokeny i kontrast akcent/przycisk nie oznaczają całościowego potwierdzenia WCAG.
5. Zapis dotyczy całego snapshotu. Brak pełnej strategii konfliktów wielu urządzeń. Własne JPEG w tym samym snapshocie powiększają payload; localStorage ma limit, choć błąd zapisu pozostawia formularz i starsze dane.
6. Nowa historia nie odtwarza wyników, których stara aplikacja nie zapisała. Dat bez źródła i stron ciała nie dopisuje się. Legacy pozostają osobno.
7. Harmonogram planu jest interpretacją znanych skrótów dni z tekstu, nie pełnym silnikiem planowania. Statystyki są podstawowe; brak RIR/RPE, wykresów każdego parametru i pomiaru czasu pojedynczego ćwiczenia w bieżącym formularzu.
8. Dwa historyczne lokalne skrypty zachowano w Git, aby ujawnić stan prób. Są starsze niż edytor pojedynczej serii; nie wolno traktować ich historycznych sukcesów jako obecnego PASS.
9. AUDIT.md zawiera historyczne ustalenie o public.products bez RLS i ustawieniach Auth. Nie potwierdzano ponownie bieżącego stanu bazy w tym przekazaniu; nie wykonano SQL ani zmiany cudzej tabeli. Audytor powinien oddzielić dawny odczyt od aktualnego bezpieczeństwa.
10. Istniejąca biała spacja w src/App.jsx (linia 117 w audytowanym stanie) jest zgłaszana przez git show --check c5da1be. Nie jest błędem builda; pozostawiono bez kosmetycznego poprawiania kodu.
11. Dotychczasowe AUDIT/ROADMAP mają rozbieżności numeracji/statusów i starych wyników. Ta dokumentacja jawnie je opisuje; nie przepisano historii jako nowych ustaleń.

## F. Pomiary i model sylwetki — szczegóły techniczne

### Grafiki i warianty

Repo zawiera body.png i public/body.png. Zweryfikowany public/body.png ma 700×700 px, 383213 B, SHA-256 4a044ba4e6c247f2cfcc2552210e67a84bba6ad2926e5b378ac53163b8801621. Jest wspólnym rastrem przodu/tyłu męskiej anatomii, z jasnym tłem i artefaktami. Historia uploadu i metadane nie potwierdzają autora/licencji. Szczegóły: [BODY_MODEL_ASSETS.md](BODY_MODEL_ASSETS.md).

Nowy ekran NIE korzysta z tego pliku ani jego fragmentów. Nie pobiera nowej biblioteki i nie generuje grafiki. Registry w src/bodyModelAdapter.js zawiera male/female/neutral, ale front, back, license i deformation są null. Nie istnieją podłączone modele męski/kobiecy/neutralny. Wybór wariantu w profilu wybiera nazwę przyszłego modelu, nie gotową anatomię i nie płeć biologiczną.

BodyModelView pokazuje jawny komunikat o braku zasobu i siatkę interaktywnych punktów z wartościami/datami. Nie jest to nawet podłączona statyczna ilustracja człowieka, a tym bardziej model 3D lub skan. W repo pozostał dawny komponent BodyProgress z prostą ilustracją SVG, lecz nowa zakładka pomiarów go nie renderuje.

### Co faktycznie zmienia wygląd

Żaden obwód, masa, tłuszcz, budowa ani cel NIE zmienia proporcji anatomii. canDeform=false, canCompareSlider=false; prepareBodyTrend zwraca status unsupported i canApply=false. Kliknięcie wybiera punkt i zmienia jego akcent; zmiana pomiaru aktualizuje tekst, wykres i tabelę. Wtedy/Teraz przełącza rzeczywiste wartości wybranych dat, nie kształt modelu.

Nie skaluje się całej sylwetki z masy i nie interpretuje wzrostu masy jako mięśni. Wzrost profilu jest pojedynczą aktualną wartością, nie pełną historyczną serią wzrostu. Wyjściowa budowa pozostaje preferencją przyszłego zasobu.

### Dane i obliczenia

- Wspierane: masa kg, klatka/barki/talia/biodra, biceps L/P, udo L/P, łydka L/P cm oraz opcjonalny ręczny procent tłuszczu.
- Stary biceps i thigh pozostają bez przypisanej strony. Brak danych jest null/pustym stanem, nie zerem i nie oszacowaniem.
- Widok bieżący: ostatni dostępny rzeczywisty zapis osobno dla każdej miary do dzisiaj; obok jest rzeczywista data. Taki zestaw może mieć różne daty i nie jest udawanym jednym pomiarem.
- Porównanie dwóch dat: wyłącznie wartości zapisane dokładnie w każdym wybranym dniu. Różnica = wartość późniejsza minus wcześniejsza; brak jednej wartości oznacza brak różnicy, bez interpolacji i dopowiadania.
- Wykresy/tabela: zapisane wartości, bez przewidywania trendu. Kolor różnicy nie nazywa automatycznie wzrostu poprawą.
- Profil/cele: bodyProfile i additive bodyGoalHistory w istniejącym snapshocie; masa i tłuszcz odczytywane z measurements, bez dodatkowych kopii tych samych wyników.
- Edycja/usunięcie ma stabilne ID lub zabezpieczony podpis starego rekordu, nie nadpisuje po cichu zmienionego wpisu; pozostałe pola starego snapshotu zachowane.
- Adapter przygotowuje jedynie przyszłe wejścia, gdy użytkownik podał poprawny wzrost i istnieją oba obwody: deltaCm = to - from, deltaOverHeight = deltaCm / height, boundedTrend = clamp((to - from) / from, -0.035, 0.035). To nie jest przelicznik centymetrów na szerokość obrazu i NIE steruje rendererem.
- Kandydaci przyszłych regionów: barki, klatka, talia, biodra, osobno biceps/udo/łydka L/P. Przy braku któregokolwiek pomiaru adapter nie tworzy wejścia dla tej pary. Masa i % tłuszczu nie sterują tymi regionami.

### Czego brakuje do pełnego działania

Licencjonowane, spójne modele przód/tył dla wariantów; skalibrowane hotspoty; warstwowy SVG albo siatka/rig z lokalnymi regionami; udokumentowane parametry bazowe; renderer kontrolowanych miejscowych deformacji z ciągłością łączeń; obsługa niepełnych danych bez zgadywania; testy skrajnych wartości, symetrii/stron, dostępności i porównania dwóch stanów. Samo podpięcie PNG nie uruchomi deformacji. Referencyjnej planszy nie używać jako źródła gotowego modelu.

## Punkt startowy niezależnego audytu

Czytać kolejno ten dokument, IMPLEMENTATION_PLAN.md, BODY_MODEL_ASSETS.md i bieżący kod. AUDIT.md/ROADMAP.md traktować jako historię. W pierwszej kolejności zbadać czerwone testy i widoczność stopki, izolację kont/konflikty snapshotów, prawdziwy iPhone oraz rozbieżność między nazwą „sylwetka” a brakiem modelu. Nie uznawać obecności przycisku, profilu wariantu ani adaptera za ukończoną funkcję.
