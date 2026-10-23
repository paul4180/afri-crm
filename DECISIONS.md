# Decisions

Defaults for the upgrade. Change one only when a later prompt says so.

- The live app stays the Fastify server and the pages in `public/`. A second React app is not the product.
- Existing routes stay. New ones are added beside them. Nothing the CRM already calls is renamed.
- Currency on screen is naira with commas (`₦2,500,000`) unless the workspace currency is something else.
- Phones display as `+234`. Times use `Africa/Lagos`.
- Sample records are marked `[Sample]`, load into an empty workspace once, and one remove clears them from every list, the inbox, and search.
- Scores are rule-based and show the reason. A model is used only when a key is set and the workspace allows it. If it is not, the rule stands.
- WhatsApp is logged on the contact and opened in WhatsApp. Afri does not claim a delivery or a read.
- The public site is `public/landing.html`. The signed-in product is `/crm`. They stay separate.
