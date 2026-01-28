export enum NotificationType {
    MESSAGE = 'MESSAGE',
    SUPPORT = 'SUPPORT',
    PAYMENT = 'PAYMENT',
    REVIEW = 'REVIEW',
    ACCOUNT = 'ACCOUNT',
    BOOKING = 'BOOKING',
    CHAT = 'CHAT',
    CAR_UPDATE = 'CAR_UPDATE'
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    link?: string;
    createdAt: string;
}
