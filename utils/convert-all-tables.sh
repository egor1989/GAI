#! /bin/bash

for file in ../data/*-Таблица\ 1.utf8.csv; do
    node csv2json-summary-data.js "$file" "${file%.csv}.json"
done