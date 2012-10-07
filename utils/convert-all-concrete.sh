#! /bin/bash

for file in ../data/2011/*.utf8.csv; do
	#echo $file
    node csv2json-concrete-data.js "$file" "${file%.csv}.json"
done
