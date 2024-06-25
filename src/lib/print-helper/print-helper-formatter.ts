import colors from 'colors/safe.js';
import pad from 'pad';
import { Color } from '../print-helper.js';

export { frame, getFrameOptions, setColor };

const CMD_WIDTH = process.stdout.columns;
function full_width_length(edge: string): number {
  return CMD_WIDTH - edge_length(edge);
}
function half_width_length(edge: string): number {
  return Math.abs(CMD_WIDTH / 2) - edge_length(edge);
}

function edge_length(edge: string): number {
  return edge.length * 2;
}

function frame(frameOptions: frameOptions): string {
  const {
    text,
    subText,
    full_width,
    half_width,
    is_center_text,
    top,
    bottom,
    separator,
    edge,
  } = frameOptions;
  const width = full_width
    ? full_width_length(edge)
    : half_width
      ? half_width_length(edge)
      : text.length;

  const output = [];

  const line = pad('', width, separator ?? ' ');
  const middleText = getMiddleText(width, is_center_text, edge, text);
  const middleSubText = getMiddleText(width, is_center_text, edge, subText);

  if (top) output.push(line);
  if (middleText) output.push(middleText);
  if (middleSubText) output.push(middleSubText);
  if (bottom) output.push(line);

  return '\n ' + output.join(' \n ') + ' \n';
}

function getMiddleText(
  width: number,
  is_center_text: boolean,
  edge: string,
  text?: string
) {
  if (!text) return undefined;
  if (text.length > width) text = text.substring(0, width - 4) + '...';
  text = is_center_text ? center_text(text, width) : normal_text(text, width);
  return `${edge ?? ' '}${text}${edge ?? ' '}`;
}

function center_text(text: string, width: number) {
  text = pad(width / 2 + text.length / 2, text);
  text = pad(text, width - 2);
  return text;
}

function normal_text(text: string, width: number): string {
  return pad(text, width - 2);
}

interface frameOptions {
  text: string;
  subText: string | undefined;
  full_width: boolean;
  half_width: boolean;
  is_center_text: boolean;
  top: boolean;
  bottom: boolean;
  separator: string;
  edge: string;
}

function getFrameOptions(text: string, subText?: string): frameOptions {
  return {
    text: text,
    subText: subText,
    full_width: false,
    half_width: false,
    is_center_text: true,
    top: false,
    bottom: false,
    separator: ' ',
    edge: ' ',
  };
}

function setColor(text: string, color: Color): string {
  switch (color) {
    case Color.black:
      return colors.black(text);
    case Color.red:
      return colors.red(text);
    case Color.green:
      return colors.green(text);
    case Color.yellow:
      return colors.yellow(text);
    case Color.blue:
      return colors.blue(text);
    case Color.magenta:
      return colors.magenta(text);
    case Color.cyan:
      return colors.cyan(text);
    case Color.white:
      return colors.white(text);
    case Color.gray:
      return colors.gray(text);
    case Color.grey:
      return colors.grey(text);
    case Color.bgBlack:
      return colors.bgBlack(text);
    case Color.bgRed:
      return colors.bgRed(text);
    case Color.bgGreen:
      return colors.bgGreen(text);
    case Color.bgYellow:
      return colors.bgYellow(text);
    case Color.bgBlue:
      return colors.bgBlue(text);
    case Color.bgMagenta:
      return colors.bgMagenta(text);
    case Color.bgCyan:
      return colors.bgCyan(text);
    case Color.bgWhite:
      return colors.bgWhite(text);
    default:
      return text;
  }
}
