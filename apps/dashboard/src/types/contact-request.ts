export type ContactRequestReason =
  | "seeking_representation"
  | "looking_for_a_player";

export type ContactRequestStatus = "new" | "read" | "archived";

export type ContactRequest = {
  id: string;
  reason: ContactRequestReason;
  /** Null on messages sent before the form asked for a name. */
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  message: string;
  status: ContactRequestStatus;
  createdAt: Date;
};

export type ContactsInboxFilter = "active" | "new" | "read" | "archived";
