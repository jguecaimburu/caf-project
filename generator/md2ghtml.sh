#!/bin/bash

# This script converts a markdown file to an HTML file using the GitHub API.
# Github CLI should be installed and user auth completed before running this script
# Usage: From the folder where the script and template are located (cd ./generator), run:
#     ./md2ghml.sh path/to/markdown.md path/to/output.html
# Eg: ./md2ghtml.sh ../resume.md ../docs/resume.html
# If no output file is given, it defaults to the md filename
# FIXME: The html title is not set, for now it needs to be replaced manually. Same thing for links (e.g. from index to resume)

if ! command -v gh > /dev/null 2>&1; then
  echo 'Error: gh is not installed.' >&2
  exit 1
fi

markdown_file=$1
if [[ ! -f "$markdown_file" ]]; then
  echo "Error: $markdown_file does not exist." >&2
  exit 1
fi

# Read the markdown file content
markdown_content="$(< "$markdown_file")"

# Get the basename of the markdown file without the extension
markdown_file_basename="${markdown_file%.*}"

# Set the default output file name as the basename with .html extension
output_argument="$2"
html_output_file="${output_argument:-"$markdown_file_basename.html"}"

# Use the GitHub API to convert the markdown to HTML
html_content="$(gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /markdown \
  -f text="$markdown_content")"

# Exit if the API call fails
if [[ $? -ne 0 ]]; then
  echo 'Error: gh api failed.' >&2
  exit 1
fi

# Use temporary files to process HTML output
tmp_html_content_file=$(mktemp)
tmp_html_file=$(mktemp)

# Remove temporary files on exit
trap "rm -f $tmp_html_content_file $tmp_html_file" EXIT

# Write the api output to the temporary file
echo "$html_content" > "$tmp_html_content_file"

# Copy the html template to the other temporary file
cat '_template.html' > "$tmp_html_file"

# Replace the title and insert the HTML content
sed -i -e "s/REPLACE_TITLE/$markdown_file/g" "$tmp_html_file"
sed -i -e "/markdown/r$tmp_html_content_file" "$tmp_html_file"

# Use Tidy to format the HTML if it's installed
if command -v tidy > /dev/null 2>&1; then
  tidy -i --custom-tags inline --indent-spaces 4 -w 70 -o "$html_output_file" "$tmp_html_file"
else
  cp "$tmp_html_file" "$html_output_file"
fi
