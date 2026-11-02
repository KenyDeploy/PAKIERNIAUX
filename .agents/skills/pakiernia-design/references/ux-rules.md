# UX, ergonomia i dane

## Trening

- Narastająca lista serii: zapisane wyniki pozostają widoczne jako zwarte wiersze; każda seria ma edycję i usuwanie. „Dodaj serię” tworzy kolejną kartę. Cel planu jest informacją, nie wykonaniem. Nie wracaj do pojedynczego edytora ani dropdownu jako głównego sposobu wpisywania serii.
- Zachowuj stabilne ID i wszystkie wiersze już rozpoczętych sesji. Numeracja widoku może się zmienić po usunięciu; ID pozostałych rekordów nie. Wypełniona lub wykonana seria wymaga świadomego potwierdzenia utraty danych; nieruszona pusta karta nie potrzebuje dodatkowego okna.
- Poprzednie/Następne oraz wybór dowolnego ćwiczenia muszą obejmować również dodane pozycje. Przejście i wznowienie zachowują wpisy, indeks ćwiczenia i miejsce pracy. Błąd zapisu nie może przełączać ćwiczenia lub usuwać formularza.
- Dodanie, zamiana, pominięcie, cele i usunięcie w sesji nie modyfikują oryginalnego planu ani biblioteki. Cofnięcie pominięcia zachowuje wpisy. Pominięte wyniki nie trafiają do zakończonego treningu.
- Wyraźnie odróżniaj szkic, zatwierdzoną serię, zapis lokalny, oczekiwanie na synchronizację i zapis treningu w historii. Nie komunikuj sukcesu chmurowego po samym zapisie lokalnym.
- Podsumowanie i historia opierają się na tych samych zatwierdzonych, poprawnych wynikach. Masa ciała nie tworzy zgadywanych kilogramów objętości. Puste dodatkowe obciążenie może stać się rzeczywistym 0 wyłącznie zgodnie z logiką jawnego zatwierdzenia ćwiczenia z masą ciała.
- Zegary treningu i przerwy są odrębne. Zmiana wyglądu nie zmienia ich semantyki, pauz i odtwarzania po reload.

## Pomiary i profil

Docelowa prezentacja: naturalne modele męski i kobiecy, przód/tył, w spójnym kadrze i skali; interaktywne punkty poprawnie dopasowane do anatomii. Model jest statyczny. Wybór ilustracji nie określa płci biologicznej ani składu ciała. Neutralny pozostaje opcją profilu z jawnym sposobem prezentacji; nie podstawiaj po cichu innego wariantu.

Po wybraniu miary pokazuj faktyczną wartość i datę, różnicę od poprzedniego oraz pierwszego zapisu. Porównanie dat korzysta z rzeczywistych odczytów z wybranych dni. Wtedy/Teraz przełącza wartości i podświetlenia, nie deformuje anatomii. Nie interpoluj brakujących pomiarów i nie przypisuj starszego ogólnego bicepsa/uda do zgadywanej strony. Kierunek różnicy nie oznacza automatycznie poprawy.

Konfiguracja przy pierwszym uruchomieniu: wariant modelu, wzrost, masa początkowa, cel i opcjonalne obwody. Nie blokuj treningu wymaganiem kompletu pomiarów. Zachowuj możliwość późniejszej zmiany oraz zgodność starszych kont, dat i historii celów. Nie uruchamiaj migracji kont dlatego, że zmienia się ilustracja. Weryfikuj, czy kreator już istnieje na sprawdzanej gałęzi, zanim zaproponujesz implementację.

## iPhone i formularze

- Projektuj przede wszystkim na iPhone, z głównymi akcjami osiągalnymi jedną ręką i celami co najmniej 44×44 px. Gest ma alternatywny przycisk i obsługę klawiatury tam, gdzie to właściwe.
- Uwzględniaj `env(safe-area-inset-*)`, zmienny pasek Safari oraz wysokość/offset `visualViewport`. Treść przewija się nad klawiaturą; nagłówek i stopka nie zasłaniają pola, fokusu ani przycisku zapisu. Nie dodawaj kolejnej nakładającej się stopki.
- Korzystaj z istniejących paneli/modali i ochrony szkiców. Zachowuj fokus, etykiety, Escape, kontrolę przewijania i działanie po powiększeniu tekstu.
- Błąd quota, walidacji lub synchronizacji pozostawia wpisy i daje możliwość ponowienia. Chroniona operacja nie może zapisać połowy powiązanych danych. Ponowienie i podwójny submit nie tworzą duplikatów.
- Chronione dane to także daty, jednostki, plany, zdjęcia, historia i wpisy legacy. Nie usuwaj ani nie resetuj kont/pamięci przeglądarki użytkownika w celu testowania.

## Gdy czegoś brakuje

Wyraźnie rozróżniaj: działająca funkcja, infrastruktura bez zasobu, prototyp i zadanie niedokończone. Nie zastępuj braków makietowymi wynikami, nieaktywnymi przełącznikami lub niezweryfikowaną grafiką. Brak modelu albo testu urządzenia opisz w raporcie, zamiast zmieniać go w fikcyjne PASS.
