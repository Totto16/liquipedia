[comment]: <> "LTeX: language=en"
# Liquipedia Scripts


## ViolentMonkey / GreaseMonkey Script

### Usage

To use the ViolentMonkey (VM) or GreaseMonkey (GM) script follow these steps:

Install 
[ViolentMonkey](https://violentmonkey.github.io/#installation)

If you already have GreaseMonkey installed, it's also fine, I support it too, but haven't tested it, please submit an issue or PR if something isn't working on GM.


Clikc on [this](https://github.com/Totto16/liquipedia/raw/main/liquipedia.user.js) link and install it in the install wizard, you can look at the build source code [here](https://github.com/Totto16/liquipedia/blob/main/liquipedia.user.js)


### Develop

You need [node.js](https://nodejs.org/en) >=18.2.0 (even if smaller versions are supported, it's not recommended)

than run

```bash
npm install
npm run dev
```

and you're ready to develop the script, teh source code is located in 'src/'



## Backend C++ Script

### Usage

When it's finished I likely will provide executables, use those

Otherwise refer to the Develop section and build the executable yourself


### Develop

You need [meson](https://mesonbuild.com/Quick-guide.html#installation-using-python) installed and a C++23 compiler, if you're on windows good luck with MSVC xD, otherwise just use the package manager to install the latest clang or gcc.

To build the app run

```bash
meson setup build
meson compile -C build
./build/combinatorics # to run the executable
```
