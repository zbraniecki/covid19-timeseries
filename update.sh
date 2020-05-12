curl https://coronadatascraper.com/timeseries-byLocation.json -o ./data/timeseries-byLocation.json;
./tools/convert.mjs;
npm run build;
