#!/bin/bash
if [ "$VERCEL_ENV" = "preview" ]; then
  npm run build:dev
else
  npm run build
fi
