#!/usr/bin/env bash
scriptDir=$(dirname $0)

destinationBase=" ars@64.226.93.54:/home/ars/"
path="uschedule-ui"

echo "Uploading to Digital Ocean"
echo "Destination: ${destinationBase}${path}"
rsync -a --delete --exclude-from=${scriptDir}/../../.dockerignore  $scriptDir/../../ ${destinationBase}${path} || exit 1
echo "Uploading is done"