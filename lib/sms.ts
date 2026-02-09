/**
 * Mock SMS service for Ethiopia
 * This would typically integrate with Gebeta SMS, Ethio Telecom, or a similar provider.
 */

export async function sendSMS(phone: string, message: string) {
    console.log(`[SMS SERVICE] Sending to ${phone}: ${message}`)
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, messageId: Math.random().toString(36).substring(7) })
        }, 500)
    })
}
