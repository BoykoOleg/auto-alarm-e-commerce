import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  sender_type: 'client' | 'company';
  message_text: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

interface RequestChatProps {
  requestId: number;
  onClose?: () => void;
}

export const RequestChat = ({ requestId }: RequestChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  const loadMessages = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(
        `https://functions.poehali.dev/08452dc9-363d-4b0e-b976-d796d2cc8717?action=messages&request_id=${requestId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Файл слишком большой (максимум 10 МБ)',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    setIsSending(true);
    const token = localStorage.getItem('authToken');

    try {
      let fileData = null;

      if (selectedFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(selectedFile);
        });

        fileData = {
          content: base64,
          name: selectedFile.name,
          type: selectedFile.type,
        };
      }

      const response = await fetch(
        `https://functions.poehali.dev/08452dc9-363d-4b0e-b976-d796d2cc8717?action=send_message&request_id=${requestId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message_text: newMessage.trim() || null,
            file: fileData,
          }),
        }
      );

      if (response.ok) {
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        await loadMessages();
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.message || 'Не удалось отправить сообщение',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 overscroll-contain -webkit-overflow-scrolling-touch">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Icon name="Loader2" className="animate-spin" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
            <p className="text-center text-sm">Сообщений пока нет. Начните переписку!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2.5 sm:p-3 ${
                  msg.sender_type === 'client'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.message_text && (
                  <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{msg.message_text}</p>
                )}
                
                {msg.file_url && (
                  <div className="mt-2 flex items-center gap-2">
                    {msg.file_type?.startsWith('image/') ? (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.file_url}
                          alt={msg.file_name || 'Изображение'}
                          className="max-w-full rounded cursor-pointer hover:opacity-90"
                        />
                      </a>
                    ) : (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 underline hover:opacity-80 text-sm"
                      >
                        <Icon name="Paperclip" size={16} />
                        <span className="break-all">{msg.file_name}</span>
                      </a>
                    )}
                  </div>
                )}
                
                <p className="text-xs opacity-70 mt-1">{formatDate(msg.created_at)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-3 sm:p-4 border-t bg-background">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 text-sm bg-muted p-2 rounded">
            <Icon name="Paperclip" size={16} className="flex-shrink-0" />
            <span className="flex-1 truncate">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-6 w-6 p-0"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0 h-10 w-10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Icon name="Paperclip" size={18} />
          </Button>

          <textarea
            ref={textareaRef}
            placeholder="Сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={1}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <Button
            size="icon"
            className="flex-shrink-0 h-10 w-10"
            onClick={handleSendMessage}
            disabled={isSending || (!newMessage.trim() && !selectedFile)}
          >
            <Icon name={isSending ? 'Loader2' : 'Send'} size={18} className={isSending ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestChat;
