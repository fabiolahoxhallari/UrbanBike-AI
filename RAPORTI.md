# RAPORTI PËRFUNDIMTAR I PROJEKTIT
# URBANBIKE AI
### Parashikimi i kërkesës ditore për biçikleta me Inteligjencë Artificiale

**UNIVERSITETI POLIS**

**Lënda:** Inteligjenca Artificiale

**Pedagogu:** Prof. Asst. Dr. Sc. Besart Hyseni

**Studentja:** Fabiola Hoxhallari

**Forma e realizimit:** Punë individuale

**Viti akademik:** 2026–2027

**Data:** 15.11.2026

**GitHub:** https://github.com/fabiolahoxhallari/UrbanBike-AI

**Figma:** https://www.figma.com/make/accrfVOHPwpXQgrudI3nQ4/UrbanBike-AI-Dashboard

---

## 1. HYRJE

Inteligjenca Artificiale (AI) dhe Machine Learning po përdoren gjithnjë e më shumë për analizimin e të dhënave historike dhe parashikimin e situatave të ardhshme. Një ndër fushat ku këto teknologji mund të japin rezultate të dobishme është transporti urban, veçanërisht sistemet e marrjes me qira të biçikletave.

Projekti **UrbanBike AI** është një aplikacion demonstrues që përdor të dhëna historike për të parashikuar numrin e qirave të biçikletave gjatë një dite të caktuar në Washington, D.C., SHBA.

Projekti bazohet në të dhënat e sistemit Capital Bikeshare për periudhën 2011–2012, të kombinuara me informacione meteorologjike nga NASA POWER.

Nëpërmjet përpunimit të të dhënave, analizës eksploruese, trajnimit të algoritmeve të Machine Learning dhe zhvillimit të një ndërfaqeje grafike, projekti demonstron procesin e ndërtimit të një sistemi parashikues.

UrbanBike AI ka karakter akademik dhe demonstrues. Ai nuk është një shërbim i testuar për parashikimin e kërkesës aktuale në kohë reale.

## 2. QËLLIMI DHE OBJEKTIVAT

### 2.1 Qëllimi kryesor

Qëllimi kryesor është zhvillimi dhe testimi i një modeli të Inteligjencës Artificiale që parashikon kërkesën ditore për biçikleta, duke përdorur historikun e qirave, karakteristikat kalendarike dhe të dhënat meteorologjike.

Pyetja kryesore e projektit është:

**Sa qira biçikletash priten për një ditë të caktuar, duke u bazuar në informacionin e disponueshëm përpara fillimit të saj?**

### 2.2 Objektivat specifike

- Grumbullimi dhe integrimi i të dhënave nga burime të besueshme.
- Pastrimi dhe përgatitja e të dhënave për analizë.
- Identifikimi i tendencave dhe faktorëve të lidhur me kërkesën.
- Ndërtimi dhe krahasimi i modeleve parashikuese.
- Vlerësimi i performancës me metrika statistikore.
- Realizimi i një detyre shtesë klasifikimi.
- Krijimi i një ndërfaqeje grafike për paraqitjen e rezultateve.
- Dokumentimi i metodologjisë, kufizimeve dhe kontributit individual.

## 3. TEKNOLOGJITË E PËRDORURA

Projekti kombinon teknologji për analizën e të dhënave, Machine Learning, zhvillimin e aplikacioneve dhe menaxhimin e kodit.

| Teknologjia | Përdorimi |
|---|---|
| Python | Përpunimi i të dhënave dhe ekzekutimi i modeleve |
| pandas | Leximi, bashkimi dhe pastrimi i të dhënave |
| NumPy | Operacione numerike |
| Matplotlib | Vizualizimi i rezultateve |
| scikit-learn | Trajnimi dhe vlerësimi i modeleve |
| Visual Studio Code | Mjedisi i zhvillimit |
| React dhe TypeScript | Ndërtimi i ndërfaqes |
| Vite | Ekzekutimi lokal i frontend-it |
| Figma Make | Konceptimi dhe gjenerimi i ndërfaqes |
| Git dhe GitHub | Versionimi dhe publikimi i kodit |

