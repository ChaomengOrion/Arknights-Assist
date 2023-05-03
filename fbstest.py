import flatbuffers

buf = open('monster.dat', 'rb').read()
buf = bytearray(buf)
monster = example.GetRootAsMonster(buf, 0)