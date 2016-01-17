#!/usr/bin/env bash

set -e

SERVER=files.pharo.org
BASEDIR=/appli/files.pharo.org/books/
SERVER_USER=filepharosync
TMP_DIR='~cassou/books-website'

ssh $SERVER sh <<EOF
sudo su --login --command "mkdir -p \"$BASEDIR\"" "$SERVER_USER"
rm -rf $TMP_DIR
mkdir $TMP_DIR
EOF

echo Pushing all files to $SERVER
scp -r * $SERVER:$TMP_DIR

ssh $SERVER sh <<EOF
sudo su --login --command "cp -R $TMP_DIR/* $BASEDIR" $SERVER_USER
EOF
