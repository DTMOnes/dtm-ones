import type { ContactRequest } from "@/types/contact-request";

export type ContactMutationSuccess = {
  ok: true;
  request: ContactRequest;
};

export type ContactDeleteSuccess = {
  ok: true;
};
