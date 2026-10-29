# dokuce.me

Prototip (mock-up) sajta za praćenje pošiljki / money-transfer shipments. Cilj je ispitati interesovanje korisnika prije razvoja pravog proizvoda — nema pravog servera ni baze, sve radi u browseru.

## Šta sajt radi

- **Praćenje pošiljke** — korisnik unosi tracking kod na početnoj strani i vidi status + istoriju (timeline).
- **Prijava za agencije** (`/agencije.html`, `/en/agencies.html`) — agencija za transfer se loguje i ažurira status pošiljke; promjena je odmah vidljiva na stranici za praćenje.
- **Dvojezičnost** — srpska verzija je na korijenu (`/`), engleska u `/en/`, sa `hreflang` vezama za SEO.
- **Responsive / mobile-first** dizajn, bez ijedne JS biblioteke ili build koraka — čist HTML/CSS/JS.

## Demo nalog za agencije

```
korisničko ime: demo
lozinka: demo
```

## Demo kodovi za praćenje

```
DK2026100123  — u tranzitu
DK2026100456  — isporučena
DK2026100789  — stigla u zemlju primaoca
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
