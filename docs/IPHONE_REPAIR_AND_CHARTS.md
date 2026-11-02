# Naprawa po nagraniu iPhone + standard wykresów

Wersja bazowa: ba39efe, ta sama gałąź PR #1. Nagranie użytkownika (~110 s) przejrzano poprzez osiem klatek z lokalnego pliku. Potwierdza wejście stałej stopki w formularze i zmienną wysokość obszaru Safari. Nagrania ani klatek z rzeczywistymi danymi nie dodano do repo; zrzuty poniżej zawierają wyłącznie izolowane fixtures.

## Wdrożone zmiany

- **Trening:** zamiast stopki nakładanej na dokument, nagłówek, przewijana zawartość i dolna nawigacja zajmują odrębne obszary. Stopka jest rodzeństwem main, nie elementem listy. Wysokość i położenie powłoki reagują na visualViewport.height/offsetTop oraz resize. Safe-area ma własny odstęp. Focus przewija wewnętrzną zawartość tak, aby pokazać jednocześnie pole i zapis; przy klawiaturze również na 320 px pola używają dwóch kolumn. Bez zmiany zapisu, numeracji, ID, dodawania, edycji i usuwania serii.
- **Zdjęcia:** główny kontener ma pełne 3:2 zamiast wysokości zależnej od okna, która mogła przycinać sylwetkę. Obrazy nie są rozciągane. Atlas ma indywidualnie przypisane pozycje kafelków przez istniejące exercisePhotoStyle; pełny kafelek pokazuje całe źródło, bez dodatkowego kadrowania. Własne zdjęcia zachowują contain. Nie da się odtworzyć fragmentu nieobecnego w źródłowym pliku; nie generowano nowych grafik. Powiększenie korzysta z tego samego zasobu.
- **Baza:** każdy wiersz otwiera szczegóły dotykiem, Enterem lub spacją. Nie ma przycisku Edytuj na liście; edycja i zdjęcie pozostają w szczegółach. Miniatura / dłuższa nazwa / sprzęt / parametry / strzałka mają wspólne wyrównanie. Widok kompaktowy zachowuje metadane, a wyszukiwanie jest przyklejone pod nagłówkiem.
- **Panele:** spokojniejsze tła zamiany, cienkie separatory wyników, subtelniejsza przerwa i aktywna seria bez poświaty. Dotychczasowe potwierdzenia i akcje pozostają.
- **Wykresy:** SmoothChart i monotoneCurve zastępują wszystkie dotychczasowe wykresy progresu i słupkowe miniwykresy. Linia 2,2 px, akcent motywu, gradient 14%→0%, dyskretne rzeczywiste punkty, kliknięcie/focus/Enter pokazują dokładną datę i wartość. Interpolacja ogranicza tangenty tak, aby nie tworzyć ekstremów poza końcami segmentu. Gdy znane czasy są różne i rosnące, oś X zachowuje odstępy czasu; zapisy z tą samą datą zachowują wszystkie punkty w kolejności. Krzywa pomiędzy punktami jest prezentacją, nie dodatkowym pomiarem ani prognozą.
- **Zakres:** miniwykresy pulpitu mają 7 dni, Postęp siłowy 7/30/90/całą historię, pomiary i objętość 7/30/90/cały okres. Rozwijana historia ćwiczenia zawiera wykres ciężaru i objętości. Brak ciężaru nie tworzy fikcyjnego zera objętości; wynik z rzeczywiście zapisanym 0 kg jest odrębny. Brak obserwacji daje pusty stan; jedna obserwacja daje tylko punkt. Miniwykresy nie są już wewnątrz przycisków nawigacyjnych, więc ich dotknięcie nie opuszcza pulpitu.
- **Classic Mono:** dodany jako siódmy motyw w istniejącym podglądzie i zapisie ustawień konta, z białą linią i bez poświaty. Sześć wcześniejszych akcentów i domyślny Lime zachowano. Wersja bazowa nie miała Mono — nie fabrykowano screenshotu „przed” tego motywu.

