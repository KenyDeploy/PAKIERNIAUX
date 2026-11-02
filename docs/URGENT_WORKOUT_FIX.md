# Pilna poprawka treningu po kolejnym nagraniu iPhone

Baza: 623cd6b, ta sama gałąź PR #1. Przejrzano osiem klatek lokalnego nagrania (~93 s). Widoczny błąd: pole dodatkowego ciężaru miało placeholder 0, ale zapis podciągania z pustym polem kończył się błędem walidacji. Film i klatki użytkownika nie są publikowane w repo.

## Zmiany

- Dla ćwiczeń oznaczonych w istniejącej bazie sprzętem **Masa ciała** pole nazywa się „Dodatkowe kg” i wyjaśnia: puste pole = 0 kg przy zapisie serii. Dopiero jawne „Zapisz serię” normalizuje ten brak do zapisanego 0. Nie zgadujemy masy użytkownika i nie dodajemy jej do objętości. Dla sztangi/hantli pusty ciężar nadal wymaga wpisania. Wyświetlanie zapisów: „10 powt. · masa ciała” lub „+5 kg × 10”.
- Bieżąca karta ma wyraźny status i akcent, oczekująca — przerywaną ramkę i etykietę, wykonana — zwarty wiersz z ikoną oraz tekstem. Narastająca lista, identyfikatory i świadome usuwanie pozostają. Dodawanie od razu tworzy edytowalną kartę, niezależnie od celu planu.
- W dolnym pasku widoczne tekstowe **Poprzednie / Następne / Zakończ**. Bezpośrednia lista „Ćwiczenia w sesji” pokazuje też dodane pozycje i pozwala wracać do dowolnego ćwiczenia. Nawigacja sprawdza aktualną sesję i zakres; nieudany zapis nie przełącza indeksu ani nie usuwa wpisów. Starsza sesja bez jawnego indeksu nawigacji startuje od 0.
- Zakończenie zapisuje **wyłącznie wcześniej zatwierdzone, poprawne serie**, pomijając oznaczone jako pominięte. Usunięto zbiorcze „Zapisz też niezaznaczone serie”; szkice trzeba zatwierdzić w ich kartach. Podsumowanie ostrzega o szkicach, a przy braku zatwierdzonych wyników oferuje powrót zamiast zapisu pustego treningu.
- Jeden odczytowy helper podsumowania liczy serie, sumę powtórzeń i objętość zapisanego obciążenia. Te same sumy są widoczne przed zakończeniem i po zapisie. Kontrolny przypadek: **5 kg × 10 + 2,5 kg × 10 = 2 serie, 20 powtórzeń, 75 kg objętości dodatkowego obciążenia**. Niepotwierdzona seria 999 kg × 100 nie zmienia tych sum.
- Dodanie ćwiczenia modyfikuje wyłącznie rozpoczętą sesję. Oryginalny plan i mechanizm synchronizacji pozostają bez zmian; brak nowych zależności lub migracji. Zachowano oddzielny obszar stopki poza przewijaną listą i reakcję na visualViewport.

## Testy

- `npm test` **67/67 PASS**, `npm run build` PASS. Nowe testy logiki: jawne zero dodatkowego ciężaru, brak mutacji szkicu, dokładne sumy, pominięte/niezatwierdzone wyniki, dwa dodane ćwiczenia i nawigacja po reload.
- Chromium: **urgent-workout, growing-series, session-discard, workout-premium, browser — PASS**. Nowy scenariusz dodaje dwa ćwiczenia, zapisuje szkice w obu, przechodzi w obie strony i przez listę, odświeża i kończy trening. Sprawdza stabilne ID, poprawki/usunięcie, anulowanie usunięcia, błędy localStorage i ponowienie, brak zmiany planu, brak niezatwierdzonych wyników w historii oraz identyczność sum przed/po zapisie.
- 320/375/390/430 px, symulowana klawiatura 340 px i offsetTop 35: pole oraz zapis są dostępne, obszar listy nie przecina stopki, hit-test zapisu trafia w przycisk. Brak błędów JS w sprawdzonych scenariuszach.
- Nie wykonywano nowego testu na fizycznym iPhonie/Safari/PWA ani natywnej klawiaturze. Nagranie jest testem użytkownika poprzedniego preview; poprawka wymaga ponownej próby urządzenia.

## Screenshoty 390 px

- [Pole dodatkowego obciążenia](audit/urgent-bodyweight-390.png).
- [Dwie wykonane serie](audit/urgent-two-sets-390.png).
- [Podsumowanie 2 / 20 / 75](audit/urgent-summary-390.png).
- [Trzy ćwiczenia w sesji i nawigacja](audit/urgent-session-navigation-390.png).

Zrzuty są izolowanymi danymi testowymi. Odtwarza je tests/urgent-workout.mjs z APP_URL, PLAYWRIGHT_MODULE i CHROMIUM_PATH lokalnego środowiska. Nie scalano do main i nie publikowano produkcji.
