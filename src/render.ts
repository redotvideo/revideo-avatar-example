require('dotenv').config();

import { renderVideo } from '@revideo/renderer';
import { searchImage, getVideoScript, generateAudio, getVideoHeadline, getWordTimestamps } from './utils';
import * as fs from 'fs';

async function main(){
    const url = await searchImage(`bmw logo svg`);

    const words = await getWordTimestamps("./public/avatar_headline.mp4");

    const metadata = { logo: url, words: words}
    fs.writeFileSync('./public/metadata.json', JSON.stringify(metadata, null, 2));

    await renderVideo('./vite.config.ts', metadata);

}

main();
