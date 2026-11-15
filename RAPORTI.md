# Raporti i studentit: UrbanBike AI

Studenti: [PLOTËSO: Emri Mbiemri]
Grupi (nëse punohet në grup): [PLOTËSO ose shkruaj "punë individuale"]
Data: [PLOTËSO: data e dorëzimit]
GitHub-i im: [PLOTËSO: URL e repozitorit tënd privat, pas publikimit]
Figma: [PLOTËSO: lidhja Share → Copy link e skedarit tënd Figma]

## Qëllimi

Problemi që zgjidhim: Sa qira biçikletash priten për ditën pasuese në Washington, D.C.? (Sistemi Capital Bikeshare, të dhëna historike 2011–2012.)

Target-i y: `rentals` = numri total i qirave në një ditë (kolona `cnt` e UCI Bike Sharing, e riemërtuar).

Predictorët X:
- Numerikë: `rentals_lag1` (qiratë e djeshme), `rentals_lag7` (qiratë 7 ditë më parë), `rentals_mean7` (mesatarja e 7 ditëve të kaluara, pa ditën aktuale), `temp_c_lag7`, `rain_mm_lag7`, `wind_ms_lag7` (moti NASA 7 ditë më parë), `trend_days` (numri i ditëve nga fillimi i serisë).
- Kategorikë: `weekday`, `month`, `workingday`, `holiday` (kalendari).
- Nuk përdoren `casual`, `registered` dhe `cnt` të ditës së synuar, sepse `casual + registered = cnt` do ta zbulonte përgjigjen (rrjedhje informacioni).

Koha kur parashikojmë dhe çfarë informacioni është i njohur: Parashikojmë në fillim të ditës t. E njohim kalendarin e ditës t, qiratë e ditëve t−1 dhe t−7 dhe motin e ditës t−7. Nuk e njohim numrin real të qirave të ditës t. Supozimi kryesor është se qiratë e ditës së djeshme janë të disponueshme në atë çast. Ky është një simulim historik njëditor, jo një shërbim që ka parashikuar kërkesën reale të sotme.

## Pastrimi

Burimet reale dhe çelësi i bashkimit: UCI Bike Sharing (`data/raw/day.csv`, 731 ditë) dhe NASA POWER (`data/raw/nasa_weather.csv`, 731 ditë; temperatura në °C, reshjet në mm/ditë, era në m/s). Bashkimi bëhet sipas datës (`date`), me kontroll `one_to_one`: çdo datë shfaqet saktësisht një herë në të dyja burimet.

Dallimi mes origjinaleve dhe kopjes didaktike: Skedarët origjinalë nuk kishin mungesa dhe as dublime (0 mungesa te UCI; hash-et përputhen me `provenance.json`) dhe nuk u ndryshuan. Problemet u shtuan qëllimisht vetëm në kopjen e ushtrimit `data/teaching/dirty.csv`, me fara fikse 42: 18 vlera që mungojnë te `temp_c`, 12 te `rain_mm`, 6 tekste "gabim" te `temp_c` dhe 12 rreshta të dublikuar.

Rreshtat para/pas: 743 rreshta në kopjen didaktike, 731 pas pastrimit. Pas krijimit të lag-eve, 7 ditët e para hiqen sepse nuk kanë histori të plotë, kështu që `model_data.csv` ka 724 rreshta.

Dublimet: 12 rreshta identikë u gjetën me `duplicated()` dhe u hoqën me `drop_duplicates()`. Pas heqjes, çdo datë është unike dhe datat ndjekin njëra-tjetrën pa boshllëqe (kontrolluar me `assert`).

Mungesat para/pas konvertimit: Para konvertimit kishte 30 qeliza bosh (18 te `temp_c`, 12 te `rain_mm`), ndërsa 6 vlerat "gabim" ishin tekst. Pas `pd.to_numeric(errors="coerce")`, teksti kthehet në NaN dhe mungesat meteorologjike bëhen 36. Tipet ndryshojnë: `date` kthehet në datë dhe `temp_c` nga tekst në numër me presje dhjetore (float64).

