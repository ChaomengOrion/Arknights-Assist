s = r'''{}    ___    __              _       __    __      {}
{}   /   |  / /___________  (_)___ _/ /_  / /______{}
{}  / /| | / //_/ ___/ __ \/ / __ `/ __ \/ __/ ___/{}
{} / ___ |/ ,< / /  / / / / / /_/ / / / / /_(__  ) {}
{}/_/  |_/_/|_/_/  /_/ /_/_/\__, /_/ /_/\__/____/  {}
{}                         /____/                  {}
''''''\033[1;30m-------------------------------------------------\033[m
\033[1;32mArknights Assist Script V2.0.6\033[m \033[4;32m(For Arknights v2.4.01 | Tested on Frida v16.5.6 | Last modified on 2024-11-09)\033[m
\033[1;33mAuthored by ChaomengOrion\033[m'''.format('\033[36m', '\033[m', '\033[36m', '\033[m', '\033[1;36m', '\033[m', '\033[1;36m', '\033[m', '\033[1;34m', '\033[m', '\033[34m', '\033[m')
import base64, re
b = base64.b64encode(s.encode('utf-8'))
print(base64.b64decode(b).decode('utf-8'))
print(b.decode())
#with open('agent/main.ts', 'rt', encoding='utf-8') as f:
#    sc = re.sub('const title = \'.*?\'', 'const title = \'{}\''.format(b.decode()), f.read())
#with open('agent/main.ts', 'wt', encoding='utf-8') as f:
#    f.write(sc)