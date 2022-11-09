# Pasteburn

![salamander](./public/salamander.png)

[简体中文](./docs/README.zh_CN.md)

Pasteburn is a self-hosted, anonymous pastebin that features burn-after-read and end-to-end encryption.

A online demo is available at [pasteburn.onrender.com](https://pasteburn.onrender.com). Note that the demo is very unstable and should not be used for purposes other than demonstration.

## Use Cases

Paste something into pasteburn with a password. Censorship based on keyword filtering or trivial bots will not able to filter it out. Set the paste burn after one unique visitor and it will destroy itself after your friend read it. The pasteburn link can be shared via censored channel. The password can be shared in the URL or in a way you think appropriate.

Pasteburn is designed to be self-hosted and used as a way to share things in a small group.

## Features

**Support Text, Links and Files.**

**Sunset and Burn After Read:** You can decide the paste should burn after how many unique visitors or a certain amount of time passed. For example, you can only allow one unique visitor, send your friend a message and it will immediately burn once he or she clicks. The data will remain available for a while in the local cache of the browser. So it can be read multiple times for a while even if the server has already deleted it.

**End-To-End Encryption:** The plain text is en/decrypted in your browser using the password and never leaves your browser. The password can be passed via the hash in URL, which is never sent by the browser. For example, when you visit `http://site.com/id#password`, and the `#password` part is processed locally by the browser. So even the pasteburn server does not know what you paste.

**Safe Links:** Links are not simple 301 redirection from the server but rather the decrypted data in your browser redirects you via JavaScript. So no titlebot can follow you.

## How It Works

Once you successfully submit a paste to Pasteburn, the server will store the encrypted data and you will get a URL in the form of `https://pasteburn.onrender.com/pasteId#password`.

The `#password` part will not be sent by the browser according to the HTTP protocol. The browser processes it locally. So the server or the network provider never knows your password.

Only after the browser decrypts the data with the given password, one can see the paste. If the decrypted paste is a link, the redirection takes place.

So if you paste the whole link, even with your password in it, trivial bots can't figure out what's inside because usually they don't run Javascript and thus can not correctly decrypt the data. But if you do think the channel you send messages has such ability or too risky, you can also share the password in other ways you think appropriate.

## Deployment

The recommended way is to use [the docker image](https://hub.docker.com/r/pasteburn/pasteburn).

```shell
docker run -v /path/to/data:/app/data -p 3000:3000 pasteburn/pasteburn
# or
docker run -e PASTEBURN_USE_MEMORY_DB=true -p 3000:3000 pasteburn/pasteburn
```

You can also refer to [Next.js Deployment](https://nextjs.org/docs/deployment).

## Develop

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

You can get involved by:

- Fixing bugs and adding features
- Introducing or hosting Pasteburn for people in need
- Contributing translations (introducing i18n is WIP)

Contributions regarding following aspect are particularly welcomed:

- Improve usability of Pasteburn
- Contribute to the ecosystem that makes people adopt it easier. e.g. browser extension, Android application, etc. They may be added to [the pasteburn organization](https://github.com/pasteburn).

## Credits

- [dgl/paste.sh](https://github.com/dgl/paste.sh): for the idea of e2e encryption in the browser
- [render](https://render.com): for hosting the online demo

## Alternatives

[PrivateBin/PrivateBin](https://github.com/PrivateBin/PrivateBin) is a good and complete alternative. However, the codebase of Pasteburn is arguably more modern.
