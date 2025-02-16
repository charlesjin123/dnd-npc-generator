"use server";

import axios from 'axios';
import dotenv from 'dotenv';
import type { NPCData } from "../components/NPCGenerator"
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { OpenAI } from 'openai';

dotenv.config();

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateNPC = async (description: string): Promise<NPCData> => {
  const completionCreateResponse = await client.chat.completions.create({
    messages: [
      { role: 'system', content: `
        You are a non-player-character (NPC) generator for the Dungeons and Dragons fantasy tabletop-roleplaying game. 
        The user will provide a description of the NPC that they would like to generate, and you will flesh out the details. 
        You should provide the name, race, and job or class of the NPC, as well as a description of their backstory, personality, appearance, and notable equipment or items that they possess. 
        In the user-provided description, they might provide some details that they would like the NPC to have, such as their race or occupation. 
        In those cases, make sure that those details are present in the information you output. 
        You can call the following API to obtain more information about things in the game Dungeons and Dragons: https://www.dnd5eapi.co/api/
        The format you should output your result in is as follows: name;race;job or class;description
        Do not output any other extra words besides those information. ` },
      { role: 'user', content: `Below is the brief description that the user has provided for the NPC that they would like to generate, please generate it for them: ${description}` }
    ],
    model: 'llama3.1-8b',
    temperature: 0.9,
  });

  const npcData = completionCreateResponse.choices[0].message.content.split(';');
  return {
    name: npcData[0],
    race: npcData[1],
    class: npcData[2],
    description: npcData[3]
  }
}

export const generateNPCImage = async (npcData: NPCData): Promise<string> => {
  console.log("Generating npc image: ");
  console.log(npcData);

  const response = await openaiClient.images.generate({
    model: "dall-e-3",
    // prompt: `You are a fantasy non-player-character (NPC) generator. 
    // You will be provided with some information about an NPC and you will generate an image of the character without any text or typography.
    // Focus on just generating the visuals of the character itself.
    // Here is the NPC's description: ${npcData!.description}}.`,
    prompt: npcData!.description,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url!;
}

export const askFollowUpQuestion = async (question: string, npcData: NPCData | null): Promise<string> => {
  
  const completionFollowUpResponse = await client.chat.completions.create({
    messages: [
      { role: 'system', content: `
        You are a non-player-character (NPC) generator for the Dungeons and Dragons fantasy tabletop-roleplaying game. 
        The user will provide a description of the NPC that they would like to generate, and you will flesh out the details. 
        In the user-provided description, they might provide some details that they would like the NPC to have, such as their race or occupation. 
        In those cases, make sure that those details are present in the information you output. 
        You can call the following API to obtain more information about things in the game Dungeons and Dragons: https://www.dnd5eapi.co/api/
        Here is a data of a character you have generated previously: {name: ${npcData!.name}; race: ${npcData!.race}; class/job: ${npcData!.class}; description: ${npcData!.description}}.
        Answer some user-provided follow up questions about it to flesh out the details further.
        Answer the question directly and don't output unnecessary transition words.` },
      { role: 'user', content: `Below is the follow-up question the user would like to ask about the character with data {name: ${npcData!.name}; race: ${npcData!.race}; class/job: ${npcData!.class}; description: ${npcData!.description}}: ${question}` }
    ],
    model: 'llama3.1-8b',
    temperature: 0.9,
  });

  return completionFollowUpResponse.choices[0].message.content;
}

