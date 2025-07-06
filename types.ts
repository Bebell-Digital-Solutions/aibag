
export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: number;
  sender: MessageSender;
  text: string;
  isError?: boolean;
}

export interface UploadedFile {
  name: string;
  content: string;
}
