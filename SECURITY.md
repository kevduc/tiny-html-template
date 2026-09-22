# Security policy

Please report vulnerabilities privately through the repository's security advisory form:

https://github.com/kevduc/tiny-html-template/security/advisories/new

Do not include sensitive details in public issues.

## Interpolation boundary

`html` escapes `&`, `<`, `>`, `"`, and `'` when a string or number is interpolated into HTML text or an ordinary quoted attribute value. This behavior does not validate the meaning of a value for the output context. In particular, URL values require URL-scheme and destination validation before interpolation.

This package is not a sanitizer. HTML escaping alone does not make dynamic values safe in `srcdoc`, style or event-handler attributes, comments, tag names, attribute names, unquoted attributes, or script or style bodies. Those contexts require validation and encoding for the specific parser. Static template text is emitted verbatim and must contain only trusted markup; keep untrusted data in interpolations so it receives HTML escaping. Use a context-appropriate sanitizer, validator, or API before rendering dynamic HTML-valued or executable content.

Only fragments created by the same module instance are embedded as markup; other objects are rejected.
