import { readFileSync } from 'node:fs';

var input = readFileSync('./day-03-input.txt', 'utf8').trimEnd();

function solve(input, part) {
  if (part === 2) {
    input = input.replace(/don't\(\).+?($|do\(\))/gs, '');
  }
  const matches = input.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g);
  const nums = Array.from(matches).map((match) => [+match[1], +match[2]]);
  const sum = nums.reduce((acc, [a, b]) => acc + a * b, 0);
  console.log(sum);
}
solve(input, 1);
solve(input, 2);
