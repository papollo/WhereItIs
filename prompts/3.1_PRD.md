# Dokument wymagań produktu (PRD) - WhereItIs

## 1. Przegląd produktu

WhereItIs to webowa aplikacja desktopowa, która pomaga użytkownikom odnajdywać przedmioty w domu poprzez tworzenie
wirtualnych odwzorowań pomieszczeń, mebli oraz ich zawartości. Użytkownik buduje proste mapy pomieszczeń w formie siatki
oraz przypisuje przedmioty do stworzonych wcześniej mebli. Aplikacja oferuje wyszukiwarkę, która pozwala szybko odnaleźć
przedmiot po jego nazwie, eliminując konieczność fizycznego przeszukiwania mieszkania.

Aplikacja została zaprojektowana z myślą o prostocie, minimalizmie i możliwości szybkiego wykonania najważniejszego
zadania: odnalezienia zgubionej rzeczy. Największą korzyść osiągną rodzice, którzy często odkładają przedmioty w różnych
miejscach i chcą łatwo je odnajdywać.

## 2. Problem użytkownika

Użytkownicy często zapominają, gdzie odkładają przedmioty w swoim domu. Prowadzi to do frustracji, straty czasu oraz
niepotrzebnego stresu. Użytkownicy nie mają łatwego sposobu na zapisanie lokalizacji przedmiotów, przez co muszą ręcznie
przeszukiwać mieszkanie.

WhereItIs adresuje ten problem, umożliwiając:

- stworzenie wirtualnych pomieszczeń i mebli,
- przypisanie przedmiotów do konkretnych miejsc,
- szybkie odnalezienie przedmiotu poprzez wyszukiwarkę.

Dzięki temu użytkownik może błyskawicznie ustalić, w którym meblu znajduje się dany przedmiot.

## 3. Wymagania funkcjonalne

### 3.1 Tworzenie pomieszczeń

1. Użytkownik może dodać nowy pokój.
2. Pokój posiada unikalną nazwę i kolor.
3. Pokój jest reprezentowany jako siatka 0,5 m w maksymalnym rozmiarze 20 m × 20 m (np. 25x25 lub 40x40 w zależności od
   przeliczeń).
4. Siatka jest renderowana przy użyciu CSS Grid lub HTML Canvas.
5. Użytkownik może malować komórki siatki, wybierając kolor z palety lub podając kod HEX.
6. Użytkownik może edytować lub usuwać istniejący pokój.

### 3.2 Zarządzanie meblami

1. Użytkownik może dodać mebel przypisany do konkretnego pokoju.
2. Mebel posiada unikalną nazwę oraz krótki opis.
3. Mebel posiada kolor wybrany z predefiniowanej palety lub ustawiony poprzez kod HEX.
4. Użytkownik może edytować lub usuwać mebel.
5. Po kliknięciu w mebel otwiera się modal z listą przypisanych przedmiotów oraz możliwością ich dodawania.

### 3.3 Dodawanie i zarządzanie przedmiotami

1. Przedmiot posiada wyłącznie nazwę.
2. Przedmiot jest przypisany do konkretnego mebla.
3. W modalu użytkownik może dodać wiele przedmiotów jednocześnie poprzez klikanie przycisku „+”, który dodaje kolejne
   pola input.
4. Przedmioty mogą się powtarzać (brak unikalności nazw).
5. Użytkownik może usuwać przedmioty z listy.

### 3.4 Wyszukiwarka

1. Użytkownik może wyszukać przedmiot po nazwie.
2. W wynikach użytkownik widzi listę mebli zawierających dany przedmiot.
3. Po kliknięciu w wynik użytkownik zostaje przeniesiony do pokoju i mebla, w którym znajduje się przedmiot.
4. Wyszukiwanie działa w czasie rzeczywistym (proponowane), lub po zatwierdzeniu query.

### 3.5 Konta użytkowników i logowanie

1. Aplikacja wymaga założenia konta (email + hasło).
2. Hasła muszą być przechowywane w sposób bezpieczny (hash).
3. Użytkownik ma jedyną rolę: USER.
4. Użytkownik po zalogowaniu ma dostęp tylko do własnych pomieszczeń, mebli i przedmiotów.
5. Użytkownik może wylogować się w dowolnym momencie.

