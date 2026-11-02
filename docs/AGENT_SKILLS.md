# Umiejętności Pakierni na dwóch laptopach

Umiejętności są zwykłymi plikami repozytorium w `.agents/skills/`. Źródłem zatwierdzonej wersji jest GitHub `main`, a stałym adresem aplikacji https://pakierniaux.vercel.app. Gałęzie i Preview służą do pracy oraz testów. Skills nie są instalowane globalnie i nie wymagają Skills CLI do używania. Nie zmieniają kodu aplikacji ani `package.json`.

## Drugi laptop — dokładne kroki

Jeżeli repozytorium nie jest jeszcze pobrane:

```sh
git clone https://github.com/KenyDeploy/PAKIERNIAUX.git
cd PAKIERNIAUX
git switch main
```

Jeżeli repozytorium już jest na laptopie, najpierw `git status`; nie nadpisuj ani nie resetuj niezapisanych zmian. Po ich bezpiecznym zachowaniu:

```sh
git fetch origin
git switch main
git pull --ff-only
```

Po pobraniu zatwierdzonego `main` twórz od niego osobne gałęzie robocze, np. `git switch -c codex/nazwa-zadania`. Nie trzeba ponownie instalować umiejętności na drugim komputerze ani kopiować ich do katalogu użytkownika. Zmiany trafiają na `main` i produkcję dopiero po weryfikacji oraz poleceniu obejmującym publikację.

Otwórz **folder PAKIERNIAUX jako projekt** w Codexie, a nie nadrzędny folder Documents lub wygenerowany folder czatu. Repozytoryjne Skills są wykrywane w `.agents/skills` od katalogu roboczego do korzenia repozytorium. Codex wykrywa zmiany automatycznie; jeżeli lista nie odświeży się, otwórz ponownie projekt i rozpocznij nowy czat, a w razie potrzeby uruchom ponownie Codexa. Sprawdź selektor `$`/listę Skills; w CLI/IDE dostępne jest także `/skills`.

Przykład wywołania:

```text
Użyj $pakiernia-design. Najpierw sprawdź aktualny kod i stan Git.
Popraw ergonomię formularza pomiarów na iPhonie, zachowując zapis i historię.
Pokaż screenshoty przed/po 390 px i wyniki testów.
```

Próba tylko do odczytu:

```text
Użyj $pakiernia-design do przeglądu ekranu treningu.
Nie zmieniaj plików. Wskaż naruszenia standardu wraz z miejscem w kodzie.
```

Jeżeli umiejętność jest wyłączona w lokalnych ustawieniach, włącz ją w Codexie. Dwie umiejętności o tej samej nazwie z instalacji globalnej/projektowej nie są automatycznie scalane; używaj wersji wskazanej ścieżką `.agents/skills/`. Nie kasuj globalnych plików bez zlecenia.

Instrukcje działają po pobraniu repo. Uruchomienie aplikacji/testów wymaga osobno Node/npm, zależności projektu oraz dostępnego Playwright i przeglądarki. Poświadczenia, binaria, lokalne ścieżki i `.env.local` nie synchronizują się przez Git. Sama obecność skillu nie dowodzi, że narzędzie testowe jest zainstalowane.

## Co znaleziono i wybrano

Zastosowano proces `find-skills`: rozpoznanie potrzeb → leaderboard Skills.sh → źródła właścicieli → przegląd treści, wymagań, licencji i skutków wykonania. Nie uruchamiano `npx skills`, nie pobierano pakietu CLI ani jego zależności. Popularność jest wskazówką do odkrywania, nie dowodem bezpieczeństwa.

| Skill | Źródło | Decyzja i zastosowanie |
|---|---|---|
| pakiernia-design | ten projekt | Główna umiejętność: marka, iPhone, trening/pomiary i ochrona danych |
| frontend-design | anthropics/skills | Zainstalowany projektowo; świadoma kompozycja i typografia, bez zastępowania marki Pakierni |
| web-design-guidelines | vercel-labs/agent-skills | Zainstalowany projektowo; audyt UX/dostępności, lokalny przypięty zestaw reguł |
| vercel-react-best-practices | vercel-labs/agent-skills, katalog react-best-practices | Zainstalowany projektowo z regułami; React/Vite, bez narzucania Next.js |
| webapp-testing | anthropics/skills | Zainstalowany projektowo; Playwright i istniejące testy, opcjonalny sprawdzony helper Python |
| find-skills | vercel-labs/skills | Zainstalowany projektowo; wyszukiwanie przy osobnym zadaniu, projektowe/pinowane instalacje |
| agent-browser | vercel-labs/agent-browser | Sprawdzony, niezainstalowany: obecny SKILL.md jest stubem do osobnego CLI; instalator pobiera natywne binaria, a instrukcje promują instalację globalną. Brak potrzeby drugiego runtime przy istniejącym Playwright |
| react-native-guidelines | vercel-labs/agent-skills | Znaleziony w oficjalnym katalogu, niezainstalowany: React Native/Expo, inny stos niż webowa PWA Pakierni |

