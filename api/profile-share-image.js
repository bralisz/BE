'use strict';

const sharp = require('sharp');
const publicProfileApi = require('./public-profile');

const WIDTH = 1200;
const HEIGHT = 630;
const CARD_WIDTH = 248;
const CARD_HEIGHT = 224;
const CARD_GAP = 22;
const CARD_START_X = 71;
const CARD_Y = 326;
const DEFAULT_ORIGIN = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billieilishtv.site').replace(/\/$/, '');

/*
 * Vetores Hershey Sans 1-stroke usados para desenhar o texto sem depender das
 * fontes instaladas no Vercel. Assim, o preview não mostra caracteres em forma
 * de quadrados quando o Sharp/libvips é executado em um ambiente sem fontes.
 *
 * Acknowledgements required by the Hershey font data license:
 * - The Hershey Fonts were originally created by Dr. A. V. Hershey while
 *   working at the U. S. National Bureau of Standards.
 * - The format of the font data in this distribution was originally created by
 *   James Hurt, Cognition, Inc., 900 Technology Park Drive, Billerica, MA 01821.
 */
const HERSHEY_GLYPHS = Object.freeze({" ":{"a":378.0,"d":""},"!":{"a":315.0,"d":"M 315 662 L 315 220 M 315 63 L 284 31.5 L 315 0 L 346 31.5 L 315 63"},"\"":{"a":504.0,"d":"M 220 662 L 220 441 M 472 662 L 472 441"},"#":{"a":662.0,"d":"M 441 788 L 220 -220 M 630 788 L 410 -220 M 220 378 L 662 378 M 189 189 L 630 189"},"$":{"a":630.0,"d":"M 346 788 L 346 -126 M 472 788 L 472 -126 M 630 567 L 567 630 L 472 662 L 346 662 L 252 630 L 189 567 L 189 504 L 220 441 L 252 410 L 315 378 L 504 315 L 567 284 L 598 252 L 630 189 L 630 94.5 L 567 31.5 L 472 0 L 346 0 L 252 31.5 L 189 94.5"},"%":{"a":756.0,"d":"M 756 662 L 189 0 M 346 662 L 410 598 L 410 536 L 378 472 L 315 441 L 252 441 L 189 504 L 189 567 L 220 630 L 284 662 L 346 662 L 410 630 L 504 598 L 598 598 L 693 630 L 756 662 M 630 220 L 567 189 L 536 126 L 536 63 L 598 0 L 662 0 L 724 31.5 L 756 94.5 L 756 158 L 693 220 L 630 220"},"&":{"a":819.0,"d":"M 819 378 L 819 410 L 788 441 L 756 441 L 724 410 L 693 346 L 630 189 L 567 94.5 L 504 31.5 L 441 0 L 315 0 L 252 31.5 L 220 63 L 189 126 L 189 189 L 220 252 L 252 284 L 472 410 L 504 441 L 536 504 L 536 567 L 504 630 L 441 662 L 378 630 L 346 567 L 346 504 L 378 410 L 441 315 L 598 94.5 L 662 31.5 L 724 0 L 788 0 L 819 31.5 L 819 63"},"'":{"a":315.0,"d":"M 252 598 L 220 630 L 252 662 L 284 630 L 284 567 L 252 504 L 220 472"},"(":{"a":441.0,"d":"M 441 788 L 378 724 L 315 630 L 252 504 L 220 346 L 220 220 L 252 63 L 315 -63 L 378 -158 L 441 -220"},")":{"a":441.0,"d":"M 189 788 L 252 724 L 315 630 L 378 504 L 410 346 L 410 220 L 378 63 L 315 -63 L 252 -158 L 189 -220"},"*":{"a":504.0,"d":"M 346 472 L 346 94.5 M 189 378 L 504 189 M 504 378 L 189 189"},"+":{"a":819.0,"d":"M 504 567 L 504 0 M 220 284 L 788 284"},",":{"a":252.0,"d":"M 252 126 L 220 94.5 L 189 126 L 220 158 L 252 126 L 252 63 L 189 0"},"-":{"a":819.0,"d":"M 220 284 L 788 284"},".":{"a":252.0,"d":"M 220 158 L 189 126 L 220 94.5 L 252 126 L 220 158"},"/":{"a":693.0,"d":"M 724 788 L 158 -220"},"0":{"a":630.0,"d":"M 378 662 L 284 630 L 220 536 L 189 378 L 189 284 L 220 126 L 284 31.5 L 378 0 L 441 0 L 536 31.5 L 598 126 L 630 284 L 630 378 L 598 536 L 536 630 L 441 662 L 378 662"},"1":{"a":630.0,"d":"M 284 536 L 346 567 L 441 662 L 441 0"},"2":{"a":630.0,"d":"M 220 504 L 220 536 L 252 598 L 284 630 L 346 662 L 472 662 L 536 630 L 567 598 L 598 536 L 598 472 L 567 410 L 504 315 L 189 0 L 630 0"},"3":{"a":630.0,"d":"M 252 662 L 598 662 L 410 410 L 504 410 L 567 378 L 598 346 L 630 252 L 630 189 L 598 94.5 L 536 31.5 L 441 0 L 346 0 L 252 31.5 L 220 63 L 189 126"},"4":{"a":630.0,"d":"M 504 662 L 189 220 L 662 220 M 504 662 L 504 0"},"5":{"a":630.0,"d":"M 567 662 L 252 662 L 220 378 L 252 410 L 346 441 L 441 441 L 536 410 L 598 346 L 630 252 L 630 189 L 598 94.5 L 536 31.5 L 441 0 L 346 0 L 252 31.5 L 220 63 L 189 126"},"6":{"a":630.0,"d":"M 598 567 L 567 630 L 472 662 L 410 662 L 315 630 L 252 536 L 220 378 L 220 220 L 252 94.5 L 315 31.5 L 410 0 L 441 0 L 536 31.5 L 598 94.5 L 630 189 L 630 220 L 598 315 L 536 378 L 441 410 L 410 410 L 315 378 L 252 315 L 220 220"},"7":{"a":630.0,"d":"M 630 662 L 315 0 M 189 662 L 630 662"},"8":{"a":630.0,"d":"M 346 662 L 252 630 L 220 567 L 220 504 L 252 441 L 315 410 L 441 378 L 536 346 L 598 284 L 630 220 L 630 126 L 598 63 L 567 31.5 L 472 0 L 346 0 L 252 31.5 L 220 63 L 189 126 L 189 220 L 220 284 L 284 346 L 378 378 L 504 410 L 567 441 L 598 504 L 598 567 L 567 630 L 472 662 L 346 662"},"9":{"a":630.0,"d":"M 598 441 L 567 346 L 504 284 L 410 252 L 378 252 L 284 284 L 220 346 L 189 441 L 189 472 L 220 567 L 284 630 L 378 662 L 410 662 L 504 630 L 567 567 L 598 441 L 598 284 L 567 126 L 504 31.5 L 410 0 L 346 0 L 252 31.5 L 220 94.5"},":":{"a":252.0,"d":"M 220 378 L 189 346 L 220 315 L 252 346 L 220 378 M 220 158 L 189 126 L 220 94.5 L 252 126 L 220 158"},";":{"a":252.0,"d":"M 220 378 L 189 346 L 220 315 L 252 346 L 220 378 M 252 126 L 220 94.5 L 189 126 L 220 158 L 252 126 L 252 63 L 189 0"},"<":{"a":756.0,"d":"M 724 567 L 220 284 L 724 0"},"=":{"a":819.0,"d":"M 220 378 L 788 378 M 220 189 L 788 189"},">":{"a":756.0,"d":"M 220 567 L 724 284 L 220 0"},"?":{"a":567.0,"d":"M 189 504 L 189 536 L 220 598 L 252 630 L 315 662 L 441 662 L 504 630 L 536 598 L 567 536 L 567 472 L 536 410 L 504 378 L 378 315 L 378 220 M 378 63 L 346 31.5 L 378 0 L 410 31.5 L 378 63"},"@":{"a":850.0,"d":"M 662 410 L 630 472 L 567 504 L 472 504 L 410 472 L 378 441 L 346 346 L 346 252 L 378 189 L 441 158 L 536 158 L 598 189 L 630 252 M 472 504 L 410 441 L 378 346 L 378 252 L 410 189 L 441 158 M 662 504 L 630 252 L 630 189 L 693 158 L 756 158 L 819 220 L 850 315 L 850 378 L 819 472 L 788 536 L 724 598 L 662 630 L 567 662 L 472 662 L 378 630 L 315 598 L 252 536 L 220 472 L 189 378 L 189 284 L 220 189 L 252 126 L 315 63 L 378 31.5 L 472 0 L 567 0 L 662 31.5 L 724 63 L 756 94.5 M 693 504 L 662 252 L 662 189 L 693 158"},"A":{"a":567.0,"d":"M 378 662 L 126 0 M 378 662 L 630 0 M 220 220 L 536 220"},"B":{"a":662.0,"d":"M 220 662 L 220 0 M 220 662 L 504 662 L 598 630 L 630 598 L 662 536 L 662 472 L 630 410 L 598 378 L 504 346 M 220 346 L 504 346 L 598 315 L 630 284 L 662 220 L 662 126 L 630 63 L 598 31.5 L 504 0 L 220 0"},"C":{"a":662.0,"d":"M 662 504 L 630 567 L 567 630 L 504 662 L 378 662 L 315 630 L 252 567 L 220 504 L 189 410 L 189 252 L 220 158 L 252 94.5 L 315 31.5 L 378 0 L 504 0 L 567 31.5 L 630 94.5 L 662 158"},"D":{"a":662.0,"d":"M 220 662 L 220 0 M 220 662 L 441 662 L 536 630 L 598 567 L 630 504 L 662 410 L 662 252 L 630 158 L 598 94.5 L 536 31.5 L 441 0 L 220 0"},"E":{"a":598.0,"d":"M 220 662 L 220 0 M 220 662 L 630 662 M 220 346 L 472 346 M 220 0 L 630 0"},"F":{"a":567.0,"d":"M 220 662 L 220 0 M 220 662 L 630 662 M 220 346 L 472 346"},"G":{"a":662.0,"d":"M 662 504 L 630 567 L 567 630 L 504 662 L 378 662 L 315 630 L 252 567 L 220 504 L 189 410 L 189 252 L 220 158 L 252 94.5 L 315 31.5 L 378 0 L 504 0 L 567 31.5 L 630 94.5 L 662 158 L 662 252 M 504 252 L 662 252"},"H":{"a":693.0,"d":"M 220 662 L 220 0 M 662 662 L 662 0 M 220 346 L 662 346"},"I":{"a":252.0,"d":"M 220 662 L 220 0"},"J":{"a":504.0,"d":"M 472 662 L 472 158 L 441 63 L 410 31.5 L 346 0 L 284 0 L 220 31.5 L 189 63 L 158 158 L 158 220"},"K":{"a":662.0,"d":"M 220 662 L 220 0 M 662 662 L 220 220 M 378 378 L 662 0"},"L":{"a":536.0,"d":"M 220 662 L 220 0 M 220 0 L 598 0"},"M":{"a":756.0,"d":"M 220 662 L 220 0 M 220 662 L 472 0 M 724 662 L 472 0 M 724 662 L 724 0"},"N":{"a":693.0,"d":"M 220 662 L 220 0 M 220 662 L 662 0 M 662 662 L 662 0"},"O":{"a":693.0,"d":"M 378 662 L 315 630 L 252 567 L 220 504 L 189 410 L 189 252 L 220 158 L 252 94.5 L 315 31.5 L 378 0 L 504 0 L 567 31.5 L 630 94.5 L 662 158 L 693 252 L 693 410 L 662 504 L 630 567 L 567 630 L 504 662 L 378 662"},"P":{"a":662.0,"d":"M 220 662 L 220 0 M 220 662 L 504 662 L 598 630 L 630 598 L 662 536 L 662 441 L 630 378 L 598 346 L 504 315 L 220 315"},"Q":{"a":693.0,"d":"M 378 662 L 315 630 L 252 567 L 220 504 L 189 410 L 189 252 L 220 158 L 252 94.5 L 315 31.5 L 378 0 L 504 0 L 567 31.5 L 630 94.5 L 662 158 L 693 252 L 693 410 L 662 504 L 630 567 L 567 630 L 504 662 L 378 662 M 472 126 L 662 -63"},"R":{"a":662.0,"d":"M 220 662 L 220 0 M 220 662 L 504 662 L 598 630 L 630 598 L 662 536 L 662 472 L 630 410 L 598 378 L 504 346 L 220 346 M 441 346 L 662 0"},"S":{"a":630.0,"d":"M 630 567 L 567 630 L 472 662 L 346 662 L 252 630 L 189 567 L 189 504 L 220 441 L 252 410 L 315 378 L 504 315 L 567 284 L 598 252 L 630 189 L 630 94.5 L 567 31.5 L 472 0 L 346 0 L 252 31.5 L 189 94.5"},"T":{"a":504.0,"d":"M 346 662 L 346 0 M 126 662 L 567 662"},"U":{"a":693.0,"d":"M 220 662 L 220 189 L 252 94.5 L 315 31.5 L 410 0 L 472 0 L 567 31.5 L 630 94.5 L 662 189 L 662 662"},"V":{"a":567.0,"d":"M 126 662 L 378 0 M 630 662 L 378 0"},"W":{"a":756.0,"d":"M 158 662 L 315 0 M 472 662 L 315 0 M 472 662 L 630 0 M 788 662 L 630 0"},"X":{"a":630.0,"d":"M 189 662 L 630 0 M 630 662 L 189 0"},"Y":{"a":567.0,"d":"M 126 662 L 378 346 L 378 0 M 630 662 L 378 346"},"Z":{"a":630.0,"d":"M 630 662 L 189 0 M 189 662 L 630 662 M 189 0 L 630 0"},"[":{"a":441.0,"d":"M 220 788 L 220 -220 M 252 788 L 252 -220 M 220 788 L 441 788 M 220 -220 L 441 -220"},"\\":{"a":441.0,"d":"M 94.5 662 L 536 -94.5"},"]":{"a":441.0,"d":"M 378 788 L 378 -220 M 410 788 L 410 -220 M 189 788 L 410 788 M 189 -220 L 410 -220"},"^":{"a":504.0,"d":"M 346 724 L 94.5 284 M 346 724 L 598 284"},"_":{"a":567.0,"d":"M 94.5 -220 L 662 -220"},"`":{"a":252.0,"d":"M 252 504 L 189 441 L 189 378 L 220 346 L 252 378 L 220 410 L 189 378"},"a":{"a":598.0,"d":"M 567 441 L 567 0 M 567 346 L 504 410 L 441 441 L 346 441 L 284 410 L 220 346 L 189 252 L 189 189 L 220 94.5 L 284 31.5 L 346 0 L 441 0 L 504 31.5 L 567 94.5"},"b":{"a":598.0,"d":"M 220 662 L 220 0 M 220 346 L 284 410 L 346 441 L 441 441 L 504 410 L 567 346 L 598 252 L 598 189 L 567 94.5 L 504 31.5 L 441 0 L 346 0 L 284 31.5 L 220 94.5"},"c":{"a":567.0,"d":"M 567 346 L 504 410 L 441 441 L 346 441 L 284 410 L 220 346 L 189 252 L 189 189 L 220 94.5 L 284 31.5 L 346 0 L 441 0 L 504 31.5 L 567 94.5"},"d":{"a":598.0,"d":"M 567 662 L 567 0 M 567 346 L 504 410 L 441 441 L 346 441 L 284 410 L 220 346 L 189 252 L 189 189 L 220 94.5 L 284 31.5 L 346 0 L 441 0 L 504 31.5 L 567 94.5"},"e":{"a":567.0,"d":"M 189 252 L 567 252 L 567 315 L 536 378 L 504 410 L 441 441 L 346 441 L 284 410 L 220 346 L 189 252 L 189 189 L 220 94.5 L 284 31.5 L 346 0 L 441 0 L 504 31.5 L 567 94.5"},"f":{"a":378.0,"d":"M 410 662 L 346 662 L 284 630 L 252 536 L 252 0 M 158 441 L 378 441"},"g":{"a":598.0,"d":"M 567 441 L 567 -63 L 536 -158 L 504 -189 L 441 -220 L 346 -220 L 284 -189 M 567 346 L 504 410 L 441 441 L 346 441 L 284 410 L 220 346 L 189 252 L 189 189 L 220 94.5 L 284 31.5 L 346 0 L 441 0 L 504 31.5 L 567 94.5"},"h":{"a":598.0,"d":"M 220 662 L 220 0 M 220 315 L 315 410 L 378 441 L 472 441 L 536 410 L 567 315 L 567 0"},"i":{"a":252.0,"d":"M 189 662 L 220 630 L 252 662 L 220 693 L 189 662 M 220 441 L 220 0"},"j":{"a":315.0,"d":"M 252 662 L 284 630 L 315 662 L 284 693 L 252 662 M 284 441 L 284 -94.5 L 252 -189 L 189 -220 L 126 -220"},"k":{"a":536.0,"d":"M 220 662 L 220 0 M 536 441 L 220 126 M 346 252 L 567 0"},"l":{"a":252.0,"d":"M 220 662 L 220 0"},"m":{"a":945.0,"d":"M 220 441 L 220 0 M 220 315 L 315 410 L 378 441 L 472 441 L 536 410 L 567 315 L 567 0 M 567 315 L 662 410 L 724 441 L 819 441 L 882 410 L 914 315 L 914 0"},"n":{"a":598.0,"d":"M 220 441 L 220 0 M 220 315 L 315 410 L 378 441 L 472 441 L 536 410 L 567 315 L 567 0"},"o":{"a":598.0,"d":"M 346 441 L 284 410 L 220 346 L 189 252 L 189 189 L 220 94.5 L 284 31.5 L 346 0 L 441 0 L 504 31.5 L 567 94.5 L 598 189 L 598 252 L 567 346 L 504 410 L 441 441 L 346 441"},"p":{"a":598.0,"d":"M 220 441 L 220 -220 M 220 346 L 284 410 L 346 441 L 441 441 L 504 410 L 567 346 L 598 252 L 598 189 L 567 94.5 L 504 31.5 L 441 0 L 346 0 L 284 31.5 L 220 94.5"},"q":{"a":598.0,"d":"M 567 441 L 567 -220 M 567 346 L 504 410 L 441 441 L 346 441 L 284 410 L 220 346 L 189 252 L 189 189 L 220 94.5 L 284 31.5 L 346 0 L 441 0 L 504 31.5 L 567 94.5"},"r":{"a":410.0,"d":"M 220 441 L 220 0 M 220 252 L 252 346 L 315 410 L 378 441 L 472 441"},"s":{"a":536.0,"d":"M 536 346 L 504 410 L 410 441 L 315 441 L 220 410 L 189 346 L 220 284 L 284 252 L 441 220 L 504 189 L 536 126 L 536 94.5 L 504 31.5 L 410 0 L 315 0 L 220 31.5 L 189 94.5"},"t":{"a":378.0,"d":"M 252 662 L 252 126 L 284 31.5 L 346 0 L 410 0 M 158 441 L 378 441"},"u":{"a":598.0,"d":"M 220 441 L 220 126 L 252 31.5 L 315 0 L 410 0 L 472 31.5 L 567 126 M 567 441 L 567 0"},"v":{"a":504.0,"d":"M 158 441 L 346 0 M 536 441 L 346 0"},"w":{"a":693.0,"d":"M 189 441 L 315 0 M 441 441 L 315 0 M 441 441 L 567 0 M 693 441 L 567 0"},"x":{"a":536.0,"d":"M 189 441 L 536 0 M 536 441 L 189 0"},"y":{"a":504.0,"d":"M 158 441 L 346 0 M 536 441 L 346 0 L 284 -126 L 220 -189 L 158 -220 L 126 -220"},"z":{"a":536.0,"d":"M 536 441 L 189 0 M 189 441 L 536 441 M 189 0 L 536 0"},"{":{"a":441.0,"d":"M 378 788 L 315 756 L 284 724 L 252 662 L 252 598 L 284 536 L 315 504 L 346 441 L 346 378 L 284 315 M 315 756 L 284 693 L 284 630 L 315 567 L 346 536 L 378 472 L 378 410 L 346 346 L 220 284 L 346 220 L 378 158 L 378 94.5 L 346 31.5 L 315 0 L 284 -63 L 284 -126 L 315 -189 M 284 252 L 346 189 L 346 126 L 315 63 L 284 31.5 L 252 -31.5 L 252 -94.5 L 284 -158 L 315 -189 L 378 -220"},"|":{"a":252.0,"d":"M 220 788 L 220 -220"},"}":{"a":441.0,"d":"M 252 788 L 315 756 L 346 724 L 378 662 L 378 598 L 346 536 L 315 504 L 284 441 L 284 378 L 346 315 M 315 756 L 346 693 L 346 630 L 315 567 L 284 536 L 252 472 L 252 410 L 284 346 L 410 284 L 284 220 L 252 158 L 252 94.5 L 284 31.5 L 315 0 L 346 -63 L 346 -126 L 315 -189 M 346 252 L 284 189 L 284 126 L 315 63 L 346 31.5 L 378 -31.5 L 378 -94.5 L 346 -158 L 315 -189 L 252 -220"},"~":{"a":756.0,"d":"M 189 189 L 189 252 L 220 346 L 284 378 L 346 378 L 410 346 L 536 252 L 598 220 L 662 220 L 724 252 L 756 315 M 189 252 L 220 315 L 284 346 L 346 346 L 410 315 L 536 220 L 598 189 L 662 189 L 724 220 L 756 315 L 756 378"}});
const HERSHEY_CAP_HEIGHT = 662;

