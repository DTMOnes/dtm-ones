export type ContactRequestType = "player" | "recruiter";

export type ContactRequestStatus = "new" | "read" | "archived";

export type ContactRequest = {
  id: string;
  type: ContactRequestType;
  email: string;
  phone: string;
  message: string;
  status: ContactRequestStatus;
  created_at: string;
  updated_at: string;
};

export type ContactsInboxFilter = "active" | "new" | "read" | "archived";
