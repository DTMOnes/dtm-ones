# Two Next.js apps, one database package

The landing site (public Roster, ContactRequest form) and the dashboard (Users, Staff work) stay separate Next.js apps. They are different products that share a database. We will not merge them into one origin. Both import the same Drizzle package.

**Considered:** One Next.js app with route groups (one deploy; cookies, cache, and CSS collide). Landing depending on the dashboard package (inverts the dependency). Copying the schema into each app.
