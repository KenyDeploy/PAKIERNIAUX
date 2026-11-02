# Referencja do audytu

approved-ui-reference.png jest planszą zaakceptowaną i dostarczoną przez użytkownika w rozmowie (30.10.2026), skopiowaną bez edycji do repo na potrzeby niezależnego porównania UI.

Oryginalna nazwa: 8436c1c4-738b-4dd1-8367-d3d1241bab0f.png.
SHA-256: 41fb4f01035a96bb6c2c7f2e4150d6b245817722d0ee3d421bc9f781363ae282.

To referencja projektowa z przykładowymi wynikami i datami, nie dane konta, nie zrzut gotowej aplikacji i nie model sylwetki do podłączenia w kodzie. Nie ustanawia praw do wycięcia grafiki anatomii. Dla akcentów obowiązują dokładne kolory z etapu 7 (w tym Arctic Teal).

Bieżące wyniki testów i ograniczenia są w FINAL_AUDIT_HANDOFF.md w katalogu głównym; wcześniejsze AUDIT.md jest zapisem historycznym.

## Narastająca lista serii

- [Przed zmianą](series-before.png): snapshot ea97309, dwie wykonane serie w rozwiniętej historii oraz trzeci formularz.
- [Po zmianie](series-after.png): trzy zwarte wykonane serie i dwie niezależne karty do wypełnienia, bez zakładek i głównego formularza w dropdownie.

Zrzuty 390 px w lokalnym Chromium, wyłącznie izolowane dane testowe. Nie stanowią testu fizycznego iPhone’a. Screenshot „po” odtwarza tests/growing-series.mjs z AFTER_SCREENSHOT ustawionym na ścieżkę pliku. Przed zmianą plik zarejestrowano przed modyfikacją kodu, bez generowania grafiki.

## UX03–UX05 / premium trening

- [Przed](ux03-05-before-390.png): bazowy commit 27ef367; powtórzone informacje o przerwie i nawigacja na końcu dokumentu.
- [Po](ux03-05-after-390.png): ten sam scenariusz dwóch zatwierdzonych serii i trzeciej otwartej, jawne akcje ćwiczenia, pojedynczy moduł przerwy i stała nawigacja. Zrzut całej strony pokazuje stałą stopkę na wysokości początkowego viewportu; dalszą kartę można przewinąć nad nią.

Porównanie z approved-ui-reference.png: zachowano kompaktowe logo/zegar, ciemne neutralne tło, akcent motywu, zdjęcie, zwartą historię i duże pola/CTA. Wykonane serie pozostają w zwartej narastającej liście zgodnie z późniejszym wymaganiem użytkownika. Dodano jawne Zamień/Pomiń/Opcje i stale dostępne zakończenie zamiast ukrywania ich wyłącznie w menu. Użyto rzeczywistych istniejących zasobów ćwiczeń, dlatego nazwa i zdjęcie różnią się od przykładu z planszy; nie kopiowano fikcyjnej historii ani dat.

Odtwarzanie: `tests/workout-premium-capture.mjs`, `SCREENSHOT` wskazuje plik wyjściowy; `APP_URL`, `PLAYWRIGHT_MODULE` i `CHROMIUM_PATH` wskazują lokalny preview i dostępny Chromium. Stan „przed” zarejestrowano przed edycją kodu. Testy oraz ograniczenia opisuje sekcja wdrożenia UX03–UX05 w UX_AUDIT.md. Fizycznego iPhone’a nie testowano.

## Polish treningu — etap A

[Before 390 px](polish-a-before-390.png) pochodzi z 900eea8, przed edycją kodu. [After 390 px](polish-a-after-390.png) i [panel opcji](polish-a-options-after-390.png) pokazują lokalne dane testowe, bez generowania nowych zasobów.

Pełna klatka atlasu 3:2 mieści się w kontrolowanej wysokości 160–240 px bez obcinania sylwetki; własne zdjęcia treningu używają contain. Powiększanie pozostaje dostępne. Nieaktywna przerwa jest jednym wierszem, aktywna ma lekkie sterowanie. Opcje to lista akcji bez stosu ciężkich kart; wykonane serie są wierszami, a bieżąca karta ma subtelny akcent. Dolny pasek ma dodatkowy odstęp ponad safe-area i reaguje także na zmianę rozmiaru okna. Nie zmieniono zapisu wyników, planów ani synchronizacji.

Walidacja: build PASS; 15 odpowiednich testów active-series/session-actions/training-clock PASS. Scenariusze workout-polish-a, workout-premium i timer-photo PASS: 320/375/390/430 px, różne ćwiczenia, pionowe/poziome zdjęcia własne, powiększenie, start/+15/pominięcie przerwy, menu, wykonane wiersze, wznowienie 10 serii i symulowany visualViewport klawiatury. Brak poziomego przewijania i błędów JS w tych próbach. iPhone Safari/PWA, natywna klawiatura i rzeczywisty pasek przeglądarki wymagają testu na urządzeniu — nie zastępuje go Chromium.

Zrzut after odtwarza `tests/workout-polish-a.mjs`; before wykonano `tests/workout-premium-capture.mjs` przed zmianami z SCREENSHOT ustawionym na ścieżkę before. Nie scalano do main ani nie publikowano produkcji.

## Pomiary 2.0 — etap B

[Mężczyzna — przód](measurements-v2-male-390.png), [kobieta — tył](measurements-v2-female-back-390.png), [porównanie dat](measurements-v2-comparison-390.png): 390 px, izolowane lokalne dane testowe. Autorskie schematy SVG są tymczasowymi ilustracjami statycznymi, a nie finalnymi modelami anatomicznymi. Dokumentacja funkcji, testów, ograniczeń i adaptera: [MEASUREMENTS_V2.md](../MEASUREMENTS_V2.md). Zrzuty odtwarza tests/measurements-v2.mjs. Nie wykonywano fizycznego testu iPhone’a.

## Pulpit, baza i odznaki — etap C

Pulpit [przed](premium-c-home-before-390.png) / [po](premium-c-home-after-390.png), baza [przed](premium-c-catalog-before-390.png) / [po](premium-c-catalog-after-390.png), [lista kompaktowa](premium-c-catalog-compact-390.png), [odznaki](premium-c-rewards-after-390.png). Lokalne fixtures, 390 px Chromium. Raport porównania, zasady punktów i testy: [PREMIUM_C.md](../PREMIUM_C.md). Stan before pochodzi z d598c21, bez generowania nowych grafik.