Mobilny UX Pakierni obsługują własne reguły iPhone oraz `web-design-guidelines` (dotyk, fokus, safe-area, formularze). Nie instalowano przypadkowego natywnego zestawu tylko dlatego, że ma słowo „mobile”.

## Źródła, licencje i kontrola

Przypięte commity i manifest plików/SHA-256: [skills-lock.json](../.agents/skills-lock.json). To **własny manifest audytowy Pakierni**, nie format lockfile generowany przez Skills CLI. Nie używaj `skills update`, aby go aktualizować.

- Anthropic: `ca45fc496a3436251f191354091d557da31c15b5`, frontend-design i webapp-testing z dołączonymi Apache-2.0 LICENSE.txt.
- Vercel agent-skills: `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`; README deklaruje MIT, React SKILL.md także. Ten snapshot nie ma osobnego głównego LICENSE; deklaracja i źródło zachowane w UPSTREAM-NOTICE.md. Nie przypisujemy mu licencji Apache z innego repo.
- Vercel skills/find-skills: `51b9062b3fc51dc04c89ab92dbeb65681fa0cb25`, dołączony oryginalny MIT LICENSE.
- Lokalna kopia Web Interface Guidelines: `434b7f91364665f2f733b310ec54809bf8f37937`, command.md i własny MIT LICENSE z tego źródła.
- Agent Browser oceniono na `5868f7c05020e047c00e68e4abf9253cce864f41`, Apache-2.0. `package.json` wymaga Node >=24; `postinstall.js` pobiera binaria GitHub Release i może poprawiać globalne shimy. Plik przejrzano, ale nie wykonano; nie oceniano bezpieczeństwa samych binariów.

Instalacja: sprawdzony, wbudowany `skill-installer` OpenAI z `--ref` i `--dest .agents/skills`; nie używano kodu instalacyjnego z pobieranych repozytoriów. Dołączone pliki są normalnymi plikami, bez zależności od symlinków na danym laptopie.

Lokalne adaptacje są oznaczone w zmienionych SKILL.md:

- find-skills: brak poleceń globalnej instalacji i automatycznych aktualizacji; instalacja tylko po sprawdzeniu źródła i konkretnego commita.
- web-design-guidelines: reguły są lokalne i przypięte zamiast pobierania zmiennego `main` przy każdym audycie. Nowa wersja jest najpierw danymi do przeglądu.
- webapp-testing: pierwszeństwo istniejących testów JS Pakierni, przegląd helpera przed wykonaniem, brak wymuszania Pythona i stałych ścieżek z innego systemu. `with_server.py` uruchamia przekazaną komendę przez shell: używać tylko własnych stałych komend, nie danych z UI, stron lub nieufnych plików. Zatrzymuje proces nadrzędny, więc na Windows preferuj istniejący serwer z kontrolowanym cyklem życia.
- vercel-react-best-practices: poprawiono trzy odnośniki w zbiorczym AGENTS.md, aby prowadziły do dołączonego katalogu rules/. Treść reguł pozostała oryginalna.

Przejrzano helper i przykłady webapp-testing. Nie ma w nich pobierania zależności ani telemetrii; wykonują jednak komendy, otwierają lokalne strony i zapisują pliki. Przykłady są materiałem do adaptacji, nie poleceniem uruchomienia na prawdziwym koncie. Nowe zależności, binaria i dostęp do kont nadal wymagają odrębnego uzasadnienia w zadaniu.

Żaden przegląd tekstu nie gwarantuje bezpieczeństwa przyszłej wersji. Zmiana SHA oznacza ponowną kontrolę instrukcji, zależności i licencji. Nie włączaj obcych hooków, MCP, telemetrii, automatycznych aktualizacji lub uploadów przy instalowaniu umiejętności.

## Wykrywanie i walidacja

Wykrywanie sprawdzono lokalnie przez rzeczywisty `codex app-server` i żądanie `skills/list` z `forceReload:true` dla korzenia repo, bez uruchamiania modelu lub zadania edycji. Wynik końcowy opisuje dokument `SKILLS_VALIDATION.md`. Dodatkowo sprawdzono frontmatter, nazwy katalogów, referencje, integralność plików i brak zmian aplikacji względem bazy PR.

Oficjalna dokumentacja: [Codex Skills](https://developers.openai.com/codex/skills/), [Agent Skills specification](https://agentskills.io/specification). Katalog odkrywania: [find-skills](https://skills.sh/vercel-labs/skills/find-skills). Kod przypięty z GitHub jest źródłem instalacji; strona Skills.sh służy do znalezienia kandydatów.
