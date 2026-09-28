# Baut public/data/puzzles.json aus einer Stichprobe der Lichess-Puzzle-Datenbank (CC0).
# Quelle: https://database.lichess.org/#puzzles  (siehe data-src/getpuz.py)
import csv, json, random
random.seed(7)
THEMES = ["fork","pin","skewer","discoveredAttack","doubleCheck","hangingPiece","trappedPiece",
  "deflection","attraction","interference","clearance","xRayAttack","intermezzo","sacrifice",
  "quietMove","defensiveMove","zugzwang","capturingDefender","exposedKing","kingsideAttack",
  "mateIn1","mateIn2","mateIn3","backRankMate","smotheredMate","promotion","advancedPawn",
  "rookEndgame","pawnEndgame","opening"]
BANDS = [(0,1200),(1200,1600),(1600,2000),(2000,3500)]
PER = 40
buckets = {t:[[] for _ in BANDS] for t in THEMES}
with open('data-src/puzzles_sample.csv') as f:
    for r in csv.DictReader(f):
        if int(r['Popularity']) < 85 or int(r['NbPlays']) < 300 or int(r['RatingDeviation']) > 90: continue
        rating = int(r['Rating']); th = r['Themes'].split()
        b = next(i for i,(lo,hi) in enumerate(BANDS) if lo <= rating < hi)
        for t in th:
            if t in buckets and len(buckets[t][b]) < PER*4:
                buckets[t][b].append((r['PuzzleId'], r['FEN'], r['Moves'], rating, [x for x in th if x in buckets]))
puzzles=[]; index={}; out={}
for t in THEMES:
    out[t]=[]
    for b in range(len(BANDS)):
        sel = random.sample(buckets[t][b], min(PER,len(buckets[t][b])))
        ids=[]
        for p in sel:
            if p[0] not in index:
                index[p[0]]=len(puzzles); puzzles.append([p[0],p[1],p[2],p[3],p[4]])
            ids.append(index[p[0]])
        out[t].append(ids)
json.dump({"bands":BANDS,"puzzles":puzzles,"themes":out}, open('public/data/puzzles.json','w'), separators=(',',':'))
print(len(puzzles), {t:[len(x) for x in out[t]] for t in THEMES})
