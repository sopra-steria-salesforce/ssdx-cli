import colors from 'colors/safe.js';
import {
  Color,
  frame,
  getFrameOptions,
  setColors,
} from './print-helper/print-helper-formatter.js';
import { logger } from './log.js';
import pad from 'pad';

export function header(
  text: string,
  subText: string | undefined = undefined,
  bgColor: Color = Color.bgYellow,
  color: Color = Color.black
): void {
  const frameOptions = getFrameOptions(text, subText);
  frameOptions.full_width = true;
  frameOptions.top = true;
  frameOptions.bottom = true;
  frameOptions.separator = '-';
  frameOptions.edge = '|';

  text = frame(frameOptions);
  text = colors.bold(colors.black(text));
  text = setColors(text, [color, bgColor]);
  info(text, false);
}

export function subheader(
  text: string,
  subText: string | undefined = undefined,
  bgColor: Color = Color.bgYellow,
  color: Color = Color.black
): void {
  const frameOptions = getFrameOptions(text, subText);
  frameOptions.half_width = true;
  frameOptions.top = true;
  frameOptions.bottom = true;
  frameOptions.separator = '-';
  frameOptions.edge = '|';

  text = frame(frameOptions);
  text = colors.bold(colors.black(text));
  text = setColors(text, [color, bgColor]);
  info(text, false);
}

export function info(text: string, log: boolean = true): void {
  if (log) logger.info(text);
  console.log(text);
}
export function warning(text: string, log: boolean = true): void {
  if (log) logger.warn(text);
  console.log(colors.yellow(text));
}
export function error(text: string, log: boolean = true): void {
  if (log) logger.error(text);
  console.log(colors.bold(colors.red(text)));
}
export function code(text: string, log: boolean = true): void {
  if (log) logger.info(text);
  console.log(colors.bgGreen(colors.black(text)));
}
export function printSeparator(): void {
  info(pad('', process.stdout.columns, '-'), false);
}
