# PAKIERNIA U MATIEGO — nowy UX

## Wymagania
Node.js 18+ (zalecane 20+).

## Uruchomienie lokalne
```bash
npm install
npm run dev
```
Otwórz adres pokazany przez Vite.

## Build produkcyjny
```bash
npm run build
```

## Vercel
1. Wrzuć zawartość projektu do repo GitHub.
2. W Vercel wybierz `Add New Project` i repozytorium.
3. Framework: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

## Supabase
1. Otwórz SQL Editor w projekcie Supabase.
2. Wklej i uruchom zawartość `supabase/schema.sql`.
3. Włącz Email provider w Authentication > Providers.
4. Lokalna konfiguracja jest w `.env.local` (nie commituj tego pliku).

Aplikacja używa Supabase Auth oraz tabeli `user_data`. Po zalogowaniu plany, ćwiczenia, nawodnienie, kalendarz treningów i pomiary są ładowane oraz zapisywane dla konkretnego użytkownika. `localStorage` pozostaje lokalnym cache i trybem awaryjnym, gdy zmienne Supabase nie są ustawione.

## Konfiguracja Supabase
Utwórz `.env.local` w katalogu projektu:
```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
Następnie uruchom `supabase/schema.sql` w SQL Editorze, włącz Email provider w Authentication > Providers i zrestartuj Vite. Schemat zawiera osobne tabele na profile, ćwiczenia, plany, sesje treningowe, serie, pomiary, wodę, dni treningowe i odznaki, wszystkie zabezpieczone RLS per `auth.uid()`. Obecna wersja klienta zapisuje kompatybilny snapshot stanu w `user_data`; tabele szczegółowej historii są przygotowane pod kolejny krok migracji zapisu serii i wyników.

## Co zostało poprawione
- ekran startowy z logo i animacją,
- uproszczona nawigacja mobilna,
- większe pola i przyciski dotykowe,
- odchudzony dashboard,
- mocno przebudowany ekran treningu,
- lepsza przerwa między seriami,
- wygodniejsze RPE,
- lepsze modale,
- responsywność telefonu/tabletu/desktopu,
- zachowane: treningi, plany, ćwiczenia, historia, statystyki, pomiary, backup/import, dark/light.
