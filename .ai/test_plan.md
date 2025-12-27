<analiza_projektu>

**1. Kluczowe komponenty projektu:**

* **Moduł Uwierzytelniania (`Auth`):** Kompleksowa obsługa sesji z wykorzystaniem Supabase Auth. Zawiera rejestrację,
  logowanie, reset hasła, obsługę tokenów (refresh token) oraz Guards (`auth.guard`, `guest.guard`). Kluczowe klasy:
  `AuthSessionService`, `AuthApi`.
* **Moduł Pokoi (`Rooms`):** Serce aplikacji. Pozwala na CRUD pokoi oraz, co najważniejsze, definiowanie ich kształtu za
  pomocą edytora siatki (`RoomGridEditorComponent`). Stan zarządzany przez `RoomEditorFacade` i `RoomsListFacade`.
* **Edytor Siatki (`RoomGridEditorService`):** Logika biznesowa odpowiedzialna za renderowanie siatki pokoju, walidację
  poprawności kształtu (ciągłość obszaru), obsługę "pędzla" do malowania oraz wykrywanie kolizji. Jest to najbardziej
  skomplikowany algorytmicznie element frontendowy.
* **Moduł Mebli (`Furniture`):** Zarządzanie meblami wewnątrz pokoju, w tym ich pozycjonowanie na siatce (
  `FurniturePlacement`). Zawiera walidację, czy mebel mieści się w obrysie pokoju i nie koliduje z innymi (choć logika
  kolizji jest częściowo po stronie bazy, frontend musi to obsłużyć wizualnie).
* **Moduł Przedmiotów (`Items`):** Zarządzanie zawartością mebli. Obsługuje dodawanie masowe (Bulk Add) oraz usuwanie.
* **Wyszukiwarka (`Search`):** Globalna wyszukiwarka przedmiotów z filtrowaniem i nawigacją do konkretnego mebla w
  pokoju.
* **Warstwa Danych (`Api` & `Supabase`):** Bezpośrednia komunikacja z Supabase za pomocą klienta JS. Silne typowanie
  oparte na `database.types.ts`. Obsługa błędów API (`ApiError`) i ich mapowanie na komunikaty zrozumiałe dla
  użytkownika.

**2. Specyfika stosu technologicznego i wpływ na testowanie:**

* **Angular (Standalone Components):** Ułatwia testowanie jednostkowe (Unit Testing) poszczególnych komponentów bez
  konieczności konfiguracji skomplikowanych modułów testowych. Wymaga użycia `TestBed` i ewentualnie `ComponentHarness`
  dla Angular Material.
* **Supabase (Backend-as-a-Service):**
    * Brak tradycyjnego backendu do testowania w tym repozytorium.
    * Testy jednostkowe muszą bezwzględnie mockować `SupabaseService`, aby uniknąć połączeń sieciowych.
    * Testy E2E będą wymagały albo dedykowanej instancji testowej Supabase, albo lokalnego emulatora Supabase, aby
      zapewnić izolację danych (szczególnie przy testach Auth i RLS).
* **Reactive Forms & Walidacja:** Rozbudowana walidacja po stronie klienta (regexy kolorów, długości nazw). Testy muszą
  pokryć przypadki brzegowe tych walidatorów.
* **RxJS & Facades:** Zarządzanie stanem oparte na `BehaviorSubject`. Testy muszą weryfikować poprawność strumieni
  danych, obsługę `loading` i `error` state. Należy używać `fakeAsync` lub `testScheduler` do testowania
  asynchroniczności.

**3. Priorytety testowe:**

1. **Edytor Siatki (`RoomGridEditorService`):** Krytyczny element UX. Błędy tutaj uniemożliwiają korzystanie z głównej
   funkcjonalności aplikacji (mapowanie domu).
2. **Proces Uwierzytelniania:** Jeśli użytkownik nie może się zalogować lub odświeżyć sesji (`refreshSession`),
   aplikacja jest bezużyteczna.
3. **Integracja Pokój-Mebel-Przedmiot:** Scenariusz: Stwórz pokój -> Zdefiniuj kształt -> Dodaj mebel (z walidacją
   miejsca) -> Dodaj przedmioty. To główny "Happy Path" użytkownika.