## Weryfikacja

- `npm test`: **64/64 PASS**, build PASS. Test krzywej próbkuje każdy segment dla wzrostów/spadków/plateau, także przy nierównych odstępach X, i sprawdza brak wyjścia poza wartości końcowe. Projekcje wykresów testują brakujące ciężary, zero i serie niezatwierdzone/pominięte; preferencje obejmują Mono i kontrast.
- Chromium PASS: **iphone-review, premium-charts, growing-series, timer-photo, workout-premium, premium-c, browser, body-measurements**. Scenariusze obejmują zapis/korektę/usunięcie, trwałe ID, reload, zakończenie/historię, przerwy, profile/pomiary, filtry bazy, motywy i punkty wykresów.
- **Geometria:** dla 3/5/10 serii i kilku pozycji przewinięcia sprawdzono przecięcia prostokąta obszaru listy i widocznych (przyciętych przez overflow) prostokątów kart ze stopką — 0. Przy szerokościach 320/375/390/430 px oraz symulowanej klawiaturze 340 px i offsetTop 0/35 sprawdzono jednoczesną widoczność pola i zapisu oraz elementFromPoint na obu. To mocniejsze sprawdzenie niż sam brak overflow.
- Zrzuty trzech źródeł: przysiad, podciąganie i wyciskanie. Powiększenie ma ten sam URL co obraz w treningu. Brak błędów JS i poziomego przewijania w wykonanych ścieżkach.
- **Nie wykonano nowego testu na fizycznym iPhonie/Safari/PWA, natywnej klawiatury ani VoiceOver.** Nagranie jest rzeczywistym testem użytkownika wcześniejszego preview; nowe poprawki zweryfikowano w Chromium. iPhone wymaga ponownej próby, szczególnie rozwijania paska Safari i klawiatury.
- Bez migracji, zmiany synchronizacji, nowych zależności, scalenia do main lub wdrożenia produkcyjnego. Testy nie korzystają z prawdziwych kont.

## Screenshoty 390 px

| Widok | Przed | Po |
|---|---|---|
| Trening | [przed](audit/iphone-before-workout-390.png) | [po](audit/iphone-after-workout-390.png) |
| Baza | [przed](audit/iphone-before-catalog-390.png) | [po](audit/iphone-after-catalog-390.png) |
| Lime — pulpit | [przed](audit/iphone-before-lime-home-390.png) | [po](audit/iphone-after-lime-home-390.png) |
| Lime — siła | [przed](audit/iphone-before-lime-chart-390.png) | [po](audit/iphone-after-lime-chart-390.png) |
| Electric Blue — pulpit | [przed](audit/iphone-before-blue-home-390.png) | [po](audit/iphone-after-blue-home-390.png) |
| Electric Blue — siła | [przed](audit/iphone-before-blue-chart-390.png) | [po](audit/iphone-after-blue-chart-390.png) |
| Classic Mono — pulpit | Motyw niedostępny w bazowej wersji | [nowy](audit/iphone-after-mono-home-390.png) |
| Classic Mono — siła | Motyw niedostępny w bazowej wersji | [nowy](audit/iphone-after-mono-chart-390.png) |

Zdjęcia: [przysiad](audit/iphone-photo-squat-390.png), [podciąganie](audit/iphone-photo-pullup-390.png), [wyciskanie](audit/iphone-photo-press-390.png).

Odtwarzanie: tests/iphone-review-capture.mjs (CAPTURE_PHASE=before/after), tests/iphone-review.mjs i tests/premium-charts.mjs; APP_URL/PLAYWRIGHT_MODULE/CHROMIUM_PATH wskazują lokalne środowisko. Before zapisano przed zmianami kodu. Pełnostronicowe zrzuty pulpitu zawierają stałą nawigację w pozycji początkowego viewportu; trening ma teraz osobny viewport i nie nakłada stopki na serie.
