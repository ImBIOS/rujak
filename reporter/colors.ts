// https://github.com/lukeed/kleur/blob/598f24cb7f5054b7c504e9ab89251305311131b1/colors.mjs

// The MIT License (MIT)

// Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
// Copyright (c) 2023 Imamuzzaki Abu Salam <imamuzzaki@gmail.com> (imam.dev)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function colors(x: number, y: number) {
  const rgx = new RegExp(`\\x1b\\[${y}m`, 'g');
  const open = `\x1b[${x}m`;
  const close = `\x1b[${y}m`;

  return function (e: boolean, txt: string | null) {
    if (!e || txt === null) return txt ?? '';
    return (
      open +
      (typeof txt === 'string' && txt.includes(close)
        ? txt.replace(rgx, close + open)
        : txt) +
      close
    );
  };
}

// modifiers
export const reset = colors(0, 0);
export const bold = colors(1, 22);
export const dim = colors(2, 22);
export const italic = colors(3, 23);
export const underline = colors(4, 24);
export const inverse = colors(7, 27);
export const hidden = colors(8, 28);
export const strikethrough = colors(9, 29);

// colors
export const black = colors(30, 39);
export const red = colors(31, 39);
export const green = colors(32, 39);
export const yellow = colors(33, 39);
export const blue = colors(34, 39);
export const magenta = colors(35, 39);
export const cyan = colors(36, 39);
export const white = colors(37, 39);
export const gray = colors(90, 39);

// background colors
export const bgBlack = colors(40, 49);
export const bgRed = colors(41, 49);
export const bgGreen = colors(42, 49);
export const bgYellow = colors(43, 49);
export const bgBlue = colors(44, 49);
export const bgMagenta = colors(45, 49);
export const bgCyan = colors(46, 49);
export const bgWhite = colors(47, 49);

export default colors;
