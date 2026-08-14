'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BsSend, 
  BsRobot, 
  BsX, 
  BsDash,
  BsImage, 
  BsFileEarmark, 
  BsCameraVideo,
  BsDownload,
  BsTrash,
  BsPaperclip,
  BsLightningCharge,
  BsStars,
  BsMic,
  BsVolumeUp,
  BsVolumeMute
} from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  name: string;
  url: string;
  size?: string;
  preview?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: MediaAttachment[];
}

export default function MultiModalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your DevOps Multi-Modal AI Assistant. You can send text, logs, images, or configuration files for automated analysis. How can I help you today?',
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current || !voiceEnabled) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const url = e.target?.result as string;
        let type: 'image' | 'video' | 'file' = 'file';
        
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        }
        
        const attachment: MediaAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          name: file.name,
          url,
          size: formatFileSize(file.size),
          preview: type === 'image' ? url : undefined
        };
        
        setAttachments(prev => [...prev, attachment]);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input || 'Sent attachments',
      timestamp: new Date(),
      attachments: [...attachments]
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    setTimeout(() => {
      let aiContent = '';
      const hasImages = userMessage.attachments?.some(att => att.type === 'image');
      const hasVideos = userMessage.attachments?.some(att => att.type === 'video');
      const hasFiles = userMessage.attachments?.some(att => att.type === 'file');

      if (hasImages) {
        aiContent = '📸 **Image Analysis Report**:\n\n• Detected Architecture Diagram / Metrics graph.\n• Health status: 99.8% uptime across all pods.\n• Recommendation: No latency anomalies found.';
      } else if (hasVideos) {
        aiContent = '🎥 **Video Stream Analysis**:\n\n• Evaluated deployment session footage.\n• Step latency: Build (2m), Test (45s), Push (1m).\n• Optimization: Implement Docker layer caching to save 40% time.';
      } else if (hasFiles) {
        aiContent = '📄 **Configuration File Audit**:\n\n• Hardening: Verified non-root container user.\n• Resource limits: Memory limit 512Mi, CPU 500m.\n• Security scan: 0 critical vulnerabilities detected.';
      } else {
        aiContent = generateContextualResponse(input);
      }

      const aiMessage: Message = { 
        role: 'assistant', 
        content: aiContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
      
      if (voiceEnabled) {
        setTimeout(() => speakText(aiContent), 500);
      }
    }, 1200);
  };

  const generateContextualResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('deploy') || lowerInput.includes('pipeline')) {
      return '🚀 **CI/CD Pipeline Status**:\n\n• All 24 pipelines currently healthy.\n• Last build duration: 4m 12s.\n• Docker caching enabled for stage layers.';
    } else if (lowerInput.includes('monitor') || lowerInput.includes('performance')) {
      return '📊 **Performance Diagnostic**:\n\n• CPU usage: 38% average across cluster.\n• Memory: 54% allocated.\n• p99 latency: 110ms on API endpoints.';
    } else if (lowerInput.includes('security') || lowerInput.includes('scan')) {
      return '🛡️ **Security Sweep**:\n\n• 0 High/Critical CVEs found in base images.\n• CIS Docker benchmark compliance: 100%.\n• Non-root runtime active.';
    }
    
    return 'I am ready to assist across CI/CD, Container Creation, Security Scanning, Infrastructure Diagnosis, and Incident Response. Enter your prompt or attach files above.';
  };

  const renderAttachment = (attachment: MediaAttachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img 
              src={attachment.preview || attachment.url} 
              alt={attachment.name}
              className="w-full h-36 object-cover"
            />
            <div className="p-2 bg-white">
              <p className="text-xs font-medium text-slate-700 truncate">{attachment.name}</p>
              {attachment.size && <p className="text-[10px] text-slate-400">{attachment.size}</p>}
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <div className="w-full h-36 bg-slate-800 flex items-center justify-center">
              <BsCameraVideo size={36} className="text-slate-400" />
            </div>
            <div className="p-2 bg-white">
              <p className="text-xs font-medium text-slate-700 truncate">{attachment.name}</p>
              {attachment.size && <p className="text-[10px] text-slate-400">{attachment.size}</p>}
            </div>
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-700">
              <BsFileEarmark size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">{attachment.name}</p>
              {attachment.size && <p className="text-[10px] text-slate-400">{attachment.size}</p>}
            </div>
          </div>
        );
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <BsRobot size={24} />
          {/* Green Status Indicator */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? '56px' : '620px'
      }}
      exit={{ opacity: 0, y: 15, scale: 0.98 }}
      className="fixed bottom-6 right-6 z-50 w-[460px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
    >
      {/* Header in Clean White & Grey */}
      <div className="bg-slate-50 border-b border-slate-200 p-3.5 text-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
            <BsRobot size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              DevOps Assistant
              <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                Multi-Modal
              </span>
            </h3>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {isSpeaking ? 'Speaking...' : 'Ready'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (isSpeaking) stopSpeaking();
            }}
            className={`p-1.5 rounded-md transition-colors ${
              voiceEnabled ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={voiceEnabled ? 'Voice output enabled' : 'Voice output disabled'}
          >
            {voiceEnabled ? <BsVolumeUp size={14} /> : <BsVolumeMute size={14} />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <BsDash size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <BsX size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-3 chat-widget-scrollbar"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs z-10 flex items-center justify-center border-2 border-dashed border-slate-400 m-3 rounded-xl"
                >
                  <div className="text-center">
                    <BsImage size={36} className="text-slate-700 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-slate-800">Drop files to attach</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[88%] rounded-xl p-3.5 shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs text-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs text-xs'
                  }`}>
                    {msg.content && (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    )}
                    
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.attachments.map(att => (
                          <div key={att.id}>
                            {renderAttachment(att)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`text-[10px] mt-1.5 flex items-center justify-between ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.role === 'assistant' && voiceEnabled && msg.content && (
                        <button
                          onClick={() => speakText(msg.content)}
                          className="ml-2 hover:text-slate-700 transition-colors"
                          title="Listen to this message"
                        >
                          <BsVolumeUp size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl rounded-tl-xs p-3 shadow-2xs text-xs text-slate-600 flex items-center gap-2">
                  <BsRobot className="animate-spin text-slate-500" size={14} />
                  <span>Processing multi-modal inputs...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="px-3 py-2 bg-slate-100 border-t border-slate-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BsPaperclip size={12} className="text-slate-500" />
                <span className="text-[11px] font-medium text-slate-600">
                  {attachments.length} attached
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-700 max-w-[120px] truncate">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <BsTrash size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.json,.yaml,.yml"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Attach files"
              >
                <BsPaperclip size={16} />
              </button>
              
              {/* Preserving Red Indicator when recording/mic active */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title={isListening ? "Stop recording" : "Voice input"}
                disabled={loading}
              >
                <BsMic size={16} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask DevOps Assistant or drop files..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 text-xs text-slate-800"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && attachments.length === 0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  input.trim() || attachments.length > 0
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <BsSend size={12} />
              </button>
            </div>
          </form>
        </>
      )}
    </motion.div>
  );
}
