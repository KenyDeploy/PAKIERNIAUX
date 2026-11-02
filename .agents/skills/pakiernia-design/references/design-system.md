# System wizualny Pakierni

## Kierunek i referencja

Nowoczesna aplikacja fitness premium: ciemne eleganckie powierzchnie, oszczędna dekoracja, minimalistyczne karty i czytelne wyniki. Hierarchię, proporcje i gęstość porównuj z `docs/audit/approved-ui-reference.png` w katalogu głównym repo. Plik `docs/audit/README.md` wyjaśnia pochodzenie planszy. To cel wyglądu, nie screenshot aktualnego HEAD. Narastająca lista serii i późniejsze wymagania użytkownika zastępują sprzeczne fragmenty planszy.

## Siedem motywów

| Id | Nazwa | Akcent |
|---|---|---|
| lime | Electric Lime | #C9FF31 |
| magenta | Neon Magenta | #F43CB6 |
| blue | Electric Blue | #4EA5FF |
| violet | Cyber Violet | #A879FF |
| orange | Solar Orange | #FF9B42 |
| teal | Arctic Teal | #34DDBB |
| mono | Classic Mono | #F2F2F2 |

Sprawdź definicje w `src/preferences.js`, `src/theme.css` i aktualnych stylach. Tabela opisuje standard; zgłoś rozbieżność z kodem zamiast zakładać, że wdrożenie jest kompletne. Nie duplikuj wartości akcentów w komponentach. Używaj istniejących `--accent`, `--on-accent`, `--accent-soft`, `--accent-border`, `--accent-glow`, `--bg`, `--surface`, `--surface2`, `--text`, `--muted`, `--line`; przed użyciem potwierdź ich definicję i dziedziczenie także w modalach.

Nie dodawaj przypadkowych zielonych powierzchni, gradientów, poświat ani obramowań. Classic Mono ma neutralne powierzchnie i biały akcent bez zielonego zabarwienia lub poświaty. Znaczenie sukcesu/ostrzeżenia/błędu korzysta z tokenów semantycznych i tekstu/ikony, nie wyłącznie koloru. Nie traktuj semantycznego zielonego potwierdzenia jako dekoracyjnego akcentu.

## Układ i typografia

- Utrzymuj istniejącą rodzinę fontów i spójną skalę. Liczby wyników mają wyraźną hierarchię; daty i jednostki pozostają czytelne. Długie nazwy ćwiczeń nie wypychają akcji.
- Karty grupują treść, nie dekorują każdej etykiety osobną ramką. Cienkie separatory, spokojne tła, kontrolowane odstępy; unikaj nadmiaru cieni i głośnych gradientów.
- Każda główna akcja jasno mówi, co robi. Pusty stan wyjaśnia następny krok, bez demonstracyjnych wyników na koncie.
- Zachowaj widoczny fokus, kontrast oraz powiększenie tekstu. Pola na iPhonie mają co najmniej 16 px, cele dotykowe co najmniej 44×44 px. Nie wyłączaj zoomu.

## Wykresy

Wykorzystuj istniejące komponenty wykresów, w szczególności `SmoothChart`/`monotoneCurve`, jeśli są w aktualnym HEAD. Lekkie linie, płynne krzywe bez sztucznych ekstremów, dyskretny gradient i rzeczywiste punkty. Akcent pochodzi z motywu. Data i wartość dostępne dotykiem i klawiaturą, z tabelą/odczytem tekstowym. Brak danych daje pusty stan, pojedynczy zapis daje punkt, nie wymyślony trend. Interpolacja wizualna nie tworzy dodatkowych obserwacji ani prognozy. Nie zastępuj braków zerem.

## Grafiki

Ponownie używaj istniejących, zweryfikowanych zasobów. Zachowaj proporcje i pełny kadr, nie rozciągaj fotografii. Naturalne statyczne modele ciała wymagają spójnych czterech widoków oraz udokumentowanego pochodzenia. Sprawdź bieżący adapter i pliki; samo istnienie profilu modelu nie dowodzi, że ilustracje są podłączone. Nie używaj `body.png` ani fragmentów planszy bez potwierdzonego prawa do użycia. Jeżeli zasobu brakuje, opisz wymagane pliki i jawny stan zastępczy zamiast kolejnego manekina udającego finalny model.
