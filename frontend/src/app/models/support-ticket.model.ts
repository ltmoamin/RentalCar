export enum SupportTicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export enum SupportIssueType {
    PAYMENT = 'PAYMENT',
    CAR_ISSUE = 'CAR_ISSUE',
    DELAY = 'DELAY',
    REFUND = 'REFUND',
    OTHER = 'OTHER'
}

export enum SupportTicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export interface SupportMessage {
    id: number;
    sender: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    createdAt: string;
}

export interface SupportTicket {
    id: number;
    subject: string;
    description: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    booking?: {
        id: number;
        startDate: string;
        endDate: string;
        totalPrice: number;
        status: string;
        carName: string;
    };
    paymentId?: number;
    status: SupportTicketStatus;
    issueType: SupportIssueType;
    priority: SupportTicketPriority;
    createdAt: string;
    updatedAt: string;
    messages: SupportMessage[];
}

// Added this to resolve the missing import error
export interface SupportTicketResponse extends SupportTicket { }

export interface SupportTicketRequest {
    subject: string;
    description: string;
    bookingId?: number;
    paymentId?: number;
    issueType: SupportIssueType;
    priority: SupportTicketPriority;
}

export interface SupportMessageRequest {
    content: string;
    mediaUrl?: string;
}
