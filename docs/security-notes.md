# Day 8 — Think like an attacker: security notes

Dokument wykonania zadania **Day 8 (OWASP Top 10)** dla Track S. Notatki są po polsku, żeby łatwo było je wytłumaczyć.

## 1. OWASP Top 10 — każde ryzyko w jednym zdaniu

1. **A01 — Broken Access Control**: użytkownik może zrobić coś, na co nie ma pozwolenia (np. zobaczyć lub zmienić cudze dane).
2. **A02 — Cryptographic Failures**: wrażliwe dane (hasła, numery kart) są przechowywane lub przesyłane bez szyfrowania.
3. **A03 — Injection**: atakujący wysyła złośliwy kod (np. SQL lub HTML), a aplikacja wykonuje go zamiast traktować jak zwykły tekst.
4. **A04 — Insecure Design**: aplikacja została zaprojektowana bez myślenia o bezpieczeństwie (brak limitów, brak kontroli).
5. **A05 — Security Misconfiguration**: złe ustawienia serwera/aplikacji — np. brak zabezpieczeń w nagłówkach HTTP, włączone opcje debug.
6. **A06 — Vulnerable and Outdated Components**: używamy starych bibliotek ze znanymi dziurami, a atakujący je wykorzystuje.
7. **A07 — Identification and Authentication Failures**: słabe logowanie — łatwe hasła, brak blokady po nieudanych próbach, hasła w zwykłym tekście.
8. **A08 — Software and Data Integrity Failures**: ufamy danym/plikom, które nie zostały zweryfikowane (np. zepsuty update, wgranie złego pakietu).
9. **A09 — Security Logging and Monitoring Failures**: nie mamy logów ani monitoringu, więc nie zauważamy ataków.
10. **A10 — Server-Side Request Forgery (SSRF)**: serwer pobiera wskazany przez atakującego adres URL i pokazuje mu odpowiedź.

## 2. Czy nasza aplikacja może być podatna?

| Ryzyko | Czy podatne? | Wyjaśnienie |
|---|---|---|
| A01 Access Control | Częściowo | Logika tylko po stronie klienta (przeglądarki). Każdy z dostępem do urządzenia może otworzyć DevTools i odczytać cudze `localStorage` (`tasks_<user>`). Aplikacja nie chroni danych przed innymi osobami na tym samym komputerze. |
| A02 Crypto | Częściowo | Hasła są hashowane (SHA-256) — dobrze, ale SHA-256 to funkcja **szybka**, więc słabsza do haseł niż bcrypt/argon2. Całość i tak żyje w `localStorage` bez szyfrowania. |
| A03 Injection | Nie (w dużej mierze zabezpieczone) | Brak serwera i SQL — SQLi nie dotyczy. React **eskapuje** cały renderowany tekst, więc `<script>` wpisany jako zadanie pokaże się jako zwykły tekst, nie wykona się (test poniżej). |
| A04 Insecure Design | Tak (świadomie) | To projekt edukacyjny: "konto" istnieje tylko lokalnie i daje tylko iluzję wieloosobowości. To celowa decyzja na potrzeby nauki, ale w realnej aplikacji wymagałoby serwera. |
| A05 Misconfiguration | Do sprawdzenia | Docelowo wdrożenie na HTTPS (GitHub Pages to robi automatycznie). Warto dodać podstawowe nagłówki bezpieczeństwa (np. `Content-Security-Policy`). |
| A06 Components | **Sprawdzone: 0 podatności** | `npm audit` zwróciło `found 0 vulnerabilities` (12 sierpnia 2026). |
| A07 Auth Failures | Częściowo | Hasła min. 6 znaków + walidacja — ale uwierzytelnianie jest po stronie klienta, bez limitu prób logowania i bez prawdziwego hashowania typu bcrypt. |
| A08 Integrity | Niskie | Nie pobieramy danych z zewnątrz; weryfikowalne via `package-lock.json` i `npm audit`. |
| A09 Logging & Monitoring | Nie | Brak serwera = brak logów. Informacja: w prawdziwej aplikacji to poważny brak. |
| A10 SSRF | Nie dotyczy | Nasza aplikacja nie ma serwera, który pobierałby URL-e. |

## 3. Test XSS na naszej aplikacji (worked example)

Wpisz w pole "New task...":

```html
<script>alert('xss')</script>
```

**Oczekiwany wynik**: żaden alert się nie pokaże. Zadanie zostanie wyświetlone jako zwykły tekst. To dlatego, że React **eskapuje output** — znaki `<` i `>` są zamieniane na bezpieczne encje HTML, więc przeglądarka nie traktuje tego jako kodu.

Spróbuj tego samego w polu "Username". Tutaj też tekst jest tylko wyświetlany jako tekst — nie jest wykonywany.

## 4. DevTools — panele Security i Network na naszej aplikacji

