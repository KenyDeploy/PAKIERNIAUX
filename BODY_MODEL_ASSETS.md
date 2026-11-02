# Zasoby sylwetki i adapter — stan etapu 6

## Inspekcja istniejącego body.png

`public/body.png`: PNG 700×700, 383213 bajtów, SHA-256 `4a044ba4e6c247f2cfcc2552210e67a84bba6ad2926e5b378ac53163b8801621`. Wspólny raster przodu i tyłu męskiej anatomii mięśniowej na jasnym tle, widoczne artefakty tła; nie odpowiada docelowemu ciemnemu modelowi z planszy. Historia Git (`4dcabf8`, `0f24f8a`) opisuje jedynie upload plików. Metadane PNG zawierają daty techniczne, bez autora/źródła/licencji. Dokumentacja repozytorium nie potwierdza praw do wykorzystania tego zasobu. Nie ustalono licencji; nie traktujemy dat metadanych jako dowodu autorstwa.

Nie podłączono pliku do nowego widoku. Brakuje zatwierdzonych, oddzielnych zasobów męskiego, kobiecego i neutralnego oraz modelu deformacji. Nie utworzono zastępczej anatomii, patyczaka ani dodatkowych obrazów. Raster nie zawiera warstw, siatki, masek ani punktów kontrolnych — nie wspiera bezpiecznej miejscowej deformacji.

## Działające połączenie danych

`bodyMeasurements.js`: rozszerzalne, datowane pomiary i źródła wartości, dokładne stany danego dnia do porównania, ostatnie rzeczywiste wartości do widoku bieżącego. Dawne biceps/thigh pozostają polami bez przypisanej strony. Masa i tkanka tłuszczowa w profilu są odczytami rzeczywistych pomiarów, nie osobnymi kopiami preferencji. Cel i jego zmiany trafiają do `bodyProfile` / `bodyGoalHistory` w dotychczasowym prywatnym snapshocie. Bez migracji SQL.

`BodyModelView.jsx`: wybór przód/tył i punktów z wartościami/datami, dostępność klawiatury. Przy braku zasobu pokazuje jawny komunikat oraz działające punkty w siatce, bez sugerowania istniejącej anatomii. `bodyModelRegistry` w `bodyModelAdapter.js` jest jedynym miejscem konfiguracji zasobów. Do uruchomienia statycznego modelu potrzebne są zatwierdzone `front`, `back` i informacja o licencji. Obecne `bodyAnchors` są szkicem infrastruktury, wymagają kalibracji do każdego dostarczonego wariantu. Lewa/prawa strona odnosi się do ciała osoby, nie strony ekranu.

## Wymagania zasobu deformowalnego

- Udokumentowane autorstwo/licencja pozwalająca na dystrybucję w PWA, modyfikacje i offline. Osobne przód/tył dla wspieranych wariantów; spójna perspektywa, proporcje, skala i przezroczyste tło.
- Wektor z niezależnymi ścieżkami lub siatka z maskami/rig: barki, klatka, talia, biodra oraz osobno lewy/prawy biceps, udo i łydka. Brak sztucznego skalowania całego rastra. Łączenia regionów muszą pozostać ciągłe, bez deformowania głowy/dłoni/stóp podczas korekty obwodu.
- Kalibrowane, nazwane kotwice pomiarowe dla modelu i obu widoków; obszary dotykowe i warianty mobilne. Parametry bazowe wymagają dokumentacji, nie są odgadywane z płci/modelu lub masy.
- Adapter musi jawnie przyjmować wzrost, dostępne rzeczywiste obwody i daty/źródła obu stanów; brak danych oznacza brak sterowania danym regionem. Masa i cel nie są parametrem wzrostu mięśni. Wzrost profilu jest bieżącą informacją użytkownika, nie domyślną historyczną daną o wzroście.
- `prepareBodyTrend(before, after, profile)` przygotowuje wyłącznie wejścia: obwody, różnice, relację do podanego wzrostu i ograniczony sygnał trendu ±3,5%. To nie jest konwersja obwodu na szerokość ani prognoza wyglądu. Nie jest stosowany do grafiki; `canApply=false`, status `unsupported`.
- Przyszły renderer `deform(inputs, asset)` musi walidować kompletność, ograniczać i wygładzać miejscową zmianę, pozostawiać nieznane regiony bez zmian oraz oferować porównanie dwóch stanów tego samego modelu. Dopiero po wdrożeniu i testach renderera można włączyć capability i suwak. Samo podłączenie obrazów nie włącza deformacji.

## Co pozostaje niewdrożone

Naturalne modele męski/kobiecy/neutralny, wizualne deformowanie anatomii i suwak porównania wyglądu — wymagają powyższych zasobów i implementacji renderera. Działają porównania liczbowe i Wtedy/Teraz rzeczywistych stanów punktów; nie deklarujemy działającego skanu lub prognozy sylwetki. Potrzebne są również ręczne próby na fizycznym iPhonie i na dwóch rzeczywistych kontach; testy atrap nie potwierdzają działania produkcyjnego Auth/RLS.
