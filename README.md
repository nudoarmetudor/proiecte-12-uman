Mai jos ai un `README.md` complet, gata de copy-paste în GitHub.

````md
# Portal Proiecte Web Marinciuc

Portal web pentru centralizarea, prezentarea și evaluarea peer-to-peer a proiectelor HTML realizate de elevi.

Proiectul este construit ca o aplicație web statică, publicată prin GitHub Pages, și folosește Google Apps Script + Google Sheets pentru colectarea și agregarea evaluărilor.

---

## 1. Scopul proiectului

Acest repository conține un portal educațional prin care elevii pot:

- accesa proiectele web realizate de colegi;
- explora site-urile publicate prin GitHub Pages;
- completa un formular de evaluare peer-to-peer;
- acorda scoruri pe criterii clare;
- oferi comentarii formative;
- consulta scorurile agregate pentru fiecare proiect;
- vizualiza comentariile primite de fiecare proiect.

Portalul are rol de instrument didactic pentru dezvoltarea competențelor digitale, a reflecției critice și a capacității de a oferi feedback constructiv.

---

## 2. Link către portal

Pagina publică a proiectului este disponibilă prin GitHub Pages:

```txt
https://nudoarmetudor.github.io/proiecte-html-marinciuc/
````

---

## 3. Structura repository-ului

```txt
proiecte-html-marinciuc/
│
├── LICENSE
├── README.md
├── elevi.json
├── index.html
├── scripts.js
└── styles.css
```

---

## 4. Rolul fișierelor

### `index.html`

Fișierul principal al aplicației.

Conține structura HTML a portalului:

* bara de navigare;
* secțiunea introductivă;
* zona de căutare;
* filtrele pe categorii;
* grila de proiecte;
* formularul de evaluare;
* fereastra pentru comentarii;
* zona de notificări.

Fișierul nu conține CSS sau JavaScript inline. Stilurile și logica sunt separate în fișiere dedicate.

---

### `styles.css`

Fișierul de stilizare al aplicației.

Conține:

* variabile CSS;
* stiluri generale;
* stiluri pentru cardurile proiectelor;
* stiluri pentru filtre;
* stiluri pentru ferestrele modale;
* stiluri pentru formularul de evaluare;
* stiluri responsive;
* animații;
* stiluri pentru notificări.

Acest fișier este conectat în `index.html` prin:

```html
<link rel="stylesheet" href="./styles.css">
```

---

### `scripts.js`

Fișierul principal de logică JavaScript.

Conține:

* încărcarea datelor din `elevi.json`;
* încărcarea evaluărilor agregate din Google Apps Script;
* generarea cardurilor de proiect;
* filtrarea proiectelor;
* căutarea după nume, categorie, URL sau feedback;
* deschiderea formularului de evaluare;
* trimiterea evaluărilor către Google Sheets;
* afișarea scorurilor agregate;
* afișarea comentariilor individuale;
* mecanisme de fallback local prin `localStorage`.

Fișierul este conectat în `index.html` prin:

```html
<script src="./scripts.js"></script>
```

---

### `elevi.json`

Fișierul care conține lista proiectelor elevilor.

Fiecare proiect este definit printr-un obiect JSON cu următoarea structură:

```json
{
  "id": "mihaela-urzica",
  "nume": "Mihaela Urzica",
  "url": "https://mihaelaurzica01-lgtm.github.io/VictoriousStarM/",
  "categorie": "CV"
}
```

Câmpurile au următorul rol:

| Câmp        | Descriere                                                                              |
| ----------- | -------------------------------------------------------------------------------------- |
| `id`        | Identificator unic al proiectului. Este folosit pentru legarea evaluărilor de proiect. |
| `nume`      | Numele elevului sau al echipei.                                                        |
| `url`       | Linkul public către proiectul elevului.                                                |
| `categorie` | Categoria proiectului. De exemplu: `CV`, `demo`, `browser game`, `Beauty & Health`.    |

---

### `README.md`

Documentația repository-ului.

Explică scopul proiectului, structura fișierelor, modul de configurare și regulile de actualizare.

---

### `LICENSE`

Fișierul de licență al proiectului.

Repository-ul folosește licența `GPL-3.0`.

---

## 5. Tehnologii utilizate

Proiectul folosește următoarele tehnologii:

| Tehnologie         | Rol                                                                         |
| ------------------ | --------------------------------------------------------------------------- |
| HTML               | Structura paginii web.                                                      |
| CSS                | Stilizarea interfeței.                                                      |
| JavaScript         | Logica aplicației, încărcarea datelor, filtrarea și trimiterea evaluărilor. |
| GitHub Pages       | Publicarea portalului online.                                               |
| JSON               | Stocarea listei de proiecte.                                                |
| Google Sheets      | Stocarea evaluărilor trimise de utilizatori.                                |
| Google Apps Script | Legătura dintre portal și Google Sheets.                                    |
| Tailwind CSS CDN   | Clase utilitare pentru layout și design.                                    |
| Font Awesome       | Iconițe folosite în interfață.                                              |

---

## 6. Cum funcționează aplicația

Fluxul general este următorul:

```txt
1. Utilizatorul deschide portalul publicat prin GitHub Pages.
2. Aplicația încarcă lista proiectelor din elevi.json.
3. Aplicația solicită scorurile agregate de la Google Apps Script.
4. Proiectele sunt afișate sub formă de carduri.
5. Utilizatorul poate căuta sau filtra proiectele.
6. Utilizatorul poate deschide proiectul unui elev.
7. Utilizatorul poate completa formularul de evaluare.
8. Evaluarea este trimisă către Google Sheets prin Apps Script.
9. Apps Script recalculează scorurile și comentariile agregate.
10. Portalul reîncarcă datele și actualizează interfața.
```

---

## 7. Structura datelor din `elevi.json`

Exemplu complet:

```json
[
  {
    "id": "mihaela-urzica",
    "nume": "Mihaela Urzica",
    "url": "https://mihaelaurzica01-lgtm.github.io/VictoriousStarM/",
    "categorie": "CV"
  },
  {
    "id": "balaban-inna",
    "nume": "Inna Balaban",
    "url": "https://innabalaban007-gif.github.io/Inna/",
    "categorie": "CV"
  }
]
```

Reguli importante:

1. Fiecare `id` trebuie să fie unic.
2. Nu se recomandă folosirea spațiilor în `id`.
3. Pentru `id`, se recomandă litere mici și cratimă.
4. Câmpul `categorie` trebuie scris consecvent.
5. Nu se recomandă amestecarea formelor `categorie` și `categoria`.
6. Linkul din `url` trebuie să fie public și funcțional.
7. Dacă un proiect nu are încă link, câmpul `url` poate fi lăsat gol.

Exemplu de `id` recomandat:

```txt
prenume-nume
```

Exemple:

```txt
mihaela-urzica
inna-balaban
daniela-avadani
```

---

## 8. Criteriile de evaluare

Evaluarea peer-to-peer este realizată pe baza a 8 criterii.

| Criteriu                              | Pondere |
| ------------------------------------- | ------: |
| Relevanța problemei abordate          |     15% |
| Claritatea scopului și a mesajului    |     10% |
| Adecvarea pentru publicul-țintă       |     15% |
| Utilitatea și valoarea informațională |     15% |
| Structura și navigarea                |     10% |
| Design vizual și atractivitate        |     10% |
| Calitatea tehnică a realizării        |     10% |
| Originalitate și impact general       |     15% |

Fiecare criteriu este evaluat pe o scară Likert de la 1 la 5:

| Scor | Semnificație |
| ---: | ------------ |
|    1 | Foarte slab  |
|    2 | Slab         |
|    3 | Acceptabil   |
|    4 | Bun          |
|    5 | Foarte bun   |

Scorul general este calculat ca medie ponderată.

---

## 9. Comentariile formative

Pe lângă scorurile numerice, evaluatorii completează patru câmpuri de feedback:

| Câmp                 | Rol                                                        |
| -------------------- | ---------------------------------------------------------- |
| `strengthComment`    | Punctul forte principal al proiectului.                    |
| `improvementComment` | Aspectul care ar trebui îmbunătățit în primul rând.        |
| `audienceComment`    | Măsura în care site-ul răspunde nevoilor publicului-țintă. |
| `generalComment`     | Comentariu general pentru autor.                           |

Aceste comentarii sunt salvate în Google Sheets și pot fi afișate în portal prin butonul:

```txt
Vezi comentariile
```

---

## 10. Integrarea cu Google Apps Script

Portalul comunică cu Google Sheets printr-un Web App creat în Google Apps Script.

În `scripts.js`, URL-ul Apps Script este definit în obiectul `CONFIG`:

```js
const CONFIG = {
  appsScriptUrl: 'URL_APPS_SCRIPT_AICI',
  seedEvaluationsFile: 'evaluari.json',
  localFallbackStorageKey: 'portal-peer-review-fallback-v2',
  remoteRefreshDelayMs: 1800
};
```

Pentru funcționarea corectă, Apps Script trebuie publicat ca Web App cu acces public.

Setări recomandate la deployment:

```txt
Execute as: Me
Who has access: Anyone
```

---

## 11. Structura Google Sheets

Google Sheets trebuie să conțină o foaie numită:

```txt
Evaluari
```

Coloanele folosite sunt:

```txt
submittedAt
id
projectId
projectName
projectCategory
projectUrl
evaluatorName
evaluatorClass
visitedSite
relevanta
claritate
publicTinta
utilitate
navigare
design
tehnic
originalitate
strengthComment
improvementComment
audienceComment
generalComment
userAgent
```

Aceste coloane sunt generate automat de Apps Script dacă foaia nu există sau dacă structura nu corespunde.

---

## 12. Răspunsul așteptat de la Apps Script

Pentru ca portalul să poată afișa scorurile și comentariile, Apps Script trebuie să returneze un obiect de tipul:

```json
{
  "ok": true,
  "generatedAt": "2026-05-13T09:00:00.000Z",
  "projects": {
    "mihaela-urzica": {
      "count": 4,
      "weightedScore": 3.74,
      "criterionAverages": {
        "relevanta": 3.25,
        "claritate": 4,
        "publicTinta": 4,
        "utilitate": 3.5,
        "navigare": 3.75,
        "design": 4,
        "tehnic": 3.75,
        "originalitate": 4
      },
      "scoreLabel": "Bun",
      "topStrength": "Design vizual și atractivitate",
      "mainImprovement": "Relevanța problemei abordate",
      "summary": "Evaluatorii apreciază în principal design vizual și atractivitate...",
      "comments": [
        {
          "evaluatorName": "Tudor",
          "evaluatorClass": "13C",
          "visitedSite": "Parțial",
          "submittedAt": "2026-05-13T09:00:00.000Z",
          "strengthComment": "Text comentariu",
          "improvementComment": "Text comentariu",
          "audienceComment": "Text comentariu",
          "generalComment": "Text comentariu"
        }
      ]
    }
  }
}
```

Câmpul `comments` este important. Fără el, portalul poate afișa scorurile, dar nu poate afișa comentariile individuale.

---

## 13. Publicarea prin GitHub Pages

Pentru publicare:

1. Deschide repository-ul pe GitHub.
2. Accesează `Settings`.
3. Intră la `Pages`.
4. La `Source`, selectează branch-ul principal, de obicei `main`.
5. Selectează folderul `/root`.
6. Salvează.
7. Așteaptă câteva minute până la publicarea site-ului.

Linkul va avea forma:

```txt
https://nudoarmetudor.github.io/proiecte-html-marinciuc/
```

---

## 14. Cum adaugi un proiect nou

Pentru a adăuga un proiect nou:

1. Deschide fișierul `elevi.json`.
2. Adaugă un obiect nou în array.
3. Respectă structura existentă.
4. Salvează modificarea.
5. Fă commit în GitHub.
6. Așteaptă actualizarea GitHub Pages.

Exemplu:

```json
{
  "id": "nume-prenume",
  "nume": "Nume Prenume",
  "url": "https://username.github.io/nume-proiect/",
  "categorie": "CV"
}
```

---

## 15. Cum modifici un proiect existent

Pentru modificarea unui proiect:

1. Deschide `elevi.json`.
2. Găsește obiectul corespunzător elevului.
3. Modifică doar câmpul necesar.
4. Nu schimba `id` dacă proiectul are deja evaluări.

Important:

Dacă modifici `id`, evaluările deja salvate în Google Sheets nu se vor mai potrivi cu proiectul respectiv.

---

## 16. Recomandări pentru `id`

Corect:

```json
"id": "mihaela-urzica"
```

De evitat:

```json
"id": "Mihaela Urzica"
```

De evitat:

```json
"id": "mihaela_urzica!!!"
```

Format recomandat:

```txt
litere-mici-fara-diacritice-cu-cratima
```

---

## 17. Mecanismul de fallback

Dacă Google Apps Script nu este disponibil, aplicația poate salva temporar evaluări în `localStorage`.

Aceasta este o soluție de rezervă.

Limitări:

* datele sunt salvate doar în browserul utilizatorului;
* nu sunt vizibile pentru ceilalți utilizatori;
* pot fi șterse dacă utilizatorul curăță datele browserului.

Pentru utilizare reală în clasă, Google Apps Script + Google Sheets trebuie să fie funcțional.

---

## 18. Probleme frecvente și soluții

### Cardurile nu apar

Verifică:

* dacă `elevi.json` există;
* dacă JSON-ul este valid;
* dacă fișierul este în același folder cu `index.html`;
* dacă browserul nu blochează încărcarea fișierelor.

---

### Butonul „Evaluează” nu funcționează

Verifică:

* dacă `scripts.js` este conectat corect;
* dacă în `index.html` există:

```html
<script src="./scripts.js"></script>
```

Nu este corect:

```html
<script href="./scripts.js"></script>
```

---

### Stilurile nu se aplică

Verifică dacă în `index.html` există:

```html
<link rel="stylesheet" href="./styles.css">
```

Verifică dacă fișierul `styles.css` este în același folder cu `index.html`.

---

### Comentariile nu se afișează

Verifică dacă Apps Script returnează câmpul:

```json
"comments": []
```

Pentru fiecare proiect, răspunsul Apps Script trebuie să includă lista comentariilor individuale.

---

### Scorurile apar, dar comentariile nu

Aceasta înseamnă că Apps Script calculează sumarul, dar nu returnează comentariile individuale.

Verifică funcția `summarizeProject_()` din Apps Script și asigură-te că în `return` există:

```js
comments: comments
```

---

### Modificările din Apps Script nu apar în site

După modificarea Apps Script, trebuie creat un deployment nou:

```txt
Deploy → Manage deployments → Edit → Version: New version → Deploy
```

Dacă nu creezi o versiune nouă, site-ul poate folosi în continuare codul vechi.

---

## 19. Testarea endpoint-ului Apps Script

Pentru testarea endpoint-ului, deschide în browser:

```txt
URL_APPS_SCRIPT_AICI?action=summary
```

Răspunsul trebuie să conțină:

```json
{
  "ok": true,
  "projects": {}
}
```

Dacă există evaluări, obiectul `projects` trebuie să includă proiectele evaluate.

---

## 20. Reguli recomandate pentru utilizarea didactică

Evaluatorii trebuie să:

* deschidă proiectul înainte de completarea formularului;
* ofere scoruri corecte și argumentate;
* scrie comentarii clare, utile și respectuoase;
* indice atât punctele forte, cât și direcțiile de îmbunătățire;
* evite comentariile superficiale sau ironice.

Autorii proiectelor trebuie să:

* consulte scorurile primite;
* citească feedback-ul;
* identifice aspectele de îmbunătățit;
* actualizeze proiectul pe baza recomandărilor primite.

---

## 21. Posibile dezvoltări viitoare

Proiectul poate fi extins prin:

* autentificare pentru evaluatori;
* limitarea unei singure evaluări per proiect per evaluator;
* export automat al rapoartelor;
* dashboard separat pentru profesor;
* sortare după scor;
* filtrare după nivelul de performanță;
* statistici pe clasă;
* vizualizări grafice ale criteriilor;
* integrare cu Google Classroom;
* rubrică de evaluare descărcabilă în format PDF;
* sistem de badge-uri pentru proiecte.

---

## 22. Mentenanță

Pentru menținerea proiectului:

1. Actualizează periodic `elevi.json`.
2. Verifică funcționarea linkurilor proiectelor.
3. Verifică periodic Apps Script.
4. Verifică dacă Google Sheets primește evaluările.
5. Nu schimba `projectId` după ce au fost colectate evaluări.
6. Păstrează o copie de rezervă a foii Google Sheets.

---

## 23. Autor și coordonare

Proiect coordonat de:

```txt
Tudor Lapp
```

Repository:

```txt
https://github.com/nudoarmetudor/proiecte-html-marinciuc
```

---

## 24. Licență

Acest proiect este publicat sub licența `GPL-3.0`.

Consultați fișierul `LICENSE` pentru detalii.

```
```