1. Otwórz aplikację (npm run dev) i naciśnij F12.
2. **Security** → pokazuje certyfikat HTTPS na wdrożonej wersji (GitHub Pages).
3. **Network** → wyświetla żądania i odpowiedzi. U nas są to tylko pliki statyczne (HTML, JS, CSS, manifest) — nie ma żadnych zapytań do bazy ani API, co oznacza mniejszą powierzchnię ataku.

## 5. Wniosek

Najsłabszy punkt aplikacji to **autoryzacja po stronie klienta** (A01, A07): `localStorage` czyta każdy, kto ma dostęp do urządzenia, a hash SHA-256 nie jest wystarczająco odporny na hasła. Wnioski te idą do GitHub Issues i będą podstawą docierania aplikacji w Dniu 9 (harden).

# Day 9 — Harden your app: co faktycznie poprawiliśmy

| Obszar | Co zrobiliśmy |
|---|---|
| Walidacja wejścia | Username tylko `a-z 0-9 _` (3–20 znaków); hasło 6–64 znaków; zadanie max 60 znaków + blokada duplikatów. Nigdy nie ufamy przeglądarce. |
| Sanitizacja | Ze wszystkich pól wycinamy znaki sterujące (control chars) przed zapisem. |
| Escape output | React eskapuje cały output. **Automatyczny test** `npm run check-security` wpisuje `<script>alert('xss')</script>`, rejestruje dialog i sprawdza, że żaden się nie pojawił → `PASS — input stays text`. |
| Autoryzacja | Hasło nigdy nie jest zapisane: losowa sól (salt) + SHA-256. Identyczne hasła dają różne hashe. Brak sekretów we froncie. |
| HTTPS + nagłówki | GitHub Pages = HTTPS. GitHub Pages nie pozwala ustawić nagłówków serwera, więc dodaliśmy przez `<meta>`: `Content-Security-Policy` (tylko własne skrypty), `X-Content-Type-Options: nosniff`, `referrer: no-referrer`. |
| Testy | `npm run check-security` (XSS + CSP) i `npm run check-offline` (offline) — oba przechodzą automatycznie. |

# Day 10 — Deploy, audit & plan the capstone

## 1. Wdrożenie na żywo (HTTPS)

- Live URL: **https://vikkyyyt1-hash.github.io/PWA/** (GitHub Pages, HTTPS enforced, deploy automatyczny: `npm run build` + `npx gh-pages -d dist --no-history`).
- Instalacja na telefonie: w przeglądarce mobilnej otwórz URL → menu przeglądarki → "Dodaj do ekranu głównego / Install app" (lub przycisk 📥 Download App w aplikacji).

## 2. Self-audyt OWASP Top 10 (wnioski dla naszej aplikacji)

| Ryzyko | Status | Wniosek |
|---|---|---|
| A01 Access Control | ⚠️ | Auth tylko po stronie klienta — `localStorage` czyta każdy z dostępem do urządzenia. **Issue #12.** |
| A02 Crypto | ⚠️ | Salt + SHA-256 (dobrze jak na demo), ale SHA-256 jest szybkie — dla prawdziwych haseł lepsze bcrypt/argon2. |
| A03 Injection/XSS | ✅ | React eskapuje output; automatyczny test `check-security` potwierdza: input nigdy nie wykona się jako kod. |
| A04 Insecure Design | ⚠️ | Aplikacja edukacyjna — celowo bez serwera. |
| A05 Misconfiguration | ✅ | HTTPS + CSP (meta) + nosniff + no-referrer. |
| A06 Components | ✅ | `npm audit`: 0 podatności. |
| A07 Auth | ⚠️ | Reguły haseł + hashowanie są, ale logowanie lokalne, bez limitu prób. **Issue #12.** |
| A08 Integrity | ✅ | Brak danych z zewnątrz; weryfikowalne pakiety. |
| A09 Logging | ❌ | Brak logów — świadoma luka demo. **Issue #13.** |
| A10 SSRF | ✅ | Nie dotyczy (brak serwera). |

## 3. Lighthouse na żywej stronie (Day 10)

Wyniki po poprawkach (skrypt: `npm run check-lighthouse`, raport: `docs/lighthouse.json`):

| Kategoria | Wynik |
|---|---|
| Performance | **100** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

Uwaga: Lighthouse 12 usunął kategorię PWA — instalowalność weryfikujemy osobno: `manifest.json` + `sw.js` + `npm run check-offline` (PASS).

### Co poprawiliśmy po pierwszym audycie
- Kontrast przycisku install (2.53:1 → 4.5:1+) — ciemniejszy zielony `#047857`.
- Brak `meta description` (SEO) — dodany.
- Brak landmarku `<main>` i przeskakujące nagłówki (h1→h3) — `<main>` + `<h2>`.

## 4. GitHub Issues i scope capstone

- Issues z ustaleń: **#9–#11 zamknięte (naprawione), #12–#15 otwarte** (pełna lista: `docs/issues.md`).
- **Capstone (Week 3)**: *Secure installable app* — ta aplikacja jako projekt: PWA z kontami, offline i twardym modelowaniem bezpieczeństwa. Stretch goal: **rola admina** (Issue #14).
