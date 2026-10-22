# Huu Tai Nguyen — Portfolio

A lightweight, responsive portfolio built with vanilla HTML, CSS, and JavaScript, with persistent light/dark themes and restrained editorial motion.

## Run locally

Serve this directory over HTTP (the contact integrations use browser ES modules, so opening `index.html` directly with `file://` is not recommended):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Theme and motion

Use the sun/moon control in the header to switch between the warm paper light theme and the charcoal dark theme. The choice is saved in `localStorage` under `portfolio-theme`; if storage is blocked, the toggle continues to work for the current page. The hero entrance, project poster interactions, scroll progress line, and section reveals respect `prefers-reduced-motion`.

## Contact integrations

The existing Firebase Firestore and EmailJS setup remains in `index.html`, using the original project configuration, service ID, template ID, and public EmailJS key. A real end-to-end submission was not performed as part of this redesign; it should be checked in the intended Firebase/EmailJS environment before publishing.

The Firebase web configuration and EmailJS browser key are client-side values, not server-side secrets. Review Firebase Firestore Security Rules to ensure only the intended writes are allowed, and configure appropriate abuse protection for public form submissions.

## Design note

`images/main.jpg` is retained as part of the supplied source, but is not used in the redesigned page because it depicts an unrelated person rather than a portfolio portrait. Project artwork is built from CSS and typography rather than fabricated application screenshots. Repository links are not shown because no project URLs were supplied.