Arsyeja e imputimit vetëm me train: Mungesat plotësohen brenda `Pipeline` me medianën e mësuar vetëm nga periudha train (`SimpleImputer`). Nëse medianën e llogaritnim nga i gjithë dataset-i, informacion nga validation dhe test do të hynte në përgatitje dhe rezultati do të dukej më i mirë se sa është në të vërtetë (rrjedhje informacioni). Një mungesë nuk trajtohet si 0°C, sepse zero është matje reale dhe do ta ndryshonte kuptimin e temperaturës.

## Grafikët

Të gjithë grafikët përdorin vetëm periudhën train (2011-01-08 deri 2012-04-30). Testi nuk përdoret për eksplorim.

Vëzhgimi 1 dhe figura përkatëse (`reports/figures/01_demand.png`): Kërkesa rritet nga fillimi i 2011 (rreth 1000–2000 qira/ditë) drejt verës 2011 (rreth 4000–5000), bie gjatë dimrit 2011–2012 dhe rritet përsëri në pranverën 2012, ku arrin vlera mbi 6000. Ka edhe luhatje të forta ditore rreth mesatares 7-ditore. Kjo tregon sezonalitet dhe një prirje rritëse të përgjithshme, prandaj modeli përdor `month` dhe `trend_days`.

Vëzhgimi 2 dhe figura përkatëse (`reports/figures/03_weather.png`): Temperatura 7 ditë më parë ka lidhje pozitive me qiratë e ditës (korrelacioni në train është 0.54). Lidhja dobësohet mbi rreth 20°C, ku qiratë qëndrojnë kryesisht midis 3500 dhe 5500.

Vëzhgim shtesë (`reports/figures/02_workingday.png`): Mesatarja në ditë pune është 3761 qira dhe në fundjavë/festë 3570 qira. Diferenca është e vogël (rreth 5%), dhe mesatarja nuk përshkruan gjithë shpërndarjen.

Pse një lidhje e dukshme nuk provon shkakësi: Temperatura lidhet edhe me stinën dhe me kohën. Qiratë rriten gjithashtu për shkak të rritjes së sistemit nga viti 2011 në 2012, jo vetëm nga moti. Një faktor i tretë i përbashkët mund ta krijojë lidhjen, dhe një grafik pikash tregon vetëm bashkëlidhje. Për shkakësi nevojitet një dizajn tjetër (p.sh. kontroll për stinën dhe prirjen).

## Vlerësimi

Ndarja kronologjike: train 2011-01-08 – 2012-04-30 (479 ditë), validation 2012-05-01 – 2012-08-31 (123 ditë), test 2012-09-01 – 2012-12-31 (122 ditë). Parashikimi është njëditor, me qiratë e ditëve të kaluara të njohura. Metrikat MAE dhe RMSE maten në qira për ditë.

| Modeli | Validation MAE | Test MAE | Test RMSE | Test R² |
|---|---:|---:|---:|---:|
| Yesterday | 775.203 | 916.402 | 1330.386 | 0.539 |
| DummyMean | 2953.866 | 2494.628 | 2790.064 | -1.027 |
| Ridge | 687.558 | 893.251 | 1252.655 | 0.591 |
| RandomForest | 1821.528 | 1671.499 | 2042.654 | -0.087 |

Modeli i zgjedhur nga validation dhe arsyeja: Ridge (alpha = 10), sepse ka MAE-n më të ulët në validation (687.558) midis dy kandidatëve të Machine Learning (Ridge dhe Random Forest). Zgjedhja u bë me validation, përpara se të interpretohej testi. Ridge është modeli linear me rregullim; në këtë problem ai mëson një lidhje të thjeshtë midis historisë së qirave, motit dhe kalendarit.

