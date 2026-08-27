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

Aplikacja synchronizuje treningi, plany, pomiary, ustawienia i ręczne oznaczenia z kontem użytkownika. Zdjęcia pomiarowe są przechowywane razem z pomiarami i automatycznie ograniczane do trzech najnowszych.

## Ważne
Ta wersja zachowuje dane w `localStorage`, podobnie jak obecna aplikacja. Supabase nie jest jeszcze podłączony celowo — najpierw stabilizujemy UI/UX. Następny etap może przenieść dane do Supabase i dodać logowanie/synchronizację.

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
