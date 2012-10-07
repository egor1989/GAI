#! /bin/bash

for file in *.csv; do
    iconv -f windows-1251 -t utf-8 "$file" -o "${file%.csv}.utf8.csv"
done