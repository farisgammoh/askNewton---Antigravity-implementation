import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Paperclip, 
  Plus, 
  MessageSquare, 
  Bot, 
  User,
  File,
  Image,
  FileText,
  Download,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  fileUrls?: string[];
  timestamp: string;
}

interface Conversation {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  storageUrl: string;
  uploadedAt: string;
}

function ChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json() as Promise<Conversation[]>;
    }
  });

  // Fetch messages for current conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['/api/messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const response = await fetch(`/api/messages/${currentConversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json() as Promise<Message[]>;
    },
    enabled: !!currentConversationId
  });

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "New Chat" })
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    }
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ content, fileUrls }: { content: string; fileUrls?: string[] }) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          role: 'user',
          content,
          fileUrls
        })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
      setMessageInput("");
      setSelectedFiles(null);
    }
  });

  // File upload
  const uploadFiles = async (files: FileList): Promise<string[]> => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
      const result = await response.json();
      return result.url;
    });

    return Promise.all(uploadPromises);
  };

  // Handle message submission
  const handleSubmit = async () => {
    if (!messageInput.trim() && (!selectedFiles || selectedFiles.length === 0)) return;

    if (!currentConversationId) {
      await createConversation.mutateAsync();
    }

    let fileUrls: string[] = [];
    
    if (selectedFiles && selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        fileUrls = await uploadFiles(selectedFiles);
      } catch (error) {
        console.error('File upload failed:', error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    sendMessage.mutate({
      content: messageInput,
      fileUrls: fileUrls.length > 0 ? fileUrls : undefined
    });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle textarea resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageInput]);

  // Start a new conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation.mutate();
    } else if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button 
            onClick={() => createConversation.mutate()}
            className="w-full"
            data-testid="button-new-chat"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => setCurrentConversationId(conversation.id)}
                data-testid={`button-conversation-${conversation.id}`}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-sm truncate" data-testid={`text-conversation-title-${conversation.id}`}>
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="font-semibold text-lg" data-testid="text-chat-header">
                AskNewton AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about health insurance in California
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Ask me anything about health insurance in California. I can help with coverage options, enrollment, and more.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start space-x-3",
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  )}
                  data-testid={`message-${message.id}`}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  
                  <Card className={cn(
                    "flex-1 max-w-3xl",
                    message.role === 'user' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-white dark:bg-gray-800'
                  )}>
                    <CardContent className="p-4">
                      <div className="prose dark:prose-invert max-w-none" data-testid={`message-content-${message.id}`}>
                        {message.content}
                      </div>
                      
                      {message.fileUrls && message.fileUrls.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.fileUrls.map((url, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              {getFileIcon('application/octet-stream')}
                              <span className="text-sm truncate flex-1">Attached file {index + 1}</span>
                              <Button size="sm" variant="ghost" asChild>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            {/* File Preview */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Selected Files:</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setSelectedFiles(null)}
                    data-testid="button-clear-files"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {getFileIcon(file.type)}
                      <span className="truncate">{file.name}</span>
                      <Badge variant="outline">{formatFileSize(file.size)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setSelectedFiles(e.target.files)}
                data-testid="input-file-upload"
              />
              
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="button-attach-file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about health insurance..."
                  className="min-h-[44px] max-h-[120px] resize-none pr-12"
                  data-testid="input-message"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={(!messageInput.trim() && !selectedFiles) || sendMessage.isPending || isUploading}
                data-testid="button-send-message"
              >
                {sendMessage.isPending || isUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {(sendMessage.error || createConversation.error) && (
              <Alert className="mt-3 border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {sendMessage.error?.message || createConversation.error?.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;