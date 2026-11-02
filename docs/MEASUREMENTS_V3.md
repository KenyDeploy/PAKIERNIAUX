# Pomiary 3.0 — naturalne ilustracje i konfiguracja

Baza: `d5b4af5`, gałąź `codex/real-progress-mobile`, PR #1. Zakres dotyczy etapu 2. Dotychczasowy trening, pulpit premium i Classic Mono zachowane.

## Działający zakres

- Cztery **rzeczywiście podłączone finalne statyczne ilustracje** fitness: mężczyzna/kobieta, przód/tył. Oryginalne zasoby OpenAI image_gen, wspólny canvas 1024×1536 i podobna naturalna skala. [Pochodzenie i dokładne prompty](BODY_ASSETS_PROVENANCE.md), [manifest z SHA-256](body-assets-manifest.json). Bez body.png, stocków lub referencji zewnętrznych osób. Stary BodySilhouette nie jest importowany przez nowy widok.
- Neutralny zachowuje `bodyProfile.model=neutral` i pokazuje podpisany panel punktów/wartości **bez postaci**. Nie podstawia męskiej ilustracji ani nie zapisuje płci biologicznej. Przy błędzie pobrania obrazu również pozostają dostępne dane i punkty.
- Hotspoty 44×44 px dopasowane osobno do anatomii wariantów. Wybór pokazuje wartość, faktyczną datę, różnicę od poprzedniego i pierwszego zapisu. Pusty pomiar pozostaje pusty. Przerywany punkt oznacza brak pomiaru w prezentowanym stanie; akcent w porównaniu oznacza istniejącą niezerową różnicę, bez oceny dobrze/źle. L/P odnosi się do ciała, nie ekranu.
- Zachowane Aktualnie/Poprzedni/Porównaj/Historia, daty, wykresy, tabela, edycja/usuwanie, notatki i historia celów. Suwak Wtedy/Teraz ma **dwie pozycje**, po jednej dla każdej wybranej daty; dotyk, klawiatura i alternatywne przyciski zmieniają rzeczywiste wartości i podświetlenia. Bez interpolacji pomiarów, zgadywania brakujących stron i deformacji; identyczny URL obrazu przy obu pozycjach. `canCompareValues=true`, `canDeform=false`, `canCompareSlider=false` dotyczy porównania deformowanych modeli.
- Wspólny lekki SmoothChart pozostał wykresem pod modelem; tabela przedstawia oryginalne odczyty. Cztery ilustracje dodano do istniejącego precache PWA.

## Nowe konto i dane historyczne

Nowy pusty snapshot otrzymuje `bodySetup.status=pending`. Zaproszenie do opcjonalnego dwukrokowego kreatora znajduje się na pulpicie po głównej akcji startu. Nie blokuje treningu modalem. Starsze snapshoty bez tego pola nie są oznaczane jako nowe.

Krok 1: model, opcjonalny wzrost i cel. Krok 2: opcjonalna masa początkowa i obwody. Można skończyć bez pomiarów lub wybrać Później. Kreator można ponownie otworzyć w Pomiarach; profil zmienić istniejącym formularzem, a masę/obwody edytować w historii. Zakończenie bez danych nie tworzy pustego pomiaru.

`completeBodySetup` przekazuje jeden nowy snapshot do istniejącego `updateData`: profil i datowany pomiar zapisują się atomowo. Masa nie ma drugiej kopii w profilu. Historia celu używa istniejącego `saveBodyProfile`; niezmieniony cel nie otrzymuje duplikatu. Zmiana profilu od otwarcia kreatora jest odrzucana. Błąd zapisu nie zamyka formularza; ponowienie i podwójny submit nie mnożą rekordów. DraftDialogSheet chroni wpisy przy zamknięciu panelu w aplikacji, nie po wymuszonym zamknięciu przeglądarki.

Bez nowych zależności projektu, zmian Auth/RLS, schematu bazy lub mechanizmu synchronizacji. Normalizacja dodaje pole wyłącznie pustemu nowemu snapshotowi; zachowuje legacy dane, identyfikatory i dodatkowe pola.

## Rzeczywista weryfikacja

