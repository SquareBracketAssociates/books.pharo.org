#!/usr/bin/env bash

echo Uploading files to files.pharo.org...
#rsync --progress --cvs-exclude --recursive --links --times --delete . #filepharosync@files.pharo.org:/appli/files.pharo.org/books
rsync --progress --cvs-exclude --recursive --links --times --delete . pharoorgde@files.pharo:books
echo done


echo The pdfs are hosted under /pharoorgde/files/book-pdfs