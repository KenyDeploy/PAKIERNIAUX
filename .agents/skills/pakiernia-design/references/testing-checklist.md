# Weryfikacja zmian Pakierni

## Przed i po

- Sprawdź `git status`, gałąź i HEAD; odnotuj istniejące zmiany. Przeczytaj aktualne `package.json` i scenariusze w `tests/` zamiast uruchamiać komendy ze starego raportu bez sprawdzenia.
- Zapisz screenshot „przed” i „po” przy **390 px**, z tymi samymi izolowanymi fixtures i istotną interakcją. Obejrzyj obrazy, nie tylko potwierdź istnienie plików. Dla modeli pokaż całą sylwetkę bez zasłonięcia przez stopkę.
- Sprawdź **320/375/390/430 px** oraz niski widok z klawiaturą. Mierz przecięcia widocznych prostokątów i w razie potrzeby hit-test przycisku; sam brak poziomego overflow nie dowodzi dostępności akcji.
- Weryfikuj zmieniony ekran we wszystkich siedmiu motywach, w tym Classic Mono. Brak zielonych dekoracji, czytelny fokus i błędy, prawidłowa praca po powiększeniu tekstu.

## Dobierz regresję

Dla zmian kodu aplikacji uruchom `npm test` i `npm run build` (na Windows można użyć `npm.cmd`). Uruchom również odpowiednie istniejące scenariusze przeglądarkowe. Samo `npm test` nie uruchamia `tests/*.mjs`.

| Zmieniany obszar | Przykładowe scenariusze, jeśli istnieją w HEAD |
|---|---|
| Serie i nawigacja | growing-series, urgent-workout, workout-premium, session-discard |
| Profil, pomiary, porównanie | body-measurements, measurements-v2, measurements-v3, form-drafts |
| Motywy, pulpit, wykresy | settings, dashboard, premium-c, premium-charts |
| Zapis i wznowienie | browser, odpowiednie testy kont/cache/synchronizacji |
| PWA i cache zasobów | pwa na świeżym buildzie |

To wskazówki do wyboru, nie deklaracja obecności lub PASS tych plików. Nie dodawaj brakującego testu tylko po to, by zgadzała się tabela. Przy zmianie wyłącznie dokumentacji/Skills sprawdź format, odnośniki, zakres diffu i wykrywanie umiejętności; nie deklaruj nowego wyniku aplikacji bez jej testowania.

## Środowisko

Użyj istniejącego projektu i zatwierdzonych narzędzi. Przykład uruchomienia lokalnego builda:

```sh
npm run preview -- --host 127.0.0.1 --port 4180 --strictPort
```

Wskaż `APP_URL=http://127.0.0.1:4180`; nie zakładaj, że scenariusz domyślnie używa tego samego portu. `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH` i ewentualne `PLAYWRIGHT_BROWSERS_PATH` dobierz do lokalnego runtime. Nie kopiuj ścieżki z laptopa autora ani poświadczeń. Brak modułu/binarium zgłoś lub skorzystaj z już dostępnego narzędzia; nie wykonuj niezweryfikowanego `npx`/instalatora. Nie wskazuj APP_URL na prawdziwe konto lub produkcję dla scenariuszy quota/usuwania.

## Dane i zachowanie

- Zapis → przejście → powrót → reload/wznowienie; stabilne ID, te same sumy i historia.
- Dodane ćwiczenia i nawigacja bez zmiany planu źródłowego.
- Anulowanie usunięcia/odrzucenia nie zmienia snapshotu. Jawne usunięcie nie odtwarza wiersza po reload.
- Błąd localStorage/synchronizacji, ponowienie i podwójne wysłanie; bez utraty szkicu, połowicznego zapisu lub duplikatu.
- Starsze, częściowe i puste dane; brak wymyślonych dat, stron ciała, wyników i zer.
- Izolacja kont testowana na atrapach nie dowodzi poprawności dwóch prawdziwych kont/urządzeń. Nie testuj destrukcyjnie cudzych danych.

## Co raportować

Podaj faktycznie uruchomione komendy, wynik, SHA, silnik przeglądarki, rozmiary, screenshoty i niewykonane próby. Odróżniaj błąd aplikacji od nieaktualnego selektora lub niedziałającego serwera. Aktualizując test, zachowaj jego cel i asercje danych; nie usuwaj sprawdzania tylko dla zielonego wyniku.

Chromium/WebKit z emulacją iPhone i symulowanym visualViewport to **nie fizyczny iPhone**. Natywną klawiaturę iOS, safe-area urządzenia, rzeczywisty pasek Safari, PWA/tło i VoiceOver oznacz jako sprawdzone tylko po realnej próbie. Nie dziedzicz historycznych wyników audytów jako wyniku bieżącej gałęzi.
