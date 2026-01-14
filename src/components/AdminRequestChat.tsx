import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'

interface Message {
  id: number
  sender_type: 'client' | 'company'
  message_text: string | null
  file_url: string | null
  file_name: string | null
  file_type: string | null
  created_at: string
}

interface AdminRequestChatProps {
  requestId: number
}

export const AdminRequestChat = ({ requestId }: AdminRequestChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadMessages()
  }, [requestId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(
        `https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=messages&request_id=${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить сообщения',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Файл слишком большой (максимум 10 МБ)',
          variant: 'destructive',
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) {
      return
    }

    setIsSending(true)
    const token = localStorage.getItem('authToken')

    try {
      const messageData: any = {
        message_text: newMessage.trim() || null,
      }

      if (selectedFile) {
        const reader = new FileReader()
        const fileBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
          }
          reader.readAsDataURL(selectedFile)
        })

        messageData.file = {
          content: fileBase64,
          name: selectedFile.name,
          type: selectedFile.type,
        }
      }

      const response = await fetch(
        `https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=send_message&request_id=${requestId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        }
      )

      if (response.ok) {
        setNewMessage('')
        setSelectedFile(null)
        loadMessages()
        toast({
          title: 'Успешно',
          description: 'Сообщение отправлено',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Ошибка',
          description: error.message || 'Не удалось отправить сообщение',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Icon name="Loader" className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="MessageCircle" className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Нет сообщений</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'company' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  msg.sender_type === 'company'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Icon
                      name={msg.sender_type === 'company' ? 'Building2' : 'User'}
                      className="h-4 w-4 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {msg.message_text && (
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {msg.message_text}
                        </p>
                      )}
                      {msg.file_url && (
                        <div className="mt-2">
                          {msg.file_type?.startsWith('image/') ? (
                            <img
                              src={msg.file_url}
                              alt={msg.file_name || 'Изображение'}
                              className="max-w-full rounded border"
                            />
                          ) : (
                            <a
                              href={msg.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm underline"
                            >
                              <Icon name="Paperclip" className="h-4 w-4" />
                              {msg.file_name}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 text-sm bg-muted p-2 rounded">
            <Icon name="Paperclip" className="h-4 w-4" />
            <span className="flex-1 truncate">{selectedFile.name}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedFile(null)}
            >
              <Icon name="X" className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            disabled={isSending}
          />
          <input
            type="file"
            id={`file-upload-admin-${requestId}`}
            className="hidden"
            onChange={handleFileSelect}
            disabled={isSending}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById(`file-upload-admin-${requestId}`)?.click()}
            disabled={isSending}
          >
            <Icon name="Paperclip" className="h-4 w-4" />
          </Button>
          <Button onClick={handleSendMessage} disabled={isSending || (!newMessage.trim() && !selectedFile)}>
            {isSending ? (
              <Icon name="Loader" className="h-4 w-4 animate-spin" />
            ) : (
              <Icon name="Send" className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
