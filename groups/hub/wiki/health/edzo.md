---
tags: [edzes, taplakozas, alvas, rekompozicio]
status: active
last-updated: 2026-05-06
---

# Edző — Edzésterv & Protokollok

Tomi rekompozíciós programja: Upper/Lower split otthoni eszközökkel (kézisúlyzó + szalag), 45–60 perces edzések, RPE-alapú progresszió. Fő cél: **95 → 85 kg**, jelenlegi kiemelt mérföldkő **90 kg**.

## Heti beosztás
- **H** Upper A (nyomó) · **K** Lower A (guggolás) · **Sze** kardió 30–40p (130 BPM) · **Cs** Upper B (húzó) · **P** Lower B (csípő) · **Szo** kardió · **V** pihenő
- Bemelegítés minden edzésnap: 10p szobabicikli (130 BPM) + 5p dinamikus mobilizáció

## Edzésblokkok (vázlat — részletek a forrásban)
- **Upper A**: Floor Press, vállnyomás, 1-kar evezés, oldalemelés, fekvőtámasz AMRAP, tricepsz kickback, Pallof press
- **Lower A**: Goblet guggolás, RDL, Bolgár guggolás, szalagos hip thrust, vádli, plank
- **Upper B**: 2-kar evezés, szűk Floor Press, Arnold press, bicepsz curl, face pull, pull-apart, farmer's walk
- **Lower B**: 1-lábas RDL, sumo guggolás, step-up, lying leg curl, ülő vádli, dead bug

Progresszió: ha minden szettben felső rep-tartomány előírt RPE-vel megvan → +1–2 kg. Szalagnál vastagabb szalag / dupla hurok.

## Táplálkozás (rekomp)
- **1800 kcal/nap** — *FELSŐ HATÁR, nem alsó* (Tomi hajlamos túlenni → ez a stagnálás fő oka)
- Fehérje **180 g** (1.87 g/ttkg), zsír **65 g**, szénhidrát **125 g** (edzés körül; pihenőnapon 80–100 g), rost 30–35 g
- Tracking: **Foodvisor** — minden étkezés logolva, "amit nem mér, nem létezik"

## Napi rutin
- 07:00 Withings mérlegelés (auto szinkron)
- 18:00 edzés
- 19:00 hideg fürdő/zuhany
- 21:00 Foodvisor logolás
- Heti check-in: hétfő 09:00

## Hideg fürdő — alvási apnoe protokoll ⭐
A projekt legfontosabb adatalapú felfedezése:
- **Forró fürdő** után: AHI ~33–35, REM 1–2h (garatizmok ellazulnak → kollapszus)
- **Hideg fürdő** után: AHI ~17–25, REM 2–3h+ → **~32% AHI javulás**
- Eddigi legjobb: AHI **16.9**, REM **3h08m** (2026-02-22)

Szoktatás (napi 19:00): 1. hét 30 mp hideg zuhany → 2. hét 1p → 3. hét 2p → 4. hét 2–3p kádban 15–18°C. (Tomi első alkalommal 2 percet bírt kádban.)

## MAD (Mandibular Advancement Device)
Régi fogorvosi MAD nem tartja az alsó fogat. Alternatíva: **SleepPro Custom AM** (UK labor, £80–150, NHS jóváhagyott). Státusz: még nem történt lépés → érdemes időnként rákérdezni.

## Withings toolok (gyors referencia)
| Tool | Mikor |
|------|-------|
| `get_weight_and_body` | súly, testzsír%, izom, hidráció |
| `get_sleep` / `get_sleep_details` | AHI, REM/deep/light, horkolás |
| `get_activity` / `get_workouts` | lépések, edzésadat |
| `get_weight_trend` | heti súlyátlag-trend |

## Mérföldkövek
95 kg → 92 kg → **90 kg (kiemelt)** → 87 kg → **85 kg (CÉL)**

---
Forrás: `sources/edzo/context.md`
