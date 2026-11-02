# UX Refinement 4.0

Podstawa: `main` be763bf72fabf357c1a0ce0a97153a255af4354b. Praca na `codex/ux-refinement-4`.

## Konkretne różnice

| Ekran | Przed | Po |
| --- | --- | --- |
| Nawigacja | Dokument zachowywał pozycję poprzedniej zakładki; osobny reset tylko na pulpicie. | Każde przejście i ponowne dotknięcie zakładki ustawia początek dokumentu. Trening zachowuje własny scroller i przywraca bieżącą serię. |
| Trening | Wszystkie niewykonane serie były pełnymi formularzami; duże zdjęcie poprzedzało wpisywanie. | Jeden aktywny formularz. Inne szkice i wykonane wyniki są kompaktowymi, edytowalnymi wierszami. Zdjęcie rozwija się na żądanie i nadal ma pełny podgląd. |
| Stopka treningu | Trzy podobne przyciski nawigacji i zakończenia. | Następne jest akcją główną; zakończenie ma osobną strefę z separatorem. Stały układ nie przeskakuje przy utracie fokusu pola. |
| Pomiary | Cztery tryby i wiele ustawień przed modelem. | Dwa tryby: Sylwetka oraz Historia / analiza. Porównanie dat przy modelu, ustawienia ilustracji i profilu zwijane. Wykres i rzeczywista historia razem w analizie. |
| Pulpit | Puste miniwykresy zwiększały karty; konfiguracja i pełny kalendarz zajmowały dużo wysokości. | Kompaktowe statystyki bez pustych miniwykresów, konfiguracja z akcjami w jednym wierszu, tydzień widoczny i pełny kalendarz rozwijany. |
| Postęp | Puste sekcje wykresów zajmowały miejsce. | Zwięzłe komunikaty zamiast dużych pustych powierzchni. Wykresy z danymi pozostają bez zmiany. |

Zachowano dotychczasowe uporządkowanie planów i katalogu, wybór dowolnego ćwiczenia sesji, edycję/usuwanie serii, ich identyfikatory oraz cztery finalne naturalne ilustracje. Nie zmieniono tokenów siedmiu motywów ani mechanizmu zapisu i synchronizacji.

## Zweryfikowane scenariusze

- `npm test`: 71/71; `npm run build`: PASS.
- `tests/ux-refinement.mjs`: Chromium i WebKit. Dwa pełne cykle wszystkich zakładek dla 320/375/390/430 px, każdorazowo od końca poprzedniego ekranu; dotknięcie aktywnej zakładki; brak poziomego przepełnienia.
- Powrót z panelu szczegółów do tej samej pozycji filtrowanej listy ćwiczeń.
- Pięć zapisanych serii, edycja pierwszej, usunięcie trzeciej, dodatkowe ćwiczenie, Poprzednie/Następne i wybór z listy; zachowanie planu źródłowego.
- Wznowienie na czternastej serii z zachowanym szkicem, symulowane `visualViewport.height=340`, cztery szerokości; zapis i zgodność podsumowania: 4 serie, 31 powtórzeń, 1055 kg. Szkice wykluczone z wyniku.
- Siedem motywów na wszystkich głównych ekranach, w tym Classic Mono i Electric Blue.
- Regresja Chromium: `urgent-workout`, `growing-series`, `browser`, `dashboard`, `premium-charts`, `body-measurements`, `measurements-v3`, `form-drafts`, `settings`, `pwa`.
- `measurements-v3` również w WebKit: cztery dekodowane obrazy, przód/tył, punkty 44 px, dokładne porównanie dat, brak dopisywania brakujących wyników, zachowane dane historyczne, opcjonalny kreator.
- Offline sprawdzone w lokalnym trybie urządzenia, z cache aplikacji i przywróceniem sesji; nie jest to test synchronizacji prawdziwego konta offline.

Testy przeglądarkowe używają lokalnych izolowanych danych. Nie wykonano testu fizycznego iPhone'a, natywnej klawiatury iOS, VoiceOver ani dwóch prawdziwych kont. Emulacja Chromium/WebKit nie zastępuje tych prób.

## Bezpieczeństwo danych i publikacja

Brak migracji, zmian konfiguracji Supabase, synchronizacji, normalizacji danych, zależności i zasobów modeli. Testy zachowania identyfikatorów, niezmienionych planów, historii, błędu quota i ponowienia pozostają aktywne. Nie wykonywano zapisów na kontach produkcyjnych.

Screenshoty przed/po 390 px oraz raporty przeglądarek zapisano jako artefakty zadania `outputs/ux4`; pliki przed/po przedstawiają rzeczywistą aplikację z tym samym lokalnym zestawem pomiarów. Publikacja zgodnie z jawnym poleceniem użytkownika: PR do main po kontrolach, następnie weryfikacja SHA i stałej domeny. Wynik produkcji należy raportować dopiero po faktycznym wdrożeniu.