4. **Wyszukiwanie:** Funkcjonalność "WhereItIs" traci sens, jeśli wyszukiwarka nie zwraca poprawnych lokalizacji.

**4. Obszary ryzyka:**

* **Synchronizacja stanu siatki:** Ryzyko rozbieżności między wizualną reprezentacją siatki na frontendzie a zapisanymi
  koordynatami w bazie danych (np. przy edycji kształtu pokoju, gdy istnieją już meble).
* **Obsługa sesji:** `AuthSessionService` ma logikę odświeżania tokenów i obsługi `onAuthStateChange`. Ryzyko
  wylogowania użytkownika w trakcie pracy lub niepoprawnego przywrócenia sesji po odświeżeniu strony.
* **Obsługa błędów API:** Aplikacja mocno polega na mapowaniu błędów PostgreSQL/Supabase na `ApiError`. Ryzyko, że
  użytkownik otrzyma niezrozumiały błąd techniczny (np. kod błędu SQL) zamiast komunikatu biznesowego.
* **Wydajność siatki:** Przy dużych pokojach (maks 49x49) i wielu meblach, renderowanie siatki (`ngFor`) może być wolne.

</analiza_projektu>

<plan_testów>

# Plan Testów dla projektu WhereItIs

## 1. Wprowadzenie i cele

Celem niniejszego planu jest zdefiniowanie strategii zapewnienia jakości dla aplikacji frontendowej **WhereItIs** –
systemu do mapowania i inwentaryzacji przedmiotów domowych. Aplikacja oparta jest o framework Angular oraz platformę
Supabase.

Główne cele procesu testowego to:

* Weryfikacja poprawności kluczowych algorytmów (edycja siatki pokoju).
* Zapewnienie stabilności procesu uwierzytelniania i zarządzania sesją użytkownika.
* Potwierdzenie integralności danych w relacji Pokój -> Mebel -> Przedmiot.
* Weryfikacja obsługi błędów i walidacji formularzy.

## 2. Zakres testów

### W zakresie (In-Scope):

* **Logika Frontendowa:** Komponenty, Serwisy, Fasady (State Management), Walidatory.
* **Interfejs Użytkownika (UI):** Responsywność, obsługa formularzy, interakcja z siatką (Grid), Angular Material
  Components.
* **Integracja z API:** Poprawność wysyłanych zapytań i obsługa odpowiedzi (w tym błędów) z Supabase (mockowane w unit
  testach, rzeczywiste w E2E).
* **Ścieżki krytyczne:** Rejestracja, Tworzenie pokoju, Dodawanie mebli, Wyszukiwanie.

### Poza zakresem (Out-of-Scope):

* Testy wydajnościowe samej platformy Supabase.
* Testy bezpieczeństwa reguł bazodanowych (RLS) – zakładamy, że są one testowane osobno na poziomie backendu/bazy
  danych, testujemy jedynie reakcję frontendu na odmowę dostępu (401/403).

## 3. Typy testów

### 3.1. Testy Jednostkowe (Unit Tests)

* **Technologia:** Jasmine + Karma (domyślne dla Angulara) lub Jest.
* **Cel:** Izolowane testowanie logiki biznesowej.
* **Kluczowe obszary:**
    * `RoomGridEditorService`: Testowanie algorytmów wypełniania, walidacji sąsiedztwa komórek, generowania siatki.
    * `AuthSessionService`: Testowanie logiki odświeżania tokenów i obsługi stanu sesji.
    * Walidatory (`auth.validation.ts`, `rooms.validation.ts`, `furniture.validation.ts`): Sprawdzenie warunków
      brzegowych (np. format HEX koloru, limity znaków).
    * Fasady (`RoomDetailsFacade`, etc.): Weryfikacja zmian stanu `isLoading`, `error`, `data` w reakcji na odpowiedzi
      API.

### 3.2. Testy Komponentów (Integration Tests)

