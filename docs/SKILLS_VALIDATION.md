# Walidacja repozytoryjnych Skills

Data: 02.11.2026. Baza PR: `58c112ed97dbcae24795613a63392fc779f985b6` (`main`). Zmiana obejmuje wyłącznie AGENTS.md, `.agents/` i dokumentację Skills. Nie jest aktualizacją implementacji Pomiarów 3.0 ani wynikiem testów aplikacji.

## Wykrywanie przez Codexa — PASS

Narzędzie: `codex-cli 0.166.0-alpha.5.1`, Windows. W osobnym lokalnym procesie `codex app-server --stdio` wykonano `initialize`, `initialized` i `skills/list` z `cwds` ustawionym na korzeń repo oraz `forceReload:true`. Nie uruchamiano modelu, zadania edycji, instalacji pluginów ani logowania. Użyto izolowanego CODEX_HOME w katalogu roboczym, bez zmian w globalnych ustawieniach.

Odczyt rzeczywistego wyniku:

| name | scope | enabled |
|---|---|---|
| pakiernia-design | repo | true |
| frontend-design | repo | true |
| web-design-guidelines | repo | true |
| vercel-react-best-practices | repo | true |
| webapp-testing | repo | true |
| find-skills | repo | true |

`errors: []`. Wszystkie ścieżki prowadzą do `.agents/skills/<name>/SKILL.md`, a nazwy odpowiadają katalogom. Wynik dotyczy lokalnego mechanizmu wykrywania, nie wizualnego testu selektora Skills w każdej wersji aplikacji Codex na drugim laptopie. Projektless chat otwarty nad repo nie ma tego samego katalogu roboczego — należy otworzyć folder repo jako projekt. W razie braku odświeżenia: ponownie otworzyć projekt/nowy czat, następnie ewentualnie zrestartować Codexa.

Próbę powtórzono w świeżym checkoutcie Git worktree w drugim katalogu, z `core.autocrlf=true`: sześć Skills ponownie miało `scope:repo`, `enabled:true`, bez błędów. Sumy SHA-256 wszystkich 95 plików odpowiadały manifestowi. To test przenośności checkoutu, nie fizyczny test drugiego laptopa. Próba lokalnego `git clone` była niedostępna przez błąd MSYS sh w sandboxie; worktree nie wymagał tego pomocnika.

## Struktura i integralność — PASS

- Parser Codexa wczytał frontmatter wszystkich sześciu Skills bez błędów. Dodatkowo sprawdzono niepuste opisy do 1024 znaków, prawidłowe nazwy do 64 znaków oraz dopasowanie nazw do katalogów.
- 95 plików umiejętności ujęto w `.agents/skills-lock.json` z SHA-256. Kopie upstream porównano z hashami blobów Git przypiętych commitów; brak nieoczekiwanych zmian. Jawne lokalne adaptacje są wymienione w manifeście.
- 13 lokalnych odnośników Markdown rozwiązano do istniejących plików. Naprawiono trzy błędne odnośniki źródłowego zbiorczego dokumentu Vercela; reguł nie zmieniono.
- Brak symlinków i zależności od ścieżek laptopa autora w instalacji Skills.
- `.gitattributes` ogranicza zakończenia linii instrukcji do LF, aby hashe nie zmieniały się przy klonowaniu z Windows/macOS. Oryginalne podwójne spacje Markdown w dokumentach Vercela zachowano; wyłączenie `blank-at-eol` dotyczy tylko tego zestawu zewnętrznych dokumentów.
- Istniejąca plansza `docs/audit/approved-ui-reference.png` pozostaje w repo i jest wskazana jako referencja wyglądu, nie źródło wyników lub grafiki do wycinania.

Wbudowany `quick_validate.py` nie uruchomił się z powodu braku PyYAML w dostępnym Pythonie. Nie instalowano dodatkowej globalnej zależności; nie nazywamy tej próby PASS. Powyższa walidacja korzysta z rzeczywistego parsera/wyszukiwania Codexa i osobnych kontroli struktury/odnośników.

## Helper webapp-testing

Przed dołączeniem odczytano `scripts/with_server.py` i trzy przykłady Python. Sprawdzono składnię wszystkich czterech przez `ast.parse` (PASS), bez wykonania ich scenariuszy lub zapisania cache do repo. `with_server.py --help` uruchomiono z sukcesem. Nie uruchamiano jego serwerów ani scenariuszy z przykładowymi ścieżkami systemu Linux.

Helper przyjmuje komendy shell i nie gwarantuje zakończenia wszystkich procesów potomnych na Windows. Te ograniczenia są jawne w lokalnej adaptacji. Żaden skrypt agent-browser, npm postinstall lub zdalny installer nie był wykonany. Skopiowanie Skills wykonano sprawdzonym wbudowanym instalatorem OpenAI do jawnego katalogu projektowego, z pełnymi SHA.

## Zakres aplikacji — bez zmian

Porównanie z bazą obejmuje `src/`, `public/`, `tests/`, `package.json`, `package-lock.json` i `vite.config.js`: **brak różnic**. Nie uruchamiano ponownie builda/testów aplikacji dla zmiany wyłącznie instrukcji. Nie deklarujemy screenshotów aplikacji, testów iPhone’a lub nowego wyniku regresji na podstawie starszych raportów. PR nie zawiera scalenia ani wdrożenia produkcyjnego.
