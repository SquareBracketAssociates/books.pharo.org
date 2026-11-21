#!/usr/bin/env bash

echo Uploading files to files.pharo.org...
rsync --progress --cvs-exclude --recursive --links --times . pharoorgde@ssh.cluster023.hosting.ovh.net:books
echo done

echo The pdfs are hosted under /pharoorgde/files/book-pdfs