with import <nixpkgs> {};
with pkgs.yarn;

stdenv.mkDerivation {
  name = "yarn";
  buildInputs = [
    nodejs-10_x
    (yarn.override { nodejs = nodejs-10_x; })
    mozjpeg
    optipng
    autoconf
    automake];
  src = null;
  shellHook = ''
    unset http_proxy
    export GIT_SSL_CAINFO=/etc/ssl/certs/ca-bundle.crt
    SOURCE_DATE_EPOCH=$(date +%s)
    zsh
  '';
}

