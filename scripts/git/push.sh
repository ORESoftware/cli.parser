#!/usr/bin/env bash


set -e;

ssh-add -D
ssh-add ~/.ssh/id_ed25519

combined=""
for arg in "${@}"; do
  combined="${combined} ${arg}"
done

trimmed="$(echo "$combined" | xargs)"

if test "${trimmed}" == '' ; then
  trimmed="squash-this-commit-later";
fi

echo "the commit message: '$trimmed'";

echo 'transpiling with tsc to check...'
tsc -p tsconfig.json

git add -A
git commit -am "${trimmed}" || {
  echo "could not create a new commit"
}

git push origin || {
  echo 'could not push to origin'
}
