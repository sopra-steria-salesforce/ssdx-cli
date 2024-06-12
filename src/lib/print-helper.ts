import colors from 'colors/safe.js';
import pad from 'pad';

const COL_WIDTH = process.stdout.columns - 2;
const SEPARATOR_ICON = '=';

function header(text: string): void {
  let spaced_text = pad(COL_WIDTH / 2 + text.length / 2 - 2, text);

  spaced_text = pad(spaced_text, COL_WIDTH - 2);

  const separator = pad('', COL_WIDTH, SEPARATOR_ICON);
  const output = ` ${separator} \n |${spaced_text}| \n ${separator} \n`;

  const formatted_text = colors.bold(colors.yellow(output));

  console.log();
  console.log(formatted_text);
}

export { header };
