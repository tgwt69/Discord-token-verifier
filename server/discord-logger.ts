import fetch from 'node-fetch';

// Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1362588621260984451/IgaKJyMXGYYWGg8UZ_WgKdeN_cKStoHmiOVio40l7qwatI35Bw_Bx3GxAggWBDbJEs9E';

// Interface for log message
interface LogMessage {
  type: 'INFO' | 'REQUEST' | 'TOKEN_CHECK' | 'LOGIN' | 'ERROR';
  message: string;
  data?: any;
}

/**
 * Gets emoji for the log type for better visual indicators
 * @param type Log type
 * @returns Emoji string
 */
function getEmojiForType(type: LogMessage['type']): string {
  switch (type) {
    case 'INFO':
      return '📘'; // Blue book
    case 'REQUEST':
      return '🔄'; // Arrows in circle
    case 'TOKEN_CHECK':
      return '🔍'; // Magnifying glass
    case 'LOGIN':
      return '🔑'; // Key
    case 'ERROR':
      return '⚠️'; // Warning
    default:
      return '📝'; // Note
  }
}

/**
 * Format date for display in Discord
 * @param date Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Sends a log message to Discord webhook
 * @param logMessage The message to log
 */
export async function logToDiscord(logMessage: LogMessage): Promise<void> {
  try {
    // Create a formatted message for Discord
    const { type, message, data } = logMessage;
    
    // Only send REQUEST type messages to Discord webhook
    // For other types, just log to console and return
    if (type !== 'REQUEST' && type !== 'ERROR' && type !== 'LOGIN') {
      // Still log to console
      console.log(`[DISCORD_LOGGER] [${type}] ${message}`);
      return;
    }
    
    // Get timestamp for the log
    const timestamp = new Date();
    const formattedTimestamp = formatDate(timestamp);
    
    // Format the data if it exists
    let formattedData = '';
    if (data) {
      // Remove sensitive information like tokens
      const sanitizedData = sanitizeData(data);
      
      // Limit the size of the JSON data to avoid oversized embeds
      const jsonStr = JSON.stringify(sanitizedData, null, 2);
      formattedData = jsonStr.length > 1000 
        ? `\`\`\`json\n${jsonStr.substring(0, 997)}...\n\`\`\``
        : `\`\`\`json\n${jsonStr}\n\`\`\``;
    }
    
    // Create a clean, organized title
    const emoji = getEmojiForType(type);
    const cleanTitle = `${emoji} ${type}`;
    
    // Create a footer with timestamp
    const footer = {
      text: `Timestamp: ${formattedTimestamp} • Token Checker`
    };
    
    // Create Discord embed with a thumbnail for better visibility
    const embed: any = {
      title: cleanTitle,
      description: message,
      color: getColorForType(type),
      timestamp: timestamp.toISOString(),
      footer: footer,
      fields: []
    };
    
    // Add data field if present
    if (formattedData) {
      embed.fields.push({
        name: '📄 Details',
        value: formattedData
      });
    }
    
    // Create the payload to send to Discord
    const payload = {
      username: 'Token Checker Bot',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/6295/6295417.png', // Token/security icon
      embeds: [embed]
    };
    
    console.log(`[DISCORD_LOGGER] Sending to webhook: ${DISCORD_WEBHOOK_URL.substring(0, 30)}...`);
    
    // Send the message to Discord
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Check the response from Discord
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DISCORD_LOGGER] Discord API Error (${response.status}): ${errorText}`);
    } else {
      console.log(`[DISCORD_LOGGER] Successfully sent to Discord (HTTP ${response.status})`);
    }
    
    // Log to console as well
    console.log(`[DISCORD_LOGGER] [${type}] ${message}`);
  } catch (error) {
    // If Discord logging fails, just log to console
    console.error('Error sending log to Discord:', error);
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
      console.error(error.stack);
    }
  }
}

/**
 * Sanitize data to remove sensitive information
 * @param data The data object to sanitize
 * @returns Sanitized data object
 */
function sanitizeData(data: any): any {
  if (!data) return data;
  
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Recursively sanitize objects
  const sanitizeObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      // Sanitize token fields
      if (
        typeof obj[key] === 'string' && 
        (key === 'token' || key === 'authorization' || key === 'Authorization')
      ) {
        // Replace most of the token with asterisks but keep first and last 5 chars
        const token = obj[key];
        if (token.length > 10) {
          // Use different characters for better visibility
          obj[key] = `${token.substring(0, 5)}[...]${token.substring(token.length - 5)}`;
        } else {
          obj[key] = '[REDACTED]';
        }
      }
      
      // Sanitize nested objects
      if (obj[key] && typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    });
  };
  
  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * Get color code for the log type
 * @param type Log type
 * @returns Color code
 */
function getColorForType(type: LogMessage['type']): number {
  switch (type) {
    case 'INFO':
      return 0x3498db; // Blue
    case 'REQUEST':
      return 0x2ecc71; // Green
    case 'TOKEN_CHECK':
      return 0x9b59b6; // Purple
    case 'LOGIN':
      return 0xf1c40f; // Yellow
    case 'ERROR':
      return 0xe74c3c; // Red
    default:
      return 0x95a5a6; // Gray
  }
}