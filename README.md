# SlowDowner
music web player with slowdown option

## System Dependendies
### Ubuntu/Debian (apt)
TODO

### NixOS
If you have the nix package manager or are running NixOS you can install all dependencies with 
``` nix-shell ``` 
(This will try to start zsh in the end. Comment the line out if you use bash)

## Dependencies
### Yarn
This project uses Yarn as package manager, to install all needed dependencies run
``` yarn install ```
in the project directory

### Building
To build the static files run
```yarn run build```
this will create the folder ```dist``` with all static files.
then you can run 
```yarn run start```
to run the server locally 
or use the provided Dockerfile to create a dockerimage like this
```docker build -t slowdowner:v3```
for example

### Development
to run the test server locally run
``` yarn run start ```
and in another terminal
``` yarn run dev ```