* **Technologia:** Angular TestBed + Angular CDK Harnesses.
* **Cel:** Weryfikacja interakcji między szablonem HTML a klasą komponentu.
* **Kluczowe obszary:**
    * Formularze (np. `RoomFormComponent`, `FurnitureFormDialogComponent`): Czy błędy walidacji wyświetlają się
      poprawnie? Czy przycisk "Zapisz" jest zablokowany przy błędnych danych?
    * Wyświetlanie list (`FurnitureListComponent`, `ItemsListComponent`): Czy poprawne dane są przekazywane do `input`?
      Czy zdarzenia `output` (np. delete) są emitowane?

### 3.3. Testy End-to-End (E2E)

* **Technologia:** Cypress lub Playwright.
* **Cel:** Symulacja pełnych ścieżek użytkownika na działającej aplikacji podłączonej do testowej bazy danych.
* **Scenariusze:** Pełne przejście od rejestracji do stworzenia mapy domu i wyszukania przedmiotu.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Uwierzytelnianie (Auth)

| ID      | Nazwa Scenariusza    | Kroki                                                                           | Oczekiwany Rezultat                                                     |
|:--------|:---------------------|:--------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| AUTH-01 | Poprawna rejestracja | 1. Wejdź na `/register`<br>2. Podaj email i poprawne hasło (x2)<br>3. Zatwierdź | Komunikat o sukcesie, przekierowanie do logowania.                      |
| AUTH-02 | Walidacja hasła      | 1. Wejdź na `/register`<br>2. Podaj hasło < 6 znaków                            | Wyświetlenie błędu walidacji pod polem hasła.                           |
| AUTH-03 | Logowanie            | 1. Wejdź na `/login`<br>2. Podaj poprawne dane                                  | Przekierowanie do `/rooms`, pobranie tokenu sesji.                      |
| AUTH-04 | Reset hasła          | 1. Wejdź na `/forgot-password`<br>2. Podaj email                                | Komunikat o wysłaniu linku (niezależnie czy email istnieje - security). |

### 4.2. Zarządzanie Pokojami (Rooms & Grid)

| ID      | Nazwa Scenariusza             | Kroki                                                                                                           | Oczekiwany Rezultat                                          |
|:--------|:------------------------------|:----------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------|
| ROOM-01 | Tworzenie pokoju (Happy Path) | 1. Kliknij "Dodaj pokój"<br>2. Wpisz nazwę i wybierz kolor<br>3. Zaznacz obszar na siatce (ciągły)<br>4. Zapisz | Pokój utworzony, przekierowanie do widoku szczegółów pokoju. |
| ROOM-02 | Walidacja pustej siatki       | 1. Wpisz nazwę i kolor<br>2. Nie zaznaczaj nic na siatce<br>3. Kliknij Zapisz                                   | Błąd "Wybierz przynajmniej jedną komórkę siatki".            |
| ROOM-03 | Rysowanie "Pędzlem"           | 1. W edytorze zmień pędzel na 3x3<br>2. Kliknij na siatkę                                                       | Zaznacza się obszar 3x3 komórki wokół kursora.               |
| ROOM-04 | Edycja pokoju                 | 1. Wejdź w edycję pokoju<br>2. Zmień nazwę i kształt siatki<br>3. Zapisz                                        | Dane zaktualizowane, powrót do widoku detali.                |

### 4.3. Meble i Przedmioty (Furniture & Items)

| ID      | Nazwa Scenariusza            | Kroki                                                                                                                               | Oczekiwany Rezultat                                                             |
|:--------|:-----------------------------|:------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| FURN-01 | Dodanie mebla z pozycją      | 1. W szczegółach pokoju kliknij "Dodaj mebel"<br>2. Wypełnij dane<br>3. Zaznacz na podglądzie siatki miejsce (zielone)<br>4. Zapisz | Mebel dodany do listy oraz widoczny jako prostokąt na podglądzie siatki pokoju. |
| FURN-02 | Kolizja/Brak miejsca         | 1. Próba dodania mebla w miejscu, gdzie nie ma zdefiniowanej siatki pokoju (szare pole)                                             | Walidator uniemożliwia zapisanie pozycji lub UI nie pozwala na zaznaczenie.     |
| ITEM-01 | Masowe dodawanie przedmiotów | 1. Otwórz mebel<br>2. Dodaj 3 wiersze przedmiotów<br>3. Zapisz                                                                      | Wszystkie 3 przedmioty zapisane i widoczne na liście.                           |
| ITEM-02 | Usuwanie przedmiotu          | 1. Kliknij ikonę kosza przy przedmiocie<br>2. Potwierdź w dialogu                                                                   | Przedmiot znika z listy, toast "Usunięto".                                      |

