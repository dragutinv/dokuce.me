# dokuce.me

Prototip (mock-up) sajta za praćenje lokalnih pošiljki koje putuju između gradova (npr. preko agencija za transport, autobuskih linija i sl.). Cilj je ispitati interesovanje korisnika prije razvoja pravog proizvoda — nema pravog servera ni baze, sve radi u browseru.

## Šta sajt radi

- **Praćenje pošiljke** — korisnik unosi tracking kod na početnoj strani i vidi rutu (grad slanja → grad primanja), status i istoriju (timeline).
- **Prijava za agencije** (`/agencije.html`, `/en/agencies.html`) — agencija se loguje, bira grad slanja i grad primanja i ažurira status pošiljke; promjena je odmah vidljiva na stranici za praćenje.
- **Dvojezičnost** — srpska verzija je na korijenu (`/`), engleska u `/en/`, sa `hreflang` vezama za SEO.
- **Responsive / mobile-first** dizajn, bez ijedne JS biblioteke ili build koraka — čist HTML/CSS/JS.
- **Google Analytics (GA4)** — ugrađen na svim stranicama, treba samo upisati pravi Measurement ID (vidi ispod).

## Demo nalog za agencije

```
korisničko ime: demo
lozinka: demo
```

## Demo kodovi za praćenje

```
ME2026100123  — Podgorica → Bijelo Polje, u tranzitu
ME2026100456  — Nikšić → Bar, isporučena
ME2026100789  — Herceg Novi → Pljevlja, stigla u grad primaoca
```

## Google Analytics

Na svih 5 HTML stranica je dodat GA4 `gtag.js` snippet sa placeholder ID-jem `G-XXXXXXXXXX`. Da bi praćenje posjeta zaista radilo:

1. Napravi GA4 property na [analytics.google.com](https://analytics.google.com) za `dokuce.me`.
2. Kopiraj svoj Measurement ID (format `G-XXXXXXXXXX`).
3. Zamijeni `G-XXXXXXXXXX` tim ID-jem na oba mjesta (u `src` linku i u `gtag('config', ...)` pozivu) u sljedećim fajlovima: `index.html`, `en/index.html`, `agencije.html`, `en/agencies.html`, `404.html`.

Najlakše preko pretrage i zamjene u editoru ili komandom (iz root foldera projekta):

```bash
grep -rl "G-XXXXXXXXXX" --include="*.html" . | xargs sed -i 's/G-XXXXXXXXXX/G-TVOJID123/g'
```

## Kako radi "baza" podataka

Nema backend-a. Sve pošiljke i status istorija čuvaju se u `localStorage` browsera (vidi `js/data.js`). To znači:

- Podaci su samo lokalni za taj browser/uređaj — nisu dijeljeni između posjetilaca.
- Idealno za demonstraciju toka (agencija ažurira → korisnik vidi), ali **nije** pravo rješenje za produkciju.
- Kad bude vrijeme za pravi proizvod, `js/data.js` je mjesto gdje bi se `localStorage` pozivi zamijenili pravim API pozivima.

## Pokretanje lokalno

Statičan sajt — dovoljno je otvoriti `index.html` u browseru, ili pokrenuti lokalni server, npr.:

```bash
npx serve .
```

## Deploy (GitHub Pages)

Repo sadrži `CNAME` fajl sa `dokuce.me`, pa je spreman za GitHub Pages na custom domenu:

1. Settings → Pages → Source: `main` branch, `/ (root)`.
2. Kod registrara domena (dokuce.me) dodati DNS zapise prema GitHub Pages uputstvu (ili `A` zapisi ka GitHub Pages IP adresama, ili `CNAME` ka `<username>.github.io` ako se koristi subdomen).
3. Sačekati da GitHub izda SSL sertifikat za custom domen (Enforce HTTPS).

## Struktura

```
index.html            # Početna — srpski (default)
agencije.html          # Prijava/dashboard agencija — srpski
en/index.html          # Početna — engleski
en/agencies.html       # Prijava/dashboard agencija — engleski
css/style.css          # Sav stajling
js/data.js             # Demo podaci + localStorage "baza"
js/app.js              # Logika za praćenje pošiljke (početna strana)
js/agency.js           # Logika za login i dashboard agencija
assets/                # Logo, favicon, ilustracija (SVG)
sitemap.xml, robots.txt, CNAME, 404.html
```
