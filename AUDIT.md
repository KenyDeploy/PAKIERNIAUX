# Pakiernia u Matiego — audyt i pierwsza naprawa

## Zgłoszenia użytkownika — kalendarz, kończenie sesji i baza ze zdjęciami

- Ręczne oznaczenie dnia liczy się jako odbyty trening w pulpicie, historii, odznakach, kalendarzu i passie. Dzień z zapisaną sesją nie jest liczony ponownie jako ręczny trening; dwie rzeczywiste sesje jednego dnia nadal liczą się jako dwie. Ręczne wpisy mają własne wiersze w historii, bez wymyślania czasu, serii i objętości. Statystyki ciężaru i objętości nadal wynikają wyłącznie z zapisanych serii. Kliknięcie dnia z sesją wyjaśnia, dlaczego kalendarz nie usuwa treningu z historii.
- Zakończenie sesji ma okno podsumowania z liczbą i listą serii. Można zapisać zatwierdzone serie, jawnie potwierdzić poprawnie wypełnione (także podpowiedziane) wartości albo odrzucić pustą sesję bez zapisu. Niewypełnione i niepoprawne serie są pomijane. Wpisane wartości nie są automatycznie zaliczane jako wykonane. Puste pole i zielony znacznik wykonania mają różne ikony. Trening można zakończyć przed ostatnim ćwiczeniem. Wynik, dzień i usunięcie rozpoczętej sesji trafiają do jednego snapshotu; identyfikator sesji zapobiega powieleniu wyniku.
- Baza: 72 polskie ćwiczenia, 7 grup mięśniowych i 6 typów sprzętu (hantle, sztanga, wyciąg, maszyna, suwnica Smitha, masa ciała). Filtry partii i sprzętu działają łącznie z wyszukiwaniem. Nowe pozycje są dodawane przy jednorazowej aktualizacji katalogu bez nadpisywania identyfikatorów, własnych ćwiczeń i ustawień. Później usunięte pozycje nie wracają samoczynnie. Przycisk uzupełniania umożliwia ich świadome przywrócenie.
- Realistyczne wizualizacje AI w jednym stylu są przypisane do konkretnych nazw ćwiczeń: miniatury w bazie, większy podgląd w szczegółach i podczas treningu. Pochodzenie i sposób przypisania opisuje `EXERCISE_IMAGES.md`. Nie importowano cudzych materiałów o nieznanej licencji. Zdjęcia są pomocą w rozpoznawaniu ruchu, a nie zweryfikowanym instruktażem techniki.
- Przebudowano ekran treningu: nazwa ćwiczenia, wybór ćwiczenia, zdjęcie, serie i ostatnie wyniki mają oddzielne sekcje. Usunięto pozostałość fikcyjnego wyniku w pseudoelementach CSS. Dolna nawigacja aplikacji nie dubluje nawigacji treningu; przyciski zmiany ćwiczenia są w normalnym układzie, bez nachodzenia na serie. Zmiana ćwiczenia przywraca początek widoku i zachowuje wpisane dane.

Testy obejmują scenariusze zgłoszone przez użytkownika, integralność katalogu i mapowania obrazów, zachowanie własnych danych podczas aktualizacji katalogu oraz kompilację. Rozszerzony Playwright sprawdza także filtry, ręczne wpisy, zamykanie pustej sesji, jawne zatwierdzanie wpisanych serii i układ podczas treningu. `tests/pwa.mjs` wykrył i pozwolił naprawić problem cache zasobów z nagłówkiem `Vary: Origin`: pobranie modułu JS wysyłało inny nagłówek niż instalacja cache i odświeżenie offline kończyło się pustą stroną. Dopasowanie cache pomija `Vary` wyłącznie dla jawnie dozwolonych publicznych zasobów powłoki. Test sprawdza cache powłoki/zdjęć i zapis po odłączeniu sieci w lokalnym trybie urządzenia — nie jest dowodem pełnego trybu offline kont Supabase.

Nadal do wykonania: prawdziwy iPhone/Safari i klawiatura, rzeczywiste dwa konta (próbę zatrzymał limit e-maili), wykresy powtórzeń i objętości ćwiczenia, edycja/usuwanie pomiarów i wybór daty odniesienia, pełny offline kont i konflikty między urządzeniami. Tabela `products` pozostaje nietknięta. Poniższe sekcje są historycznym zapisem poprzednich etapów.

Weryfikacja tego etapu zakończona: `npm test` — 12/12; `npm run build` — poprawnie; Playwright/Chromium — cały przepływ, wszystkie 12 plików zdjęć, filtry i grupy, 36 kombinacji zakładek/szerokości, 4 szerokości modalu oraz 3 szerokości ekranu treningu; osobny test PWA — odświeżenie offline, wznowienie, zapis lokalny i odtworzenie zdjęcia z cache. Komplet 72 zdjęć w WebP waży około 2,2 MB. Nie wykonywano testu Safari ani fizycznego iPhone’a.

