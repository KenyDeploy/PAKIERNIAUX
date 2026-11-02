# Etap C — pulpit, baza ćwiczeń i motywacja

## Przed / po

- **Pulpit:** przed — statyczne liczby, tydzień i kalendarz. Po — miniwykres objętości i frekwencji z ostatnich siedmiu lokalnych dni w istniejących kartach, trend porównywalnego ciężaru oraz karta ostatniego rekordu. Zachowano Start/Wznów, plany, kalendarz, ręczne oznaczanie dni i opcjonalne nawodnienie. Nowy moduł poziomu jest pod podstawowymi akcjami, odznaki można rozwinąć.
- **Baza:** przed — cięższe wiersze i tekstowe przyciski Edytuj. Po — neutralne powierzchnie, cienkie separatory, proporcje miniatur 3:2, nazw i ikony edycji 44 px. Przełącznik „Kompaktowa lista” ukrywa parametry pomocnicze i zmniejsza miniatury; pełne szczegóły i edycja pozostają dostępne przez nazwę/ikonę. Wyszukiwanie, grupy, sprzęt, własne ćwiczenia i zdjęcia bez zmiany działania. Gęstość jest ustawieniem bieżącego widoku, nie nowym polem synchronizacji.
- **Odznaki:** przed — cztery progi liczby treningów w Postępie. Po — wspólny moduł XP/poziomu na pulpicie i w Postępie, sześć wymaganych odznak oraz zachowana wcześniejsza „25 treningów”. Kolory oznaczają stan zdobyta/do zdobycia, a nie demonstracyjne nagrody.

## Zasady oparte na zapisach

`src/motivation.js` wylicza wynik z bieżącego snapshotu konta, bez zapisywania kopii XP, osobnej tabeli nagród, migracji lub zmiany synchronizacji.

- 100 XP za zakończoną sesję z co najmniej jedną rzeczywiście zatwierdzoną, poprawną serią. Pominięte ćwiczenia/serie, niezatwierdzone wyniki, puste sesje, niepoprawne i przyszłe daty nie tworzą punktów. Powtórzony identyfikator sesji jest liczony raz.
- 20 XP za ręcznie oznaczony dzień bez zapisanej sesji tego dnia. Jeden dzień liczony raz; nie tworzy serii, ciężaru ani objętości. Kilka prawdziwych sesji w dniu pozostaje osobnymi sesjami.
- 15 XP za odrębny dzień z rzeczywistym pomiarem. Nie za każde pole lub wielokrotne edycje tego samego dnia. Pomiary bez daty, przyszłe i puste nie tworzą punktów.
- Każde 300 XP podnosi poziom; start to poziom 1 / 0 XP. Pasek pokazuje punkty w bieżącym poziomie. Usunięcie/korekta danych przelicza wynik, bez ponownego przyznawania punktów przy reload. Zasady są dostępne również w module aplikacji.
- Pierwszy / 5 / 10 / 25 treningów bazują na zakończonych sesjach i odrębnych ręcznych dniach frekwencji. Passa wymaga historycznych trzech kolejnych dni. Regularne pomiary: trzy odrębne dni na przestrzeni co najmniej 14 dni.
- Rekord wymaga wcześniejszego ciężaru dla **tego samego ID ćwiczenia i tej samej liczby powtórzeń**. Pierwszy wynik nie jest rekordem względem zera. Brak ciężaru nie jest zamieniany w obciążenie. Karta tygodnia pokazuje najnowsze takie przekroczenie historycznego maksimum w siedmiu dniach; w przeciwnym razie pokazuje ostatnią porównywalną zmianę. Miniwykres dotyczy tego samego ćwiczenia i powtórzeń co karta. Nie jest to medyczna ani całościowa ocena siły — zakres ruchu, technika i RIR nie są porównywane.

## Testy i ograniczenia

- Build PASS; 9 odpowiednich testów motivation/dashboard/app PASS.
- Chromium: premium-c, dashboard, browser PASS. Sprawdzono puste konto, rzeczywiste dane, XP i poziom, siedem odznak (sześć zdobytych w fixture z dziesięcioma treningami), wspólne wartości w Postępie, kompaktową i zwykłą bazę, edycję, wyszukiwanie/filtry, reload bez nowych kopii danych, kalendarz, nawodnienie i trening → zapis → historia.
- 320/375/390/430 px, bez poziomego przewijania i błędów JS w tych próbach. Cel edycji ma min. 44×44 px. Nie wykonywano fizycznego testu iPhone’a, Safari ani VoiceOver.
- Screenshoty używają izolowanych zapisów testowych; aplikacja nie zawiera generatora demonstracyjnych wyników. Pełne strony pokazują stały pasek nawigacji na wysokości początkowego viewportu; zawartość można przewinąć ponad nim.
- Bez zmian danych produkcyjnych, schematu, zależności i synchronizacji. Bez scalenia do main i publikacji produkcyjnej.

## Screenshoty 390 px

Stan przed zarejestrowano na d598c21 przed edycją kodu:

- Pulpit: [przed](audit/premium-c-home-before-390.png) / [po](audit/premium-c-home-after-390.png).
- Baza: [przed](audit/premium-c-catalog-before-390.png) / [po](audit/premium-c-catalog-after-390.png) / [kompaktowa](audit/premium-c-catalog-compact-390.png).
- [Rozwinięte odznaki i XP](audit/premium-c-rewards-after-390.png).

Odtworzenie: tests/premium-c-capture.mjs (CAPTURE_PHASE=before/after) i tests/premium-c.mjs, z APP_URL oraz PLAYWRIGHT_MODULE/CHROMIUM_PATH wskazującymi lokalny preview i Chromium. Test odznak ma stały zegar i osobny zestaw dziesięciu zapisów; nie należy porównywać jego liczb z czterema zapisami z ogólnego zrzutu pulpitu. Wykresy/XP pomijają przyszłe wyniki względem zegara testu; wcześniejsze zbiorcze liczniki zachowują dotychczasowy kontrakt.
