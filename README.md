# Frida-Assist-Script
> 高一时写的，仅自用
## Some function samples
- 显示单位具体血量（默认对除了类型为`Character`和`Token`以外的所有场上单位生效）
![显示血量](pics/0.png)

- 键盘按下`Z`键，同时点击敌方单位查看该敌方单位的属性面板，并显示一次该敌人的路线（避免自己初见老是忘记路线QAQ
![属性面板1](pics/1.png)
![属性面板2](pics/1_1.png)

- 键盘暂停支持，通过键盘X键作为控制键，分别可以实现
>1. 按下第一次暂停，按下第二次继续
>2. 按下时游戏暂停，松开时游戏继续
>3. 松开时游戏暂停，按下时游戏继续
>4. 每次按下运行一帧（按`Update`计算）
>5. 每次按下运行两帧（按`Update`计算）

- 显示战斗时间轴
![时间轴](pics/2.png)

- 解锁120帧or更高（默认关闭）

- 战斗中解锁3倍速或更高【高风险】（默认关闭）

- 给场景添加一些没啥用的后处理（默认关闭）

- 转发游戏内http流量（默认关闭）

## How to compile & load

```sh
$ git clone https://github.com/ChaomengCFX/Arknights-Assist.git
$ cd Arknights-Assist/
$ npm install

$ frida -Uf com.hypergryph.arknights.bilibili -l _arknights.js

$ frida -Uf com.hypergryph.arknights -l _arknights.js
```

## Development workflow

To continuously recompile on change, keep this running in a terminal:

```sh
$ npm run watch
```

And use an editor like Visual Studio Code for code completion and instant
type-checking feedback.
