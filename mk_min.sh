#!/bin/bash
set -x

cat js/creator_ui.js \
    js/creator_preload.js \
    js/app.js > js/min.creator_web.js