Arkitektura e aplikacionit përfshin një pjesë backend në Python dhe një pjesë frontend në React. Komunikimi realizohet përmes kërkesave HTTP drejt API-së së aplikacionit.

## 4. BURIMET E TË DHËNAVE

### 4.1 UCI Bike Sharing Dataset

Burimi kryesor është **Bike Sharing Dataset**, i publikuar në UCI Machine Learning Repository.

Ai përmban të dhëna historike për numrin e biçikletave të marra me qira në sistemin Capital Bikeshare në Washington, D.C., gjatë viteve 2011 dhe 2012.

Në projekt përdoret skedari `day.csv`, me 731 regjistrime ditore.

Variabla që synohet të parashikohet është:

`rentals = cnt`

Kjo përfaqëson numrin total të qirave të biçikletave gjatë një dite.

### 4.2 NASA POWER

Burimi i dytë është NASA POWER, i përdorur për të dhënat meteorologjike.

Informacionet përfshijnë temperaturën, reshjet dhe shpejtësinë e erës.

Të dhënat meteorologjike ruhen në skedarin:

`data/raw/nasa_weather.csv`

### 4.3 Integrimi i burimeve

Të dyja burimet përmbajnë nga 731 regjistrime ditore dhe bashkohen sipas datës.

Për bashkimin përdoret një kontroll i marrëdhënies `one_to_one`, për të garantuar që çdo datë përfaqësohet vetëm një herë në secilin burim.

Skedarët origjinalë ruhen të pandryshuar, duke mundësuar gjurmueshmërinë e të dhënave.

## 5. PËRCAKTIMI I VARIABLAVE

### 5.1 Variabla e synuar

Variabla e varur është `rentals`, numri total i qirave ditore.

Detyra kryesore përbën një problem **regresioni**, sepse rezultati është një vlerë numerike.

### 5.2 Variablat parashikuese

Variablat numerike:

- `rentals_lag1` – qiratë e ditës së mëparshme.
- `rentals_lag7` – qiratë shtatë ditë më parë.
- `rentals_mean7` – mesatarja e shtatë ditëve të mëparshme.
- `temp_c_lag7` – temperatura shtatë ditë më parë.
- `rain_mm_lag7` – reshjet shtatë ditë më parë.
- `wind_ms_lag7` – shpejtësia e erës shtatë ditë më parë.
- `trend_days` – numri i ditëve nga fillimi i periudhës së analizuar.

Variablat kategorike:

- `weekday` – dita e javës.
- `month` – muaji.
- `workingday` – tregues i ditës së punës.
- `holiday` – tregues i ditës së festës.

### 5.3 Parandalimi i rrjedhjes së informacionit

Kolonat `casual`, `registered` dhe `cnt` të ditës që parashikohet nuk përdoren si variabla hyrëse.

Arsyeja është se shuma e përdoruesve rastësorë dhe atyre të regjistruar është e barabartë me numrin total të qirave. Përdorimi i tyre do t'i jepte modelit informacionin që duhet të parashikojë.

Modeli supozon se në fillim të ditës së synuar janë të njohura qiratë e ditëve të mëparshme dhe karakteristikat kalendarike.

## 6. PASTRIMI DHE PËRGATITJA E TË DHËNAVE

Pastrimi është një fazë e rëndësishme, sepse cilësia e të dhënave ndikon drejtpërdrejt në performancën e modelit.

### 6.1 Krijimi i kopjes didaktike

Të dhënat origjinale nuk përmbanin mungesa apo dublime. Për të demonstruar procesin e pastrimit, u krijua një kopje didaktike me probleme të shtuara qëllimisht.

Në këtë kopje u shtuan:

- 18 mungesa në temperaturë.
- 12 mungesa në reshje.
- 6 vlera tekstuale të pavlefshme në temperaturë.
- 12 rreshta të dublikuar.

Për riprodhueshmëri u përdor fara fikse 42.

### 6.2 Heqja e dublimeve

Kopja didaktike kishte fillimisht 743 rreshta.

Dublimet u identifikuan me `duplicated()` dhe u hoqën me `drop_duplicates()`.

Pas këtij procesi mbetën 731 rreshta unikë.