### 3.6 Onboarding

1. Onboarding uruchamia się automatycznie przy pierwszym logowaniu.
2. Użytkownik może ponownie uruchomić onboarding w ustawieniach.
3. Onboarding składa się z kilku ekranów wyjaśniających podstawowe funkcje.

### 3.7 Monitoring i analityka

1. Rejestrowane zdarzenia:
    - room_created
    - furniture_created
    - item_added
    - search_performed
2. Dane są przechowywane w minimalnym zakresie – brak śledzenia zachowania użytkownika poza tym, co niezbędne.

### 3.8 Obsługa błędów

1. W przypadku błędu po stronie serwera użytkownik zobaczy komunikat w prawym górnym rogu ekranu.
2. Komunikat znika po określonym czasie lub może być zamknięty.

### 3.9 Wymagania prawne i ograniczenia

1. Aplikacja musi być zgodna z RODO w zakresie przechowywania danych użytkowników (email, hasło).
2. Prawo do wglądu i usunięcia danych użytkownika musi być respektowane.

## 4. Granice produktu

### 4.1 Poza zakresem MVP

1. Realistyczne modele 3D.
2. Synchronizacja w chmurze oraz wieloplatformowe konto.
3. Udostępnianie danych innym użytkownikom.
4. System tagów, kategorii lub zaawansowanych metadanych przedmiotów.
5. Rozpoznawanie przedmiotów przez aparat.
6. Eksport i import danych.
7. Role inne niż USER.
8. System wersjonowania pokoi i mebli.

### 4.2 Ograniczenia technologiczne

1. Platforma: tylko web/desktop.
2. Baza danych: PostgreSQL.
3. Brak integracji z usługami zewnętrznymi.
4. Jednoosobowy development – potencjalne wydłużenie czasu implementacji.

### 4.3 Otwarte kwestie

1. Brak określonej struktury nawigacji – wymaga dodatkowego zaprojektowania (Dashboard? Lista pokoi? Widok edycji?).

## 5. Historyjki użytkowników

### Autoryzacja i onboarding

#### US-001 Logowanie użytkownika

Tytuł: Logowanie do systemu  
Opis: Jako użytkownik chcę zalogować się za pomocą emaila i hasła, aby uzyskać dostęp do mojej prywatnej przestrzeni.  
Kryteria akceptacji:

- Użytkownik może wpisać email i hasło.
- System weryfikuje dane logowania.
- Niepoprawne dane zwracają czytelny błąd.
- Po zalogowaniu użytkownik widzi główny widok aplikacji.

#### US-002 Rejestracja konta

Tytuł: Stworzenie konta użytkownika  
Opis: Jako użytkownik chcę utworzyć konto, aby moje pokoje, meble i przedmioty były zapisywane.  
Kryteria akceptacji:

- Formularz zawiera email i hasło.
- System waliduje unikalność emaila.
- Hasło jest bezpiecznie przechowywane.
- Po rejestracji użytkownik jest przeniesiony do logowania.

#### US-003 Onboarding nowego użytkownika

Tytuł: Pierwsze kroki  
Opis: Jako użytkownik chcę zobaczyć krótkie wprowadzenie przy pierwszym logowaniu.  
Kryteria akceptacji:

- Onboarding wyświetla się tylko przy pierwszym logowaniu.
- Onboarding można pominąć.
- Użytkownik może ponownie włączyć onboarding z ustawień.

### Zarządzanie pokojami

#### US-004 Dodanie pokoju

Tytuł: Tworzenie pokoju  
Opis: Jako użytkownik chcę utworzyć nowy pokój i pomalować jego siatkę, aby odwzorować rzeczywisty kształt
pomieszczenia.  
Kryteria akceptacji:

- Użytkownik nadaje unikalną nazwę i wybiera kolor pokoju.
- Użytkownik widzi siatkę 0,5 m.
- Użytkownik może malować komórki siatki.
- Pokój zapisuje się poprawnie w bazie.

#### US-005 Edycja pokoju

Tytuł: Edytowanie pokoju  
Opis: Jako użytkownik chcę zmodyfikować nazwę, kolor lub wygląd siatki pokoju.  
Kryteria akceptacji:

