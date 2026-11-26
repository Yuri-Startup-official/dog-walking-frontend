# Architecture decisions

Use this list to keep confirmed product choices separate from assumptions. Do not build a provider-specific integration until the related decision is resolved.

## Confirmed direction

| Decision | Choice |
| --- | --- |
| First packaged client | Windows desktop |
| Initial workspace users | Owners and service providers |
| Account model | One account can use both owner and provider workspaces, with a visible workspace switcher |
| Later client | Mobile application |
| Manager contact | A private support chat in the app/desktop |
| Visual design | Can be revised after the product structure is agreed |
| Desktop/web implementation | Shared React workspace in the Windows Electron shell |
| Server and data | ASP.NET Core API with PostgreSQL; clients do not access the database |

Provider capabilities belong to a separate provider profile and verification state. Choosing the provider workspace alone does not grant permission to accept or perform paid orders. The exact checks and approval workflow remain open.

## Recommended baseline

| Topic | Recommendation | Why |
| --- | --- | --- |
| Backend shape | Modular monolith | One deployable API is simpler to operate; domain boundaries still allow future extraction |
| First order assignment | Provider applications followed by owner selection | Matches the current API and keeps final selection with the customer |
| Workspace switching | Default new accounts to owner; remember the last selected workspace | Gives one-account users a predictable start |
| Public site | Public marketing/help pages plus a sign-in link to the shared workspace | Separates discovery from authenticated work without creating another business backend |
| Live updates | Start with polling; add SignalR when response latency or volume requires it | The current support chat already uses polling and can evolve without changing ownership rules |
| Mobile framework | Decide after the API and desktop workflows stabilize | Avoids duplicating unsettled business rules |
| API versioning | Decide before external/mobile clients depend on the current routes | Prevents avoidable breaking changes |

## Decisions still needed before production integrations

1. **Launch market:** country, cities, currency, language, age rules, and applicable service/payment requirements.
2. **Website scope:** which public pages are needed at launch and whether public service discovery is in the website MVP.
3. **Order scope:** can one walking/boarding order include multiple pets, and can providers offer both services?
4. **Provider trust:** which profile checks are required (email, phone, identity, background, or documents) and who reviews them?
5. **Location:** map/geocoding provider, supported search radius, and whether live walk tracking is needed at launch.
6. **Payments:** provider, platform fee, when a customer is charged, refund/cancellation rules, disputes, provider payout timing, and treatment of failed payments.
7. **Support operations:** working hours, response target, escalation process, conversation retention, and who may administer staff accounts.
8. **Mobile:** supported platforms and framework once the API contracts are stable.

## Review order

Review the screen map first, then the domain model and status transitions, then the API contracts. Implementation work beyond the existing baseline should follow those decisions.