### 4.4. Wyszukiwanie (Search)

| ID      | Nazwa Scenariusza     | Kroki                                                                 | Oczekiwany Rezultat                                                            |
|:--------|:----------------------|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------|
| SRCH-01 | Wyszukiwanie globalne | 1. Wejdź na `/search`<br>2. Wpisz frazę "Klucze"<br>3. Kliknij Szukaj | Lista wyników zawierająca przedmiot "Klucze" wraz z nazwą mebla i pokoju.      |
| SRCH-02 | Nawigacja z wyników   | 1. Kliknij w wynik wyszukiwania                                       | Przekierowanie do `/rooms/{roomId}?furnitureId={id}` i otwarcie dialogu mebla. |

## 5. Środowisko testowe

* **Lokalne (Dev):**
    * Node.js v18+.
    * Lokalna instancja Angular CLI.
    * Połączenie do projektu Supabase "Dev" (lub emulatora lokalnego).
* **CI/CD (Pipeline):**
    * GitHub Actions / GitLab CI.
    * Uruchamianie testów jednostkowych (`npm run test:ci`).
    * Uruchamianie lintera (`npm run lint`).
    * (Opcjonalnie) Uruchamianie E2E na środowisku stagingowym.

## 6. Narzędzia do testowania

* **Framework Unit/Integration:** Jasmine & Karma (zgodnie z `package.json` Angulara) lub Jest (zalecana migracja dla
  szybkości).
* **E2E:** Playwright (zalecane ze względu na stabilność i szybkość) lub Cypress.
* **Mockowanie:** Jasmine Spies / `jest.mock`.
* **UI Helpers:** Angular CDK Test Harnesses (do testowania komponentów Material).

## 7. Harmonogram testów

Testy powinny być wykonywane w sposób ciągły:

1. **Podczas developmentu:** Programista pisze i uruchamia testy jednostkowe dla nowych funkcjonalności (szczególnie
   walidatory i serwisy).
2. **Pull Request:** Automatyczne uruchomienie wszystkich testów jednostkowych i lintera. Merge zablokowany w przypadku
   błędów.
3. **Przed Release:** Uruchomienie pełnego zestawu testów E2E na środowisku stagingowym (z użyciem `Seed Data`
   dostępnego w `UserEditPageComponent`).

## 8. Kryteria akceptacji testów

* **Pokrycie kodu (Code Coverage):** Minimum 80% dla serwisów (`*.service.ts`) i walidatorów (`*.validation.ts`).
* **Wynik testów:** 100% testów jednostkowych i E2E musi przechodzić (status PASS).
* **Błędy krytyczne:** Brak otwartych błędów o priorytecie Critical/Blocker.
* **UX:** Aplikacja nie może generować błędów w konsoli przeglądarki podczas standardowego użytkowania.

## 9. Role i odpowiedzialności

* **QA Engineer:** Tworzenie planu testów, scenariuszy E2E, testy manualne eksploracyjne, weryfikacja zgłoszeń.
* **Frontend Developer:** Pisanie testów jednostkowych i integracyjnych dla swoich komponentów, utrzymanie zgodności z
  planem testów.

## 10. Procedury raportowania błędów

Błędy należy zgłaszać w systemie śledzenia zadań (np. Jira/GitHub Issues) według szablonu:

1. **Tytuł:** Zwięzły opis problemu.
2. **Środowisko:** Przeglądarka (wersja), OS, Wersja aplikacji.
3. **Wstępne warunki:** Np. "Zalogowany użytkownik z 1 pokojem".
4. **Kroki do reprodukcji:** Dokładna instrukcja 1, 2, 3...
5. **Oczekiwany rezultat:** Co powinno się stać.
6. **Rzeczywisty rezultat:** Co się stało (w tym screenshoty/logi z konsoli).
7. **Priorytet:** (Low/Medium/High/Critical).

</plan_testów>