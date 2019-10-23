#!/usr/bin/env sh

set -e;

if [ "$skip_postinstall" = "yes" ]; then
    echo "skipping postinstall routine.";
    exit 0;
fi

export FORCE_COLOR=1;
export skip_postinstall="yes";

mkdir -p "$HOME/.oresoftware/bin" || {
  echo "Could not create .oresoftware dir in user home.";
  exit 1;
}


if [ "$(uname -s)" = "Darwin" ]; then

   if [ ! -f "$HOME/.oresoftware/bin/realpath" ]; then
      (
        curl_url='https://raw.githubusercontent.com/oresoftware/realpath/master/assets/install.sh'
        curl --silent -o- "$curl_url" | sh || {
           echo "Could not install realpath on your system.";
           exit 1;
        }
      )
   fi
fi
