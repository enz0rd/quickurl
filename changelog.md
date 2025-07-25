# quickurl changelog:

## 25/07/2025 - V0.0.7 - Rate limit, Chart fix, Public API ...
Implemented:
- Rate limit for plans (free = 20 links/mo, pro = 200 links/mo) &#9989;
- Limit link group creation (free = 5 groups, pro = 50 groups); &#9989;
- Fix for access charts &#9989;
- API Key managing &#9989;
- New `/documentation` route for API Docs
- Public API

## 10/07/2025 - V0.0.6 - Safe Browsing, DNS Changes, 2FA Reset ...
Implemented:
- Preventing Malicious URL redirect &#9989;
- Changed DNS management &#9989;
- 2FA Reset if user doesn't have access anymore &#9989;
- Link groups &#9989;

## 09/07/2025 - V0.0.5 - 2FA, QR Code and Password protection for links
Implemented: 
- QRCode generator for links &#9989;
- Password protection for links &#9989;
- Cron jobs adjustements &#9989;
- Manage account page &#9989;
- Two Factor Auth &#9989;
- Change email &#9989;
- Delete account &#9989;

Future: 
- Public API for url shortening &#128679;

## 07/07/2025 - V0.0.4 - Data analytics
Implemented:
- Data analytics on links &#9989;
   - Analyze user access on links &#9989;
   - Indicators for: &#9989;
      - Browser used &#9989;
      - City/Country &#9989;
      - OS type &#9989;
      - Device type &#9989;
      - Link performance &#9989;
   - Filter by slug &#9989;
   - Analise all links &#9989;

Future: 
- 2FA &#128679;
- QRCode generator for links &#128679;
- Password protection for links &#128679;
- Public API for url shortening &#128679;

## 03/07/2025 - V0.0.3 - Search links and Reset password
- Delete links automatically after they expire &#9989;
- Delete reset password tokens automatically after they expire &#9989;
- Search links on dashboard &#9989;
- Reset password form &#9989;
- Reset password via email sent &#9989;

Future:
- Data analytics &#128679;

## 01/07/2025 - v0.0.2 - Subscriptions
Implemented:
- Refined UI &#9989;
- Link deletion &#9989;
- Plan verification on links &#9989;
- Bug report alert &#9989;
- Subscription control &#9989;
- Pro subscription &#9989;
   - Subscription checkout &#9989;
   - Subscription validation &#9989;
   - Subscription cancel &#9989;
   - User can edit links: &#9989; 
        - Set a custom slug &#9989;
        - Set a custom amount of uses for link &#9989;
        - Set a custom expiration date for link &#9989;
        - Change original URL to redirect &#9989;
- Pagination on dashboard &#9989;

Future:
- Search links on dashboard &#128679;
- Delete links automatically after they expire &#128679;
- Reset password &#128679;

## 30/06/2025 - v0.0.1 - User registration
Implemented:
- User registration &#9989;
- User login &#9989;
- User validations &#9989;
- Tables to control subscriptions &#9989;
- Footer info &#9989;
- Link list on dashboard &#9989;
- Link editing &#9989;

Future:
- Pagination on dashboard &#128679;
- Subscription routes (to-do) &#128679;
