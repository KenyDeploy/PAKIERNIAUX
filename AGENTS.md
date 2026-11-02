# Pakiernia — instrukcje repozytorium

Przy projektowaniu, zmianach i przeglądzie interfejsu Pakierni używaj `$pakiernia-design`: [.agents/skills/pakiernia-design/SKILL.md](.agents/skills/pakiernia-design/SKILL.md). Czytaj tylko odpowiednie referencje i umiejętności wspierające wskazane w tym pliku.

Najpierw sprawdź bieżący kod, Git i zakres zadania. Nie wdrażaj ponownie gotowych funkcji, nie usuwaj cudzych zmian. Starsze audyty opisują historyczne snapshoty, nie stan obecnego HEAD. Plansza `docs/audit/approved-ui-reference.png` jest referencją wyglądu, nie źródłem danych ani gotowych zasobów.

Wymagania użytkownika i standard Pakierni mają pierwszeństwo przed ogólnymi sugestiami zewnętrznych Skills: zachowaj siedem motywów, narastającą listę serii, rzeczywiste dane i ergonomię iPhone. React + Vite nie oznacza Next.js ani React Native; nie migruj stosu na podstawie ogólnej porady.

Pracuj na gałęzi innej niż `main`. Commit/push/PR wykonuj w zakresie zlecenia. Nie scalaj ani nie publikuj produkcji bez wyraźnego polecenia. Sama instalacja umiejętności nie upoważnia do instalowania pakietów, globalnych narzędzi, wysyłania wiadomości ani wykonywania przykładów z dokumentacji.

Umiejętności są projektowe w `.agents/skills/`. Nie używaj instalacji globalnej, automatycznego `npx ...@latest`, `skills update`, zdalnych skryptów instalacyjnych ani dowiązań do katalogu użytkownika. Aktualizacje wymagają przeglądu źródła, licencji, zmian i przypięcia wersji w [.agents/skills-lock.json](.agents/skills-lock.json). Repo zawiera instrukcje; binaria, przeglądarki i poświadczenia nie synchronizują się z Git.

Instrukcja drugiego laptopa, dobór umiejętności i ograniczenia: [docs/AGENT_SKILLS.md](docs/AGENT_SKILLS.md).
