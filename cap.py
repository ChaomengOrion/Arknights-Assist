import subprocess, time, gzip, rich
from PIL import Image
from io import BytesIO

mode = 'gzip-raw'

logger = rich.get_console()
logger.log(f'Mode: [green]{mode}[/green]')

ip = '192.168.2.3:5555'
#ip = '127.0.0.1:7555'

match mode:
    case 'gzip-encode':
        cmd = f'adb -s {ip} exec-out \"screencap -p | gzip -1\"'
    case 'encode':
        cmd = f'adb -s {ip} exec-out \"screencap -p\"'
    case 'raw':
        cmd = f'adb -s {ip} exec-out \"screencap\"'
    case 'gzip-raw':
        cmd = f'adb -s {ip} exec-out \"screencap | gzip -1\"'

logger.log(f'Cmd: [blue]{cmd}[/blue]')

start = time.perf_counter()

p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

match mode:
    case 'gzip-encode':
        bt = gzip.decompress(p.stdout.read())
    case 'encode':
        bt = p.stdout.read()
    case 'raw':
        raw = p.stdout.read()
        bt = raw
        img = Image.frombuffer('RGBA', (int.from_bytes(raw[:4], 'little'), int.from_bytes(raw[4:8], 'little')), raw[16:], 'raw', 'RGBA', 0, 1)
        bytesIO = BytesIO()
        img.save(bytesIO, format='PNG')
        bt = bytesIO.getvalue()
        #import matplotlib.pyplot as plt
        #plt.imshow(img)
        #plt.show()
    case 'gzip-raw':
        bt = p.stdout.read()
        raw = gzip.decompress(bt)
        img = Image.frombuffer('RGBA', (int.from_bytes(raw[:4], 'little'), int.from_bytes(raw[4:8], 'little')), raw[16:], 'raw', 'RGBA', 0, 1)
        bytesIO = BytesIO()
        img.save(bytesIO, format='PNG')
        bt = bytesIO.getvalue()
        #import matplotlib.pyplot as plt
        #plt.imshow(img)
        #plt.show()

# 获取结束时间
end = time.perf_counter()
# 计算运行时间
runTime = end - start
runTime_ms = runTime * 1000
# 输出运行时间
logger.log("运行时间：", runTime, "秒")
logger.log("运行时间：", runTime_ms, "毫秒")

with open('D:/screen.png', 'wb') as f:
    f.write(bt)