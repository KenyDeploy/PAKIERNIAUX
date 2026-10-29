# Pakiernia u Matiego

Prywatny dziennik treningowy: plany z bazy ćwiczeń, zapisywanie serii, historia i statystyki na rzeczywistych danych, pomiary sylwetki i konta Supabase.

Baza zawiera 72 polskie ćwiczenia w 7 grupach, z filtrami partii i sprzętu oraz realistycznymi wizualizacjami AI. Pochodzenie zdjęć: [EXERCISE_IMAGES.md](EXERCISE_IMAGES.md). Ręczne oznaczenia w kalendarzu liczą się do frekwencji i historii, a serie i objętość pochodzą tylko z zapisanych wyników. Zakończenie treningu pozwala sprawdzić serie, świadomie zatwierdzić wypełnione pola lub odrzucić pustą sesję.

## Uruchomienie

Node.js 22.12+ (produkcja Vercel używa Node 24).

```sh
npm ci
npm run dev
npm test
npm run build
```

W `.env.local` ustaw `VITE_SUPABASE_URL` i `VITE_SUPABASE_PUBLISHABLE_KEY`. Nie commituj tego pliku. Bez konfiguracji Supabase działa lokalny tryb urządzenia. Brak klucza serwisowego w aplikacji klienckiej.

## Zapis danych

Obecny klient używa Supabase Auth oraz tabeli `user_data` z RLS według `user_id`. Snapshot obejmuje plany, ćwiczenia, sesje z seriami, rozpoczętą sesję, datowane pomiary, dni treningowe i nawodnienie. Cache jest odrębny dla każdego konta. Nie zapisujemy do chmury, dopóki odczyt konta nie zakończy się powodzeniem. Błąd synchronizacji zachowuje lokalną kopię i umożliwia ponowienie.

Na istniejącej instalacji nie uruchamiaj ponownie `supabase/schema.sql` jako aktualizacji: nie jest migracją tej poprawki i część istniejących polityk nie jest idempotentna. Ta zmiana nie wymaga migracji SQL.

## PWA i testy

Build generuje manifest i service worker z cache powłoki. Nowy worker czeka na zamknięcie poprzednich okien, żeby nie wymieniać aplikacji w trakcie treningu. Wczytanie danych konta wymaga połączenia; pełny tryb offline i konflikty równoczesnych zmian na kilku urządzeniach są poza zakresem tej wersji.

`npm test` uruchamia testy obliczeń i interfejsu w Happy DOM, wraz z testem atrap synchronizacji. `tests/browser.mjs` jest osobnym scenariuszem dla Playwright (zainstaluj Playwright i Chromium i uruchom przy działającym serwerze). Opcjonalnie ustaw `PLAYWRIGHT_MODULE` na ścieżkę modułu oraz `APP_URL` na adres lokalnego trybu testowego bez Supabase. Test wymaga pustego profilu przeglądarki i nie powinien być uruchamiany na prawdziwym koncie użytkownika.

Pełne ustalenia, zakres weryfikacji, ograniczenia i plan dalszego rozwoju: [AUDIT.md](AUDIT.md).

Test w zainstalowanym Chromium można uruchomić bez pobierania przeglądarki:

```sh
CHROMIUM_PATH=/usr/bin/chromium node tests/browser.mjs
```

Wymaga modułu `playwright` (lub `PLAYWRIGHT_MODULE` wskazującego jego plik wejściowy) i działającego serwera lokalnego bez konfiguracji Supabase. Scenariusz korzysta z osobnego, pustego kontekstu przeglądarki. Obejmuje własny plan, cele serii, zapis i wznowienie treningu oraz przerw, historię, wykres, pomiary, 36 kombinacji zakładek i szerokości oraz 4 szerokości modalu planu. To symulacja telefonu w Chromium, nie test Safari ani fizycznego iPhone’a.

Po `npm run build` uruchom `npm run preview`; dla tego adresu można dodatkowo wykonać `node tests/pwa.mjs` z tymi samymi zmiennymi `APP_URL`, `CHROMIUM_PATH` i `PLAYWRIGHT_MODULE`. Ten test sprawdza instalację service workera, cache zdjęć, odświeżenie offline, wznowienie i zapis lokalnego treningu. Dotyczy trybu urządzenia bez Supabase; pełny offline kont wymaga dalszego rozwoju.
