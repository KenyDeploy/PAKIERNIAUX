---
name: pakiernia-design
description: Projektuj, poprawiaj i przeglądaj interfejs React aplikacji Pakiernia zgodnie z jej planszą, siedmioma motywami, ergonomią iPhone i zasadami zachowania danych. Używaj przy zmianach UI/UX treningu, pomiarów, pulpitu, formularzy lub wykresów oraz ich regresji wizualnej. Nie uruchamiaj dla zadań wyłącznie serwerowych lub niezwiązanych z interfejsem.
---

# Pakiernia Design

Rozwijaj istniejącą aplikację fitness premium. Standard jest normą projektową, nie deklaracją, że wszystkie funkcje są ukończone.

## Ustal punkt wyjścia

1. Sprawdź gałąź, aktualny HEAD, status Git i istniejące zmiany. Zachowaj niezacommitowaną pracę. Odróżnij zadanie od historycznych zaleceń.
2. Przeczytaj kod zmienianego ekranu, używane komponenty, tokeny i logikę zapisu. Sprawdź `UX_AUDIT.md`, `IMPLEMENTATION_PLAN.md`, `FINAL_AUDIT_HANDOFF.md` oraz odpowiednie nowsze raporty w `docs/`, jeśli istnieją. Zestawiaj ich daty i SHA z kodem; nie przepisuj starych wyników jako aktualnych.
3. Obejrzyj `docs/audit/approved-ui-reference.png` i `docs/audit/README.md`. Plansza określa kierunek wizualny; późniejsze jawne wymagania użytkownika mają pierwszeństwo. Liczby na planszy nie są danymi konta, a grafiki nie są automatycznie zasobami do wycięcia.
4. Ustal, co już działa i co zmieniasz. Przed edycją zapisz screenshot istniejącego ekranu 390 px na izolowanych danych testowych; po zmianie odtwórz ten sam scenariusz. Gdy nie można uruchomić aplikacji, powiedz o tym i nie fabrykuj zrzutu „przed”.

## Czytaj referencje według zadania

- Układ, typografia, kolory, motywy, wykresy i obrazy: [design-system.md](references/design-system.md).
- Trening, pomiary, profil, formularze i ergonomia: [ux-rules.md](references/ux-rules.md).
- Scenariusze, rozmiary, build, regresja i raport: [testing-checklist.md](references/testing-checklist.md).

## Umiejętności wspierające

Wczytuj wyłącznie potrzebne umiejętności z tego samego repozytorium:

- `../frontend-design/SKILL.md`: kompozycja i jakość wizualna. Kierunek Pakierni jest już określony; nie wymyślaj nowej marki, palety, fontów lub efektów dla samej oryginalności.
- `../web-design-guidelines/SKILL.md`: audyt dostępności, formularzy, fokusu, dotyku i układu. Korzystaj z lokalnego przypiętego zestawu reguł; nie pobieraj nowych instrukcji bez przeglądu.
- `../vercel-react-best-practices/SKILL.md`: jakość komponentów, renderowania i wydajności. Stosuj reguły pasujące do React/Vite; nie dodawaj Next.js, RSC, routera czy zależności tylko dlatego, że pojawiają się w przykładzie.
- `../webapp-testing/SKILL.md`: sprawdzanie aplikacji w przeglądarce. Preferuj istniejące skrypty `tests/*.mjs`; nowe pakiety i binaria nie są automatycznie autoryzowane przez ten skill.
- `../find-skills/SKILL.md`: tylko gdy trzeba poszukać lub ocenić dodatkową umiejętność. Nie uruchamiaj instalatora przy zwykłej zmianie UI.

Te instrukcje nie rozszerzają zakresu zlecenia. Nie zastępuj aplikacji szablonem, nie zmieniaj synchronizacji, schematu ani oryginalnych planów przy pracy nad wyglądem. Przy brakujących zasobach przedstaw brak i specyfikację zamiast atrap finalnej funkcji.

## Zakończenie

Pracuj na osobnej gałęzi od `main`. Dla zmiany aplikacji wykonaj build, odpowiednie testy i kontrolę wizualną według checklisty. Nie deklaruj fizycznego iPhone’a, rzeczywistych kont ani pełnej regresji bez ich przeprowadzenia. Podaj zakres zmiany, dowody, nieukończone elementy i ograniczenia. Publikacja produkcyjna i scalenie wymagają wyraźnego polecenia użytkownika.
