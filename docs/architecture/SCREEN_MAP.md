# Screen map: website, Windows desktop, and later mobile

**Status:** proposed navigation baseline. Current implementation is marked separately from planned screens.

The first desktop release serves both owners and service providers. The website is planned to contain public information pages and the same authenticated workspace. Mobile comes after the shared API and core workflows stabilize.

## Public website

| Page | Purpose | State |
| --- | --- | --- |
| Home | Explain the service and route owners/providers to the right start | Planned |
| How it works | Separate steps for ordering and providing care | Planned |
| Walking and boarding | Explain service scope and requirements | Planned |
| Become a provider | Explain profile, verification, application, and service rules | Planned |
| Safety and trust | Explain account checks, address privacy, payments, support, and incident reporting | Planned |
| Help and FAQ | Self-service answers and link to sign in for private support | Planned |
| Terms and privacy | Legal documents for the selected launch market | Planned |
| Sign in / Register | Secure access to the workspace | API connected; verification flow pending |

Use `/help` or `/contact` for public help pages. Keep `/support` for the internal staff workspace unless route naming is deliberately changed.

## Owner workspace

| Tab | Purpose | State |
| --- | --- | --- |
| **Map / Find care** | Create requests and follow their location/status; provider discovery can be added if needed | Current map is illustrative; real geocoding planned |
| **My orders** | Draft, publish, review applications, follow service status and reports | Core create/apply/assign/complete flow connected |
| **My dogs** | Maintain care, behavior, and medical notes | Basic profile flow connected |
| **Messages** | Private conversation with the assigned provider, tied to an order | Planned |
| **Support** | Private conversation with a manager; link an owned order if useful | Text chat connected; polling updates |
| **Payments** | Charges, receipts, refunds, and payment methods | Planned after provider/rules decision |
| **Profile and security** | Contact details, verification, password, and sessions | Basic placeholder; hardening planned |

## Service provider workspace

| Tab | Purpose | State |
| --- | --- | --- |
| **Order map** | Find available walking and boarding requests by area/time | Current map is illustrative; real search/geocoding planned |
| **My work** | Applications, assigned/upcoming, active, and completed orders | Core application and service lifecycle connected |
| **Availability** | Set working days, hours, and unavailable times | Planned |
| **Services and areas** | Select walking/boarding, define service area and rates | Planned |
| **Messages** | Private conversation with the owner for an assigned order | Planned |
| **Support** | Private conversation with a manager; link an assigned order if useful | Text chat connected; polling updates |
| **Earnings and payouts** | View payment settlement and payout history | Planned after payment rules/provider decision |
| **Profile and verification** | Experience, service details, contact and identity checks | Basic placeholder; verification policy pending |

If an account can act as both owner and provider, show a visible workspace switcher. That behavior still needs product confirmation.

## Support staff workspace

| Screen | Purpose | State |
| --- | --- | --- |
| Queue | List unassigned conversations and those assigned to the current staff member | Connected |
| Conversation | Read and send text messages; view optional order reference | Connected |
| Assignment and status | Claim, resolve, and reopen conversations | Connected |
| Staff administration and audit | Provision staff, define permissions, review sensitive actions | Planned |

Staff access is internal. Public account registration must never create a support account.

## Main service flow

```text
Owner: register → add dog → publish walking/boarding request
Provider: profile → find request → apply
Owner: compare applications → assign provider → pay [payment integration later]
Provider: perform service → send completion report
Both: order-linked conversation [planned] or separate manager support chat [connected]
Platform: confirm payment/refund/payout [provider and business rules pending]
```

## Navigation and interaction rules

- Use separate sections for service messages and manager support. Do not merge these histories.
- Keep the order's precise address hidden until the owner/provider relationship is established.
- Let the server decide whether a user can see an order, message, address, or payment.
- Show payment actions only when the API confirms the payment state and allowed action.
- Mobile should reuse these journeys, but may use native navigation patterns after its framework is selected.
