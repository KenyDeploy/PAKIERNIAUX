# Pomiary ciała 2.0 — etap B

## Działający zakres

- Widoki Aktualnie / Poprzedni / Porównaj / Historia. Wykres i datowana lista znajdują się pod sylwetką, a Historia pomija ilustrację i prowadzi wprost do danych. Edycja, usuwanie z potwierdzeniem, profil, cele i ochrona szkiców UX02 pozostają dostępne.
- Wybór Mężczyzna / Kobieta zapisuje wyłącznie istniejące pole bodyProfile.model przez dotychczasowy onPersist. Nie zmienia celu, historii celu, pomiarów ani płci. Starszy profil neutralny pozostaje zachowany, dopóki użytkownik nie wybierze wariantu; na ekranie używa domyślnego schematu męskiego. Nie wyprowadzamy z ilustracji biologii ani składu ciała.
- Przód / tył z punktami obwodów, zaznaczeniem i obsługą dotyku/klawiatury. Masa i tkanka tłuszczowa dostępne w selektorze, bez wymyślonych punktów anatomicznych. Kliknięcie punktu pokazuje wynik, datę i różnice w obszarze ponad nawigacją.
- Aktualny wynik pochodzi z ostatniego rzeczywistego zapisu wybranego pola. Zmiany: ostatni minus poprzedni oraz ostatni minus najstarszy dostępny odczyt tego pola. Brakujący odczyt pozostaje pusty; pierwszy odczyt ma zmianę od początku 0 i brak zmiany od poprzedniego. Poprzedni zapis zachowuje tożsamość także przy dwóch odczytach tego samego dnia. Porównanie dwóch dat uwzględnia wyłącznie pomiary z tych dni. Znaki różnic nie są automatyczną oceną postępu.
- Starsze ogólne biceps/udo nie otrzymują wymyślonej strony. Przyszłe i nieprawidłowe daty nie trafiają do wykresu. Wpisy częściowe i stare dane pozostają zachowane; lista pokazuje również brak wartości danego pola w innych zapisach.

## Ilustracje i dalsze podłączenie zasobów

`src/BodySilhouette.jsx` zawiera autorskie, kodowe SVG: dwa obrysy i linie przodu/tyłu, cieniowanie oraz neutralne tło. To **tymczasowe statyczne schematy**, nie finalne anatomiczne ilustracje i nie model medyczny. Ekran oznacza je „Schemat tymczasowy SVG”. Nie korzystają z body.png, niepotwierdzonych materiałów zewnętrznych ani generowanych rasterów. Grafika jest identyczna niezależnie od wartości pomiarów; zmienia się jedynie zaznaczenie punktu.

`bodyModelRegistry` w `src/bodyModelAdapter.js` nadal oddziela finalne zasoby od tymczasowego renderera. Żeby je podłączyć, potrzebne są lokalne front/back dla każdego wariantu, potwierdzone pochodzenie/licencja i dopasowane współrzędne `bodyAnchors`. Obecny układ współrzędnych to 320×500, lustrzane L/P na tyle. Ilustracje powinny mieścić całą sylwetkę i zachowywać tę samą skalę oraz pozycję. `BodyModelView` wybierze finalne obrazy dopiero po uzupełnieniu obu ścieżek i metadanych licencji. Przy innych proporcjach należy skorygować canvas i punkty oraz ponownie sprawdzić cele 44 px.

`canDeform` i `canCompareSlider` pozostają false. Brak deformacji, animacji wzrostu mięśni i suwaka porównującego zmienione modele jest świadomym zakresem tego etapu. Porównywane są zapisane liczby, nie prognozowany wygląd. Finalne ilustracje pozostają pracą graficzną do wykonania/zatwierdzenia.

## Walidacja

- Build PASS; 10 odpowiednich testów measurement-progress/body-measurements/body-accounts/app PASS.
- Przeglądarka: measurements-v2, body-measurements oraz form-drafts. Sprawdzono warianty, przód/tył, punkty, rzeczywiste delty i daty, brakujące strony, porównanie, wykres/listę, edycję/usuwanie, nieudany zapis i ponowienie, zachowanie ID oraz odświeżenie. Szerokości 320/375/390/430 px; bez poziomego przewijania i błędów JS w sprawdzonych ścieżkach.
- Fizycznego iPhone’a / Safari, VoiceOver i natywnej klawiatury nie testowano. Dane scenariuszy są izolowanymi fixtures w lokalnym profilu Chromium, nie demonstracyjnymi wynikami dostarczanymi użytkownikowi.
- Bez migracji, zmian synchronizacji, nowych zależności i zmian treningu. Bez scalania do main i publikacji produkcyjnej.

Zrzuty pełnej strony 390 px: [mężczyzna/przód](audit/measurements-v2-male-390.png), [kobieta/tył](audit/measurements-v2-female-back-390.png), [porównanie](audit/measurements-v2-comparison-390.png). Stała dolna nawigacja na zrzucie pełnej strony jest rysowana na wysokości początkowego viewportu; zawartość można przewinąć ponad nią. Odtworzenie: `tests/measurements-v2.mjs` z APP_URL, PLAYWRIGHT_MODULE i CHROMIUM_PATH dla lokalnego środowiska.
