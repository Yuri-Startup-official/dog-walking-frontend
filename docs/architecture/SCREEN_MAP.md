# Screen map: web and Windows desktop

**Status:** current UI and planned workspace are identified separately.

## Current routes

| Route | Screen | State |
| --- | --- | --- |
| `/login` | Sign in | Connected to the API |
| `/register` | Registration | Connected to the API; email verification is pending |
| `/owner` | Owner workspace | Connected order and dog flows; map is illustrative |
| `/walker` | Sitter workspace | Connected available orders, applications, and assigned work |

The Windows desktop shell will open the same React routes. It does not introduce a second set of business screens.

## Owner navigation

| Section | Purpose | State |
| --- | --- | --- |
| **Map** | View own orders and create a walking or boarding order | Basic screen; real map/geocoding pending |
| **My orders** | Follow order status, applications, assignment, and reports | Core flow connected |
| **My dogs** | Add and view dog-care information | Basic flow connected |
| **Messages** | Service conversation with an assigned sitter | Placeholder/future API work |
| **Support** | Private chat with a service manager; optional order reference | Required next product feature |
| **Profile** | Account details and security settings | Basic placeholder |
| **Payments** | Charges and refunds | Add after provider integration |

## Sitter navigation

| Section | Purpose | State |
| --- | --- | --- |
| **Order map** | Find open walking and boarding orders | Current map is illustrative; real map/geocoding pending |
| **My orders** | Applications, assigned, in-progress, and completed work | Core flow connected |
| **Availability** | Work schedule and unavailable time | Placeholder/future API work |
| **Services and areas** | Service types, districts, and working radius | Placeholder/future API work |
| **Messages** | Service conversation with an owner | Placeholder/future API work |
| **Support** | Private chat with a service manager; optional order reference | Required next product feature |
| **Profile** | Experience, contact verification, and security | Basic placeholder |
| **Payouts** | Earnings and payout history | Add after provider integration |

## Support chat flow

```text
Workspace → Support → New conversation → Topic + optional order → Message
                                                   ↓
                          Manager queue → Assigned → Reply → Resolved
```

Users see only their own conversations. Authorized staff see conversations allowed by their support permissions. Attachments, if added later, use private storage and short-lived access links.

## Public website pages

Plan these as public routes that link into `/login` and `/register`:

- Home and how the service works.
- Dog walking and boarding information.
- For sitters: joining, profile requirements, and service rules.
- Safety, FAQ, terms, privacy, and support contact.

These marketing pages are not part of the current authenticated workspace.
