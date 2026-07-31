---
permalink: /terms/
title: "Terms and Privacy Policy"
modified: 2026-07-30
ads: false
---

{% include base_path %}
{% include toc %}

## Privacy Policy

The privacy of my visitors is important to me. This Privacy Policy outlines the types of personal information that is received and collected on this site, and how it is used.

First and foremost, I will never share your email address or any other personal information with anyone without your direct consent.

### Log Files

Like many other websites, this site uses log files to help learn about when, from where, and how often traffic flows to this site. The information in these log files includes:

* Internet Protocol addresses (IP)
* Types of browser
* Internet Service Provider (ISP)
* Date and time stamp
* Referring and exit pages
* Number of clicks

None of this information is linked to anything that is personally identifiable.

### Cookies and Web Beacons

Cookies are small files stored on your device by your browser. This site and the third-party services listed below may set cookies or use similar technologies (such as web beacons and local storage) to measure traffic and, where advertising is enabled, to serve and measure ads.

If you wish to disable cookies, you may do so through your web browser options. Instructions can be found on the website of whichever browser you use. Disabling cookies does not prevent you from reading anything on this site.

### Google Analytics

This site uses Google Analytics 4 to understand how visitors engage with the content — which pages are read, roughly where readers come from, and which devices they use. It reports aggregate trends and does not identify individual visitors to me. IP addresses are anonymised.

You can read the [Google Privacy Policy](https://policies.google.com/privacy) and, if you prefer to be excluded entirely, install the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout).

### Advertising

{% if site.ads.publisher_id %}
This site displays advertising served by Google AdSense.

Google and its partners use cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the internet. You may opt out of personalised advertising by visiting [Google Ads Settings](https://adssettings.google.com), or opt out of a third-party vendor's use of cookies for personalised advertising at [aboutads.info](https://www.aboutads.info/choices/).

Third-party advertisers may place and read cookies on your browser and/or use web beacons to collect information. I have no access to or control over these cookies. Please review the privacy policies of any third-party ad server for more information on their practices and how to opt out.

For a full list of the vendors that may process data, see [Google's advertising partners](https://business.safety.google/adscookies/).
{% else %}
This site does not currently display advertising. Should that change, this section will describe which network is used and how to opt out of personalised ads.
{% endif %}

### Consent for visitors in the EEA and the UK

If you are visiting from the European Economic Area or the United Kingdom, you will be asked for consent before any non-essential cookies — including analytics and advertising cookies — are set. You can change or withdraw that choice at any time using the privacy settings link in the consent banner.

### Contact

If you have any questions about this policy, or would like your data removed, email me at [{{ site.author.email | split: ", " | first }}](mailto:{{ site.author.email | split: ", " | first }}).

*Last updated: {{ page.modified | date: "%B %-d, %Y" }}.*
