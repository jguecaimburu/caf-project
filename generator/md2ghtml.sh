#!/bin/bash

# Github CLI should be installed and user auth completed before running this script
if [[ ! -x "$(command -v gh)" ]]; then
  echo 'Error: gh is not installed.' >&2
  exit 1
fi

markdown_file=$1
if [[ ! -f "$markdown_file" ]]; then
  echo "Error: $markdown_file does not exist." >&2
  exit 1
fi
markdown_content="$(< "$markdown_file")"

markdown_file_basename="$(basename "$markdown_file" .md)"
output_argument="$2"
html_output_file="${output_argument:-"$markdown_file_basename.html"}"

html_content="$(gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /markdown \
  -f text="$markdown_content")"

if [[ $? -ne 0 ]]; then
  echo 'Error: gh api failed.' >&2
  exit 1
fi

tmp_html_content_file='tmp_content.html'
echo "$html_content" > "$tmp_html_content_file"
tmp_html_file="tmp_$html_output_file"
cp '_template.html' "$tmp_html_file"

sed -i -e "s/REPLACE_TITLE/$markdown_file/g" "$tmp_html_file"
sed -i -e "/markdown/r$tmp_html_content_file" "$tmp_html_file"

if [[ -x "$(command -v tidy)" ]]; then
  tidy -i --indent-spaces 4 -w 70 -o "$html_output_file" "$tmp_html_file"
  rm "$tmp_html_file"
else
  mv "$tmp_html_file" "$html_output_file"
fi

rm "$tmp_html_content_file"