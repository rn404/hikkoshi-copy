#!/bin/bash

if [ "$#" -eq 0 ]; then
  echo "File path must be specified"
  exit 1
fi

deno run -A src/main.ts $1
