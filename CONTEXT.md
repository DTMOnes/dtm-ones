# DTM Ones

A basketball agency that represents Clients. The Roster is the public Clients. Users maintain Clients and inbound ContactRequests from a dashboard.

## Language

### Staff

**User**:
A person who signs in to the dashboard. A User is either an Owner or a Staff member. A User is not a Client.
_Avoid_: Admin (as a type of person), account, operator, Client

**Owner**:
A User who can do everything Staff can, and can create other Users, change a User's name (including their own), change their role, and delete them — not their own role or themselves, which another Owner must change or delete. The dashboard always has at least one Owner.
_Avoid_: Admin, superuser

**Staff**:
A User who can manage Clients and ContactRequests and cannot manage Users. Managing Clients includes removing them to the Trash, restoring them, and deleting them from the Trash.

### Roster

**Client**:
A Player or a Coach the agency represents. A Client is not a User. A Client is exactly one of Player or Coach; the same human doing both is two Clients. Kind is required. A Client has a Visibility. Staff create a Client by choosing Player or Coach; name, nationality, last club, and Eurobasket link may be unset while the Client is private. Players and Coaches both have a presentation image and a gallery.
_Avoid_: User, talent, represented being, super-entity

**Visibility**:
Whether a Client is on the Roster. Public means on the Roster. Private means not on the Roster. A Client may be public only when that kind’s profile is complete. Visibility is not a document-draft workflow.
_Avoid_: draft, published, GitHub

**Eurobasket link**:
A URL to the Client’s profile on Eurobasket. Players and Coaches can both have one. A public Client has a Eurobasket link.
_Avoid_: eurobasket url, scouting link, profile url

**Roster**:
The public Clients. A private Client is still a Client, not on the Roster.
_Avoid_: team, catalog, all Clients, the database of Clients

**Player**:
A basketball player the agency represents. A Player is a Client, is not a User, does not sign in, and is not a Coach. A Player has at most one Category, a height, and videos. A public Player has a complete profile: name, Category, presentation image, height, nationality, last club, Eurobasket link, at least one gallery image, and at least one video.
_Avoid_: User, account, athlete-as-login, Coach-as-Player

**Coach**:
A basketball coach the agency represents. A Coach is a Client, is not a Player, is not a User, and does not have height, Category, or videos. A public Coach has a complete profile: name, nationality, last club, Eurobasket link, presentation image, and at least one gallery image.
_Avoid_: Player, Player tagged “Coaches”

**Trash**:
Clients that Staff or an Owner have removed. A Client in the Trash is not on the Roster and is not listed with the other Clients. Restoring a Client keeps its Visibility; public means it returns to the Roster. Deleting from the Trash destroys the Client. The Trash holds only Clients.
_Avoid_: Bucket, recycle bin, archive, trash bin, ContactRequest

**Category**:
A Player’s position on the court. Staff create and rename Categories. A Category cannot be deleted while any Player has it. A Coach does not have a Category.
_Avoid_: Youths, Coaches-as-Category, tag, filter-bucket, age group, closed position enum

### Inquiries

**ContactRequest**:
An inbound message from the public contact form, classified by why it was sent, not by who sent it. The two reasons are seeking representation and looking for a player. “Looking for a player” is the hiring reason; it is not a Player record and is not about a specific Client.
_Avoid_: Contact, lead, ticket, Recruiter (as a person we store), Player (as the sender)
