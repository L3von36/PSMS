import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@/lib/generated-prisma';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const prisma = new PrismaClient();

async function startBot() {
    if (!token) {
        console.error('❌ TELEGRAM_BOT_TOKEN is not defined in .env file');
        process.exit(1);
    }

    console.log('🤖 Starting Telegram Bot Authentication Service...');

    // Create bot in polling mode
    const bot = new TelegramBot(token, { polling: true });

    // Handle /start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        console.log(`📩 Received /start from chat ID: ${chatId}`);

        const opts: TelegramBot.SendMessageOptions = {
            reply_markup: {
                keyboard: [
                    [{
                        text: "📱 Share My Phone Number",
                        request_contact: true
                    }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
            }
        };

        bot.sendMessage(chatId, "Welcome to PSMS Parent Portal! 👋\n\nTo receive school updates, please tap the button below to share your phone number so we can link your account.", opts);
    });

    // Handle contact sharing
    bot.on('contact', async (msg) => {
        const chatId = msg.chat.id;
        const contact = msg.contact;

        if (!contact || !contact.phone_number) {
            bot.sendMessage(chatId, "❌ Could not receive phone number. Please try again.");
            return;
        }

        let phoneNumber = contact.phone_number;
        // Normalize phone number (remove + if present, ensuring format matches DB if needed)
        // Assuming DB stores as entered. Often Telegram sends with +, our format in seed is like +251... 
        // We'll try to match exact or with/without +

        console.log(`📱 Received contact: ${phoneNumber} from ${contact.first_name}`);

        // Try to find parent in DB
        // We'll search for exact match, or match without the leading +, or with it added

        // Simplest: Try to find parent where phone ends with the last 9 digits to be safe? 
        // Or just exact match validation relative to how data is stored.
        // Let's simpler: Find First.

        try {
            // Normalize: Remove spaces, dashes, parentheses
            const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
            // Formats to check:
            // 1. Exact clean input (e.g. "+251911..." or "0911...")
            // 2. Without leading '+' if present (e.g. "251911...")
            // 3. With leading '+' if missing (e.g. "+0911..." -> probably not, standard is +country)
            // 4. If starts with country code (e.g. 251), try replacing with 0 (e.g. "0911...")
            // 5. If starts with 0, try replacing with country code +251 (e.g. "+251911...")

            // For now, let's stick to the most common variations relative to "cleanPhone"
            const variations = [
                cleanPhone, // Exact
                cleanPhone.startsWith('+') ? cleanPhone.substring(1) : `+${cleanPhone}`, // Toggle +
            ];

            // If it looks like international format (e.g. +251...), try local '0' format
            if (cleanPhone.startsWith('+251')) {
                variations.push('0' + cleanPhone.substring(4));
            } else if (cleanPhone.startsWith('251')) {
                variations.push('0' + cleanPhone.substring(3));
            }

            // If it looks like local format (09...), try international +251
            if (cleanPhone.startsWith('09') || cleanPhone.startsWith('07')) {
                variations.push('+251' + cleanPhone.substring(1));
            }

            console.log(`🔍 Searching for parent with phone variations: ${variations.join(', ')}`);

            let parent = await prisma.parent.findFirst({
                where: {
                    phone: { in: variations }
                }
            });

            if (parent) {
                // Update parent with chat ID
                await prisma.parent.update({
                    where: { id: parent.id },
                    data: { telegramChatId: chatId.toString() }
                });

                console.log(`✅ Linked ${parent.firstName} ${parent.lastName} to Chat ID ${chatId}`);

                bot.sendMessage(chatId, `✅ Success! Your account for ${parent.firstName} ${parent.lastName} has been linked.\n\nYou will now receive school updates here.`, {
                    reply_markup: { remove_keyboard: true }
                });
            } else {
                console.log(`⚠️ Phone number ${phoneNumber} not found in database.`);
                bot.sendMessage(chatId, "⚠️ We couldn't find a parent account with this phone number.\n\nPlease ensure your school registration has this number, or contact the school administrator.", {
                    reply_markup: { remove_keyboard: true }
                });
            }

        } catch (error) {
            console.error('Database error:', error);
            bot.sendMessage(chatId, "❌ An error occurred while linking your account. Please try again later.");
        }
    });

    console.log('✅ Bot is running and waiting for messages...');
}

startBot().catch(console.error);
