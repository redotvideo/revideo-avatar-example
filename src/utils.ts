require('dotenv').config();

import OpenAI from 'openai';
import axios from 'axios';
import * as fs from 'fs';
import { createClient } from "@deepgram/sdk";


const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const deepgram = createClient(process.env["DEEPGRAM_API_KEY"] || "");


export async function getWordTimestamps(audioFilePath: string){
    const {result} = await deepgram.listen.prerecorded.transcribeFile(fs.readFileSync(audioFilePath), {
		model: "nova-2",
		smart_format: true,
	});

    if (result) {
        return result.results.channels[0].alternatives[0].words;
    } else {
		throw Error("transcription result is null");
    }

}

export async function getVideoScript(companyName: string, headline: string) {
  const prompt = `Create a script for a youtube short. The script should be around 50 to 70 words long and be an interesting text that introduces a company and gives a rough overview of what it does. Remember that this is for a voiceover that should be read, so things like hashtags should not be included. Now write the script for the following company: "${companyName}", the following headline was already given: "${headline}". Now return the script after the headline and nothing else, also no meta-information - ONLY THE VOICEOVER.`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4-turbo-preview',
  });

  const result = chatCompletion.choices[0].message.content;

  if (result) {
    return result;
  } else {
    throw Error("returned text is null");
  }
}

export async function getVideoHeadline(companyName: string) {
    const prompt = `Create a headline for a youtube short. The headline should be a single sentence long and the first line of a voiceover that introduces a company and gives a rough overview of what it does. The headline should directly mention the name of the company. For example, for the company "Apple", a suitable headline might be: "Apple, the company behind the iPhone, is one of the largest companies in the world. Here's everything you need to know about them." Now return the headline for the company "${companyName}" and nothing else.`;
  
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-turbo-preview',
    });
  
    const result = chatCompletion.choices[0].message.content;
  
    if (result) {
      return result;
    } else {
      throw Error("returned text is null");
    }
  }
  

export async function searchImage(q: string) {
  const apiKey = process.env['GOOGLE_SEARCH_API_KEY'];
  const cx = process.env['GOOGLE_SEARCH_CX'];
  const searchType = 'image';
  const url = `https://www.googleapis.com/customsearch/v1`;

  try {
    const response = await axios.get(url, {
      params: {
        key: apiKey,
        cx: cx,
        q: q,
        searchType: searchType
      }
    });
    return response.data.items[0].link;
  } catch (error) {
    console.error('Error fetching image search results with Axios:', error);
    throw error;
  }
}

export async function generateAudio(text: string, voiceName: string, savePath: string) {
	const data = {
		model_id: "eleven_multilingual_v2",
		text: text,
	};

	const voiceId = await getVoiceByName(voiceName);

	const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, data, {
		headers: {
			"Content-Type": "application/json",
			"xi-api-key": process.env.ELEVEN_API_KEY || "",
		},
		responseType: "arraybuffer",
	});

	fs.writeFileSync(savePath, response.data);
}

async function getVoiceByName(name: string) {
	const response = await fetch("https://api.elevenlabs.io/v1/voices", {
		method: "GET",
		headers: {
			"xi-api-key": process.env.ELEVEN_API_KEY || "",
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data: any = await response.json();
	const voice = data.voices.find((voice: {name: string; voice_id: string}) => voice.name === name);
	return voice ? voice.voice_id : null;
}
