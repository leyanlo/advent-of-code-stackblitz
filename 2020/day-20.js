
const inputIdx = 1;
const debug = false;
const part1 = true;
const part2 = true;

function rotate2d(img, deg) {
  const height = img.length;
  const width = img[0].length;
  const newImg =
    deg % 180
      ? [...Array(width)].map(() => [...Array(height)])
      : [...Array(height)].map(() => [...Array(width)]);
  for (let i = 0; i < img.length; i++) {
    for (let j = 0; j < img[i].length; j++) {
      switch (deg) {
        case 0:
          newImg[i][j] = img[i][j];
          break;
        case 90:
          newImg[j][height - i - 1] = img[i][j];
          break;
        case 180:
          newImg[height - i - 1][width - j - 1] = img[i][j];
          break;
        case 270:
          newImg[width - j - 1][i] = img[i][j];
          break;
      }
    }
  }
  return newImg;
}

function getEdges(tile) {
  const top = tile[0];
  const right = tile.map((row) => row[row.length - 1]).join('');
  const bottom = [...tile[tile.length - 1]].reverse().join('');
  const left = tile
    .map((row) => row[0])
    .reverse()
    .join('');

  return [top, right, bottom, left];
}

function solve1(input) {
  const tiles = input.split('\n\n').reduce((tiles, tile) => {
    let [id, ...img] = tile.split('\n');
    id = id.match(/^Tile (\d+):$/)[1];
    tiles[id] = img;
    tiles[id + 'f'] = [...img].reverse();
    return tiles;
  }, {});

  const tileEdges = Object.keys(tiles).reduce((tileEdges, id) => {
    tileEdges[id] = getEdges(tiles[id]);
    return tileEdges;
  }, {});
  debug && console.log({ tileEdges });

  const edgeToId = Object.keys(tileEdges).reduce((edgeToId, id) => {
    const edges = tileEdges[id];
    for (let edge of edges) {
      edgeToId[edge] = edgeToId[edge] || [];
      edgeToId[edge].push(id);
    }
    return edgeToId;
  }, {});
  debug && console.log({ edgeToId });

  const tileConnections = Object.keys(tileEdges).reduce(
    (tileConnections, id) => {
      const edges = tileEdges[id];
      const flippedEdges = edges.map((e) => e.split('').reverse().join(''));
      tileConnections[id] = [];
      for (let edge of flippedEdges) {
        tileConnections[id].push(
          edgeToId[edge]
            .filter((i) => !i.startsWith(id) && !id.startsWith(i))
            .reduce((acc, i) => {
              return i;
            }, null)
        );
      }
      return tileConnections;
    },
    {}
  );
  debug && console.log({ tileConnections });

  const cornerIds = Object.keys(tileConnections).filter(
    (id) =>
      !id.endsWith('f') && tileConnections[id].filter(Boolean).length === 2
  );
  debug && console.log({ cornerIds });

  console.log(cornerIds.reduce((product, id) => product * id, 1));
}

