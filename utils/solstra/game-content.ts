// Utility functions for accessing game content

import characterLines from '@/app/solstra/game-content/character-lines.json'
import namesAndThings from '@/app/solstra/game-content/names-and-things.json'

/**
 * Get a random standing line ending for villagers
 */
export function getRandomStandingLine(): string {
  const lines = characterLines.STANDING_LINE_ENDINGS
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Get a random greeting line for a specific character
 */
export function getRandomGreetingLine(characterName: string): string {
  const lines = characterLines.GREETING_LINES[characterName as keyof typeof characterLines.GREETING_LINES]
  if (!lines || lines.length === 0) {
    return `${characterName} greets you warmly.`
  }
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Get a random harvest line for a specific character
 */
export function getRandomHarvestLine(characterName: string): string {
  const lines = characterLines.HARVEST_LINES[characterName as keyof typeof characterLines.HARVEST_LINES]
  if (!lines || lines.length === 0) {
    return `${characterName} offers you something from their harvest.`
  }
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Get a random harvest item for a specific character
 */
export function getRandomHarvestItem(characterName: string): string {
  const items = namesAndThings.CHARACTER_HARVEST_ITEMS[characterName as keyof typeof namesAndThings.CHARACTER_HARVEST_ITEMS]
  if (!items || items.length === 0) {
    return "Something nice"
  }
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Get all character names
 */
export function getAllCharacterNames(): string[] {
  return namesAndThings.CHARACTER_NAMES
}

/**
 * Get a random Solis status line for the dragon
 */
export function getRandomSolisStatusLine(): string {
  const lines = characterLines.SOLIS_STATUS_LINES
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Get Solis status line by index (for hourly changes)
 */
export function getSolisStatusLineByIndex(index: number): string {
  const lines = characterLines.SOLIS_STATUS_LINES
  return lines[index % lines.length]
}

/**
 * Get a random Solis feeding line
 */
export function getRandomSolisFeedingLine(): string {
  const lines = characterLines.SOLIS_FEEDING_LINES
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Character color mapping
 */
export const CHARACTER_COLORS: Record<string, string> = {
  Evander: '#d65c06',
  Banner: '#e8b025',
  Sapphira: '#2063b6',
  Tessa: '#abad23',
  Lana: '#cf8fca',
  Leonidas: '#be7113'
}

/**
 * Get the color for a character name
 */
export function getCharacterColor(characterName: string): string {
  return CHARACTER_COLORS[characterName] || '#374151'
}

/**
 * Parse text and return data structure for rendering character names with styles
 */
export function parseTextWithCharacterNames(text: string) {
  const characterNames = Object.keys(CHARACTER_COLORS);
  const regex = new RegExp(`\\b(${characterNames.join('|')})\\b`, 'g');
  
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (characterNames.includes(part)) {
      return {
        type: 'character',
        text: part,
        color: CHARACTER_COLORS[part],
        key: index
      };
    }
    return {
      type: 'text',
      text: part,
      key: index
    };
  });
}