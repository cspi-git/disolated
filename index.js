"use strict";

// Dependencies
const { app, BrowserWindow, session } = require("electron")

// Variables
const args = process.argv.slice(2)
const blocked = ["https://discord.com/error-reporting-proxy/web"]

// Main
if(!args.length) return console.log("usage: node index.js <token>")

app.on("ready", ()=>{
    session.defaultSession.clearStorageData({
        storages: ["appcache", "cookies", "filesystem", "indexdb", "localstorage", "shadercache", "websql", "serviceworkers", "cachestorage"]
    })

    app.commandLine.appendSwitch("proxy-server", "socks5://127.0.0.1:9050")
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            enableRemoteModule: false
        }
    })
    mainWindow.loadURL("https://discord.com/channels/@me")

    mainWindow.webContents.executeJavaScript(`
setInterval(()=>{
    document.body.appendChild(document.createElement \`iframe\`).contentWindow.localStorage.token = \`"${args[0]}"\`
}, 50)

setTimeout(() => {location.reload()}, 2500)`)

    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback)=>{
        if(blocked.includes(details.url)) return callback({ cancel: true })

        delete details.requestHeaders["User-Agent"]
        delete details.requestHeaders["sec-ch-ua"]
        delete details.requestHeaders["sec-ch-ua-platform"]
        callback({ cancel: false, requestHeaders: details.requestHeaders })
    })
})