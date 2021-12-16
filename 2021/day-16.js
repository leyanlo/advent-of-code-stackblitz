const fs = require('fs');

const input = fs.readFileSync('./day-16-input.txt', 'utf8').trimEnd();

function parseValue(bits) {
  let i = 0;
  const nibbles = [];
  while (bits[i++] === '1') {
    nibbles.push(bits.slice(i, (i += 4)));
  }
  nibbles.push(bits.slice(i, (i += 4)));
  return [parseInt(nibbles.join(''), 2), i];
}

function parseValues(bits, versions) {
  let i = 0;
  const values = [];
  if (bits[i++] === '0') {
    const length = parseInt(bits.slice(i, (i += 15)), 2);

    let totalOffset = 0;
    while (totalOffset < length) {
      const [value, offset] = parsePacket(
        bits.slice(i + totalOffset),
        versions
      );
      values.push(value);
      totalOffset += offset;
    }
    return [values, i + length];
  } else {
    const nSubPackets = parseInt(bits.slice(i, (i += 11)), 2);

    let totalOffset = 0;
    for (let j = 0; j < nSubPackets; j++) {
      const [value, offset] = parsePacket(
        bits.slice(i + totalOffset),
        versions
      );
      values.push(value);
      totalOffset += offset;
    }
    return [values, i + totalOffset];
  }
}

function parsePacket(bits, versions) {
  let i = 0;
  const version = parseInt(bits.slice(i, (i += 3)), 2);
  versions.push(version);

  const packetType = parseInt(bits.slice(i, (i += 3)), 2);
  if (packetType === 4) {
    const [value, offset] = parseValue(bits.slice(i));
    return [value, i + offset];
  }

  const [values, offset] = parseValues(bits.slice(i), versions);
  i += offset;

  if (packetType === 0) {
    return [values.reduce((acc, v) => acc + v), i];
  } else if (packetType === 1) {
    return [values.reduce((acc, v) => acc * v), i];
  } else if (packetType === 2) {
    return [Math.min(...values), i];
  } else if (packetType === 3) {
    return [Math.max(...values), i];
  } else if (packetType === 5) {
    return [+(values[0] > values[1]), i];
  } else if (packetType === 6) {
    return [+(values[0] < values[1]), i];
  } /* if (packetType === 7) */ else {
    return [+(values[0] === values[1]), i];
  }
}

function solve(input) {
  const nibbles = [];
  for (const char of input) {
    nibbles.push(parseInt(char, 16).toString(2).padStart(4, '0'));
  }
  const bits = nibbles.join('');
  const versions = [];
  const [value] = parsePacket(bits, versions);
  console.log(versions.reduce((acc, v) => acc + v));
  console.log(value);
}
solve(input);
