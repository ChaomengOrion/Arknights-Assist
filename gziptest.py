import gzip
with open('D:/screen.raw1.gzip', 'rb') as f:
    bt = gzip.decompress(f.read())
with open('D:/screen.raw1.dep', 'wb') as f:
    f.write(bt)