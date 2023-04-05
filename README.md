### How to compile & load

```sh
$ git clone https://github.com/jxr2006/Arknights-Assist.git
$ cd Arknights-Assist/
$ npm install
$ frida -Uf com.hypergryph.arknights.bilibili -l _arknights.js
```

### Development workflow

To continuously recompile on change, keep this running in a terminal:

```sh
$ npm run watch
```

And use an editor like Visual Studio Code for code completion and instant
type-checking feedback.
