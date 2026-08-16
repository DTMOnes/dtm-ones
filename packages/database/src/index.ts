export { createDatabase, type Database } from "./client";
export {
  createDomain,
  type ClientKind,
  type Domain,
  type RosterClient,
  type StoreClientInput,
  type StoredCategory,
  type StoredClient,
  type Visibility,
} from "./domain";
export { DomainError, isDomainError, type DomainErrorCode } from "./errors";
export * as schema from "./schema";
