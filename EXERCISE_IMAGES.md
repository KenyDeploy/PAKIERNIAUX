# Zdjęcia ćwiczeń

Pliki `public/exercise-photos-v1*.webp` zawierają 72 realistyczne wizualizacje wygenerowane narzędziem OpenAI Image Generation na potrzeby Pakierni 29 października 2026. Nie pobierano zdjęć z wyszukiwarki ani nie kopiowano cudzych materiałów stockowych. Oryginały PNG zachowano w artefaktach sesji; wersje aplikacji to kompresja WebP tych samych obrazów, bez zmiany zawartości.

Każdy atlas ma układ: 2 kolumny × 3 wiersze, w kolejności czytania. Pierwszy (`exercise-photos-v1.webp`): wyciskanie hantli na skosie, ściąganie drążka wyciągu, przysiad ze sztangą, wyciskanie żołnierskie, uginanie przedramion z hantlami i prostowanie ramion na wyciągu z liną. Atlasy 2–12: kolejne grupy po 6 pozycji z `catalog` w `src/catalog.js`. Pozycja zdjęcia nie zależy od filtrowania ani kolejności ćwiczeń w planie. Nie wolno zmieniać kolejności katalogu bez równoczesnej aktualizacji mapowania w `src/exercisePhotos.js`.

Jednolity styl: ten sam dorosły model, ciemny strój, grafitowa siłownia, naturalne oświetlenie i zielone akcenty. Grafiki służą rozpoznawaniu ćwiczeń; nie są zweryfikowaną instrukcją techniki ruchu. Interfejs oznacza je jako wizualizacje AI. Dopasowanie do pełnej nazwy ćwiczenia chroni przed pokazaniem niewłaściwego zdjęcia po zmianie nazwy własnego ćwiczenia. Własne ćwiczenia o nieznanych nazwach zachowują jawnie opisany symbol/ilustrację partii. Dawne nazwy „Hip thrust” i „Face pull” mają aliasy do odpowiadających im polskich nazw i zdjęć. Zapisy generowania są w `photo-sources/`.

Atlasy są lokalnymi zasobami aplikacji i wchodzą do cache powłoki PWA. Nie wymagają zewnętrznego serwera zdjęć ani klucza API. Przy wymianie zawartości należy zmienić wersję nazwy pliku i mapowanie cache. Test katalogu sprawdza 72 unikalne przypisania i istnienie każdego pliku; scenariusz przeglądarkowy sprawdza, że serwer zwraca rzeczywisty obraz WebP.

## Własne zdjęcia

Pole `customPhoto` przechowuje zdjęcie wybrane przez użytkownika, przetworzone na urządzeniu do JPEG do 80 KB i maksymalnie 640 px. Akceptowane pliki wejściowe: JPG/PNG/WebP do 10 MB. Zdjęcie jest częścią istniejącego prywatnego snapshotu i cache danego konta, bez osobnego publicznego adresu. Ma pierwszeństwo przed atlasem; usunięcie własnego zdjęcia przywraca zdjęcie z bazy lub symbol dla nieznanego ćwiczenia. Interfejs oznacza taki materiał jako „Twoje zdjęcie”. Nowe ukończone sesje nie kopiują zawartości zdjęcia do historii. Brak miejsca w lokalnej pamięci nie pozwala zapisać nowego snapshotu i nie zamyka formularza.