function solve2(input) {
  const tiles = input.split('\n\n').reduce((tiles, tile) => {
    let [id, ...img] = tile.split('\n');
    id = id.match(/^Tile (\d+):$/)[1];
    tiles[id] = img;
    tiles[id + 'f'] = [...img].reverse();
    return tiles;
  }, {});

  const tileEdges = Object.keys(tiles).reduce((tileEdges, id) => {
    tileEdges[id] = getEdges(tiles[id]);
    return tileEdges;
  }, {});
  debug && console.log({ tileEdges });

  const edgeToId = Object.keys(tileEdges).reduce((edgeToId, id) => {
    const edges = tileEdges[id];
    for (let edge of edges) {
      edgeToId[edge] = edgeToId[edge] || [];
      edgeToId[edge].push(id);
    }
    return edgeToId;
  }, {});
  debug && console.log({ edgeToId });

  const tileConnections = Object.keys(tileEdges).reduce(
    (tileConnections, id) => {
      const edges = tileEdges[id];
      const flippedEdges = edges.map((e) => e.split('').reverse().join(''));
      tileConnections[id] = [];
      for (let edge of flippedEdges) {
        tileConnections[id].push(
          edgeToId[edge]
            .filter((i) => !i.startsWith(id) && !id.startsWith(i))
            .reduce((acc, i) => {
              return i;
            }, null)
        );
      }
      return tileConnections;
    },
    {}
  );
  debug && console.log({ tileConnections });

  // start from top-left corner
  const topLeftId = Object.keys(tileConnections).find((id) => {
    const [top, right, bottom, left] = tileConnections[id];
    return !top && right && bottom && !left;
  });
  const topLeft = { id: topLeftId, rotate: 0 };
  const nTiles = Object.keys(tiles).length / 2;
  const imgInfos = [...Array(Math.sqrt(nTiles))].map(() => []);
  for (let i = 0; i < Math.sqrt(nTiles); i++) {
    for (let j = 0; j < Math.sqrt(nTiles); j++) {
      if (!i && !j) {
        imgInfos[i][j] = topLeft;
        continue;
      }

      if (j) {
        const { id: leftId, rotate: leftRotate } = imgInfos[i][j - 1];
        const id = tileConnections[leftId][(1 - leftRotate + 4) % 4];
        const rotate = 3 - tileConnections[id].indexOf(leftId);
        imgInfos[i][j] = {
          id,
          rotate,
        };
        continue;
      }

      const { id: topId, rotate: topRotate } = imgInfos[i - 1][j];
      const id = tileConnections[topId][(2 - topRotate + 4) % 4];
      const rotate = (4 - tileConnections[id].indexOf(topId)) % 4;
      imgInfos[i][j] = {
        id,
        rotate,
      };
    }
  }
  debug && console.log('imgInfos:', imgInfos);

  const img = [...Array(Math.sqrt(nTiles) * 8)].map(() => '');
  for (let i = 0; i < Math.sqrt(nTiles); i++) {
    for (let j = 0; j < Math.sqrt(nTiles); j++) {
      const { id, rotate } = imgInfos[i][j];
      const tile = tiles[id];
      const tileSize = tile.length - 2;
      for (let r = 1; r < tile.length - 1; r++) {
        for (let c = 1; c < tile.length - 1; c++) {
          const pixel =
            rotate === 0
              ? tile[r][c]
              : rotate === 1
              ? tile[tile.length - 1 - c][r]
              : rotate === 2
              ? tile[tile.length - 1 - r][tile.length - 1 - c]
              : tile[c][tile.length - 1 - r];

          img[i * tileSize + r - 1] += pixel;
        }
      }
    }
  }
  debug && console.log(['img:', ...img].join('\n'));

  const monster = `                  # 
#    ##    ##    ###
 #  #  #  #  #  #   `.split('\n');
  debug && console.log(['monster:', ...monster].join('\n'));

  for (let deg of [0, 90, 180, 270]) {
    for (let flip of [true, false]) {
      const mon = rotate2d(monster, deg);
      if (flip) {
        mon.reverse();
      }
      let nMonsters = 0;
      for (let i = 0; i < img.length - mon.length; i++) {
        for (let j = 0; j < img[0].length - mon[0].length; j++) {
          let abort = false;
          for (let im = 0; im < mon.length; im++) {
            for (let jm = 0; jm < mon[0].length; jm++) {
              if (mon[im][jm] === '#' && img[i + im][j + jm] === '.') {
                abort = true;
                break;
              }
            }
            if (abort) {
              break;
            }
          }
          if (!abort) {
            nMonsters++;
          }
        }
      }
      if (nMonsters) {
        debug && console.log({ nMonsters });
        const monsterRoughness = monster.reduce(
          (r, line) => r + line.match(/#/g).length,
          0
        );
        debug && console.log({ monsterRoughness });
        const imgRoughness = img.reduce(
          (r, line) => r + line.match(/#/g).length,
          0
        );
        debug && console.log({ imgRoughness });
        console.log(imgRoughness - nMonsters * monsterRoughness);
      }
    }
  }
}

const inputs = [];
inputs.push(`Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###

Tile 1951:
#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..

Tile 1171:
####...##.
#..##.#..#
##.#..#.#.
.###.####.
..###.####
.##....##.
.#...####.
#.##.####.
####..#...
.....##...

Tile 1427:
###.##.#..
.#..#.##..
.#.##.#..#
#.#.#.##.#
....#...##
...##..##.
...#.#####
.#.####.#.
..#..###.#
..##.#..#.

Tile 1489:
##.#.#....
..##...#..
.##..##...
..#...#...
#####...#.
#..#.#.#.#
...#.#.#..
##.#...##.
..##.##.##
###.##.#..

Tile 2473:
#....####.
#..#.##...
#.##..#...
######.#.#
.#...#.#.#
.#########
.###.#..#.
########.#
##...##.#.
..###.#.#.

Tile 2971:
..#.#....#
#...###...
#.#.###...
##.##..#..
.#####..##
.#..####.#
#..#.#..#.
..####.###
..#.#.###.
...#.#.#.#

Tile 2729:
...#.#.#.#
####.#....
..#.#.....
....#..#.#
.##..##.#.
.#.####...
####.#.#..
##.####...
##..#.##..
#.##...##.

Tile 3079:
#.#.#####.
.#..######
..#.......
######....
####.#..#.
.#...#.##.
#.#####.##
..#.###...
..#.......
..#.###...`);

inputs.push(`Tile 1249:
...#......
#..#..#.##
##........
#.#.......
..........
#...###...
#..#......
#...##....
..........
.....#...#

Tile 1693:
..#..####.
#.........
##..#....#
#.....#..#
......#.##
#........#
.....##...
.#..##.#.#
##........
###..#....

Tile 1481:
....#####.
#....#..##
##..#....#
##..#...#.
#..#.#...#
..........
...#..#...
.#...#...#
#...#.....
..#..##.##

Tile 3169:
####...#.#
#.#.....#.
.#......##
..#.#....#
...###..#.
#....###.#
.......#..
##.##.....
.#.#......
.#....#...

Tile 1229:
##..###..#
#.......#.
..#..##..#
##..#.....
#.#..#..#.
.#..#.#.##
....#....#
#..#..#.##
....#....#
..##..####

Tile 1489:
#......#..
....#.....
#.....#..#
#.......#.
#.#..#..#.
#.........
#........#
#..#.#....
#.........
....####.#

Tile 2477:
#####.##.#
.###...###
#....#..##
.#.#..#..#
###.##...#
#........#
#..#..#...
.......#.#
#......###
##.##.##.#

Tile 2897:
##.##..#.#
#.......##
#.#..#.#..
..#...#..#
...##.#..#
..#.......
#.#..##..#
..#....#.#
#....#.#.#
#......###

Tile 2083:
..#...##.#
###.#.##..
....##....
#...#..#..
...##....#
#..#......
.#.##.....
..##..####
....###..#
.#...#.#..

Tile 1069:
..#.#.#..#
..#....#.#
.........#
##..#.....
#.....#...
..##......
#..#......
.##..#####
#.#....#..
.....#..#.

Tile 1427:
...####.##
.###......
.#..#.#..#
..#.###.##
.#..#.....
..##.#....
.#......#.
#....#...#
.......#..
#.#..###..

Tile 1429:
.##.#.#.#.
#..##....#
..#......#
...#....##
...#.##..#
..#.#.....
#....#..##
#..#.....#
.##....#..
##.#.#...#

Tile 2357:
#.##..#.##
.........#
#..#.#..##
#....#.#..
#........#
#...##....
#....#....
....##...#
#.#..##...
.###.#.#..

Tile 3181:
...#..####
........#.
#...#...##
#.#.....##
#.........
##...#....
#.##.....#
#....#...#
..#.#...##
#..###.##.

Tile 2887:
.#..#.###.
#.........
.#....#...
#........#
..#.##...#
.......##.
....#.#..#
#...###..#
.#...#..##
###...#..#

Tile 2837:
##.##..###
.......#.#
....#.#..#
.......##.
.....#....
#.#.##..#.
#.#..#...#
....#.##..
..#......#
...######.

Tile 2539:
.###....#.
.......##.
##.##...#.
.###.....#
###..##...
.##....#.#
........#.
..........
.#........
#.....#...

Tile 2399:
##.#..##..
#...#.#..#
.##......#
###..##...
.#....#...
....#.#...
.....###.#
#.......##
#......#..
.##.##....

Tile 2383:
#..##.###.
.#.......#
#.#..#....
#..#.#...#
#.#.#.....
......#...
#....#..#.
..#.#.#..#
#..#.##..#
.#.##...##

Tile 2521:
.#..#.##.#
#........#
#.#...#.##
#........#
##.#.#..##
#..######.
.##..##..#
.#.....##.
.#.#......
..#..#####

Tile 1823:
#.#...##..
#..#.....#
.##......#
#...###.#.
......#...
.....##...
#....##.#.
#.........
#..#.....#
#.#.##.#..

Tile 1301:
####.#.###
#.##...##.
..#...####
..........
#....#..##
....#..#..
#..#.#.#..
...#...#..
###..###.#
.##..#.#.#

Tile 1289:
#.###....#
#.#.....#.
#.....##.#
#........#
.##.#...#.
.###..#...
..#.......
.##...#...
...#....##
.###....#.

Tile 3823:
#.##.##..#
.........#
#...##.#.#
.#.##.....
##.....#..
.#..#....#
#...#...##
#.........
#........#
.#.##.####

Tile 2411:
#.####.###
#....#.###
..##.....#
#.#...#..#
##...#.#.#
##.##...##
#.......#.
#...##...#
.........#
###.##.##.

Tile 1039:
.......#.#
..#.......
........#.
.##...####
##...#..##
.#.......#
..#.#.....
...#.....#
.........#
..#...#...

Tile 1609:
.##..#..##
##.###.###
.#.....#..
#........#
...#...#..
#.......##
...#..###.
#.##.##.##
#.......#.
...#.#....

Tile 2017:
##..#..#..
....###...
..##......
#...#.###.
#....#....
#.#.......
#..#.#....
###..##..#
###.#....#
#.#.#.#.##

Tile 3301:
.#####...#
...##.....
#..###...#
#....#...#
...#.#...#
#......#.#
#........#
...#......
.......#.#
..#####...

Tile 3733:
#####.##.#
#.##..#..#
#....#..##
#....#....
.....##...
#......#..
#....##.##
.........#
.#..#....#
.....##...

Tile 2309:
#..##.##..
...#.#.#.#
#..##.#..#
....##....
##....#..#
##..##.#.#
.###....#.
###...#.##
....#.....
.#.#.###.#

Tile 2879:
#.##.##...
...#.....#
...##.####
...#.#.#.#
#.###.##.#
.....#...#
#.....#.#.
#..#.#..##
.....###..
.##..#.###

Tile 3583:
.#.##...#.
..##...##.
#.#....##.
#.##...#.#
.....#..##
#####.....
..###..#..
..##..#.#.
.##....##.
##.##...#.

Tile 2153:
##...####.
..#.#...#.
##..##..#.
.#..#.#...
..........
..#...#...
#....#.###
...##....#
#.##.....#
#...#....#

Tile 3581:
#...##.###
..####..##
...##....#
.#..#.....
.##......#
#.#......#
...###.#.#
###.#.....
#.##.##...
#.#.....#.

Tile 2927:
##.#.#..##
..........
..........
.....#....
#..#..#..#
....#.#...
.#...#...#
.#...##..#
......#...
###.#.##.#

Tile 2861:
.#..#.###.
#..#....##
#.#.#..#..
........#.
..#.#.#...
...##....#
#..###.#.#
#..#..##..
..#.#....#
.#..####.#

Tile 2851:
#.#....#..
#........#
.#........
#..##.#...
..##....##
.#.......#
#.........
......#..#
..........
###.##..##

Tile 3319:
...##....#
#.......##
##.#..#...
.##....###
#...#...##
..#.......
.###..#..#
#...#.....
.........#
.#..##.#..

Tile 2143:
...#......
##.#...#.#
##.......#
#.##..#..#
..#...#..#
.#.#...#..
..#....#..
......#...
#.#.......
#..#..#.##

Tile 1093:
#.#...#.#.
##..#.....
.........#
##..#...##
##..#..#..
##..##....
##.##....#
#.#....#..
.#.#..#..#
..#.##.###

Tile 3391:
#....#..#.
#...#..#..
##....##..
..#.#..#.#
#####...##
..#..#...#
#.#......#
.#...#....
.....##.##
.#.#.#....

Tile 3917:
...##.#...
#..#.....#
#..##.###.
#.#..#..#.
.####..#.#
..##.#.###
#.#..##.#.
#....##..#
..###.#..#
..##.####.

Tile 1847:
#.##.#..#.
.#.##.....
#.#..#..#.
#....#.#..
.#.......#
..#..#.#.#
..##....##
#.#.##....
##.#..#...
.##.##.###

Tile 1667:
.##..#..#.
###....##.
#.####.#.#
...#.....#
.#.#..##.#
.#..#....#
#.##.#...#
#.#.#.....
...###...#
#.#..####.

Tile 1217:
...#####..
....#..#.#
..#...####
#........#
#........#
###..#...#
.##.##...#
.#.......#
.....##...
.##.#.###.

Tile 3467:
###.##....
.......#.#
.....#..##
##..#....#
....#..#..
....#..###
#......###
#.##...#..
..#.....##
...#.#..#.

Tile 1297:
..###..##.
#....#.#.#
.........#
###.#....#
#......#.#
##....##..
#.#.##..##
.##.....#.
.....#...#
.#.##.....

Tile 3877:
..###.#...
##..#....#
###.##..##
.#..######
....#.#..#
.#.......#
#...##.#..
..#..#....
#.##.##..#
#..##.#.#.

Tile 2389:
##...#####
##..#.#..#
#..#.....#
......#..#
.#........
#....##.#.
.##....#..
#.....#.#.
#........#
...##.#...

Tile 3361:
.....#.#..
.........#
...#....#.
##.##.....
#....##...
##...#...#
#...####.#
..##.....#
...#...#.#
###.####..

Tile 2207:
###.##..#.
#..###....
......#..#
#........#
##....##.#
........#.
...#..#...
#....#..##
...####...
##........

Tile 1997:
..#.#..###
......#...
...#...#..
..#......#
.........#
#....#...#
....#..#..
.....#....
#........#
#....#####

Tile 1063:
#.#...##..
.##..#....
#.#..##...
..#...####
......##..
#...#.#...
####......
.#.....#..
.#.......#
#...####..

Tile 3109:
...###.###
.......#..
......##.#
.#......##
#..##..#..
##..#..#.#
.....##.##
#....#.#.#
.....###..
####....#.

Tile 1097:
#####.##..
.#...#.##.
..#..#....
#..#....#.
#.#....#.#
.#...#.#.#
#....#..##
#....#...#
...#...#..
...#.#..#.

Tile 1117:
#..##.#.##
#.#.....#.
...#.#...#
#.#..##.#.
#.###..#..
#....#...#
....#.....
.#...#...#
..##..#..#
.#.#.....#

Tile 2551:
.#..#.####
#...#.....
##....##.#
#....#....
.##.....#.
.#...#....
#....#.#..
......#...
##.#.#....
.#....#..#

Tile 2677:
.#.####..#
#.#.....##
...#.#....
.#...#...#
.##...#..#
##....#...
...##.#..#
##...#..##
##...#...#
##...###.#

Tile 1367:
.#.##...##
#.#..#....
....##.#..
.........#
.#....##.#
....#.##..
....##...#
#.#..#...#
#.#.#..##.
....#.##.#

Tile 1913:
.##..#..##
.#...##.##
..#.....#.
......#...
...#...##.
...####...
..#..#....
....#.#...
#.........
.####.####

Tile 1709:
.#....##..
..#...#.##
.#......#.
...#....##
.#.##...#.
.#.#.#.###
.........#
#.......#.
##....#...
..#.##.###

Tile 1459:
.##..#.#..
...##.....
.#.#...###
...#.....#
##..#..#.#
.........#
.........#
....#...#.
#..#......
...#.#...#

Tile 2137:
##..#....#
#.#####.#.
......#..#
#.#......#
#...#..#.#
#..#..#.##
###..####.
.##..#...#
#.#.......
.##.##....

Tile 2659:
#.##..#...
#...##....
#...#...#.
#........#
#....#....
.......##.
..#.....#.
#.#..##..#
#......#..
..###.#..#

Tile 2657:
####...##.
........#.
..####..#.
..#.......
....#.#..#
#.#.#.#...
...#....#.
###...####
........##
##.#.#.#..

Tile 2099:
#.###.##.#
#..#...###
..#......#
.#...#.#..
...##.....
###.##...#
..##..#...
...#......
..#.#.#.#.
..#.##....

Tile 3209:
##.###....
...#....#.
#..##..##.
##.##.#...
.#..#....#
#..#.#...#
.#...#...#
#..#......
...#......
..#.#.###.

Tile 1879:
#.##.#.##.
.#.##.#...
#..#.#....
#.....###.
#..##.....
....##....
#..#..#...
#.........
..#.##....
...####.##

Tile 1621:
###....#.#
.........#
.#....##..
.....#.#..
.#...#.#..
##...####.
.....#...#
#.........
....#.#..#
.####...##

Tile 3931:
.####.###.
#.##.....#
#..#.#...#
..#......#
###..#.##.
....##....
#..#......
..........
.#.....#.#
#.##.#..##

Tile 2777:
##....####
.#.#......
##......#.
#.......##
.#..#.#..#
##.#...#.#
##.#.....#
...##....#
#..#.#....
#.#..#....

Tile 2909:
#......##.
#........#
..#.#.###.
.......#.#
........##
....#.....
......#...
#........#
#.......#.
......#.#.

Tile 1777:
.##...####
.##.....#.
#..#.#..#.
.#......##
.#....#..#
#.###.#...
.#.#......
###..#...#
.#.......#
..#...#.##

Tile 3251:
...#.###..
#....##..#
#....#..#.
#....#..##
.....#...#
#.......##
.......#.#
#....#..#.
#...##...#
.#.#.....#

Tile 1601:
#....#....
.##.##...#
.........#
#.........
.#.....###
#..##.#.#.
#......#.#
.#..#.#..#
.#...#....
.#.#.#..##

Tile 1283:
#####.#..#
..#....##.
#..#......
.#....##..
.#.#.....#
##......##
#.....##..
##..#....#
#........#
.#.###..##

Tile 3079:
..#.##....
.......#.#
..#...##.#
..###...#.
#..#.....#
..##.....#
..#..#.#..
.##.#.#..#
#..#......
.#.##..#..

Tile 3793:
##..#####.
##...#....
##....#...
..........
#.........
.#....#..#
#....#..#.
#....#....
###..##...
#.###.##..

Tile 3037:
.##.#..##.
#..#.###..
.#....#...
...####..#
..#.###..#
#.#..#....
.##......#
#.....#..#
#...#.#...
##.######.

Tile 1669:
##.#......
.#......#.
##.#...#.#
#.#.#.#..#
##........
##....#...
#.#.....#.
..........
.........#
####...###

Tile 1087:
.###.#.#.#
###.......
.....#...#
##.....#..
.#.#......
...#......
#...#..#.#
#........#
#..#....##
.#...#####

Tile 2617:
.##..#.#..
.....#...#
..#.#.....
....#...##
####...##.
..##......
...#...#..
..#.#.##.#
#.#.......
###.##....

Tile 3943:
.#.####..#
.........#
#.........
.#........
###..#....
...#....#.
#...#.#...
.#......#.
...##.#...
..##....#.

Tile 2273:
##.#.#...#
...##.#..#
..##......
..#.....#.
#......#..
...#....#.
.##....#.#
...#.#.#..
#..###.#.#
###.#..##.

Tile 3803:
##....#..#
##...#.#.#
..##....#.
#...#..###
....#.....
....#.####
#.....##..
##....###.
#....#..##
#####.##..

Tile 1697:
....####.#
#....#.#.#
#.....#.##
#......#..
#.#...#...
#....#.#..
.##....#..
##...#.#.#
#.#..#..#.
.......#..

Tile 3343:
######.#..
#....##...
#.#.##...#
#...####..
#......#..
##.#..##.#
#.....##.#
..##.##..#
..#......#
###..##...

Tile 1549:
#.##.###.#
.....###..
...#.###..
##...##..#
#.#.......
#.........
....#....#
..#.....##
.....##...
#.#.##.##.

Tile 1619:
..###.###.
##.###...#
#...##...#
....##...#
..##..#.#.
#...#.#..#
#.......##
#..#.....#
....##...#
.#...#.#..

Tile 2971:
..##.###..
#.....#..#
#..#.....#
#..#...#.#
...#......
#......###
#....####.
.#....#...
...#.....#
#...###..#

Tile 3617:
####...#..
.......#.#
.#.#......
#..##..###
.##.......
.#....#..#
.....#.###
....##.#..
#....#...#
.#.##.####

Tile 1543:
......#.##
#......#.#
##.....###
#...#...##
#.#....#..
.#........
#....#....
......##..
##...#..#.
#...#.##.#

Tile 2111:
####..#...
#..#...#.#
#.#.#.##..
##........
#...#..#..
#.##..#...
#.........
##.#..#...
.##.#.###.
#.##.####.

Tile 1499:
#.####.#..
..##.#...#
#..#......
....#.....
.#..##...#
#.#...##.#
...#.##.##
###..#.###
.....#....
...##.##.#

Tile 3461:
.#####.#.#
#.........
..#..#....
..#......#
###...####
...#.##..#
.#........
#..#....##
#...#...##
####.....#

Tile 1483:
.....#.##.
##........
#.#.....#.
##......#.
#.....#...
..#.......
##....#..#
##........
..#...####
......###.

Tile 2467:
###.#.#...
#.#.....#.
#...#....#
#....#...#
...#..#..#
##...#....
#.#.###...
#..##..#.#
#.........
..######.#

Tile 3631:
###.#...##
.........#
#.##..#...
...##..#..
##..#.#..#
#..#.#....
......#.#.
..........
#......##.
..##.#....

Tile 3767:
#...#.#..#
..........
#......#.#
#...#.#..#
##.......#
..#......#
........#.
##...##.##
#........#
....#....#

Tile 2381:
.#.#.##...
#.##.#....
...##.#.##
#.....#.#.
#......#..
...#....#.
......####
#.#.#.....
##...##..#
...#...#.#

Tile 2687:
###...####
.....#.###
..#.#.#.#.
##..#...##
#.###...#.
..#.##..##
##.....#..
##..#..#.#
#...#..#.#
#.#..###.#

Tile 3719:
..####.#..
.#......##
#......###
##....###.
.#...##.##
.#.....#.#
..##..#.#.
#......###
...#...#..
......###.

Tile 3259:
######.#.#
#..#......
.........#
#.......#.
..##...#..
##...##.##
#......#.#
##.......#
#.......#.
#..##.#.##

Tile 3643:
###..#..##
#.#.#.#...
..##....#.
##....##..
..##......
#..#..#.##
......##..
#.......#.
#...##..##
#.#..#.###

Tile 2767:
####....##
..........
.........#
..#....#.#
#......###
#.##..#..#
#.#..#.#..
...#.#...#
#..####..#
##..#####.

Tile 2333:
###..#.##.
..##.....#
..#.#..##.
#.....#..#
....#.#...
##...#....
#.#......#
###.......
#...#....#
..#..#..##

Tile 2857:
..#..##..#
#.....#...
##....#..#
#...##....
....#.#..#
#.#.##....
#...##..#.
.#...##..#
#...#.#...
.#.###.#.#

Tile 1193:
#.#..#.#.#
##..####..
###..##.#.
#.......##
###....##.
...#...#..
#...#....#
##.......#
#####.##.#
..#####.##

Tile 2351:
.##..#####
#.........
.#..#.....
#.##.#...#
..#.#..#..
#.###....#
###..#....
##.......#
#...#..#..
.....#...#

Tile 1129:
..##..####
.....##..#
##........
.........#
#...#.....
....#...##
..#....##.
..#.....#.
..#.......
.##.###...

Tile 3433:
.##..#....
...###.###
.......##.
#..#.#.#.#
........#.
...###...#
...#......
.##...###.
.#.#..#..#
##..##..#.

Tile 1091:
###.####..
.#..#.....
##.......#
#.#...#...
...##.....
#..###...#
..##...#.#
#...#..###
.....#...#
###.#....#

Tile 3407:
.####.#...
.#..#.#..#
..#..#....
......#..#
.........#
#...##...#
...#.###.#
#....#...#
#.....###.
.#.#.#.#..

Tile 2591:
.##..##...
..#...##.#
...#..####
.#....#.##
#...##.#..
#...#....#
#..#.....#
#..#.....#
..........
.#.###.#.#

Tile 3613:
###.######
.#...##..#
#.##.....#
#.........
#...#.....
###.....##
.#.##.#..#
##..#...##
####......
..#...#...

Tile 3967:
#.#..#.#..
#..#.....#
...##...#.
.#.##...#.
#####..#.#
..##.#..#.
..........
#.#.#..#.#
#.#.....##
#..#####.#

Tile 1999:
#.#.#..##.
####.##.##
..##...#.#
....#....#
.##.#.#...
..........
.......##.
#.#......#
##...#.#.#
.#.#.#.#..

Tile 2689:
.#..#####.
.#........
..#....#.#
#......#.#
.#.#..#.##
###...#..#
...#...#.#
##......##
......##.#
.##.#..##.

Tile 3533:
.####.#...
#........#
#......#..
.........#
#..#.##..#
###....#.#
...##..#..
..#.....#.
#...#..###
..###.##.#

Tile 2267:
#.##...#.#
#....#....
.#.#.##...
.#....#.##
..#.#.....
.##.......
##.....#..
####....#.
......#..#
#..##..#.#

Tile 2297:
###..##...
#..##..##.
..#....#.#
#.#.##...#
..#.##..#.
...##...#.
#...#.....
.....#.#.#
#..#....#.
.###..##..

Tile 2711:
##..##...#
...##....#
...#..#.#.
#........#
...#.....#
........##
##....##..
#.##.....#
#.###.....
###...#..#

Tile 1931:
.###...###
......#.##
....##..##
#...#...#.
..#..##.#.
#.....#..#
#...#....#
#........#
...#..#.#.
#.##..###.

Tile 1787:
#...##..##
..#.......
#..#.#.#..
...#..#..#
.##.#..###
#.#.#.....
..........
....##...#
..........
.#.#...#..

Tile 2549:
##.#...###
.....#...#
#......###
##.###....
#..#....#.
##.......#
.#........
..###...##
##..##...#
#.##...#.#

Tile 2789:
#.#.#.#.##
#...#.##..
.##...#.##
#.##.#....
...#......
###.......
#.......##
#.#...#..#
..#.#....#
.##.#..#..

Tile 2707:
#..#.#...#
#.#.#.#...
...#..#..#
##.#.....#
#....#.##.
.....#...#
#.....#...
....#.#...
#..###...#
##..##.###

Tile 3313:
###.#..#..
.#....#..#
...#.....#
....#..###
....#..#..
#..#.#....
##.#..##..
..#...#.##
##..##....
.##.###.#.

Tile 1607:
..#...###.
#.....#...
#.......##
#.....#...
###.#.#..#
#.#.....#.
#..#...###
.........#
..#.......
##.#.#####

Tile 3889:
###.#...##
##.......#
....#..#..
#.#......#
.##......#
#...##....
#....##..#
.......#..
#...#...#.
##.#####.#

Tile 3821:
..###.##..
........##
#..##..#.#
.##.#..#.#
#....##.##
#.....##.#
#.....#..#
##........
#.#..#....
##.#.###..

Tile 3347:
.##..#...#
#.#...#...
#..#..###.
.#......#.
#..###.##.
......#...
##..##.#..
.#.###.#..
........#.
#.###..##.

Tile 1907:
.#.##...#.
#......#..
...#......
##.......#
.#.....#..
.#.....###
........##
.##.#..#.#
##.....#..
#.########

Tile 2903:
##.....#.#
....#.##..
...#.....#
.#..#####.
.....##.#.
.#......#.
..........
#..#.....#
....#...##
.#..##..##

Tile 1399:
#....###.#
..#..#####
.#....##.#
...#...#..
#..##.#..#
.....#....
..#......#
........##
#..###....
#..###.###

Tile 1993:
###.##..#.
##........
##..#..##.
.........#
.........#
#..##.#.#.
.##.......
#..#.....#
#.##.#..##
##.#.#..#.

Tile 3671:
...##.#..#
##....##.#
#..#....##
#..#...#.#
.#.#.#...#
........##
..........
##.......#
#.##....##
.#..#..##.

Tile 3167:
###..##..#
.....##...
.......#..
#...#.#..#
.#.##.#..#
###....##.
##........
#.........
..#..#....
.....##.#.

Tile 1109:
..#...#..#
#..#.#.#..
.#........
.......#.#
#..#..#...
.........#
##.#......
........##
#.#.##..#.
..#..#.#..

Tile 3089:
.###.#####
#..#..#.#.
#......#.#
...#.....#
.........#
.#.#...#..
.#..#.#.##
.......###
.#.#..#.##
..#..###..

Tile 1051:
.....##..#
#...##.#..
..........
..........
#.#.##..#.
...##...##
.##.#####.
.#...##..#
..#.#...#.
#.......##

Tile 2113:
#...###.##
.#.....##.
...#....##
...##..#..
#....#...#
..##.#....
##....#.#.
..#...###.
.....#.#.#
.##......#

Tile 2131:
#....#####
#.#.......
.###.#..##
###.##.#..
#...#.....
.#.#.....#
###....#..
..#.....##
.#...##.##
#..###....`);

part1 && solve1(inputs[inputIdx]);
part2 && solve2(inputs[inputIdx]);
