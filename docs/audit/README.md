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
