import colors from 'colors/safe.js';
import {
  Color,
  frame,
  getFrameOptions,
  setColors,
} from './print-helper/print-helper-formatter.js';

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
  info(text);
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
  info(text);
}

export function info(text: string): void {
  // TODO: add logging
  console.log(text);
}
export function warning(text: string): void {
  console.log(colors.yellow(text));
}
export function error(text: string): void {
  console.log(colors.bold(colors.red(text)));
}
export function code(text: string): void {
  console.log(colors.bgRed(colors.black(text)));
}