## Kontynuacja — 29 października 2026

Zweryfikowano PR #1: nadal otwarty i roboczy, bez zmian od przekazania `3c9b308`. Kontynuacja zachowuje obecny model danych i nie zmienia schematu bazy.

- Ochrona odczytu konta działa teraz również wewnątrz funkcji modyfikacji i kolejki zapisu. Nie można przypadkowo zapisać wartości domyślnych przed udanym odczytem.
- Odrzucone żądanie sieciowe (wyjątek, a nie tylko odpowiedź z `error`) zachowuje lokalny zapis i pokazuje komunikat o konieczności ponowienia.
- Przerwa ma trwały termin końca w rozpoczętej sesji. Nie restartuje się po odświeżeniu ani powrocie z tła. Zachowano wydłużanie i pomijanie; 0 sekund w planie pozostaje zerem. Przełączenie ćwiczenia zachowuje przerwę z nazwą ćwiczenia, które ją rozpoczęło. Oba zegary obliczają czas z dat zamiast sumowania wywołań interwału.
- Test Chromium ujawnił rozszerzanie widoku 320 px przez odznaki i problemy z dotknięciem dolnej nawigacji. Siatka ma elastyczne kolumny i dwa pola na małych ekranach. Usunięto fikcyjną liczbę zdobytych odznak dodawaną przez CSS.
- `npm test`: 8 testów przechodzi, w tym rozszerzony test blokady modyfikacji po błędzie odczytu, wyjątku sieciowego, ponowienia zapisu i zerowej przerwy. `npm run build`: przechodzi.
- Playwright + systemowy Chromium: przepływ plan → cele → trening → serie → zapis → historia → wykres → ponowne otwarcie; wcześniejsze wyniki, pomiary, wznowienie i wygaśnięcie przerwy. 36 kombinacji zakładek i szerokości 320/375/390/430/768/1280 px oraz 4 szerokości modalu. Sprawdzana szerokość dokumentu i widoku względem zadanej szerokości, pola ≥16 px, brak błędów JavaScript.
- Za zgodą użytkownika podjęto próbę utworzenia dwóch kont tymczasowych przez Supabase Auth. Adresy `.invalid` odrzucono; kolejne próby w domenie przykładowej zatrzymał limit `over_email_send_rate_limit`. Odczyt `auth.users` potwierdził brak utworzonych kont testowych. Test rzeczywistego logowania dwóch kont i RLS przez klientów pozostaje niewykonany. Nie zmieniano ustawień e-maili, haseł ani istniejących kont.

Powyższe testy przeglądarkowe są symulacją mobilną. Safari, instalacja PWA i klawiatura na fizycznym iPhonie nadal nie zostały sprawdzone. Pozostałe ograniczenia opisane niżej (pełny offline, konflikty snapshotów, grafiki konkretnych ćwiczeń i dalszy rozwój funkcji) pozostają aktualne. Historyczna sekcja weryfikacji poniżej opisuje stan pierwszego przekazania.

## Zweryfikowany punkt wyjścia

Repozytorium: KenyDeploy/PAKIERNIAUX, main `aedfc600e16c02c833d513fc7e5e795e500823f5`. Produkcja Vercel `pakierniaux` była zbudowana z tego samego commita. Supabase: projekt Pakiernia. Inspekcja bazy była wyłącznie odczytem.

| Obszar | Wykryty problem | Zmiana |
| --- | --- | --- |
| Zapis treningu | Zakończenie oznaczało tylko numer dnia. Ciężary i powtórzenia nie trafiały do historii. | Pełna sesja, zatwierdzone serie, objętość, czas, podsumowanie i szczegóły sesji. |
| Historia i statystyki | Stałe sesje, rekordy i procenty. | Obliczenia z zapisanych treningów, wybór ćwiczenia i zakresu na wykresie. |
| Ostatni wynik | Słownik przykładowych wyników według nazwy. | Ostatnia sesja według identyfikatora ćwiczenia, podpowiedź i wstępnie uzupełnione pola. |
| Serie | Limit trzech serii, przycisk dodawania bez obsługi. | Pełna liczba serii z planu i dodawanie kolejnych. |
| Plany | Brak osobnych celów serii i powtórzeń w planie. | Serie, powtórzenia i przerwa dla każdego ćwiczenia w planie. |
| Baza | Sześć ćwiczeń, jedno bez nazwy, brak domyślnej przerwy dla własnych. | 32 ćwiczenia startowe, uzupełnianie starszej bazy, naprawione nazwy, filtry i przerwy. |
| Pomiary | Dane demonstracyjne, daty „Dzisiaj”, wymagane wszystkie pola. | Rzeczywiste daty, częściowe pomiary, mapa sylwetki, różnice i wykres masy. |
| Kalendarz | Numery dni bez miesiąca i roku, historyczna passa udawała bieżącą. | Klucze dat YYYY-MM-DD, tydzień obejmujący zmianę miesiąca, bieżąca passa. |
| Nawodnienie | Piątek na stałe jako bieżący dzień, brak dat. | Zapis według daty, prawidłowy dzień tygodnia. |
| Konta | Wspólny cache lokalny, możliwość nadpisania po błędzie odczytu. | Cache według konta, blokada zapisu przed udanym odczytem, kolejka zapisów, komunikaty i ponowienie. |
| Telefon | Pola po 12 px, elementy siatki bez ograniczenia szerokości, brak safe areas. | Pola minimum 16 px, elastyczne kolumny, przewijane modale, marginesy systemowe. |
| PWA | Brak manifestu i service workera w repo. | Manifest, ikona SVG, cache powłoki aplikacji i zasobów. |