### 6.3 Trajtimi i mungesave

Fillimisht kishte 30 qeliza bosh në variablat meteorologjike.

Pas konvertimit të vlerave tekstuale të pavlefshme në `NaN`, numri i mungesave u rrit në 36.

Vlerat që mungonin u trajtuan nëpërmjet `SimpleImputer`, duke përdorur medianën e mësuar vetëm nga të dhënat e trajnimit.

Kjo metodë shmang përdorimin e informacionit nga periudhat e validimit dhe testimit gjatë përgatitjes së modelit.

### 6.4 Krijimi i variablave historike

Për të mundësuar parashikimin, u krijuan variabla që përfaqësojnë informacionin e ditëve të mëparshme.

Për shkak të nevojës për histori shtatëditore, shtatë regjistrimet e para nuk mund të përdoren për modelim.

Dataset-i përfundimtar `model_data.csv` përmban **724 rreshta**.

## 7. ANALIZA EKSPLORUESE DHE VIZUALIZIMI

Analiza eksploruese u realizua vetëm mbi periudhën e trajnimit, për të shmangur ndikimin e të dhënave të testimit në vendimet e modelimit.

### 7.1 Evolucioni i kërkesës

Grafiku `01_demand.png` tregon se kërkesa për biçikleta ndryshon sipas periudhës së vitit.

Në fillim të vitit 2011, kërkesa ishte rreth 1000–2000 qira në ditë. Gjatë verës u rrit në rreth 4000–5000 qira, ndërsa në dimër pati rënie.

Në pranverën e vitit 2012 u regjistruan përsëri rritje, në disa raste mbi 6000 qira ditore.

Ky vëzhgim sugjeron praninë e sezonalitetit dhe të një tendence të përgjithshme rritëse.

### 7.2 Ndikimi i temperaturës

Grafiku `03_weather.png` paraqet lidhjen ndërmjet temperaturës së shtatë ditëve më parë dhe numrit të qirave.

Korrelacioni në periudhën e trajnimit është rreth **0.54**, duke treguar një lidhje pozitive mes këtyre variablave.

Megjithatë, kjo lidhje nuk provon se temperatura është shkaku i drejtpërdrejtë i ndryshimeve në kërkesë. Faktorë si stina dhe zhvillimi i sistemit të biçikletave mund të ndikojnë gjithashtu.

### 7.3 Ditët e punës dhe ditët e pushimit

Grafiku `02_workingday.png` paraqet krahasimin e kërkesës sipas llojit të ditës.

Mesatarja e qirave është:

- Ditë pune: 3761 qira.
- Fundjavë ose festë: 3570 qira.

Diferenca është afërsisht 5%, çka tregon se lloji i ditës ka një lidhje me kërkesën, por nuk e shpjegon i vetëm ndryshueshmërinë e saj.

## 8. NDARJA E TË DHËNAVE

Për shkak se të dhënat kanë renditje kohore, ndarja u realizua në mënyrë kronologjike.

| Periudha | Intervali | Regjistrime |
|---|---|---:|
| Train | 08.01.2011 – 30.04.2012 | 479 |
| Validation | 01.05.2012 – 31.08.2012 | 123 |
| Test | 01.09.2012 – 31.12.2012 | 122 |

Periudha train përdoret për mësimin e parametrave të modelit.

Periudha validation përdoret për krahasimin dhe përzgjedhjen e modelit.

Periudha test përdoret për vlerësimin përfundimtar mbi të dhëna të papërdorura gjatë trajnimit.

Kjo ndarje është më e përshtatshme për parashikimin kohor sesa një ndarje e rastësishme e regjistrimeve.

## 9. MODELET E MACHINE LEARNING

### 9.1 Modelet krahasuese

Për të vlerësuar performancën, u përdorën katër modele:

**Yesterday:** parashikon që kërkesa e ditës së synuar do të jetë e barabartë me kërkesën e ditës së mëparshme.

**DummyMean:** përdor një parashikim konstant të bazuar në mesataren e trajnimit.

**Ridge Regression:** model linear me rregullim, që mëson marrëdhënien ndërmjet variablave hyrëse dhe kërkesës ditore.