- `npm test`: **71/71 PASS**, bez pominiętych. Nowe testy: nowe/stare snapshoty, opcjonalne wpisy, atomowość, brak mutacji źródła, dodatkowe pola/legacy, historia celu, walidacja, konflikt profilu, istnienie czterech zasobów. Istniejące testy dwóch kont/cache/błędów synchronizacji na atrapach pozostają zielone.
- `npm run build`: **PASS**.
- `measurements-v3.mjs`: **PASS w Chromium 151 i WebKit 26.5 na Windows**. Faktyczne pobranie/dekodowanie czterech obrazów 1024×1536, brak żądań do body.png, punkty 44 px przy 320/375/390/430, prawdziwe delty/braki, suwak/klawiatura, statyczny obraz, legacy/cele/plany po reload. Kreator: szkic, quota/retry, podwójny submit, stopki przy 320×360/375×500/390×600/430×844; Później → reload → trening bez pomiarów. Brak błędów JS w obu scenariuszach.
- Chromium: **body-measurements, measurements-v2, form-drafts, browser, pwa — PASS**. Dotychczasowa edycja/usuwanie pomiarów, zgodność legacy i profilu, ochrona szkiców, trening → zapis → historia, lokalny offline. PWA dekoduje również wszystkie cztery finalne ilustracje po odłączeniu sieci.
- Przegląd React: kontrolowane pola, oddzielony szkic, stabilna identyfikacja konta, brak nowych globalnych timerów/nasłuchów, semantyczny range i alternatywne przyciski, prefers-reduced-motion.

**Nie wykonano fizycznego iPhone’a**, natywnej klawiatury iOS, rzeczywistego paska Safari/PWA, VoiceOver ani produkcyjnego zapisu dwóch kont. WebKit z emulacją telefonu na Windows nie zastępuje tych prób. Pełny offline kont i konflikty urządzeń pozostają wcześniejszym ograniczeniem. Historyczne trzy czerwone skrypty FINAL_AUDIT_HANDOFF nie zostały zbiorczo uznane za naprawione.

Środowisko: systemowy Edge nie wystartował w sandboxie (proces/pipe), więc Chromium uruchomiono jako osobny Playwright headless shell w work/. Pierwszy stary scenariusz pomiarów wskazywał nieczynny domyślny port 5173; poprawna regresja użyła APP_URL=4180. Zaktualizowano stare asercje braku obrazu/tymczasowego SVG do finalnych zasobów bez osłabienia sprawdzania danych. PWA miało niejednoznaczny selektor Zakończ trening (stopka i dialog); zawężono go do dialogu Czas i przerwa i powtórzono z sukcesem, bez zmiany treningu.

## Screenshoty aplikacji

Izolowane zapisane fixtures, nie dane użytkownika ani koncepcyjne mockupy. Modele: viewport przewinięty tak, aby cała sylwetka mieściła się między nagłówkiem i nawigacją. Pełnostronicowe porównanie pokazuje stałą nawigację na wysokości początkowego viewportu.

| Widok | Chromium | WebKit |
|---|---|---|
| Męski przód | [obraz](audit/measurements-v3-chromium-male-front-390.png) | [obraz](audit/measurements-v3-webkit-male-front-390.png) |
| Męski tył | [obraz](audit/measurements-v3-chromium-male-back-390.png) | [obraz](audit/measurements-v3-webkit-male-back-390.png) |
| Kobiecy przód | [obraz](audit/measurements-v3-chromium-female-front-390.png) | [obraz](audit/measurements-v3-webkit-female-front-390.png) |
| Kobiecy tył | [obraz](audit/measurements-v3-chromium-female-back-390.png) | [obraz](audit/measurements-v3-webkit-female-back-390.png) |
| Porównanie | [obraz](audit/measurements-v3-chromium-compare-390.png) | [obraz](audit/measurements-v3-webkit-compare-390.png) |
| Neutralny | [obraz](audit/measurements-v3-chromium-neutral-390.png) | [obraz](audit/measurements-v3-webkit-neutral-390.png) |
| Kreator | [obraz](audit/measurements-v3-chromium-setup-390.png) | [obraz](audit/measurements-v3-webkit-setup-390.png) |

Reprodukcja: `npm ci`, `npm test`, `npm run build`, `npm run preview -- --host 127.0.0.1 --port 4180 --strictPort`; następnie APP_URL, PLAYWRIGHT_MODULE, opcjonalnie CHROMIUM_PATH albo BROWSER_ENGINE=webkit z PLAYWRIGHT_BROWSERS_PATH, po czym `node tests/measurements-v3.mjs`. Playwright i Sharp są istniejącymi narzędziami runtime, nie nowymi zależnościami projektu. Bez scalenia do main ani publikacji produkcyjnej.
