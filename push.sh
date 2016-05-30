#!/usr/bin/env bash

echo Uploading files to files.pharo.org...
rsync --progress --cvs-exclude --recursive --links --times --delete . filepharosync@files.pharo.org:/appli/files.pharo.org/books
echo done
