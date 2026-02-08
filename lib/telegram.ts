import TelegramBot from 'node-telegram-bot-api';

// Initialize bot instance if token is available
// We use polling: false for the sender service, as it only sends messages
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a singleton instance for sending
let bot: TelegramBot | null = null;

if (token) {
    bot = new TelegramBot(token, { polling: false });
}

export type TelegramMessageResult = {
    success: boolean;
    error?: string;
    messageId?: number;
};

/**
 * Send a message to a specific Telegram chat ID
 */
export async function sendTelegramMessage(chatId: string, text: string): Promise<TelegramMessageResult> {
    if (!bot) {
        console.warn('Telegram bot token not configured');
        return { success: false, error: 'Telegram bot not configured' };
    }

    try {
        const message = await bot.sendMessage(chatId, text);
        return { success: true, messageId: message.message_id };
    } catch (error: any) {
        console.error('Failed to send Telegram message:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Check if the bot is configured
 */
export function isTelegramConfigured(): boolean {
    return !!bot;
}