function truncate(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(1, maxLength - 1)).trim()}...`;
}

function normalizeVectorText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/Æ/g, 'AE')
    .replace(/æ/g, 'ae')
    .replace(/Œ/g, 'OE')
    .replace(/œ/g, 'oe')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^\x20-\x7e]/g, '?');
}

function glyphFor(character) {
  return HERSHEY_GLYPHS[character] || HERSHEY_GLYPHS['?'];
}

function vectorTextMetrics(value, fontSize, letterSpacing = 0) {
  const text = normalizeVectorText(value);
  const scale = Number(fontSize) / HERSHEY_CAP_HEIGHT;
  let width = 0;
  for (const character of text) {
    width += glyphFor(character).a * scale + Number(letterSpacing);
  }
  if (text.length) width -= Number(letterSpacing);
  return { text, scale, width, height: Number(fontSize) };
}

function fitFontSize(value, preferredSize, maxWidth, letterSpacing = 0, minimumSize = 9) {
  let size = Number(preferredSize);
  while (size > minimumSize && vectorTextMetrics(value, size, letterSpacing).width > maxWidth) size -= 1;
  return Math.max(minimumSize, size);
}

function vectorText(value, x, baselineY, options = {}) {
  const fontSize = Number(options.fontSize || 20);
  const letterSpacing = Number(options.letterSpacing || 0);
  const color = options.color || '#ffffff';
  const opacity = options.opacity == null ? 1 : Number(options.opacity);
  const strokeWidth = Number(options.strokeWidth || Math.max(1.2, fontSize * 0.065));
  const align = options.align || 'start';
  const metrics = vectorTextMetrics(value, fontSize, letterSpacing);
  let cursorX = Number(x);
  if (align === 'center') cursorX -= metrics.width / 2;
  if (align === 'end') cursorX -= metrics.width;
  const parts = [];

  for (const character of metrics.text) {
    const glyph = glyphFor(character);
    if (glyph.d) {
      parts.push(`<path d="${glyph.d}" transform="translate(${cursorX.toFixed(3)} ${Number(baselineY).toFixed(3)}) scale(${metrics.scale.toFixed(7)} ${(-metrics.scale).toFixed(7)})" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    cursorX += glyph.a * metrics.scale + letterSpacing;
  }

  return parts.join('');
}

