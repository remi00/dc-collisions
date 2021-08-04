# D.C. Visualize

Showcase project visualizing frequency of car incidents in District Columbia within 2010-2014 range.


## Features

- Presents heatmap of car collisions per county on a map with capability of picking total or particular year
- Allows to normalize the data by the area of counties (showing a density or frequency of collisions per area unit)
- Provides basic responsive UI which works well with mobile devices
- Allows to pick particular county to present its name, total number of collisions and a chart with a per-year data

## Live demo

Live demo is available under: [http://dc.xrem.net/](http://dc.xrem.net/)

⚠ Note the bundler configuration is to limit the transpillation. Use modern browser!

## Screenshots

<img src="https://github.com/remi00/dc-collisions/raw/master/docs/desktop_result.png" alt="Desktop screenshot" title="desktop" height="320" /> <img src="https://github.com/remi00/dc-collisions/raw/master/docs/desktop_3d_result.png" alt="Desktop 3D screenshot" title="desktop 3d" height="320" /> <img src="https://github.com/remi00/dc-collisions/raw/master/docs/mobile_result.png" alt="Mobile screenshot" title="mobile" height="320" />

## Technicalities

- Uses NodeJS 14.x, VueJS 3.1 and ParcelJS 2.x for fast development and ultra-simple bundling
- Uses cool Mapbox GL API for awesome maps and D3 7.x for charts

## Development

Install:

```
npm i
```

Start local development instance:

```
npm run dev
```

Build production:
```
npm run build
```

Run production:
```
npm run start
```

Execute unit tests:
```
npm run test
```

