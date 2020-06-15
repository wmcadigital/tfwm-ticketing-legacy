# Ticketing Search

Ticketing search for West Midlands Network (WMN) & Swift

## Release notes

---

For the latest updates, check out the [release notes](./RELEASE.md).

## Quick start

---

Clone the repo down to your directory and run `npm run fresh`, this will install all package dependencies and then launch a local web-server.

## Getting started

---

### Working directory

- When working on the project, only edit files within the `/src/` directory.
- All untouchable files will be sent to the `/build/` directory.

### Launching local web-server

If you have already installed all package dependencies then just run `npm start` to launch local web-server.

Whilst the web-server is active, it will watch the files in the 'src' directory for any changes and it will automatically compile the files and move them to the build directory on change. After doing so the browser window will automatically refresh or pull in the new CSS.

The default app template is for West Midlands Network. If you want to develop using one of the others use:

```
npm run start:swift
```

or

```
npm run start:oneapp
```
