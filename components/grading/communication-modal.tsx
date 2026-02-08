"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Copy, MessageCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface CommunicationModalProps {
    isOpen: boolean
    onClose: () => void
    studentName: string
    initialMessage: string
}

export function CommunicationModal({
    isOpen,
    onClose,
    studentName,
    initialMessage,
}: CommunicationModalProps) {
    const [message, setMessage] = useState(initialMessage)

    const handleCopy = () => {
        navigator.clipboard.writeText(message)
        toast.success("Message copied to clipboard")
    }

    const handleTelegram = () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
        onClose()
    }

    const handleWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        Share Performance: {studentName}
                    </DialogTitle>
                    <DialogDescription>
                        Preview and send the grade summary to the parent via their preferred channel.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Textarea 
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                        className="min-h-[200px] font-mono text-sm leading-relaxed"
                    />
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleCopy}
                        className="flex-1 gap-2"
                    >
                        <Copy className="h-4 w-4" />
                        Copy
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleTelegram}
                        className="flex-1 gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                    >
                        <Send className="h-4 w-4" />
                        Telegram
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleWhatsApp}
                        className="flex-1 gap-2 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                    >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