**Random Forest:** model që kombinon disa pemë vendimmarrjeje për të prodhuar parashikime.

### 9.2 Rezultatet e regresionit

| Modeli | Validation MAE | Test MAE | Test RMSE | Test R² |
|---|---:|---:|---:|---:|
| Yesterday | 775.203 | 916.402 | 1330.386 | 0.539 |
| DummyMean | 2953.866 | 2494.628 | 2790.064 | -1.027 |
| Ridge | 687.558 | 893.251 | 1252.655 | 0.591 |
| Random Forest | 1821.528 | 1671.499 | 2042.654 | -0.087 |

### 9.3 Përzgjedhja e modelit

Modeli i përzgjedhur është **Ridge Regression**, me parametrin `alpha = 10`.

Ai arriti MAE më të ulët në validation ndërmjet dy modeleve të Machine Learning.

Në periudhën test, Ridge arriti:

- MAE: 893.251 qira në ditë.
- RMSE: 1252.655 qira në ditë.
- R²: 0.591.

Krahasuar me modelin Yesterday, Ridge e uli MAE në test me rreth 2.5%.

Ky është një përmirësim relativisht i vogël, ndaj rezultatet duhet të interpretohen me kujdes.

### 9.4 Interpretimi i gabimit

Vlera MAE prej rreth 893 tregon se, në periudhën test, diferenca absolute ndërmjet parashikimit dhe kërkesës reale ishte mesatarisht 893 qira në ditë.

RMSE më i lartë tregon praninë e disa gabimeve veçanërisht të mëdha.

Një rast domethënës ndodhi më 29 tetor 2012, kur numri real i qirave ishte vetëm 22, ndërsa modeli parashikoi rreth 5737.

Kjo periudhë përkon me Uraganin Sandy, një ngjarje ekstreme që nuk përfaqësohet në mënyrë të mjaftueshme nga variablat hyrëse të modelit.

Rezultati tregon se modeli mund të ketë vështirësi në situata të pazakonta.

Gjithashtu, R² prej 0.018 në validation, krahasuar me 0.591 në test, tregon se performanca nuk është e qëndrueshme në të gjitha periudhat.

## 10. KLASIFIKIMI I KËRKESËS

Përveç regresionit, projekti përfshin një detyrë klasifikimi binar.

Qëllimi është të përcaktohet nëse kërkesa për biçikleta është normale apo e lartë.

Pragu është përcaktuar sipas medianës së periudhës train:

**Kërkesë e lartë: rentals ≥ 3907.**

Në periudhën test, 103 ditë klasifikohen si ditë me kërkesë të lartë dhe 19 si ditë normale.

### 10.1 Modelet e përdorura

- DummyMostFrequent.
- Logistic Regression.

### 10.2 Rezultatet e klasifikimit

| Modeli | Accuracy | Balanced Accuracy | Macro-F1 |
|---|---:|---:|---:|
| DummyMostFrequent | 84.43% | 50.00% | 0.458 |
| Logistic Regression | 91.80% | 77.98% | 0.820 |

Modeli Logistic Regression arriti performancë më të mirë në metrikat e vlerësimit.

Matrica e konfuzionit për testin është:

`[[11, 8], [2, 101]]`

Kjo tregon se modeli klasifikoi gabimisht tetë ditë normale si ditë me kërkesë të lartë dhe dy ditë me kërkesë të lartë si ditë normale.

Rezultati demonstron rëndësinë e përdorimit të disa metrikave, pasi accuracy e lartë nuk garanton domosdoshmërisht performancë të balancuar ndërmjet klasave.

## 11. ZHVILLIMI I APLIKACIONIT URBANBIKE AI

### 11.1 Struktura e sistemit

Aplikacioni përbëhet nga dy pjesë kryesore:

**Backend:** implementuar në Python, përgjegjës për komunikimin me modelin e trajnuar, përpunimin e kërkesave dhe kthimin e rezultateve.

**Frontend:** implementuar me React dhe TypeScript, përgjegjës për ndërfaqen grafike dhe paraqitjen e informacionit.

### 11.2 Ndërfaqja grafike