function originFromRequest(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const host = forwardedHost || String(req.headers.host || new URL(DEFAULT_ORIGIN).host);
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || (/^(localhost|127\.)/.test(host) ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function absoluteAssetUrl(value, origin) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw, origin);
    if (!['http:', 'https:', 'data:'].includes(parsed.protocol)) return '';
    return parsed.href;
  } catch (_) {
    return '';
  }
}

async function fetchImageBuffer(value, origin, maxBytes = 10 * 1024 * 1024) {
  const url = absoluteAssetUrl(value, origin);
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8' },
      signal: controller.signal,
      cache: 'force-cache'
    });
    if (!response.ok) return null;
    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength && declaredLength > maxBytes) return null;
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.startsWith('image/')) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length || buffer.length > maxBytes) return null;
    return buffer;
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function roundedMask(width, height, radius) {
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/></svg>`);
}

async function makeAvatar(buffer) {
  if (!buffer) {
    const initials = vectorText('BE', 69, 80, {
      fontSize: 28,
      strokeWidth: 2.1,
      color: '#d8deea',
      align: 'center',
      letterSpacing: 1
    });
    return sharp({
      create: { width: 138, height: 138, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .composite([{ input: Buffer.from(`<svg width="138" height="138" xmlns="http://www.w3.org/2000/svg"><circle cx="69" cy="69" r="69" fill="#222a39"/>${initials}</svg>`) }])
      .png()
      .toBuffer();
  }

  return sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(138, 138, { fit: 'cover', position: 'centre' })
    .composite([{ input: roundedMask(138, 138, 69), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function cardLabel(collection) {
  const key = String(collection || '').toLowerCase();
  if (key === 'movies') return 'FILME';
  if (key === 'series') return 'SERIE';
  return 'VIDEO';
}

async function makeFavoriteCard(item, index, imageBuffer) {
  const label = cardLabel(item && item.collection);
  const base = imageBuffer
    ? sharp(imageBuffer, { failOn: 'none' }).rotate().resize(CARD_WIDTH, CARD_HEIGHT, { fit: 'cover', position: 'centre' })
    : sharp({
      create: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        channels: 4,
        background: { r: 23 + index * 5, g: 28, b: 42 + index * 8, alpha: 1 }
      }
    });

  const labelText = vectorText(label, CARD_WIDTH - 43, 31, {
    fontSize: 10,
    strokeWidth: 1,
    color: '#090b10',
    align: 'center',
    letterSpacing: 0.1
  });

  const overlay = Buffer.from(`
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#03060b" stop-opacity="0.02"/>
          <stop offset="0.72" stop-color="#03060b" stop-opacity="0.03"/>
          <stop offset="1" stop-color="#03060b" stop-opacity="0.42"/>
        </linearGradient>
      </defs>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#shade)"/>
      <rect x="${CARD_WIDTH - 72}" y="14" width="58" height="25" rx="7" fill="#f6f7fb" fill-opacity="0.94"/>
      ${labelText}
    </svg>`);

  return base
    .composite([
      { input: overlay },
      { input: roundedMask(CARD_WIDTH, CARD_HEIGHT, 18), blend: 'dest-in' }
    ])
    .png()
    .toBuffer();
}

async function makeBackground(bannerBuffer) {
  if (!bannerBuffer) {
    return sharp({
      create: { width: WIDTH, height: HEIGHT, channels: 4, background: { r: 7, g: 10, b: 16, alpha: 1 } }
    }).png().toBuffer();
  }

  return sharp(bannerBuffer, { failOn: 'none' })
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .blur(3.5)
    .modulate({ brightness: 0.55, saturation: 0.75 })
    .png()
    .toBuffer();
}

async function renderProfileImage(profile, origin) {
  const favorites = Array.isArray(profile && profile.favorites)
    ? profile.favorites.filter(Boolean).slice(0, 4)
    : [];
  const hasFavorites = favorites.length > 0;

  const avatarUrl = profile && profile.avatarUrl ? profile.avatarUrl : '/assets/images/profile/default-avatar.png';
  const bannerUrl = profile && profile.bannerUrl ? profile.bannerUrl : '';
  const assetRequests = [
    fetchImageBuffer(avatarUrl, origin),
    fetchImageBuffer(bannerUrl, origin),
    ...favorites.map(item => fetchImageBuffer(item.imageUrl || item.bannerUrl, origin))
  ];
  const [avatarSource, bannerSource, ...favoriteSources] = await Promise.all(assetRequests);

  const [background, avatar, ...cards] = await Promise.all([
    makeBackground(bannerSource),
    makeAvatar(avatarSource),
    ...favorites.map((item, index) => makeFavoriteCard(item, index, favoriteSources[index]))
  ]);

  const displayName = truncate(profile && profile.displayName ? profile.displayName : 'Usuario', 32);
  const username = truncate(profile && profile.username ? profile.username : 'usuario', 20);
  const nameSize = fitFontSize(displayName, 45, 700, 0.7, 29);
  const nicknameSize = fitFontSize(username, 24, 430, 0.4, 16);

  const nameText = vectorText(displayName, 235, 153, {
    fontSize: nameSize,
    strokeWidth: Math.max(2.2, nameSize * 0.085),
    color: '#ffffff',
    letterSpacing: 0.7
  });
  const nicknameText = vectorText(username, 237, 190, {
    fontSize: nicknameSize,
    strokeWidth: Math.max(1.6, nicknameSize * 0.075),
    color: '#b7bfce',
    letterSpacing: 0.4
  });
  const favoritesText = vectorText('FAVORITOS', 71, 289, {
    fontSize: 19,
    strokeWidth: 1.6,
    color: '#9098a8',
    letterSpacing: 2.4
  });
  const footerText = vectorText('BILLIEILISHTV.SITE', 1129, 595, {
    fontSize: 17,
    strokeWidth: 1.45,
    color: '#8b93a2',
    align: 'end',
    letterSpacing: 0.8
  });

  const foreground = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pageShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#05070c" stop-opacity="0.54"/>
          <stop offset="0.46" stop-color="#060910" stop-opacity="0.82"/>
          <stop offset="1" stop-color="#06080d" stop-opacity="0.99"/>
        </linearGradient>
        <radialGradient id="glow" cx="18%" cy="4%" r="75%">
          <stop offset="0" stop-color="#315ea8" stop-opacity="0.22"/>
          <stop offset="1" stop-color="#0a0d14" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#pageShade)"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
      <circle cx="140" cy="160" r="73" fill="#fff" fill-opacity="0.96"/>
      <circle cx="140" cy="160" r="69" fill="#070a10"/>
      ${nameText}
      ${nicknameText}
      ${hasFavorites ? favoritesText : ''}
      ${footerText}
    </svg>`);

  const composites = [
    { input: foreground, top: 0, left: 0 },
    { input: avatar, top: 91, left: 71 },
    ...cards.map((card, index) => ({ input: card, top: CARD_Y, left: CARD_START_X + index * (CARD_WIDTH + CARD_GAP) }))
  ];

  return sharp(background)
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function profileShareImage(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const username = publicProfileApi.normalizeUsername(
    Array.isArray(req.query && req.query.username) ? req.query.username[0] : req.query && req.query.username
  );
  if (!publicProfileApi.validUsername(username)) return res.status(400).end();

  try {
    const profile = await publicProfileApi.fetchPublicProfile(username);
    if (!profile) return res.status(404).end();
    const image = await renderProfileImage(profile, originFromRequest(req));
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', String(image.length));
    res.setHeader('Content-Disposition', `inline; filename="${username}-favoritos.png"`);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(image);
  } catch (_) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).end();
  }
}

module.exports = profileShareImage;
module.exports.renderProfileImage = renderProfileImage;
