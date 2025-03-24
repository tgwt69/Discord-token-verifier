import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format Discord timestamp (snowflake ID) to a human-readable date
export function formatDiscordTimestamp(id: string): string {
  try {
    // Discord IDs (snowflakes) can be converted to timestamps
    // Discord epoch is 2015-01-01T00:00:00.000Z
    const snowflake = BigInt(id);
    const timestamp = Number(snowflake >> 22n) + 1420070400000;
    
    // Format as date
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Unknown date';
  }
}

// Validate Discord token format
export function validateTokenFormat(token: string): boolean {
  return token.length > 50 && token.includes('.');
}

// Format phone number to hide most digits
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return 'Not provided';
  
  // Just return a partially masked phone number
  const lastFour = phone.slice(-4);
  return `+x (xxx) xxx-${lastFour}`;
}

// Get avatar URL from Discord user data
export function getAvatarUrl(userId: string, avatarHash: string | null): string {
  if (!avatarHash) {
    // Return default Discord avatar
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
  }
  
  // Return the user's actual avatar
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}