- Użytkownik może zmienić nazwę i kolor.
- Użytkownik może przemalować siatkę.
- Zmiany są zapisywane po zatwierdzeniu.

#### US-006 Usuwanie pokoju

Tytuł: Usuwanie pokoju  
Opis: Jako użytkownik chcę usunąć pokój, którego już nie potrzebuję.  
Kryteria akceptacji:

- Usunięcie wymaga potwierdzenia.
- Usunięcie pokoju powoduje usunięcie przypisanych mebli i przedmiotów.
- Po usunięciu element jest natychmiast usuwany z UI.

### Zarządzanie meblami

#### US-007 Dodanie mebla

Tytuł: Tworzenie mebla  
Opis: Jako użytkownik chcę dodać mebel do pokoju, aby przypisywać do niego przedmioty.  
Kryteria akceptacji:

- Formularz zawiera nazwę, opis i kolor.
- Mebel pojawia się w pokoju po zapisaniu.

#### US-008 Edycja mebla

Tytuł: Edytowanie mebla  
Opis: Jako użytkownik chcę zmienić nazwę, opis lub kolor mebla.  
Kryteria akceptacji:

- Użytkownik może edytować wszystkie pola.
- Zmiany są widoczne po zapisaniu.

#### US-009 Usuwanie mebla

Tytuł: Usunięcie mebla  
Opis: Jako użytkownik chcę usunąć mebel wraz z przypisanymi przedmiotami.  
Kryteria akceptacji:

- Wymagane jest potwierdzenie usunięcia.
- Usunięcie mebla usuwa również jego przedmioty.

### Zarządzanie przedmiotami

#### US-010 Dodawanie wielu przedmiotów

Tytuł: Szybkie dodawanie przedmiotów  
Opis: Jako użytkownik chcę dodać wiele przedmiotów do mebla w jednym modalu.  
Kryteria akceptacji:

- Użytkownik może dodać wiele pól input poprzez kliknięcie „+”.
- Przedmioty zapisują się poprawnie.
- Po zapisaniu modal pokazuje zaktualizowaną listę przedmiotów.

#### US-011 Usuwanie przedmiotu

Tytuł: Usuwanie przedmiotu  
Opis: Jako użytkownik chcę usunąć przedmiot, który już nie jest potrzebny.  
Kryteria akceptacji:

- Użytkownik może usunąć wybrany przedmiot.
- Lista aktualizuje się poprawnie.

### Wyszukiwanie

#### US-012 Wyszukiwanie przedmiotu

Tytuł: Odnalezienie przedmiotu  
Opis: Jako użytkownik chcę wyszukać przedmiot po nazwie, aby znaleźć, w którym meblu się znajduje.  
Kryteria akceptacji:

- Wyszukiwarka zwraca listę mebli zawierających dane przedmioty.
- Wynik jest klikalny i przenosi użytkownika do pokoju i mebla.
- Brak wyników wyświetla komunikat.

### Obsługa błędów i monitoring

#### US-013 Komunikaty o błędach

Tytuł: Informowanie o błędach  
Opis: Jako użytkownik chcę zobaczyć jasny komunikat w przypadku błędu serwera.  
Kryteria akceptacji:

- Komunikat wyświetla się w prawym górnym rogu.
- Komunikat znika automatycznie po czasie lub po kliknięciu.

#### US-014 Rejestrowanie zdarzeń

Tytuł: Monitoring kluczowych akcji  
Opis: Jako system chcę rejestrować zdarzenia tworzenia pokoi, mebli, przedmiotów oraz wyszukiwania.  
Kryteria akceptacji:

- Zdarzenia zapisują się przy każdej odpowiedniej akcji.
- Dane są kompletne i możliwe do analizy.

## 6. Metryki sukcesu

1. 90% użytkowników potrafi dodać pokój, mebel i przedmiot w czasie krótszym niż 5 minut.
2. 75% użytkowników znajduje przedmiot w mniej niż 30 sekund od otwarcia wyszukiwarki.
3. Monitoring dostarcza dane dotyczące:
    - liczby utworzonych pokoi,
    - liczby utworzonych mebli,
    - liczby dodanych przedmiotów,
    - częstotliwości oraz skuteczności wyszukiwania.