Rezultati i provës me Random Forest: Random Forest doli më keq se Ridge dhe më keq edhe se baseline-i "Yesterday" (MAE në test 1671.499 kundrejt 893.251 dhe 916.402). Pra një model më kompleks nuk dha përmirësim në këtë konfigurim. Një shpjegim i mundshëm, që nuk e kemi testuar, është se pemët nuk e vazhdojnë prirjen rritëse që kërkon një periudhë e re. Rezultati dokumentohet siç është.

Interpretimi i gabimit në qira për ditë: Ridge gabon mesatarisht 893 qira në ditë në test, rreth 15.7% e mesatares së testit (5687 qira/ditë). Kundrejt baseline-it "Yesterday" (916 qira) përmirësimi është rreth 2.5%. Kjo është diferencë përshkruese në këtë ndarje dhe nuk provon domethënie statistikore. RMSE (1253) është më i lartë se MAE, që tregon disa gabime shumë të mëdha. Më i madhi ndodh më 2012-10-29, kur qiratë reale ishin 22, ndërsa Ridge parashikoi rreth 5737; edhe 2012-10-30 ka gabim të madh. Këto ditë përputhen me Uraganin Sandy, të përmendur në Readme-n e UCI; modeli nuk e njeh një ngjarje të tillë. R² është 0.591 në test, por vetëm 0.018 në validation, kështu që performanca nuk është e qëndrueshme në çdo periudhë.

Rezultati i klasifikimit, nëse u realizua: Po. Kërkesa quhet e lartë (`E lartë`) kur `rentals` ≥ medianës së train, që është 3907 qira. Pragu mësohet vetëm nga train dhe është rregull mësimor. Testi ka 103 ditë të larta dhe 19 normale.

| Modeli | Accuracy | Balanced accuracy | Macro-F1 |
|---|---:|---:|---:|
| DummyMostFrequent | 84.43% | 50.00% | 0.458 |
| LogisticRegression | 91.80% | 77.98% | 0.820 |

Matrica e konfuzionit e testit për LogisticRegression është [[11, 8], [2, 101]] (`reports/figures/05_confusion.png`): 8 ditë normale u parashikuan të larta dhe 2 ditë të larta u parashikuan normale. Baseline-i merr accuracy 84.43% vetëm sepse thotë gjithmonë "e lartë", pa dalluar asnjë ditë normale (balanced accuracy 50%), prandaj accuracy duhet lexuar bashkë me metrikat tjera.

## Kufizimet

1. Të dhënat vijnë nga një qytet (Washington, D.C.) dhe nga periudha historike 2011–2012; rezultati nuk provon se modeli vlen për qytete të tjera ose për vite të tjera.
2. Moti NASA vjen nga një rrjet meteorologjik (jo nga stacioni i sistemit të qirave) dhe me standard kohor LST. Përdorimi i motit të 7 ditëve më parë (lag7) nuk zgjidh çdo kufizim të të dhënave historike dhe nuk është parashikim meteorologjik.
3. Parashikimi njëditor supozon se qiratë e ditës së djeshme njihen. Aplikacioni është një demonstrim historik për datat e testit dhe nuk është shërbim i testuar për kërkesën e sotme.

## Kontributet individuale

<!-- Plotëso me fjalët e tua, vetëm atë që ke bërë ti vërtet. Shiko udhëzimet e pedagogut për përdorimin e mjeteve të AI-së dhe shkruaj ndershmërisht si u përdorën. -->

| Studenti | Skedari/ekrani | Puna dhe vendimi | Commit/prova |
|---|---|---|---|
| [PLOTËSO] | [p.sh. 03_train.py] | [PLOTËSO] | [PLOTËSO] |
| | | | |
| | | | |

## Burimet

UCI: https://doi.org/10.24432/C5W894
NASA: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
Provenienca lokale: data/raw/provenance.json
