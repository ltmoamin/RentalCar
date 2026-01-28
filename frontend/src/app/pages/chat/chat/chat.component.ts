import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { ChatService, ChatMessage, ChatConversation, ChatAdmin } from '../../../services/chat.service';
import { WebSocketService, TypingIndicator } from '../../../services/websocket.service';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
    @ViewChild('fileInput') private fileInput!: ElementRef;

    conversations: ChatConversation[] = [];
    messages: ChatMessage[] = [];
    admins: ChatAdmin[] = [];

    selectedConversation: ChatConversation | null = null;
    newMessage = '';
    isTyping = false;
    typingUser: string | null = null;

    currentUserId: number = 0;
    currentUserName: string = '';
    currentUserAvatar: string | null = null;
    currentUserEmail: string = '';
    isAdmin = false;

    showEmojiPicker = false;
    isRecording = false;
    isCancellingRecording = false;
    recordingTime = 0;
    activeActionId: number | null = null;
    private recordingInterval: any;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];

    loading = false;
    sendingMessage = false;
    uploadingFile = false;
    showUserModal = false;
    availableUsers: any[] = [];
    activeAudioId: number | null = null;
    private audioPlayer: HTMLAudioElement | null = null;

    maxRecordingTime = 60; // 60 seconds limit

    private destroy$ = new Subject<void>();
    private shouldScrollToBottom = true;
    private typingSubject = new Subject<void>();

    emojiCategories = [
        { name: 'Smileys', icons: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '🤤', '😌', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'] },
        { name: 'Gestures', icons: ['👍', '👎', '👊', '✌️', '👌', '✋', '👐', '👏', '🤝', '🙏', '👋', '🤟', '🤘', '🤙', '🤞', '🖕', '✍️', '💅', '🤳', '💪'] },
        { name: 'Hearts', icons: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
        { name: 'Activities', icons: ['✨', '🎉', '🎊', '🎈', '🎂', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎆', '🎇', '🧨', '🧧'] },
        { name: 'Objects', icons: ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛵', '🚲', '🛴', '🛹', '✈️', '⛵', '⚓', '⌚', '📱', '💻', '⌨️', '🖱️', '🖨️', '🎧', '📻', '📸', '📹', '🎥', '🏮', '🔦', '💡', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📅', '📆', '📁', '📂', '✂️', '📌', '📎', '🗝️', '🛠️', '⚙️', '⚖️', '⛓️', '🔫', '💣', '🔪', '🛡️', '🚬', '⚰️', '⚱️', '🏺'] }
    ];
    selectedEmojiCategory = 'Smileys';
    conversationSearchQuery = '';
    showArchived = false;

    get pinnedConversations(): ChatConversation[] {
        return this.filteredList.filter(c => c.pinned && !c.archived);
    }

    get directConversations(): ChatConversation[] {
        return this.filteredList.filter(c => !c.pinned && !c.archived);
    }

    get archivedConversations(): ChatConversation[] {
        return this.filteredList.filter(c => c.archived);
    }

    private get filteredList(): ChatConversation[] {
        if (!this.conversationSearchQuery.trim()) return this.conversations;
        const query = this.conversationSearchQuery.toLowerCase();
        return this.conversations.filter(c =>
            this.getOtherParticipantName(c).toLowerCase().includes(query) ||
            (c.lastMessage && c.lastMessage.toLowerCase().includes(query))
        );
    }

    get activeEmojis(): string[] {
        return this.emojiCategories.find(c => c.name === this.selectedEmojiCategory)?.icons || [];
    }

    constructor(
        private chatService: ChatService,
        private webSocketService: WebSocketService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.loadUserInfo();
        this.loadConversations();
        if (this.currentUserEmail) {
            this.webSocketService.connect(this.currentUserEmail);
        }
        this.setupWebSocket();
        this.setupTypingDebounce();
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.recordingInterval) clearInterval(this.recordingInterval);
    }

    private loadUserInfo(): void {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.currentUserId = user.id;
            this.currentUserEmail = user.email;
            const rawName = user.fullName || user.username || user.email;
            this.currentUserName = this.formatDisplayName(rawName);
            this.currentUserAvatar = user.avatarUrl || user.avatar || null;
            this.isAdmin = user.role === 'ADMIN';
        }
    }

    loadAvailableParticipants(): void {
        this.showUserModal = true;
        this.loading = true;
        this.availableUsers = [];

        if (this.isAdmin) {
            this.userService.getAllUsers()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (users) => {
                        this.availableUsers = users.map(u => ({
                            id: Number(u.id),
                            name: `${u.firstName} ${u.lastName}`,
                            role: u.role
                        }));
                        this.loading = false;
                    },
                    error: () => this.loading = false
                });
        } else {
            this.chatService.getAvailableAdmins()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (users) => {
                        this.availableUsers = users.map(u => ({
                            id: u.id,
                            name: u.name,
                            role: 'ADMIN'
                        }));
                        this.loading = false;
                    },
                    error: () => this.loading = false
                });
        }
    }

    startNewChat(user: any): void {
        this.showUserModal = false;
        this.chatService.startConversation(user.id)
            .subscribe({
                next: (conv) => {
                    const exists = this.conversations.find(c => c.id === conv.id);
                    if (!exists) {
                        this.conversations.unshift(conv);
                    }
                    this.selectConversation(conv);
                },
                error: (err) => console.error('Failed to start chat', err)
            });
    }

    loadConversations(): void {
        this.loading = true;
        this.chatService.getConversations()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (conversations) => {
                    this.conversations = conversations;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Failed to load conversations', err);
                    this.loading = false;
                }
            });
    }

    private setupWebSocket(): void {
        this.webSocketService.onMessage$
            .pipe(takeUntil(this.destroy$))
            .subscribe((message) => {
                if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
                    // Avoid duplicates by checking message ID
                    const exists = this.messages.some(m => m.id === message.id);
                    if (!exists) {
                        this.messages = [...this.messages, message];
                        this.shouldScrollToBottom = true;
                        this.markConversationAsRead();
                    }
                } else {
                    // Force increment for background conversations
                    const conv = this.conversations.find(c => c.id === message.conversationId);
                    if (conv) {
                        conv.unreadCount = (conv.unreadCount || 0) + 1;
                        this.conversations = [...this.conversations]; // Force UI update
                    }
                }
                this.updateConversationPreview(message);
            });

        this.webSocketService.onTyping$
            .pipe(takeUntil(this.destroy$))
            .subscribe((indicator) => {
                const conv = this.conversations.find(c => c.id === indicator.conversationId);
                if (conv) {
                    (conv as any).isTyping = indicator.isTyping;
                    this.conversations = [...this.conversations]; // Force UI update
                }

                if (this.selectedConversation && indicator.conversationId === this.selectedConversation.id) {
                    this.typingUser = indicator.isTyping ? indicator.userName : null;
                }
            });

        this.webSocketService.onReadReceipt$
            .pipe(takeUntil(this.destroy$))
            .subscribe((conversationId) => {
                if (this.selectedConversation && conversationId === this.selectedConversation.id) {
                    this.messages.forEach(msg => {
                        if (msg.senderId === this.currentUserId && !msg.read) msg.read = true;
                    });
                }
            });
    }

    openImage(url: string | undefined): void {
        if (url) window.open(url, '_blank');
    }

    toggleVocal(message: ChatMessage): void {
        if (!message.id || !message.mediaUrl) return;

        if (this.activeAudioId === message.id) {
            this.audioPlayer?.pause();
            this.activeAudioId = null;
        } else {
            if (this.audioPlayer) {
                this.audioPlayer.pause();
            }
            this.audioPlayer = new Audio(message.mediaUrl);
            this.activeAudioId = message.id;
            this.audioPlayer.onended = () => this.activeAudioId = null;
            this.audioPlayer.play();
        }
    }

    private pad(n: number): string {
        return n < 10 ? '0' + n : n.toString();
    }

    private setupTypingDebounce(): void {
        this.typingSubject.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
            if (this.selectedConversation && this.newMessage.trim()) {
                this.webSocketService.sendTypingIndicator(this.selectedConversation.id, true);
                setTimeout(() => {
                    if (this.selectedConversation) this.webSocketService.sendTypingIndicator(this.selectedConversation.id, false);
                }, 2000);
            }
        });
    }

    selectConversation(conversation: ChatConversation): void {
        this.selectedConversation = conversation;
        this.loadMessages();
        this.markConversationAsRead();
    }

    private loadMessages(): void {
        if (!this.selectedConversation) return;
        this.loading = true;
        this.chatService.getMessages(this.selectedConversation.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.messages = res.content.reverse();
                    this.loading = false;
                    this.shouldScrollToBottom = true;
                },
                error: () => this.loading = false
            });
    }

    private markConversationAsRead(): void {
        if (!this.selectedConversation) return;
        this.chatService.markAsRead(this.selectedConversation.id)
            .subscribe(() => {
                if (this.selectedConversation) {
                    this.selectedConversation.unreadCount = 0;
                    this.webSocketService.markAsRead(this.selectedConversation.id);
                }
            });
    }

    sendMessage(): void {
        if (!this.newMessage.trim() || !this.selectedConversation || this.sendingMessage) return;

        const receiverId = this.isAdmin ? this.selectedConversation.userId : this.selectedConversation.adminId;
        this.sendingMessage = true;
        this.chatService.sendMessage({
            receiverId,
            content: this.newMessage.trim(),
            messageType: 'TEXT'
        }).subscribe({
            next: (msg) => {
                if (this.selectedConversation && msg.conversationId === this.selectedConversation.id) {
                    const exists = this.messages.some(m => m.id === msg.id);
                    if (!exists) {
                        this.messages = [...this.messages, msg];
                        this.shouldScrollToBottom = true;
                    }
                }
                this.newMessage = '';
                this.sendingMessage = false;
                this.updateConversationPreview(msg);
            },
            error: () => this.sendingMessage = false
        });
    }

    toggleEmojiPicker() { this.showEmojiPicker = !this.showEmojiPicker; }
    addEmoji(emoji: string) { this.newMessage += emoji; this.showEmojiPicker = false; }
    onInputChange() { this.typingSubject.next(); }
    onKeyPress(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); } }

    openFileInput(type: 'image' | 'file') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'image' ? 'image/*' : '*/*';
        input.onchange = (e: any) => this.handleFileUpload(e.target.files[0], type.toUpperCase() as any);
        input.click();
    }

    handleFileUpload(file: File, type: 'IMAGE' | 'VIDEO' | 'VOICE') {
        if (!file || !this.selectedConversation) return;
        this.uploadingFile = true;
        this.chatService.uploadMedia(file).subscribe({
            next: (res) => {
                const receiverId = this.isAdmin ? this.selectedConversation!.userId : this.selectedConversation!.adminId;
                this.chatService.sendMessage({ receiverId, messageType: type, mediaUrl: res.url }).subscribe({
                    next: (msg) => {
                        if (this.selectedConversation && msg.conversationId === this.selectedConversation.id) {
                            const exists = this.messages.some(m => m.id === msg.id);
                            if (!exists) {
                                this.messages = [...this.messages, msg];
                                this.shouldScrollToBottom = true;
                            }
                        }
                        this.uploadingFile = false;
                        this.updateConversationPreview(msg);
                    },
                    error: (err) => {
                        console.error('Message send failed:', err);
                        this.uploadingFile = false;
                    }
                });
            },
            error: (err) => {
                console.error('Upload failed:', err);
                alert('Upload failed: ' + (err.error?.error || 'Invalid file type. Please restart backend.'));
                this.uploadingFile = false;
            }
        });
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Detect best supported type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
            this.mediaRecorder = new MediaRecorder(stream, { mimeType });

            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
            this.mediaRecorder.onstop = () => {
                if (this.isCancellingRecording) {
                    this.isCancellingRecording = false;
                    return;
                }
                const blob = new Blob(this.audioChunks, { type: mimeType });
                const ext = mimeType.split('/')[1].split(';')[0];
                const file = new File([blob], `voice.${ext}`, { type: mimeType });
                this.handleFileUpload(file, 'VOICE');
            };
            this.mediaRecorder.start();
            this.isRecording = true;
            this.isCancellingRecording = false;
            this.recordingTime = this.maxRecordingTime; // Start from 60
            this.recordingInterval = setInterval(() => {
                this.recordingTime--;
                if (this.recordingTime <= 0) {
                    this.stopRecording();
                }
            }, 1000);
        } catch (e) {
            console.error('Recording error:', e);
            alert('Could not access microphone');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.isCancellingRecording = false;
            this.mediaRecorder.stop();
            this.isRecording = false;
            clearInterval(this.recordingInterval);
        }
    }

    cancelRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.isCancellingRecording = true;
            this.mediaRecorder.stop();
            this.isRecording = false;
            clearInterval(this.recordingInterval);
        }
    }

    togglePin(conv: ChatConversation, e: Event) {
        e.stopPropagation();
        this.chatService.togglePin(conv.id).subscribe({
            next: () => {
                conv.pinned = !conv.pinned;
                this.conversations.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
                this.activeActionId = null;
            },
            error: (err) => console.error('Failed to pin', err)
        });
    }

    archiveConversation(conv: ChatConversation, e: Event) {
        e.stopPropagation();
        this.chatService.toggleArchive(conv.id).subscribe({
            next: () => {
                conv.archived = !conv.archived;
                this.activeActionId = null; // Close swipe actions
            },
            error: (err) => console.error('Failed to archive', err)
        });
    }

    deleteConversation(conv: ChatConversation, e: Event) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            this.chatService.deleteConversation(conv.id).subscribe({
                next: () => {
                    this.conversations = this.conversations.filter(c => c.id !== conv.id);
                    if (this.selectedConversation?.id === conv.id) {
                        this.selectedConversation = null;
                    }
                    this.activeActionId = null;
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }

    formatDisplayName(name: string | undefined): string {
        if (!name) return 'User';
        if (name.includes('@')) {
            const user = name.split('@')[0];
            return user.split(/[._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        return name;
    }

    getInitials(name: string | undefined): string {
        if (!name) return '?';
        const display = this.formatDisplayName(name);
        return display.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getOtherParticipantName(c: ChatConversation): string {
        return this.formatDisplayName(this.isAdmin ? c.userName : c.adminName);
    }

    getOtherParticipantAvatar(c: ChatConversation): string | null {
        return this.isAdmin ? c.userAvatar || null : c.adminAvatar || null;
    }

    isOwnMessage(m: ChatMessage): boolean { return m.senderId === this.currentUserId; }

    isContinuation(m: ChatMessage, i: number): boolean {
        if (i === 0) return false;
        const prev = this.messages[i - 1];
        const diff = (new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime()) / 60000;
        return m.senderId === prev.senderId && diff < 5;
    }

    formatTime(d: string): string { return d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''; }
    formatDate(d: string): string {
        const date = new Date(d), today = new Date(), yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    }

    private scrollToBottom() {
        try { if (this.messagesContainer) this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight; this.shouldScrollToBottom = false; } catch (e) { }
    }

    private updateConversationPreview(m: ChatMessage) {
        const c = this.conversations.find(conv => conv.id === m.conversationId);
        if (c) {
            c.lastMessage = m.messageType === 'TEXT' ? m.content : `[${m.messageType}]`;
            c.lastMessageAt = m.createdAt;

            // Re-sort: Move to top and maintain pinned order
            const others = this.conversations.filter(conv => conv.id !== c.id);
            this.conversations = [c, ...others];
            this.conversations.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

            // Refresh selectedConversation reference if it's the same one
            if (this.selectedConversation && this.selectedConversation.id === c.id) {
                this.selectedConversation = c;
            }
        }
    }
}
