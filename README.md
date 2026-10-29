# Pakiernia u Matiego

Prywatny dziennik treningowy: plany z bazy ćwiczeń, zapisywanie serii, historia i statystyki na rzeczywistych danych, pomiary sylwetki i konta Supabase.

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
