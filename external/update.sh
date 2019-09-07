#!/bin/sh
set -x

mv -f *.js /tmp/
wget https://unpkg.com/bootstrap/dist/css/bootstrap.min.css
wget https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css
wget https://unpkg.com/vue
wget https://unpkg.com/babel-polyfill@latest/dist/polyfill.min.js
wget https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.js
wget https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
wget https://peterolson.github.io/BigInteger.js/BigInteger.min.js
