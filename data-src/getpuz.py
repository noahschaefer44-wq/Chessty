import zstandard, urllib.request, io, sys
url='https://database.lichess.org/lichess_db_puzzle.csv.zst'
r=urllib.request.urlopen(url)
d=zstandard.ZstdDecompressor().stream_reader(r)
t=io.TextIOWrapper(d,encoding='utf-8')
out=open('puzzles_sample.csv','w')
n=0
for line in t:
    out.write(line); n+=1
    if n>=600000: break
print(n)