## Dane zastane

Nie da się odzyskać ciężarów i powtórzeń, których wcześniejsza wersja nie zapisywała. Nowa historia zaczyna się od sesji ukończonych w nowej wersji. Stare pomiary bez daty są zachowane w `legacyMeasurements`, widoczne w osobnej sekcji, bez włączania do wykresów. Same numery dni są zachowane w `legacyCompletedDays`; nie przypisujemy im wymyślonych dat. Dotychczasowe inne pola snapshotu pozostają zachowane.

Nie zmieniono schematu ani danych produkcyjnej bazy. Aplikacja nadal używa prywatnego snapshotu w `user_data`. Polityki RLS tej tabeli sprawdzają `auth.uid() = user_id`.

## Weryfikacja

- `npm run build`: poprawna kompilacja aplikacji i wygenerowanie service workera.
- `npm test`: osiem testów, w tym integracyjny test interfejsu w Happy DOM: wpisanie i zatwierdzenie serii, odtworzenie sesji, zakończenie, historia, prawdziwy wykres i różnica obwodu bicepsa.
- Test synchronizacji z atrapą Supabase: bez zapisu podczas odczytu, odrębne konta, błąd zapisu i ponowienie, brak zapisu po błędzie odczytu.
- Odczyt schematu, polityk, grantów i doradców Supabase. Brak testowego zapisu do produkcji.
- `tests/browser.mjs`: przygotowany scenariusz Playwright z 36 kombinacjami zakładki i szerokości, ale NIEURUCHOMIONY skutecznie. Brak binarnej przeglądarki; pobranie zostało zablokowane przez środowisko. Happy DOM nie potwierdza rzeczywistego układu, zoomu iOS ani działania instalacji PWA.

## Przed udostępnieniem jako sprawdzona wersja

1. Sprawdzić na iPhonie Safari i po dodaniu do ekranu początkowego: pola, klawiatura, modale, nawigacja, wyjście i wznowienie sesji.
2. Sprawdzić logowanie i zapis na dwóch rzeczywistych kontach oraz ponowne otwarcie na innym urządzeniu. Testy atrap nie zastępują tego sprawdzenia.
3. Obecny cache PWA dotyczy powłoki. Ponowne wczytanie danych konta wymaga połączenia. Pełna praca offline i rozwiązywanie konfliktów między urządzeniami wymagają kolejnego etapu.

## Ważne ustalenie bazy

W tym samym projekcie jest tabela `public.products` bez RLS. Role `anon` i `authenticated` mają uprawnienia odczytu i modyfikacji. Jest poza funkcjami treningowymi; nie zmieniono jej zasad automatycznie, ponieważ zablokowałoby to ewentualną inną integrację. Do ustalenia: czy jest potrzebna, komu ma udostępniać dane i jakie polityki zastosować.

Proponowany pierwszy element naprawy po ustaleniu dostępu:

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
```

Samo to polecenie zablokuje klientów, jeśli nie otrzymają odpowiednich polityk. Dokumentacja: https://supabase.com/docs/guides/database/postgres/row-level-security

Pozostałe ustalenia: powielone polityki snapshotu, brak indeksów części kluczy obcych, wyłączona ochrona przed hasłami z wycieków. Nie są powodem demonstracyjnych wykresów.

## Zalecany dalszy rozwój

1. Migracja z całego snapshotu do oddzielnych sesji i serii, z importem zachowującym dotychczasowe dane. Dodać wykrywanie konfliktów, pełne offline i eksport kopii zapasowej.
2. Dokładne grafiki lub krótkie animacje dla każdego ruchu. Obecne ilustracje SVG pokazują grupę ćwiczeń i sprzęt, nie są instruktażem techniki konkretnego ćwiczenia.
3. Śledzenie powtórzeń i objętości dla pojedynczego ćwiczenia, RIR/RPE, serie rozgrzewkowe i historia rekordów. Nie zwiększać automatycznie ciężaru po każdej sesji; cel powinien uwzględniać wykonanie planu i ocenę trudności.
4. Edycja i usuwanie pomiarów, obwody lewej/prawej strony, bioder i łydki, wybór daty odniesienia i celu użytkownika. Wzrost obwodu nie zawsze oznacza poprawę, więc kolory nie oznaczają automatycznie „dobrze/źle”.