Koncepti vizual i aplikacionit është realizuar me Figma Make dhe është integruar në projektin lokal.

Ndërfaqja synon të paraqesë informacionin në mënyrë të kuptueshme, duke përfshirë përzgjedhjen e datës, rezultatet e parashikimit dhe vizualizimet përkatëse.

Dizajni përdor një stil modern dashboard-i, me elemente vizuale të organizuara për të lehtësuar interpretimin e rezultateve.

### 11.3 Integrimi i frontend-it me backend-in

Gjatë integrimit, aplikacioni frontend komunikon me API-në Python përmes kërkesave HTTP.

Në mjedisin lokal, backend-i përdor adresën:

`http://127.0.0.1:8001`

Ndërsa frontend-i ekzekutohet përmes Vite në:

`http://127.0.0.1:5173`

Gjatë testimit u identifikua një problem komunikimi kur backend-i nuk ishte aktiv njëkohësisht me frontend-in.

Problemi u zgjidh duke ekzekutuar të dy serverët paralelisht dhe duke verifikuar komunikimin me API-në.

### 11.4 Demonstrimi i parashikimit

Për datën 01.09.2012, rezultatet e provës së modelit përfshijnë:

| Treguesi | Vlera |
|---|---:|
| Data | 01.09.2012 |
| Parashikimi Ridge | 6834.73 |
| Qiratë reale | 6140 |
| Gabimi absolut | 694.73 |

Ky shembull demonstron mënyrën se si parashikimi mund të krahasohet me një vlerë reale historike.

## 12. TESTIMI DHE VERIFIKIMI

Gjatë punës me projektin u kryen kontrolle për funksionimin e mjedisit lokal dhe integrimin e komponentëve.

Testimi përfshiu:

- Ekzekutimin e backend-it Python.
- Kontrollin e përgjigjes së API-së.
- Ekzekutimin e frontend-it React.
- Verifikimin e komunikimit ndërmjet komponentëve.
- Kontrollin e shfaqjes së ndërfaqes.
- Testimin e parashikimit për një datë historike.
- Ekzekutimin e testeve të integrimit.

Testet e integrimit raportuan përfundim me sukses në mjedisin lokal.

Ky verifikim nuk zëvendëson testimin e plotë të sistemit në një mjedis publik prodhimi.

## 13. KUFIZIMET E PROJEKTIT

Megjithëse UrbanBike AI demonstron përdorimin e Machine Learning për parashikimin e kërkesës, ai ka disa kufizime.

**Kufizimi gjeografik:** të dhënat i përkasin vetëm Washington, D.C. Rezultatet nuk mund të përgjithësohen automatikisht në qytete të tjera.

**Kufizimi kohor:** dataset-i përfshin vitet 2011–2012 dhe nuk pasqyron domosdoshmërisht sjelljen aktuale të përdoruesve.

**Kufizimi meteorologjik:** modeli përdor të dhëna historike të motit dhe jo një parashikim të drejtpërdrejtë meteorologjik për ditën e synuar.

**Ngjarjet e jashtëzakonshme:** situata si uraganet, ndërprerjet e shërbimit apo ngjarjet e mëdha publike mund të ndikojnë ndjeshëm në kërkesë pa u përfaqësuar nga variablat e modelit.

**Performanca:** përmirësimi i Ridge kundrejt baseline-it Yesterday është relativisht i vogël dhe performanca ndryshon sipas periudhës.

**Mjedisi i ekzekutimit:** aplikacioni është testuar lokalisht dhe nuk përbën një sistem prodhimi të publikuar online.

## 14. KONTRIBUTI INDIVIDUAL

Kontributi im në projekt u përqendrua te organizimi i mjedisit të zhvillimit, konfigurimi i mjeteve, integrimi i komponentëve, testimi i aplikacionit dhe publikimi i projektit në GitHub.

Gjatë punës përdora Visual Studio Code për të hapur dhe menaxhuar strukturën e projektit, si dhe terminalin PowerShell për të ekzekutuar komandat e nevojshme.

Në pjesën e ndërfaqes grafike përdora Figma Make për krijimin e konceptit vizual dhe punova me projektin e integruar React.

