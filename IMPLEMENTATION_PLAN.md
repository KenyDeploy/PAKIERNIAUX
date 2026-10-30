# Pakiernia — plan dalszej implementacji

Stan: 30.10.2026. Główna referencja kolejnych etapów: zaakceptowana plansza `8436c1c4-738b-4dd1-8367-d3d1241bab0f.png` z tego czatu. Docelowo: ciemne powierzchnie, limonkowy akcent, kompaktowy mobile-first, jedna aktywna seria, spójne panele i pomiary przód/tył. Liczby na planszy są przykładami, nie danymi do wprowadzenia.

## Punkt wyjścia i granice

- [x] Sprawdzono branch `codex/real-progress-mobile`, lokalny HEAD `d9896c7` oraz [PR #1](https://github.com/KenyDeploy/PAKIERNIAUX/pull/1): otwarty, draft, do `main`.
- [x] Przeczytano `AUDIT.md`, `ROADMAP.md` i kod wskazanych obszarów. Roadmapa jest starsza od lokalnych etapów 2–5; ich wykonanych funkcji nie implementować ponownie.
- [x] Zidentyfikowano niezacommitowane zmiany etapów 2–5, w tym nowe komponenty/testy. Nie są jeszcze w PR. Ten etap dodaje wyłącznie niniejszy dokument.
- Zachować dane, identyfikatory, stare pomiary i daty, plany, nawodnienie, funkcje katalogu, konta i synchronizację. Pracować na tej gałęzi; małe logiczne commity z jawną listą plików, bez zbiorczego dodawania cudzych zmian.
- Bez scalenia, produkcji i automatycznego push/wywołania wdrożenia. Bez nowych zależności i zmian schematu Supabase bez uzasadnionej potrzeby. Najpierw wykorzystać opcjonalne pola istniejącego snapshotu, z bezpiecznym odczytem starszych danych.

## Co istnieje, co poprawić, czego brakuje

| Obszar planszy | Istnieje lokalnie | Poprawki / brakujące funkcje |
| --- | --- | --- |
| Pulpit | Start/wznowienie, plan, frekwencja, objętość tygodnia, passa, kalendarz i nawodnienie | Układ karty planu i 4 metryk; liczba serii tygodnia; ustalenie okresu każdej metryki. Zachować dostęp do kalendarza/nawodnienia. |
| Aktywny trening | Zapisane serie, walidacja, stany, dodawanie serii, nawigacja, wznowienie | Jedna aktywna seria zamiast wszystkich kart, ± ciężaru/powtórzeń, notatka, układ i ikony zgodne z planszą. |
| Ostatni trening / historia | ID ćwiczenia, daty, zatwierdzone serie, objętość, wcześniejsze sesje, przejście do progresu; ogólna historia sesji | Bardziej kompaktowa lista ostatnich 5 z dostępem do wszystkich. RIR i czas ćwiczenia nie są zbierane; 1RM nie jest liczone. |
| Opcje ćwiczenia | Dodanie, zamiana z potwierdzeniem, pominięcie/cofnięcie, cele i przerwa; oryginalny plan bez zmian | Karta ćwiczenia/miniatura w menu; usunięcie tylko z sesji. Obecne `deleteExercise` usuwa z biblioteki/planów — nie używać do tej akcji. |
| Timer / zdjęcie | Pauza/wznowienie, trwałe zegary, ręczna przerwa 60/90/120 s i własna, podsumowanie, pełny ekran zdjęcia | Spójność wizualna; preset 2:30, wygodne ± czasu i ustawienie dźwięku. Jedno zdjęcie na ćwiczenie: brak galerii 1/3, nie udawać kolejnych zdjęć. |
| Pomiary | Datowane częściowe wpisy: waga, biceps, klatka, talia, udo; historia, różnice, wykres masy i tabela wykresu | Zakładki Sylwetka/Lista/Historia, punkty przód/tył, szczegóły każdej miary, porównanie, pojedynczy formularz z notatką; strony ciała i nowe miary. Brak edycji/usuwania wpisów. |
| Ustawienia / motywy | Auth, status i ponawianie synchronizacji, wylogowanie; zmienne CSS | Brak ekranu ustawień i 6 motywów. Ikona obecnie wylogowuje konto, a lokalnie nie otwiera ustawień. Brak preferencji jednostek, dźwięku i powiadomień oraz ekranów danych/prywatności i informacji. |

## Architektura i zasoby do ponownego użycia

- React + Vite + `lucide-react`; nawigacja przez `tab` w `App.jsx`, bez routera. `App.jsx` nadal łączy ekrany i obsługę formularzy; wydzielać tylko fragmenty potrzebne w danym etapie, bez przepisywania aplikacji.
- `DialogSheet` zapewnia fokus/Escape, przewijany środek, stałą stopkę i visualViewport. Wykorzystać `ExerciseHistorySheet`, `SessionExerciseEditor`, `WorkoutTimerSheet`, `ExercisePhotoViewer` i `ExercisePhotoField`.
- Logika: `training.js`, `sessionActions.js`, `exerciseHistory.js`, `trainingClock.js`; zapis przez `useTrainingData.js` (cache konta, blokada przed odczytem, kolejka, błędy i ponowienie). Zachować tę granicę.
- `Visuals.jsx`: ponownie użyć `TrendChart` (dotyk/klawiatura/tabela), `BodyProgress`, `ExerciseVisual`. Globalny `styles.css` ma zmienne, ale także sztywne kolory, reguły minifikowane i wielokrotne nadpisania; porządkować stopniowo ze zdefiniowanym zakresem ekranu. Kolory w SVG również wymagają tokenów.
- Zasoby: 72 zdjęcia w 12 atlasach WebP, `exercisePhotos.js`, własne zdjęcia, `icon.svg`. Nieużywany obecnie `public/body.png` zawiera przód i tył sylwetki — sprawdzić jakość/pochodzenie przed wykorzystaniem. To raster, nie interaktywny model 3D; hotspoty można dodać istniejącym SVG/HTML bez silnika 3D. Nie generować teraz nowych grafik.

## Checklista kolejnych małych etapów

- [ ] **A. Wspólny wygląd i szkielet.** Tokeny powierzchni, akcentu, obramowań, odstępów, typografii; spójne przyciski/panele. Akceptacja: 320/375/390/430 px, safe-area, pola ≥16 px i cele dotykowe ≥44 px, bez przepełnienia i wpływu na zapis. Rozszerzać tokeny podczas pracy nad ekranem.
- [x] **B. Pulpit.** Układ z planszy na istniejących obliczeniach. Akceptacja: każda metryka ma opisany okres; serie/objętość wyłącznie z wyników, ręczne dni tylko we frekwencji; dostęp do wszystkich dotychczasowych funkcji.
- [ ] **C. Dopasowanie treningu.** Jedna aktywna seria, ręczne dodawanie, ± i notatka; cele planu nie oznaczają wykonania. Akceptacja: nie usuwać serii już rozpoczętych sesji, zachować ich podgląd/edycję; brak utraty przy nawigacji/odświeżeniu. Usunięcie z sesji wymaga potwierdzenia utraty wpisanych danych i nie zmienia planu/bazy.
- [ ] **D. Historia, timer i zdjęcia.** Dopracować istniejące panele, bez powielania logiki. Akceptacja: ID i tylko rzeczywiste serie, brakujące RIR/czas oznaczone jako brak danych; ewentualny 1RM jawnie szacunkowy. Nie podmieniać czasu ćwiczenia czasem całej sesji. Przerwa niezależna od pauzy, dźwięk opcjonalny; galeria dopiero przy rzeczywistych dodatkowych zasobach.
- [ ] **E. Pomiary: sylwetka i nawigacja.** Przód/tył, hotspoty, lista/historia, wybór miary. Akceptacja: dotyk i klawiatura, poprawne skalowanie, odczyt starych pól; nowych pól nie uzupełniać zerami ani przypuszczeniami. Starego bicepsa nie przypisywać automatycznie do prawej/lewej strony.
- [x] **F. Pomiary: szczegóły i formularze.** Wykres/tabela/porównanie, datowany pojedynczy pomiar i notatka; edycja/usuwanie z potwierdzeniem. Akceptacja: stabilne istniejące ID, zachowanie częściowych/legacy wpisów, prawidłowa data i jednostki; błąd zapisu zachowuje formularz i dane. Kolor różnicy nie zakłada automatycznie poprawy.
- [ ] **G. Ustawienia i motywy.** Osobny ekran, 6 wariantów z planszy, konto/synchronizacja, jednostki, dźwięki, powiadomienia, dane/prywatność i informacje. Akceptacja: realne działające akcje, odrębne preferencje kont, trwałość po odświeżeniu; zmiana jednostek nie przelicza destrukcyjnie danych. Uprawnienia powiadomień dopiero po akcji użytkownika; obsłużyć brak wsparcia. Błędy zachowują znaczenie niezależnie od akcentu.
- [ ] **H. Regresja końcowa.** `npm run build`, `npm test`, scenariusze przeglądarkowe z `tests/` i PWA offline lokalnie. Akceptacja: pełna ścieżka treningu/pomiarów/ustawień, brak fikcyjnych/zdublowanych wyników, zachowanie danych, 4 szerokości, brak błędów konsoli. Osobno fizyczny iPhone/Safari/PWA i dwa rzeczywiste konta/urządzenia; atrapy i Chromium nie potwierdzają tych prób.

Po każdym etapie: tylko testy zmienianej funkcji, wizualna kontrola, mały commit i krótka aktualizacja audytu/planu. Ostatni znany punkt testowy z poprzedniego etapu: build i 25/25 testów oraz scenariusze Chromium; w tym etapie dokumentacyjnym nie uruchamiano ich ponownie. Raport dla trenera, pełny offline kont i konflikty wielu urządzeń pozostają oddzielnymi pozycjami `ROADMAP.md`, poza dopasowaniem planszy.

### Wykonane po przygotowaniu planu: etap 2, pojedyncza seria

Jedna aktywna seria, automatyczny wybór następnej niewykonanej (bez dopisywania/zaliczania), ręczne dodawanie, zwijane listy wykonanych i pozostałych serii, korekty i ± (2,5 kg / 1 powtórzenie). Zachowano wszystkie istniejące serie, dodatkowe pola i oryginalny plan; wybór niewykonanej serii oraz wpisy odtwarzają się po odświeżeniu. Panele historii poprzednich treningów, timer i zdjęcia bez przebudowy. Testy etapu: 3 testy logiki oraz istniejący test zapisu interfejsu; scenariusz Edge/Chromium na 320/375/390/430 px, korekta/wznowienie, niepoprawne dane, błąd pamięci i zapis wyłącznie zatwierdzonych wyników; build. Pozostałe punkty C (notatki i usuwanie ćwiczenia z sesji) nie należały do tego polecenia i pozostają otwarte. Wcześniejsze niezacommitowane prace zachowane poza commitem tego etapu.

### Etap 3 — ostatni trening i zarządzanie ćwiczeniem

Wykorzystano istniejące lokalne moduły historii i operacji sesji. Karta pod zdjęciem, pięć ostatnich wykonań po ID, objętość i wyłącznie zapisany czas ćwiczenia; pełna historia przez istniejący progres, pusty stan bez fikcyjnych danych. Menu z miniaturą: seria, inne ćwiczenie, zamiana z potwierdzeniem, pominięcie/cofnięcie, cele i usuwanie wyłącznie z sesji. Potwierdzane usunięcie zachowuje plan/bibliotekę/historię; pustą sesję można wznowić i uzupełnić. Pomięte ćwiczenia są wykluczone z wyniku także przy potwierdzaniu wypełnionych pól. Testy: 12 odpowiednich testów logiki/modalu/zapisu/izolacji kont na atrapie oraz scenariusz Edge/Chromium (4 szerokości, historia, czas, dodanie, zamiana, pominięcie/cofnięcie, anulowanie/usunięcie, awaria pamięci i pusta sesja po odświeżeniu); build. Bez schematu, danych produkcyjnych i przebudowy timera/zdjęć. W tym etapie moduły historii/zarządzania stają się częścią commita; pozostałe wcześniejsze lokalne prace pozostają poza nim. Notatki nadal otwarte.

### Etap 4 — czas treningu, przerwy i zdjęcia

Zegar na wysokości logo, panel pauzy/wznowienia treningu, ręczne przerwy 60/90/120/150 s i własne, stała stopka z przejściem do podsumowania. Czas sesji obejmuje przerwy i pomija tylko własne pauzy. Pauza przerwy nie zatrzymuje czasu treningu; zapisuje dokładny pozostały czas w ms, działa po odświeżeniu/ponownym otwarciu, pozwala wydłużyć i pominąć odliczanie. Start nowej przerwy kasuje jej poprzednią pauzę. Zatwierdzenie serii i automatyczna przerwa zapisują się atomowo. Zdjęcie wykorzystuje istniejący zasób, bez sztucznej galerii; zamknięcie przyciskiem, Escape lub pojedynczym wyraźnym przesunięciem w dół (drobne ruchy i dwa palce nie zamykają). Testy: build, 7 odpowiednich testów logiki/zapisu/izolacji kont na atrapie oraz Edge/Chromium na 320/375/390/430 px i wysokościach od 360 px: odświeżenie, nowa karta aplikacji, symulowany powrót z tła, niezależne pauzy, błędy zapisu, przyciski stopki, brak błędów konsoli i zapis wyłącznie zatwierdzonych serii. CSS safe-area; fizyczny iPhone/Safari i gest wymagają ręcznego sprawdzenia. Wcześniejsze pozostałe zmiany zachowano poza commitem, bez schematu/push/produkcji.

### Etap 5 — pulpit

HomeDashboard: kompaktowy nagłówek/powitanie, karta planu i start/wznowienie bez duplikowania akcji, cztery metryki 2×2, tydzień i skróty, niżej zachowany kalendarz oraz zwijane nawodnienie z tygodniowym podglądem. Odznaki pozostają w Postępie. Frekwencja łącznie obejmuje ręczne dni bez podwajania dni zapisanych sesji; serie i objętość to zatwierdzone, niepominięte wyniki z ostatnich 7 lokalnych dni do chwili odczytu. Brak obciążenia nie staje się fikcyjnym ciężarem. Plan na dziś rozpoznaje znane dni w istniejącym harmonogramie tekstowym, respektuje wybór użytkownika i rozpoczętą sesję; nieznanego harmonogramu nie opisuje jako ustalonego na dziś. Test przejścia do Postępu ujawnił NaN dla brakującego ciężaru — odczyt rekordów/wykresu ograniczono do faktycznie zapisanych obciążeń i zatwierdzonych serii, bez zmian danych.

Testy etapu: build, 7 odpowiednich testów (5 obliczeń/planów + zapis interfejsu + synchronizacja na atrapie), scenariusz Edge/Chromium: 320/375/390/430 px, główna akcja powyżej dolnej nawigacji bez przewijania, 2 kolumny, ręczne dni bez fikcyjnych wyników, ochrona dnia z sesją, nawodnienie, skróty, pusty plan, start właściwego planu i wznowienie tego samego ID, zachowanie danych oraz brak błędów konsoli. Pełna regresja pozostaje na koniec. Bez zmiany schematu, zależności i mechanizmu synchronizacji; poprzednie lokalne zmiany poza tym etapem zachowane.


### Etap 6 — profile i pomiary ciała

Działają: profil konta (model/budowa/wzrost/cel), historia zmian celu, masa i ręczna tkanka tłuszczowa z datowanych pomiarów; obwody obustronne, barki i biodra; edycja/usuwanie z kontrolą nieaktualnego formularza, notatki; wykres/tabela każdej miary, dokładne porównanie dwóch zapisanych dni i Wtedy/Teraz. Stare biceps/udo pozostają bez przypisanej strony. Wykorzystano istniejący prywatny snapshot i synchronizację, bez zmiany schematu i zależności.

Część graficzna E pozostaje otwarta: body.png nie ma potwierdzonej licencji/pochodzenia i jest rastrem. Brak zatwierdzonych modeli męskiego, kobiecego i neutralnego przód/tył oraz zasobu deformowalnego. Działa wybór punktów i infrastruktura hotspotów HTML; ekran jawnie informuje o braku grafiki. Adapter zwraca brak obsługi deformacji, nie rozciąga rastra ani nie wnioskuje proporcji z masy. Wymagania zasobów: BODY_MODEL_ASSETS.md. Naturalna anatomia, deformacje i suwak modeli nie są ukończone.

Testy: build; 9 testów logiki/interfejsu/synchronizacji (dwa konta na atrapie, historia celów, dane legacy, częściowe wpisy, edycja/usuwanie, konflikty i brak zgadywania). Edge/Chromium: 320/375/390/430 px, formularz od 360 px wysokości, wszystkie pola, punkty przód/tył, porównanie, wykres/tabela, błędy pamięci, odświeżenie, brak poziomego przepełnienia i błędów konsoli. Fizyczny iPhone/Safari/PWA i dwa rzeczywiste konta wymagają ręcznej weryfikacji. Bez produkcji/scalenia/push.


### Etap 7 — ustawienia, motywy i audyt końcowy (30.10.2026)

Poniższa tabela stanowi aktualny status funkcji; starsze sekcje opisują historię etapów. „Ukończona, wymaga testu na iPhonie” oznacza pozytywne testy lokalne, nie test fizycznego urządzenia. Cała aplikacja nie jest jeszcze zgodna z planszą w zakresie naturalnych modeli, deformacji i niezaimplementowanych funkcji wskazanych poniżej.

| Funkcja / zakres | Status | Dowód lub brak |
| --- | --- | --- |
| Pulpit: plan/start/wznowienie, 4 metryki, tydzień, skróty, kalendarz, nawodnienie | ukończona, wymaga testu na iPhonie | dashboard.mjs, final-audit.mjs; 320/375/390/430 px |
| Obliczenia frekwencji, serii, objętości, brak fikcyjnych wyników | ukończona i przetestowana | dashboard.test.js, training.test.js, app.test.js, browser.mjs |
| Jedna aktywna seria, automatyczny wybór następnej, ręczne dodanie, ±, korekty i wznowienie | ukończona, wymaga testu na iPhonie | active-series.test.js, single-series.mjs |
| Notatka do serii z planszy | niewykonana | nie ma formularza notatki do serii |
| Historia ostatniego wykonania, 5 sesji, objętość, czas tylko zapisany, pełny progres | ukończona, wymaga testu na iPhonie | exercise-history.test.js, exercise-panels.mjs |
| Dodawanie/zamiana/cele/usunięcie tylko z sesji; pominięcie i cofnięcie | ukończona, wymaga testu na iPhonie | session-actions.test.js, session-accounts.test.js, exercise-panels.mjs |
| Czas treningu i osobna przerwa, pauzy, presety, własna przerwa, podsumowanie | ukończona, wymaga testu na iPhonie | training-clock.test.js, timer-photo.mjs; odświeżenie, symulowany powrót z tła, awaria zapisu |
| Powiększenie istniejącego zdjęcia, zamknięcie, pojedynczy gest | ukończona, wymaga testu na iPhonie | timer-photo.mjs; bez fikcyjnej galerii |
| Profil konta, historia celów, rzeczywiste pomiary i zgodność legacy | ukończona i przetestowana | body-measurements.test.js, body-accounts.test.js |
| Formularze pomiarów, wykresy, tabela, porównanie dat i Wtedy/Teraz | ukończona, wymaga testu na iPhonie | body-measurements.mjs; częściowe dane nie są interpolowane |
| Widok sylwetki przód/tył i hotspoty | częściowo ukończona | wybór i wartości działają; brak zatwierdzonych grafik męskiej/kobiecej/neutralnej |
| Naturalne grafiki anatomiczne | niewykonana | brak zasobów z potwierdzonymi prawami; BODY_MODEL_ASSETS.md |
| Lokalna deformacja i suwak modeli | niewykonana | adapter i wymagania gotowe; brak zgodnego modelu, raster nie jest rozciągany |
| Ekran ustawień i 7 sekcji | ukończona, wymaga testu na iPhonie | settings.mjs; funkcje niedostępne opisane, bez pozornych kontrolek |
| Sześć dokładnych akcentów, podgląd/zapis/cofnięcie, odtworzenie, odrębność kont | ukończona i przetestowana | preferences.test.js (kontrast ≥4,5:1 dla akcentu i ciemnego tekstu), preferences-accounts.test.js; settings.mjs |
| Wizualna spójność motywów | częściowo ukończona | wspólne tokeny, przyciski, wykresy SVG, główne obramowania/ikony/wskaźniki; starszy CSS nadal zawiera dekoracyjne zielone powierzchnie i nie jest w całości znormalizowany |
| Konto, status synchronizacji, ponowienie i wylogowanie | ukończona, wymaga testu na iPhonie | istniejące akcje w ekranie ustawień; izolacja/błędy na atrapie, bez prób rzeczywistych kont produkcyjnych |
| Jednostki | częściowo ukończona | działają dotychczasowe kg/cm/l; zmiana systemu jednostek niewykonana i oznaczona |
| Alarm dźwiękowy / powiadomienia | niewykonana | wyraźny komunikat; brak fikcyjnego przełącznika i prośby o uprawnienia |
| Dane i prywatność: eksport JSON | ukończona, wymaga testu na iPhonie | settings.mjs: plik pobrany; snapshot bez hasła/tokenów; brak importu i usuwania konta |
| Import / usuwanie konta / dedykowana polityka prywatności | niewykonana | opis ograniczeń jest dostępny, nie zastępuje tych funkcji |
| O aplikacji | ukończona i przetestowana | nazwa, wersja i jawne ograniczenia sylwetki |
| Historia, statystyki i odznaki | ukończona, wymaga testu na iPhonie | browser.mjs, final-audit.mjs; odznaki pokazują rzeczywiste progi zamiast dekoracyjnych pseudoopisów CSS |
| Synchronizacja i zachowanie wcześniejszych danych | częściowo ukończona | testy cache/kolejki/błędów i dwóch kont na atrapie pozytywne; prawdziwe dwa konta/urządzenia oraz konflikty wielu urządzeń nadal wymagają próby |
| Klawiatura, safe-area, modale i nakładanie elementów | ukończona, wymaga testu na iPhonie | Chromium: pola ≥16 px, przewijany środek, stała stopka, fokus/Escape, wysokości od 360 px; natywna klawiatura iOS nie była testowana |
| PWA offline | częściowo ukończona | test lokalnej powłoki i zdjęć; pełny offline kont i synchronizacja konfliktów nie są potwierdzone |

Wykorzystano istniejący snapshot konta, bez zmian schematu Supabase, nowych zależności, produkcji, scalenia lub push. Zachowano wcześniejsze niezacommitowane prace poza commitem tego etapu. Audyt przeglądarkowy wykonywano na aktualnym drzewie roboczym, które obejmuje również te wcześniejsze zmiany.

Testy końcowe: npm test — 45/45; npm run build — poprawny. Scenariusze settings, dashboard, single-series, exercise-panels, timer-photo, body-measurements, mobile-forms, final-audit oraz browser. final-audit obejmuje 6 motywów × 4 szerokości × 6 głównych zakładek; brak poziomego przepełnienia i błędów konsoli w sprawdzonych scenariuszach. Starsze testy wskazują teraz konkretny plan, zamiast uzależniać liczbę serii i ID ćwiczenia od dnia tygodnia. Test stopki czeka na ustabilizowanie visualViewport po zmianie rozmiaru.

Ręcznie: fizyczny iPhone Safari/PWA (klawiatura, safe-area, gest, instalacja, powrót z tła), eksport w iOS, dwa rzeczywiste konta na osobnych urządzeniach, równoległe edycje i ponawianie synchronizacji. Naturalna sylwetka i deformacje pozostają oddzielnym etapem po dostarczeniu/licencjonowaniu modeli.

PWA: test pwa.mjs na lokalnym buildzie (127.0.0.1:4173) przeszedł: cache powłoki/zdjęć → offline → odtworzenie pauzy i sesji → zapis → ponowne otwarcie. Nie potwierdza offline kont chmurowych.
