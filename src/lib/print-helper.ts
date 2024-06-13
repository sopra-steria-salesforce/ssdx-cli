import colors from 'colors/safe.js';
import pad from 'pad';

export function header(text: string): void {
  text = frame({
    text: text,
    full_width: true,
    half_width: false,
    separator: '-',
    edge: '|',
  });
  const formatted_text = colors.bold(colors.bgYellow(text));
  console.log('\n' + formatted_text + '\n');
}

export function subheader(text: string): void {
  text = frame({
    text: text,
    full_width: false,
    half_width: true,
    separator: '=',
    edge: '||',
  });
  const formatted_text = colors.bold(colors.yellow(text));
  console.log('\n' + formatted_text + '\n');
}

export function info(text: string): void {
  console.log(colors.white(`\n ${text}\n`));
}

export function warning(text: string): void {
  console.log(colors.yellow(`${text}`));
}

export function error(text: string): void {
  console.log(colors.bold(colors.red(`${text}`)));
}

const CMD_WIDTH = process.stdout.columns;
function full_width_length(edge: string): number {
  return CMD_WIDTH - edge_length(edge);
}
function half_width_length(edge: string): number {
  return CMD_WIDTH / 2 - edge_length(edge);
}

function edge_length(edge: string): number {
  return edge.length * 2;
}

function frame(frameOptions: {
  text: string;
  full_width: boolean;
  half_width: boolean;
  separator: string;
  edge: string;
}): string {
  const { text, full_width, half_width, separator, edge } = frameOptions;
  const width = full_width
    ? full_width_length(edge)
    : half_width
      ? half_width_length(edge)
      : text.length;

  let middle = pad(width / 2 - edge.length + text.length / 2 - 2, text);
  middle = pad(middle, width - edge_length(edge));

  const line = pad('', width, separator);
  const output = ` ${line} \n ${edge}${middle}${edge} \n ${line} \n`;

  return output;
}