Një nga problemet teknike të hasura ishte komunikimi ndërmjet frontend-it dhe backend-it. Nëpërmjet kontrollit të mesazheve të gabimit dhe ekzekutimit të serverëve paralelisht, verifikova funksionimin e aplikacionit në mjedisin lokal.

Gjithashtu, instalova dhe konfigurova Git, inicializova repository-n lokal, realizova commit-in fillestar dhe publikova skedarët e projektit në GitHub.

| Komponenti | Kontributi | Prova |
|---|---|---|
| VS Code | Organizimi dhe konfigurimi i mjedisit lokal | Struktura e projektit |
| Figma Make | Koncepti vizual i dashboard-it | Linku Figma |
| Frontend / Backend | Integrimi dhe testimi i komunikimit | Aplikacioni lokal |
| API Python | Verifikimi i përgjigjes së serverit | `/api/health` |
| Testimi | Ekzekutimi dhe kontrolli i testeve të integrimit | `test_integration.py` |
| GitHub | Versionimi dhe publikimi i projektit | Commit-i fillestar |

### 14.1 Përdorimi i mjeteve të Inteligjencës Artificiale

Gjatë realizimit të projektit u përdorën mjete gjeneruese të Inteligjencës Artificiale, përfshirë Claude dhe ChatGPT, për asistencë në përgatitjen dhe integrimin e kodit, interpretimin e gabimeve teknike dhe shpjegimin e hapave të konfigurimit.

Figma Make u përdor për gjenerimin e konceptit vizual dhe elementeve të ndërfaqes.

Përdorimi i këtyre mjeteve shërbeu si mbështetje në procesin e zhvillimit. Kodi dhe komponentët e gjeneruar me AI nuk paraqiten si të shkruar tërësisht në mënyrë manuale.

Kontributi im praktik përfshiu konfigurimin e mjedisit, zbatimin e hapave të integrimit, ekzekutimin dhe testimin e aplikacionit, zgjidhjen e problemeve të konfigurimit dhe publikimin e rezultatit.

## 15. PËRFUNDIME

Projekti UrbanBike AI demonstron një proces të plotë akademik të përdorimit të Inteligjencës Artificiale për analizimin dhe parashikimin e kërkesës për biçikleta.

Nga analiza e të dhënave u identifikuan lidhje ndërmjet kërkesës, sezonalitetit, historikut të qirave dhe karakteristikave meteorologjike.

Në krahasimin e modeleve të regresionit, Ridge Regression dha rezultatet më të mira ndërmjet modeleve të Machine Learning të testuara, me MAE prej 893.251 qira në ditë dhe R² prej 0.591 në periudhën test.

Në detyrën e klasifikimit, Logistic Regression arriti accuracy prej 91.80% dhe Macro-F1 prej 0.820.

Rezultatet tregojnë se algoritmet e Machine Learning mund të identifikojnë marrëdhënie të dobishme në të dhënat historike, por gjithashtu evidentojnë vështirësi në rastin e ngjarjeve ekstreme dhe ndryshimeve kohore.

Integrimi i modelit me një ndërfaqe grafike e bën projektin më të kuptueshëm dhe demonstron mënyrën se si një analizë e të dhënave mund të paraqitet në formën e një aplikacioni interaktiv.

Në përfundim, UrbanBike AI përfaqëson një projekt mësimor që lidh përpunimin e të dhënave, Machine Learning, zhvillimin e aplikacioneve dhe dokumentimin teknik.

## 16. BURIMET DHE REFERENCAT

**UCI Machine Learning Repository – Bike Sharing Dataset**

https://doi.org/10.24432/C5W894

**NASA POWER – Daily API Documentation**

https://power.larc.nasa.gov/docs/services/api/temporal/daily/

**Dokumentacioni i proveniencës së të dhënave**

`data/raw/provenance.json`

**Repository i projektit në GitHub**

https://github.com/fabiolahoxhallari/UrbanBike-AI

**Koncepti grafik në Figma Make**

https://www.figma.com/make/accrfVOHPwpXQgrudI3nQ4/UrbanBike-AI-Dashboard

---

**FUND I RAPORTIT**