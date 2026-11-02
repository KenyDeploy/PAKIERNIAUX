# Pakiernia — kolejne małe etapy

Stan: 30 października 2026. Każdy etap ma zakończyć się sprawdzonym podglądem w roboczym PR. Bez scalenia do main i publikacji produkcyjnej bez polecenia użytkownika.

1. **Bieżący etap: wygoda treningu i ćwiczeń.** Krótkie zakończenie ze stale widocznymi przyciskami, zdjęcie przy dodawaniu/edycji własnego ćwiczenia, widoczny przycisk Edytuj, mniejsza liczba przewinięć do serii. Testować także bardzo niskie widoki, długą sesję i błąd zapisu zdjęcia.
2. **Ustawienia i regularność.** Cel treningów tygodniowo, opcjonalny harmonogram, cele użytkownika i historia ich zmian od określonej daty. Następnie osiągnięcia za realizację planu, regularność miesięczną i powrót po przerwie. Odpoczynek nie przerywa serii realizowanych tygodni. Ręczne wpisy liczą frekwencję; rekordy wymagają rzeczywistych wyników. Osobne ustawienia każdego konta. Kolor akcentu można dodać w tym etapie bez zmieniania znaczenia komunikatów błędów.
3. **Raport dla trenera/GPT.** Podsumowanie sesji, kopiowanie i plik Markdown/JSON oraz raport okresowy z wynikami, frekwencją i pomiarami. Ręczne udostępnianie przez użytkownika, bez automatycznego wysyłania danych. Raport ma zawierać daty, jednostki i brakujące wartości, a nie wymyślone wnioski.
4. **Postęp i pomiary.** Wykresy ciężaru, powtórzeń i objętości, wybór okresu i dotykanie punktów. Edycja/usuwanie pomiarów oraz wybór daty odniesienia. Możliwość zmiany kolejności ćwiczeń i wygodnej zamiany zajętego sprzętu.
5. **Pełny offline kont i wiele urządzeń.** Wykrywanie konfliktów zamiast nadpisywania całego snapshotu, migracja zachowująca dane, niezależna kolejka synchronizacji. Przy większej liczbie własnych zdjęć rozważyć prywatny Storage zamiast powiększania snapshotu.

Przez wszystkie etapy: zachowywać istniejące dane, testować zapis i wznowienie. Przed uznaniem aplikacji za gotową produkcyjnie sprawdzić prawdziwy iPhone/Safari/PWA z klawiaturą oraz izolację dwóch prawdziwych kont. Dotychczasowe testy Chromium i atrap Supabase nie zastępują tych prób.
