# Pasteburn

![salamander](../public/salamander.png)

[English](../README.md)

Pasteburn 是一个 self-hosted 的匿名 Pastebin，具有读后即焚和端到端加密的功能。

在线 Demo 可以在 [pasteburn.onrender.com](https://pasteburn.onrender.com) 上看到。在线 Demo 是非常不稳定的，不应该用于演示之外。

## 使用场景

将一些东西粘贴到 Pasteburn 中，然后将 URL 分享到一般的平台。基于关键词过滤的审查系统或一般的机器人将无法解密或识别内容。你可以设置只允许一个访问者，这样在你的朋友阅读之后，它将自行销毁。链接可以通过一般的渠道分享。密码可以附在 URL 中，也可以通过你认为合适的方式分享。

Pasteburn 被设计来搭建自己的分享平台，并用于小圈子分享信息。

## 功能

**支持文本、链接和文件。**

**定时销毁和阅后即焚：** 你可以决定在多少个不同的访客点击后，或经过一定的时间后，消息会被销毁。例如，你可以只允许一个访问者，然后给你的朋友发一个消息，一旦他或她点击后，服务器会立刻销毁消息。这些数据将在浏览器的本地缓存中保留一段时间。因此，即使服务器已经删除了它，它也可以在一段时间内被接收者反复读取。

**端对端加密：** 数据在您的浏览器中使用密码加密/解密，明文永远不会离开您的浏览器。密码可以通过URL中的`#`传递。例如，当你访问`http://site.com/id#password`，而`#password`部分是由浏览器在本地处理，不会通过网络发送。因此，即使是 pasteburn 服务器也不知道你粘贴了什么。

**加密短链：** 链接不是简单的服务器301重定向，而是你浏览器通过 JavaScript 将数据解密后执行重定向。因此，没有titlebot 可以跟踪你。

## 工作原理

在成功向 Pasteburn 提交之后，服务器将存储加密的数据，你将得到一个 `https://pasteburn.onrender.com/pasteId#password` 形式的URL。

根据HTTP协议，`#password` 部分将不会被浏览器发送。浏览器会在本地处理它。因此，服务器或网络供应商永远不会知道你的密码。

只有在浏览器用给定的密码解密数据后，你才能看到粘贴的内容。如果解密后的内容是一个链接，就会发生重定向。

因此，如果你粘贴整个链接，即使里面有你的密码，一般的机器人也无法弄清里面的内容，因为通常它们不运行 Javascript，所以无法正确解密数据。但如果你确实认为你发送信息的平台有这种能力或者风险过高，你也可以通过其他你认为合适的方式分享密码。

## 部署

推荐的方式是使用 [docker image](https://hub.docker.com/r/pasteburn/pasteburn)。

```shell
docker run -v /path/to/data:/app/data -p 3000:3000 pasteburn/pasteburn
# or
docker run -e PASTEBURN_USE_MEMORY_DB=true -p 3000:3000 pasteburn/pasteburn
```

你也可以参考 [Next.js的部署](https://nextjs.org/docs/deployment)。

## 开发

首先，运行开发服务器。

```bash
yarn dev
```

用你的浏览器打开 [http://localhost:3000](http://localhost:3000)

## 贡献

你可以通过以下方式参与。

- 修复错误和增加功能
- 介绍或为有需要的人托管 Pasteburn
- 贡献翻译（引入 i18n 的工作仍在进行中）。

我们特别欢迎有关以下方面的贡献。

- 提高 Pasteburn 的易用性
- 为生态系统做出贡献，使人们更容易采用它。例如，浏览器扩展、Android 应用程序等。他们可以被添加到 [the pasteburn organization](https://github.com/pasteburn) 下面。

## 鸣谢

- [dgl/paste.sh](https://github.com/dgl/paste.sh)：提出了在浏览器中进行 e2e 加密的想法
- [render](render.com)：用于托管在线 Demo
