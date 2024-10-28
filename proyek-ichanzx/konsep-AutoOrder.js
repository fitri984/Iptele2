const { digiflazz, duitku, alerts } = require("./settings.js")
const { converBase64ToImage } = require("convert-base64-to-image")
var QRCode = require('qrcode')
const { default: makeWASocket, useMultiFileAuthState,downloadMediaMessage, generateWAMessageFromContent, proto, prepareWAMessageMedia } = require("@whiskeysockets/baileys")
const useCode = process.argv.includes("--code")
const pino = require("pino")
const fs = require("fs")
const fetch = require("node-fetch")
const moment = require("moment-timezone")
const crypto = require("crypto")
const { addSaldo, minSaldo, cekSaldo } = require("./function/saldo.js")
const chalk = require("chalk")
const logUpdate = require("log-update")
const formd = require("form-data")
const md5 = require("md5")
const axios = require("axios")
const schedule = require("node-schedule")
const { responseWelcome, responseLeave } = require("./function/response.js")
const ImageDataURI = require("image-data-uri")

function formatrupiah(nominal) {
  const nom = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(nominal)
  return nom
}
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
getGroupAdmins = function(participants) {
let admins = []
for (let i of participants) {
i.admin !== null ? admins.push(i.id) : ''
}
return admins
}

function stringToDataURL(str, mimeType) {
    // Convert the string to base64
    const base64Encoded = Buffer.from(str).toString('base64');
    
    // Construct the data URL
    return `data:${mimeType};base64,${base64Encoded}`;
}


async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(global.namasesi)
  const tehtarik = makeWASocket({
    logger: pino({ level: "silent" }),
    browser: ["Chrome (Linux)", "", ""],
    auth: state,
    printQRInTerminal: !useCode,
    defaultQueryTimeoutMs: undefined,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true
  })
  if (useCode && !tehtarik.user && !tehtarik.authState.creds.registered) {
    let phoneNumber
      const question = require("./function/question.js")
      console.log(chalk.red("Masukan Nomer Whatsapp Sebagai Bot"))
      phoneNumber = await question("+")
       let code = await tehtarik.requestPairingCode(phoneNumber)
      console.log(chalk.blue(`Kode Pairing : ${code}`))
  }
  tehtarik.ev.on("connection.update", async connect => {
    const { connection, lastDisconnect } = connect
    if (connection === "close") {
      console.log(lastDisconnect)
      startBot()
    }
    if (connection === "open") {
      console.log(chalk.green("Terhubung √"))
    }
  })
  tehtarik.ev.on('group-participants.update', async (update) => {
await responseWelcome(tehtarik, update)
await responseLeave(tehtarik, update)
console.log(update)
})
  tehtarik.ev.on("creds.update", saveCreds)
  tehtarik.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return
    function replyText(text) {
      tehtarik.sendMessage(from, {text: text}, {quoted: msg})
    }
    function replyImage(capt, url) {
      tehtarik.sendMessage(from, {image:{url:url}, caption: capt}, {quoted: msg})
    }
    const type = Object.keys(msg.message)[0]
    const { quotedMsg } = msg
    const chats = msg.message.interactiveResponseMessage ? JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type === 'buttonsResponseMessage')&& msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
        if (chats == undefined) { chats = '' }
   const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '.'
    const from = msg.key.remoteJid
    const content = JSON.stringify(msg.message)
    const pushName = msg.pushName
    const isGroup = from.endsWith('@g.us')
    const sender = msg.key.fromMe ? (tehtarik.user.id.split(':')[0] + '@s.whatsapp.net' || tehtarik.user.id) : (msg.key.participant || from)
    const senderNumber = sender.split('@')[0]
    const fromMe = msg.key.fromMe
    const isImage = (type == 'imageMessage')
    const isQuotedMsg = (type == 'extendedTextMessage')
    const isOwner = [global.nomerowner, global.nomerbot].includes(sender) ? true : false
    const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
    const command = chats.replace(prefix, "").trim().split(/ +/).shift().toLowerCase()
    const args = chats.trim().split(/ +/).slice(1)
    const text = q = args.join(" ")
    const groupMetadata = isGroup ? await tehtarik.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupId = isGroup ? groupMetadata.id : ''
const participants = isGroup ? await groupMetadata.participants : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const isBotGroupAdmins = groupAdmins.includes(global.nomerbot) || false
const isGroupAdmins = groupAdmins.includes(sender)
    
    const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
mention != undefined ? mention.push(mentionByReply) : []
const mentionUser = mention != undefined ? mention.filter(n => n) : []
    
    const tanggal = moment().tz("Asia/Jakarta").format("ll")
    
    const Antilink = JSON.parse(fs.readFileSync("./database/antilink.json"))
    const isAntilink = Antilink.includes(from) ? true : false

    const Terjadwal = JSON.parse(fs.readFileSync("./database/pesanterjadwal.json"))
const User = JSON.parse(fs.readFileSync("./database/user.json"))
const Mode = JSON.parse(fs.readFileSync("./database/mode.json"))
const Fee = JSON.parse(fs.readFileSync("./database/fee.json"))
const GamesDB = JSON.parse(fs.readFileSync("./database/kategori/games.json"))
const EwalletDB = JSON.parse(fs.readFileSync("./database/kategori/ewallet.json"))
const PulsaDB = JSON.parse(fs.readFileSync("./database/kategori/pulsa.json"))
const KuotaDB = JSON.parse(fs.readFileSync("./database/kategori/kuota.json"))
const PLNDB = JSON.parse(fs.readFileSync("./database/kategori/pln.json"))
const VoucherDB = JSON.parse(fs.readFileSync("./database/kategori/voucher.json"))
const AktivasiVoucherDB = JSON.parse(fs.readFileSync("./database/kategori/voucher.json"))
const TVDB = JSON.parse(fs.readFileSync("./database/kategori/voucher.json"))
const MasaAktifDB = JSON.parse(fs.readFileSync("./database/kategori/voucher.json"))
const PaketSMSDB = JSON.parse(fs.readFileSync("./database/kategori/paketsms.json"))
const StreamingDB = JSON.parse(fs.readFileSync("./database/kategori/streaming.json"))
const AktivasiPerdanaDB = JSON.parse(fs.readFileSync("./database/kategori/aktivasiperdana.json"))
const RoleDB = JSON.parse(fs.readFileSync("./database/role.json"))
const AllTrxDB = JSON.parse(fs.readFileSync("./database/alltrx.json"))
const DigiflazzDB = JSON.parse(fs.readFileSync("./database/digiflazz.json"))

if (isGroup && isAntilink && isBotGroupAdmins) {
if (chats.includes("http://") || chats.includes("https://")) {
if (!isBotGroupAdmins) return
if (isOwner) return
if (isGroupAdmins) return 
if (msg.key.fromMe) return
await tehtarik.sendMessage(from, { delete: msg.key })
await replyText("❌ Link terdeteksi. Bot akan mengeluarkanmu!")
tehtarik.groupParticipantsUpdate(from, [sender], "remove")
}
}
      if (Terjadwal.status) {
      const job = schedule.scheduleJob("0 0 8 * * * *", async function () {
 
              await tehtarik.sendMessage("120363347195394175@g.us", {image: fs.readFileSync("./pesanImage.jpg"), caption: `GocaGame solusi layanan Top up game dan Reseller Voucher Game termurah dan terpercaya no #1 di Indonesia. lebih dari 500 game online

Via APK : https://s.id/GocaGame
Via CHAT : https://s.id/OrderGame`})
})
              }
         

async function getProduk(kategori, brand, type) {
  let dts = []
  console.log(kategori)
  DigiflazzDB.forEach(function(product) {
    DigiflazzDB.sort((a, b) => a.price - b.price)
    if (product.category === kategori) {
      if (product.brand === brand) {
        if (product.type === type) {
          let harga
          let ktgrs
          if (kategori.toLowerCase() === "e-money") ktgrs = "ewallet"
         else if (kategori.toLowerCase() === "paket sms & telpon") ktgrs = "paketsms"
          else ktgrs = kategori
          if (Mode[ktgrs.replace(" ", "").toLowerCase()].mode.toLowerCase() === "persen") {
            harga = ((Mode[ktgrs.replace(" ", "").toLowerCase()].profit/100)*product.price)+product.price
          } else {
            harga = product.price+Mode[ktgrs.replace(" ", "").toLowerCase()].profit
          }
          const status = product.seller_product_status
const seller = status ? '🟢' : '🔴'

let prdn = product.product_name.replace(" ", "").toLowerCase()
let prdname = prdn.replace(brand.replace(" ", "").toLowerCase(), "")
    
let dt = {
  title: seller + " | " + prdname.toUpperCase(),
  description: formatrupiah(harga),
  id: "beliteht " + product.buyer_sku_code
}
dts.push(dt)
        }
      }
    }
  })
  let sections = [{
          title: "PRICE LIST " + brand.toUpperCase(),
          rows: dts
        }]
        let lstt = {
          title: "PRICE LIST",
          sections
        }
  let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampilkan Price List
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
}
      
      const generateQR = async (text, path) => {
  try {
    converBase64ToImage(await QRCode.toDataURL(text), path)
  } catch (err) {
    console.error(err)
  }
}

    function isRegistered(id) {
      let regist = false
      Object.keys(User).forEach((user) => {
        if (User[user].id === id) regist = true
      })
      return regist
    } 
    switch (command) {
      case 'help':
      case 'list':
      case 'menu': {
        let sections = [{
  title: "MENU",
  rows: [{
    title: "📝 | DAFTAR AGEN",
    description: "Mendaftarkan Akun " + global.namabot,
    id: "daftar"
  },
  {
    title: "🟢 | DAFTAR PRODUK",
    description: "List Produk " + global.namabot,
    id: "listproduk"
  },
  {
    title: "💰 | TOP UP SALDO",
    description: "Deposit Saldo User " + global.namabot,
    id: "deposit"
  },
  {
    title: "🏦 | TOTAL SALDO",
    description: "Cek saldo kamu Di " + global.namabot,
    id: "saldo"
  }]
}]
let list = {
  title: "MENU",
  sections
}
let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Ini Adalah Bot Yang Menjual produk digital dengan sistem otomatis

> Kami hadir dengan semangat baru di dunia layanan top-up digital sejak tahun 2018. Dalam perjalanan singkat ini, kami telah membangun fondasi yang kokoh sebagai mitra tepercaya untuk semua kebutuhan top-up digital.
 
> Note: Harap Daftar Terlebih Dahulu Dengan Cara Tekan List Menu lalu klik *Daftar Agen* Untuk Membuka Fitur produk terlengkap kami`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(list)
 },
 {
 "name": "cta_url",
"buttonParamsJson": JSON.stringify({
  display_text: "WEBSITE RESMI",
  url: "https://www.gocagame.com"
})
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
            case 'chatagen': {
        await replyText(`Hallo *${pushName}* Harap tunggu. Kami sedang menghubungkan kamu ke Agen CS GocaGame`)
        break
      }
      case 'daftar': {
        if (isRegistered(sender)) return await replyText("Kamu Sudah Terdaftar Di Database \n\nPanduan Top Up Via Chat Klik Link Berikut https://s.id/TutorialViaWhatsApp")
        let Datauser = {
          id: sender,
          saldo: 0,
          jumlahtransaksi: 0,
          role: "BASIC",
          pengeluaran: 0
        }
        User.push(Datauser)
        fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
        await replyText("Kamu Berhasil Mendaftar \n\nPanduan Top Up Via Chat Klik Link Berikut https://s.id/TutorialViaWhatsApp")
        break
      }
      case 'listproduk': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let sections = [{
          title: "PRODUK",
          rows: [{
            title: "🎮 | TOP UP GAME",
            description: "Menampilkan List Produk Game",
            id: "listgame"
          },
          {
            title: "💵 | ISI E-WALLET",
            description: "Menampilkan List Produk E-Wallet",
            id: "listewallet"
          },
          {
            title: "📲 | ISI PULSA",
            description: "Menampilkan List Produk Pulsa",
            id: "listpulsa"
          },
          {
            title: "🪩 | ISI KUOTA",
            description: "Menampilkan List Produk Kuota",
            id: "listkuota"
          },
          {
            title: "🎟️ | VOUCHER LAINYA",
            description: "Menampilkan List Produk Voucher",
            id: "listvoucher"
          },
          {
            title: "⚡ | TOKEN PLN",
            description: "Menampilkan List Produk PLN",
            id: "listpln"
          },
                           {
            title: "🎫 | AKTIVASI VOUCHER",
            description: "Menampilkan List Produk Aktivasi Voucher",
            id: "listaktivasi"
          },
          {
            title: "📺 | VOUCHER TV",
            description: "Menampilkan List Produk TV",
            id: "listtv"
          },
          {
            title: "⏱️ | MASA AKTIF",
            description: "Menampilkan List Produk Masa Aktif",
            id: "listmasaaktif"
          },
          {
            title: "📞 | PAKET SMS & TELPON",
            description: "Menampilkan List Produk Paket SMS & Telpon",
            id: "listpaketsms"
          },
          {
            title: "🎬 | STREAMING",
            description: "Menampilkan List Produk Streaming",
            id: "liststreaming"
          },
          {
            title: "📁 | AKTIVASI PERDANA",
            description: "Menampilkan List Produk Aktivasi Perdana",
            id: "listaktivasiperdana"
          },
          ]
        }]
        let prd = {
          title: "LIST PRODUK",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Kategori Produk
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(prd)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listgame': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Games = JSON.parse(fs.readFileSync("./database/kategori/games.json"))
        if (Games.length === 0) return await replyText("Produk Game Masih Kosong!")
        let data = []
        Object.keys(Games).forEach((game) => {
          if (Games[game].brand) {
            let dt = {
              title: `🎮 | ${Games[game].nama}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Games[game].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST GAME",
          rows: data
        }]
        let lstt = {
          title: "LIST GAME",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Game
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
            case 'testpesanterjadwal': {
              
                await tehtarik.sendMessage("120363347195394175@g.us", {image: fs.readFileSync("./pesanImage.jpg"), caption: `GocaGame solusi layanan Top up game dan Reseller Voucher Game termurah dan terpercaya no #1 di Indonesia. lebih dari 500 game online

Via APK : https://s.id/GocaGame
Via CHAT : https://s.id/OrderGame`})
                break
                }
      case 'listewallet': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Ewallet = JSON.parse(fs.readFileSync("./database/kategori/ewallet.json"))
        if (Ewallet.length === 0) return await replyText("Produk E-Wallet Masih Kosong!")
        let data = []
        Object.keys(Ewallet).forEach((wallet) => {
          if (Ewallet[wallet].brand) {
            let dt = {
              title: `💵 | ${Ewallet[wallet].brand.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Ewallet[wallet].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST E-WALLET",
          rows: data
        }]
        let lstt = {
          title: "LIST E-WALLET",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar E-Wallet
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listpulsa': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Pulsa = JSON.parse(fs.readFileSync("./database/kategori/pulsa.json"))
        if (Pulsa.length === 0) return await replyText("Produk Pulsa Masih Kosong!")
        let data = []
        Object.keys(Pulsa).forEach((p) => {
          if (Pulsa[p].nama) {
            let dt = {
              title: `📲 | ${Pulsa[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Pulsa[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST PULSA",
          rows: data
        }]
        let lstt = {
          title: "LIST PULSA",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Pulsa
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listkuota': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Kuota = JSON.parse(fs.readFileSync("./database/kategori/kuota.json"))
        if (Kuota.length === 0) return await replyText("Produk Kuota Masih Kosong!")
        let data = []
        Object.keys(Kuota).forEach((p) => {
          if (Kuota[p].nama) {
            let dt = {
              title: `🪩 | ${Kuota[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Kuota[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST KUOTA",
          rows: data
        }]
        let lstt = {
          title: "LIST KUOTA",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Kuota
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listpln': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let PLN = JSON.parse(fs.readFileSync("./database/kategori/pln.json"))
        if (PLN.length === 0) return await replyText("Produk PLN Masih Kosong!")
        let data = []
        Object.keys(PLN).forEach((p) => {
          if (PLN[p].brand) {
            let dt = {
              title: `⚡ | Token ${PLN[p].brand.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${PLN[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST TOKEN PLN",
          rows: data
        }]
        let lstt = {
          title: "LIST TOKEN PLN",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar PLN
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listvoucher': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Voucher = JSON.parse(fs.readFileSync("./database/kategori/voucher.json"))
        if (Voucher.length === 0) return await replyText("Produk Voucher Masih Kosong!")
        let data = []
        Object.keys(Voucher).forEach((p) => {
          if (Voucher[p].brand) {
            let dt = {
              title: `🎟️ | ${Voucher[p].brand.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Voucher[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST VOUCHER",
          rows: data
        }]
        let lstt = {
          title: "LIST VOUCHER",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Voucher
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
            case 'listaktivasi': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Aktivasi = JSON.parse(fs.readFileSync("./database/kategori/aktivasivoucher.json"))
        if (Aktivasi.length === 0) return await replyText("Produk Aktivasi Voucher Masih Kosong!")
        let data = []
        Object.keys(Aktivasi).forEach((p) => {
          if (Aktivasi[p].brand) {
            let dt = {
              title: `🎫 | ${Aktivasi[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Aktivasi[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST AKTIVASI VOUCHER",
          rows: data
        }]
        let lstt = {
          title: "LIST AKTIVASI VOUCHER",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Aktivasi Voucher
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listtv': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let TV = JSON.parse(fs.readFileSync("./database/kategori/tv.json"))
        if (TV.length === 0) return await replyText("Produk TV Masih Kosong!")
        let data = []
        Object.keys(TV).forEach((p) => {
          if (TV[p].brand) {
            let dt = {
              title: `📺 | ${TV[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${TV[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST VOUCHER TV",
          rows: data
        }]
        let lstt = {
          title: "LIST VOUCHER TV",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar TV
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listmasaaktif': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Masa = JSON.parse(fs.readFileSync("./database/kategori/masaaktif.json"))
        if (Masa.length === 0) return await replyText("Produk Masa Aktif Masih Kosong!")
        let data = []
        Object.keys(Masa).forEach((p) => {
          if (Masa[p].brand) {
            let dt = {
              title: `⏱️ | ${Masa[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Masa[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST MASA AKTIF",
          rows: data
        }]
        let lstt = {
          title: "LIST MASA AKTIF",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Masa Aktif
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'listpaketsms': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Paket = JSON.parse(fs.readFileSync("./database/kategori/paketsms.json"))
        if (Paket.length === 0) return await replyText("Produk Paket SMS & Telpon Masih Kosong!")
        let data = []
        Object.keys(Paket).forEach((p) => {
          if (Paket[p].brand) {
            let dt = {
              title: `📞 | ${Paket[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Paket[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST PAKET SMS & TELPON",
          rows: data
        }]
        let lstt = {
          title: "LIST PAKET SMS & TELPON",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Paket SMS & Telpon
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
case 'liststreaming': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Streaming = JSON.parse(fs.readFileSync("./database/kategori/streaming.json"))
        if (Streaming.length === 0) return await replyText("Produk Streaming Masih Kosong!")
        let data = []
        Object.keys(Streaming).forEach((p) => {
          if (Streaming[p].brand) {
            let dt = {
              title: `🎬 | ${Streaming[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Streaming[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST STREAMING",
          rows: data
        }]
        let lstt = {
          title: "LIST STREAMING",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Streaming
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
case 'listaktivasiperdana': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let Perdana = JSON.parse(fs.readFileSync("./database/kategori/aktivasiperdana.json"))
        if (Perdana.length === 0) return await replyText("Produk Aktivasi Perdana Masih Kosong!")
        let data = []
        Object.keys(Perdana).forEach((p) => {
          if (Perdana[p].brand) {
            let dt = {
              title: `📁 | ${Perdana[p].nama.toUpperCase()}`,
              description: `Menampilkan Daftar Produk`,
              id: `lst ${Perdana[p].nama}`
            }
            data.push(dt)
          }
        })
        let sections = [{
          title: "LIST AKTIVASI PERDANA",
          rows: data
        }]
        let lstt = {
          title: "LIST AKTIVASI PERDANA",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampikan Daftar Aktivasi Perdana
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(lstt)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      
      case 'deposit': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        if (!args[0]) return await replyText("*Ketik Contoh:* Deposit 5.000")
        let jumlah = text.replace(".", "")
        if (isNaN(jumlah)) return await replyText('Jumlah Harus Berupa Angka')
        if (jumlah < 100) return await replyText("Minimal Deposit Adalah Rp 100!")
        if (jumlah > 1000000) return await replyText(`Maksimal Deposit Adalah Rp 1.000.000`)
        const Unique = "GG" + require("crypto").randomBytes(6).toString("hex").toUpperCase()
        let jumlahandfee = ((Fee.qris/100)*Number(jumlah))+Number(jumlah)
        await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
  merchantCode: duitku.merchantcode,
  paymentAmount: Math.round(jumlahandfee),
  merchantOrderId: Unique,
  productDetails: "Tes",
  email: duitku.email,
  paymentMethod: "SP",
  customerVaName: pushName,
  returnUrl: "https://google.com",
  callbackUrl: "https://google.com",
  signature: md5(duitku.merchantcode + Unique + Math.round(jumlahandfee) + duitku.apikey)
})
.then(async result => {

            
  if (result.data.statusCode === "00") {
   

   let url1 = Buffer.from(result.data.qrString).toString("base64")
 await generateQR(result.data.qrString, "./qrStrin.png")

                       

     
      let textDepo = `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 』
*------------------------------------------*
*- Invoice ID:* ${Unique}
*- Fee:* ${Fee.qris}%
*- Jumlah Deposit:* ${formatrupiah(jumlahandfee)}
*------------------------------------------*
_❗Note: Harap scan QRIS dan bayar sebelum expired_`
await tehtarik.sendMessage(from, {image: fs.readFileSync("./qrStrin.png"), caption: textDepo})

      let fet = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: duitku.merchantcode,
    merchantOrderId: Unique,
    signature: md5("D7182" + Unique + duitku.apikey)
  })
  console.log(fet.data)
 let status = fet.data.statusCode
  while (status !== "00") {
    await sleep(15000)
    let api = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: "D7182",
    merchantOrderId: Unique,
    signature: require("md5")("D7182" + Unique + duitku.apikey)
  })
  status = api.data.statusCode
  if (status === "00") {
    let tggl = moment().tz("Asia/Jakarta").format("ll") + " " + moment.tz('Asia/Jakarta').format('HH:mm:ss')
    
    addSaldo(sender, Number(jumlah), User)
    let cekusersaldo = cekSaldo(sender, User)
    let textReply = `『 ✅ 𝐈𝐍𝐕𝐎𝐈𝐂𝐄 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 』
*------------------------------------------*
*- Invoice ID:* ${Unique}
*- Jumlah Deposit:* ${formatrupiah(jumlah)}
*- Tanggal/Waktu:* ${tggl}
*- Saldo Saat Ini:* ${formatrupiah(cekusersaldo)}
*------------------------------------------*
_Terimakasih sudah melakukan deposit di ${global.namabot}_`
    let textLog = `『 ✅ 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 𝐋𝐎𝐆 』
*------------------------------------------*
*- Penerima:* +${sender.split("@")[0]}
*- Invoice ID:* ${Unique}
*- Jumlah Deposit:* ${formatrupiah(jumlah)}
*- Tanggal/Waktu:* ${tggl}
*------------------------------------------*
_Harap cek mutasi di provider Duitku_`
    await replyText(textReply)
    await tehtarik.sendMessage(global.nomerowner, {text: textLog })
    break
  } if (status === "02") {
    break
  }
  }
}
    })
    break
      }
      case 'saldo': {
        if (!isRegistered(sender)) return await replyText(alerts.daftar)
        let pos = null
        Object.keys(User).forEach((p) => {
          if (User[p].id === sender) pos = p
        })
        let txt = `『 SALDO KAMU 』
*------------------------------------------*
*- Nama:* ${pushName}
*- Saldo:* ${formatrupiah(cekSaldo(sender, User))}
*- Role:* ${User[pos].role.toUpperCase()}
*------------------------------------------*`
await replyText(txt)
        break
      }
            case 'cekuser': {
                if (!isOwner) return
                let txt = `『 𝐂𝐄𝐊 𝐔𝐒𝐄𝐑 』
*------------------------------------------*`
        Object.keys(User).forEach((p) => {
          txt += `*- Nomor:* ${User[p].id.split("@")[0]}
*- Saldo:* ${formatrupiah(cekSaldo(User[p].id, User))}
*- Role:* ${User[p].role.toUpperCase()}
*------------------------------------------*`
        })
await replyText(txt)
                break
                }
      case 'ownermenu': {
        let text = `『 𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔 』
*------------------------------------------*
╒- *ALL COMMAND* ->
├ #addproduk
├ #delproduk
├ #renameproduk
├ #setprofitmode
├ #cekdigi
├ #getdigi
├ #addsaldo
├ #minsaldo
├ #createrole
├ #giverole
├ #renamerole
├ #delrole
├ #listrole
├ #deluser
├ #rekap
├ #cekuser
├ #antilink
├ #hidetag
├ #opengc
├ #closegc
├ #kick
╘-------------------->
*------------------------------------------*`
await replyText(text)
        break
      }
            case 'pesanterjadwal': {
                if (!isOwner) return
                if (Terjadwal.status) {
                    Terjadwal.status = false
                    fs.writeFileSync("./database/pesanterjadwal.json", JSON.stringify(Terjadwal, null, 2))
await replyText("Pesan terjadwal dimatikan!")

                    } else {
                        Terjadwal.status = true
                        fs.writeFileSync("./database/pesanterjadwal.json", JSON.stringify(Terjadwal, null, 2))
await replyText("Pesan terjadwal diaktifkan!")

                        }
                break
                }
      case 'addsaldo': {
if (!isOwner) return
let orangnya = text.split("|")[0]
const jumlahnya = text.split("|")[1]
if (!orangnya && !jumlahnya) return await replyText("*Contoh:* #addsaldo 62838xxx|1000")
orangnya = orangnya.replace(/[^0-9]/g, '')
if (isNaN(jumlahnya)) return replyText("Jumlah harus berupa angka!")
let pos = null
Object.keys(User).forEach((or) => {
  if (User[or].id.split("@")[0] === orangnya) pos = or
})
if (pos !== null) {
  addSaldo(orangnya + "@s.whatsapp.net", Number(jumlahnya), User)
  await replyText(`✅ Berhasil menambah saldo +${orangnya} sebesar ${formatrupiah(jumlahnya)}`)
} else {
  await replyText("User tidak ditemukan!")
}
break
}
case 'minsaldo': {
if (!isOwner) return
let orangnya = text.split("|")[0]
const jumlahnya = text.split("|")[1]
if (!orangnya && !jumlahnya) return await replyText("*Contoh:* #addsaldo 62838xxx|1000")
orangnya = orangnya.replace(/[^0-9]/g, '')
if (isNaN(jumlahnya)) return replyText("Jumlah harus berupa angka!")
let pos = null
Object.keys(User).forEach((or) => {
  if (User[or].id.split("@")[0] === orangnya) pos = or
})
if (pos !== null) {
  minSaldo(orangnya + "@s.whatsapp.net", Number(jumlahnya), User)
  await replyText(`✅ Berhasil mengurangi saldo +${orangnya} sebesar ${formatrupiah(jumlahnya)}`)
} else {
  await replyText("User tidak ditemukan!")
}
break
}
      
        
        case 'addproduk': {
        if (!isOwner) return
        let nama = text.split("|")[0]
        let kategori = text.split("|")[1]
        let brand = text.split("|")[2]
        let tipe = text.split("|")[3]
        if (!kategori && !nama && !brand && !tipe) return await replyText("Contoh: #addproduk Mobile Legends DM|Games|MOBILE LEGENDS|Umum")
        if (kategori.toLowerCase() !== "games" && kategori.toLowerCase() !== "ewallet" && kategori.toLowerCase() !== "pulsa" && kategori.toLowerCase() !== "kuota" && kategori.toLowerCase() !== "pln" && kategori.toLowerCase() !== "voucher" && kategori.toLowerCase() !== "aktivasivoucher" && kategori.toLowerCase() !== "tv" && kategori.toLowerCase() !== "masaaktif" && kategori.toLowerCase() !== "paketsms" && kategori.toLowerCase() !== "streaming" && kategori.toLowerCase() !== "aktivasiperdana") return await replyText("Kategori yang tersedia: *Games*, *Ewallet*, *Pulsa*, *Kuota*, *Pln*, *Voucher*, *AktivasiVoucher*, *TV*, *Masaaktif*, *Paketsms*, *Streaming*, *Aktivasiperdana*")
        let data
        let pos = null
        if (kategori.toLowerCase() === "games") { kategori = "Games"
        Object.keys(GamesDB).forEach(async (tes) => {
          if (GamesDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        GamesDB.push(data)
        fs.writeFileSync("./database/kategori/games.json", JSON.stringify(GamesDB, null, 3))
        }
        if (kategori.toLowerCase() === "ewallet") { kategori = "E-Money"
        Object.keys(EwalletDB).forEach(async (tes) => {
          if (EwalletDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        EwalletDB.push(data)
        fs.writeFileSync("./database/kategori/ewallet.json", JSON.stringify(EwalletDB, null, 3))
        }
        if (kategori.toLowerCase() === "pulsa") { kategori = "Pulsa"
        Object.keys(PulsaDB).forEach(async (tes) => {
          if (PulsaDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        PulsaDB.push(data)
        fs.writeFileSync("./database/kategori/pulsa.json", JSON.stringify(PulsaDB, null, 3))
        }
        if (kategori.toLowerCase() === "kuota") { kategori = "Data"
        Object.keys(KuotaDB).forEach(async (tes) => {
          if (KuotaDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        KuotaDB.push(data)
        fs.writeFileSync("./database/kategori/kuota.json", JSON.stringify(KuotaDB, null, 3))
        }
        if (kategori.toLowerCase() === "pln") {
          kategori = "PLN"
          Object.keys(PLNDB).forEach(async (tes) => {
          if (PLNDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
          data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        PLNDB.push(data)
        fs.writeFileSync("./database/kategori/pln.json", JSON.stringify(PLNDB, null, 3))
        }
        if (kategori.toLowerCase() === "voucher") { kategori = "Voucher"
        Object.keys(VoucherDB).forEach(async (tes) => {
          if (VoucherDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        VoucherDB.push(data)
        fs.writeFileSync("./database/kategori/voucher.json", JSON.stringify(VoucherDB, null, 3))
        }
        if (kategori.toLowerCase() === "aktivasivoucher") { kategori = "Aktivasi Voucher"
        Object.keys(AktivasiVoucherDB).forEach(async (tes) => {
          if (AktivasiVoucherDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        AktivasiVoucherDB.push(data)
        fs.writeFileSync("./database/kategori/aktivasivoucher.json", JSON.stringify(AktivasiVoucherDB, null, 3))
        }
        if (kategori.toLowerCase() === "tv") { kategori = "TV"
        Object.keys(TVDB).forEach(async (tes) => {
          if (TVDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        TVDB.push(data)
        fs.writeFileSync("./database/kategori/tv.json", JSON.stringify(TVDB, null, 3))
        }
        if (kategori.toLowerCase() === "masaaktif") { kategori = "Masa Aktif"
        Object.keys(MasaAktifDB).forEach(async (tes) => {
          if (MasaAktifDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        MasaAktifDB.push(data)
        fs.writeFileSync("./database/kategori/masaaktif.json", JSON.stringify(MasaAktifDB, null, 3))
        }
        if (kategori.toLowerCase() === "paketsms") { kategori = "Paket SMS & Telpon"
        Object.keys(PaketSMSDB).forEach(async (tes) => {
          if (PaketSMSDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        PaketSMSDB.push(data)
        fs.writeFileSync("./database/kategori/paketsms.json", JSON.stringify(PaketSMSDB, null, 3))
        }
        if (kategori.toLowerCase() === "streaming") { kategori = "Streaming"
        Object.keys(StreamingDB).forEach(async (tes) => {
          if (StreamingDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        StreamingDB.push(data)
        fs.writeFileSync("./database/kategori/streaming.json", JSON.stringify(StreamingDB, null, 3))
        }
        if (kategori.toLowerCase() === "aktivasiperdana") { kategori = "Aktivasi Perdana"
        Object.keys(AktivasiPerdanaDB).forEach(async (tes) => {
          if (AktivasiPerdanaDB[tes].nama.toLowerCase() === nama.toLowerCase()) pos = tes
        })
        if (pos !== null) return await replyText("Produk sudah terdaftar!")
        data = {
          nama: nama,
          kategori: kategori,
          brand: brand,
          type: tipe
        }
        AktivasiPerdanaDB.push(data)
        fs.writeFileSync("./database/kategori/aktivasiperdana.json", JSON.stringify(AktivasiPerdanaDB, null, 3))
        }
        await replyText(`『 𝐀𝐃𝐃 𝐏𝐑𝐎𝐃𝐔𝐊 』
*------------------------------------------*
*- Nama:* ${nama}
*- Kategori:* ${kategori}
*- Brand:* ${brand}
*- Tipe:* ${tipe}
*------------------------------------------*`)
        break
      }
      

      case 'delproduk': {
        if (!isOwner) return
        let fld = fs.readdirSync("./database/kategori/").filter((po) => po.endsWith(".json"))
        let datas = []
        for (let j of fld) {
          let jsonFile = JSON.parse(fs.readFileSync("./database/kategori/" + j))
          for (let i = 0; i < jsonFile.length; i++) {
            let dts = {
              title: `🗑️ | ${jsonFile[i].nama}`,
              description: "Ketuk untuk menghapus",
              id: `dlt ${jsonFile[i].nama}`
            }
            datas.push(dts)
          }
        }
        let sections = [{
          title: "DELETE PRODUK",
          rows: datas
        }]
        let show = {
          title: "LIST",
          sections
        }
        let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Klik Tombol Dibawah Ini Untuk Menampilkan List Produk Yang Bisa Dihapus
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(show)
 }
 ]
 })
 })
 }
 }
}, {})

await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
        break
      }
      case 'dlt': {
        if (!isOwner) return
        let item = text
        if (!item) {
          console.log("No Item")
          await replyText("No Item")
          return
        }
        let fld = fs.readdirSync("./database/kategori/").filter((po) => po.endsWith(".json"))
        let datas = []
        let position = null
        let file = ""
        for (let fl of fld) {
          let jsnfile = JSON.parse(fs.readFileSync("./database/kategori/" + fl))
          Object.keys(jsnfile).forEach((jsn) => {
            if (jsnfile[jsn].nama.toLowerCase() === item.toLowerCase()) {
              file = fl
              position = jsn
            }
          })
        }
        if (position !== null) {
          let fls = JSON.parse(fs.readFileSync("./database/kategori/" + file))
          await replyText(`『 𝐃𝐄𝐋𝐄𝐓𝐄 𝐏𝐑𝐎𝐃𝐔𝐊 』
*------------------------------------------*
*- Nama:* ${fls[position].nama}
*------------------------------------------*`)
          fls.splice(position, 1)
          fs.writeFileSync("./database/kategori/" + file, JSON.stringify(fls, null, 3))
        }
        break
      }
      case 'renameproduk': {
        if (!isOwner) return
        let kategori = text.split("|")[0]
        let nama = text.split("|")[1]
        let namabaru = text.split("|")[2]
        if (!kategori && !nama && !namabaru) return await replyText("*Contoh:* #renameproduk Games|Mobile Legends|Mobile Legends New")
        if (kategori.toLowerCase() !== "games" && kategori.toLowerCase() !== "ewallet" && kategori.toLowerCase() !== "pulsa" && kategori.toLowerCase() !== "kuota" && kategori.toLowerCase() !== "pln" && kategori.toLowerCase() !== "voucher") return await replyText("Kategori yang tersedia: *Games*, *Ewallet*, *Pulsa*, *Kuota*, *Pln*, *Voucher*")
        let file = ""
        if (kategori.toLowerCase() === "games") {
        file = "games.json"
      }
        if (kategori.toLowerCase() === "ewallet") {
        file = "ewallet.json"
      }
        if (kategori.toLowerCase() === "pulsa") {
        file = "pulsa.json"
      }
        if (kategori.toLowerCase() === "kuota") {
        file = "kuota.json"
      }
        if (kategori.toLowerCase() === "pln") {
        file = "pln.json"
      }
        if (kategori.toLowerCase() === "voucher") {
        file = "voucher.json"
      }
      let ktgr = JSON.parse(fs.readFileSync("./database/kategori/" + file))
      let pos = null
      Object.keys(ktgr).forEach((f) => {
        if (ktgr[f].nama.toLowerCase() === nama.toLowerCase()) {
          pos = f
        }
      })
      if (pos === null) {
        await replyText("Produk tidak ditemukan!")
      } else {
      ktgr[pos].nama = namabaru
      console.log(ktgr[pos].nama)
      fs.writeFileSync("./database/kategori/" + file, JSON.stringify(ktgr, null, 3))
      await replyText(`『 𝐑𝐄𝐍𝐀𝐌𝐄 𝐏𝐑𝐎𝐃𝐔𝐊 』
*------------------------------------------*
*- Nama Lama:* ${nama}
*- Nama Baru:* ${namabaru}
*------------------------------------------*`)
}
        break
      }
      case 'setprofitmode': {
      if (!isOwner) return
      let kategori = text.split("|")[0]
        let mode = text.split("|")[1]
        let profit = text.split("|")[2]
        if (!kategori && !mode && !profit) return await replyText("*Contoh:* #setprofitmode Games|Persen|5")
       if (kategori.toLowerCase() !== "games" && kategori.toLowerCase() !== "ewallet" && kategori.toLowerCase() !== "pulsa" && kategori.toLowerCase() !== "kuota" && kategori.toLowerCase() !== "pln" && kategori.toLowerCase() !== "voucher" && kategori.toLowerCase() !== "aktivasivoucher" && kategori.toLowerCase() !== "tv" && kategori.toLowerCase() !== "masaaktif" && kategori.toLowerCase() !== "paketsms" && kategori.toLowerCase() !== "streaming" && kategori.toLowerCase() !== "aktivasiperdana") return await replyText("Kategori yang tersedia: *Games*, *Ewallet*, *Pulsa*, *Kuota*, *Pln*, *Voucher*, *AktivasiVoucher*, *TV*, *Masaaktif*, *Paketsms*, *Streaming*, *Aktivasiperdana*")
       Mode[kategori.toLowerCase()].mode = mode.toLowerCase()
       Mode[kategori.toLowerCase()].profit = Number(profit)
       fs.writeFileSync("./database/mode.json", JSON.stringify(Mode, null, 2))
       await replyText(`✅ Berhasil mengubah mode profit kategori ${kategori.toUpperCase()} menjadi ${mode} dan profit menjadi ${profit}`)
        break
      }
      case 'cekdigi': {
        if (!isOwner) return
        let cek = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        }
        let resp = await axios.post("https://api.digiflazz.com/v1/cek-saldo", cek)
        await replyText(`*Saldo Digiflazz saat ini:* ${formatrupiah(Number(resp.data.data.deposit))}`)
        break
      }
      case 'getdigi': {
        if (!isOwner) return
        let signature = crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        const payload = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: signature
        }
        const resp = await axios.post("https://api.digiflazz.com/v1/price-list", payload)
        if (resp.data.data) {
          fs.writeFileSync("./database/digiflazz.json", JSON.stringify(resp.data.data, null, 3))
       const dtproduk = JSON.parse(fs.readFileSync("./database/digiflazz.json"))
       await replyText("✅ Berhasil Get Digiflazz")
        } else {
          await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
        }
        break
      }
      case 'createrole': {
        if (!isOwner) return
        let namarole = text
        if (!namarole) return await replyText("*Contoh:* #createrole VVIP")
        let pos = null
        Object.keys(RoleDB).forEach((role) => {
          if (RoleDB[role].nama.toLowerCase() === namarole.toLowerCase()) pos = role
        })
        if (pos !== null) {
          await replyText("Role tersebut sudah ada!")
        } else {
          let dataRole = {
            nama: namarole,
            profit: 0
          }
          RoleDB.push(dataRole)
          fs.writeFileSync("./database/role.json", JSON.stringify(RoleDB, null, 3))
          await replyText(`『 𝐂𝐑𝐄𝐀𝐓𝐄 𝐑𝐎𝐋𝐄 』
*------------------------------------------*
*- Role:* ${namarole}
*------------------------------------------*`)
}
        break
      }
      case 'giverole': {
        if (!isOwner) return
        let user = text.split("|")[0]
        let role = text.split("|")[1]
        if (!user && !role) return await replyText("*Contoh:* #giverole 62838xxx|VVIP")
        user = user.replace(/[^0-9]/, '')
        console.log(user)
        let posuser = null
        let posrole = null
        Object.keys(RoleDB).forEach((p) => {
          if (RoleDB[p].nama.toLowerCase() === role.toLowerCase()) {
            posrole = p
          }
        })
        Object.keys(User).forEach((j) => {
          if (User[j].id.split("@")[0] === user) {
            posuser = j
          }
        })
        if (posuser === null) return await replyText("User tidak ditemukan!")
        if (posrole === null) return await replyText("Role tidak ditemukan!")
        if (User[posuser].role.toLowerCase() === RoleDB[posrole].nama.toLowerCase()) return await replyText("User sudah memiliki role tersebut!")
        await replyText(`『 𝐆𝐈𝐕𝐄 𝐑𝐎𝐋𝐄 』
*------------------------------------------*
*- User:* ${user}
*- Role Sebelum:* ${User[posuser].role.toUpperCase()}
*- Role Sesudah:* ${role.toUpperCase()}
*------------------------------------------*`)
        User[posuser].role = role.toUpperCase()
        fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
        break
      }
      case 'renamerole': {
        if (!isOwner) return
        let role = text.split("|")[0]
        let rolebaru = text.split("|")[1]
        if (!role && !rolebaru) return await replyText("*Contoh:* #renamerole VVIP|VVIPBARU")
        let posrole = null
        Object.keys(RoleDB).forEach((p) => {
          if (RoleDB[p].nama.toLowerCase() === role.toLowerCase()) {
            posrole = p
          }
        })
        if (posrole !== null) {
          RoleDB[posrole].nama = rolebaru.toUpperCase()
          fs.writeFileSync("./database/role.json", JSON.stringify(RoleDB, null, 3))
          await replyText(`『 𝐑𝐄𝐍𝐀𝐌𝐄 𝐑𝐎𝐋𝐄 』
*------------------------------------------*
*- Role Awal:* ${role.toUpperCase()}
*- Role Baru:* ${rolebaru.toUpperCase()}
*------------------------------------------*`)
        } else {
          await replyText("Role tidak ditemukan!")
        }
        break
      }
      case 'delrole': {
        if (!isOwner) return
        let role = text
        if (!role) return await replyText("*Contoh:* #delrole VVIP")
        let posrole = null
        if (role.toLowerCase() === "basic") return await replyText("Tidak dapat menghapus role dasar!")
        for (let i = 0; i < RoleDB.length; i++) {
          if (RoleDB[i].nama.toLowerCase() === role.toLowerCase()) {
            posrole = i
          }
        }
        if (posrole !== null) {
          RoleDB.splice(posrole, 1)
          fs.writeFileSync("./database/role.json", JSON.stringify(RoleDB, null, 3))
Object.keys(User).forEach((s) => {
  if (User[s].role.toLowerCase() === role.toLowerCase()) {
    User[s].role = "BASIC"
    fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
  }
})
          await replyText(`『 𝐃𝐄𝐋𝐄𝐓𝐄 𝐑𝐎𝐋𝐄 』
*------------------------------------------*
*- Role Yang Dihapus:* ${role.toUpperCase()}
*------------------------------------------*`)
        } else {
          await replyText("Role tidak ditemukan!")
        }
        break
      }
      case 'listrole': {
        if (!isOwner) return
        let rldb = fs.readFileSync("./database/role.json", 'utf-8')
        await replyText(rldb)
        break
      }
      case 'deluser': {
        if (!isOwner) return
        let user = args[0]
        if (!user) return await replyText("*Contoh:* #deluser 62838xxx")
        let pos = null
        for (let i = 0; i < User.length; i++) {
          if (User[i].id.split("@")[0] === user) pos = i
        } 
        if (pos !== null) {
          User.splice(pos, 1)
          fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
          await replyText("✅ Berhasil menghapus user dengan id " + user)
        } else {
          await replyText("User tidak ditemukan!")
        }
        break
      }
      case 'rekap': {
    if (!isOwner) return;
    
    const filePath = './database/alltrx.json';

    try {
        const fileData = fs.readFileSync(filePath);
        const allTransactions = JSON.parse(fileData);

        if (allTransactions.length === 0) {
            return replyText("Tidak Ditemukan Data Transaksi");
        }

        const monthlyTransactionSummary = {};
        allTransactions.forEach(data => {
            const transactionDate = moment(data.tanggal);
            const transactionMonth = transactionDate.format('MMMM');

            if (!monthlyTransactionSummary[transactionMonth]) {
                monthlyTransactionSummary[transactionMonth] = {
                    totalTransactions: 0,
                    totalHarga: 0,
                    totalHargaModal: 0,
                    totalProfit: 0
                };
            }

            monthlyTransactionSummary[transactionMonth].totalTransactions += 1;
            monthlyTransactionSummary[transactionMonth].totalHarga += parseFloat(data.hargaprofit);
            monthlyTransactionSummary[transactionMonth].totalHargaModal += parseFloat(data.hargaasli);

            const profit = parseFloat(data.hargaprofit) - parseFloat(data.hargaasli);
            monthlyTransactionSummary[transactionMonth].totalProfit += profit;
        });

        let replyMessage = `『 𝐑𝐄𝐊𝐀𝐏 𝐏𝐄𝐍𝐉𝐔𝐀𝐋𝐀𝐍 』
*------------------------------------------*\n`
        Object.keys(monthlyTransactionSummary).forEach(month => {
            const summary = monthlyTransactionSummary[month];
            const formattedTotalHarga = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(summary.totalHarga);
            const formattedTotalHargaModal = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(summary.totalHargaModal);
            const formattedTotalProfit = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(summary.totalProfit);

            replyMessage += `╒- *${month}* ->\n`
            replyMessage += `├ *Total Transaksi:* ${summary.totalTransactions}\n`
            replyMessage += `├ *Pemasukan:* ${formatrupiah(summary.totalHarga)}\n`
            replyMessage += `├ *Pengeluaran:* ${formatrupiah(summary.totalHargaModal)}\n`
            replyMessage += `├ *Keuntungan:* ${formatrupiah(summary.totalProfit)}\n`
            replyMessage += `╘-------------------->\n`
        });

        replyText(replyMessage + "*------------------------------------------*")
    } catch (error) {
        console.error('Error reading the transaction history file:', error);
        replyText("Error, Tidak dapat membaca data");
    }
    break;
}
      
      case 'antilink': {
        if (!isGroup) return replyText(alerts.grup)
if (!isGroupAdmins) return replyText(alerts.admin)
if (!isBotGroupAdmins) return replyText(alerts.botadmin)
if (isAntilink) {
  Antilink.splice(Antilink.indexOf(from), 1)
  fs.writeFileSync('./database/antilink.json', JSON.stringify(Antilink, null, 2))
  await replyText("❌ Antilink dimatikan!")
} else {
  Antilink.push(from)
  fs.writeFileSync('./database/antilink.json', JSON.stringify(Antilink, null, 2))
  await replyText("✅ Antilink diaktifkan!")
}
        break
      }
      case 'hidetag': {
if (!isGroup) return replyText(alerts.grup)
if (!isGroupAdmins) return replyText(alerts.admin)
if (!isBotGroupAdmins) return replyText(alerts.botadmin)
let mem = [];
groupMembers.map( i => mem.push(i.id) )
tehtarik.sendMessage(from, { text: q ? q : '', mentions: mem })
break
}
case 'closegc': {
if (!isGroup) return replyText(alerts.grup)
if (!isGroupAdmins) return replyText(alerts.admin)
if (!isBotGroupAdmins) return replyText(alerts.botadmin)
tehtarik.groupSettingUpdate(from, 'announcement')
await replyText("❌ Grup berhasil ditutup!")
break
}
case 'opengc': {
if (!isGroup) return replyText(alerts.grup)
if (!isGroupAdmins) return replyText(alerts.admin)
if (!isBotGroupAdmins) return replyText(alerts.botadmin)
tehtarik.groupSettingUpdate(from, 'not_announcement')
await replyText("✅ Grup berhasil dibuka!")
break
}
case 'kick': {
if (!isGroup) return replyText(alerts.grup)
if (!isGroupAdmins) return replyText(alerts.admin)
if (!isBotGroupAdmins) return replyText(alerts.botadmin)
var number;
if (mentionUser.length !== 0) {
number = mentionUser[0]
tehtarik.groupParticipantsUpdate(from, [number], "remove")
.then(async res => 
await replyText("✅ Berhasil mengeluarkan member!"))
.catch((err) => reply(mess.error.api))
} else if (isQuotedMsg) {
number = quotedMsg.sender
tehtarik.groupParticipantsUpdate(from, [number], "remove")
.then(async res => 
await replyText("✅ Berhasil mengeluarkan member!"))
.catch((err) => reply("Error"))
} else {
await replyText("Tag atau balas pesan member yang mau dikeluarkan!")
}
break
}
case 'lst': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  let item = text
  if (!item) return await replyText("No Item")
  let ktgr
  let brd
  let typ
  let folder = fs.readdirSync("./database/kategori/").filter((file) => file.endsWith(".json"))
  for (let file of folder) {
    let readF = JSON.parse(fs.readFileSync("./database/kategori/" + file))
    for (let i = 0; i < readF.length; i++) {
      if (readF[i].nama.toLowerCase() === item.toLowerCase()) {
        ktgr = readF[i].kategori
        brd = readF[i].brand
        typ = readF[i].type
      }
    }
  }
  getProduk(ktgr, brd, typ)
  break
}
case 'lanjutkanpesanan': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  let userfile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
  let sections = [{
    title: "METODE PEMBAYARAN",
    rows: [
      {
      title: "💳 | Metode QRIS",
      description: "Biaya Admin 0.7%",
      id: "metodeqris"
    },
      {
      title: "💳 | Metode DANA",
      description: "Biaya Admin 1.67%",
      id: "metodedana"
    },
      {
      title: "💳 | Metode OVO",
      description: "Biaya Admin 3.03%",
      id: "metodeovo"
    },
      {
      title: "💳 | Metode SHOPEEPAY",
      description: "Biaya Admin 2%",
      id: "metodeshopeepay"
    },
      {
      title: "💳 | Metode LINKAJA",
      description: "Biaya Admin 1.67%",
      id: "metodelinkaja"
    },
    {
      title: "💳 | Metode Potong SALDO",
      description: "Gratis Biaya Admin",
      id: "metodeuser"
    }]
  }]
  let show = {
    title: "PILIH METODE",
    sections
  }
  let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `*${global.namabot}*
 
> Pilih Metode Pembayaran Dibawah Ini Untuk Menyelesaikan Transaksi
`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "single_select",
"buttonParamsJson": JSON.stringify(show)
 }
 ]
 })
 })
 }
 }
}, {})
await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
  break
}
case 'batalkanpesanan': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  await replyText("✅ Transaksi berhasil dibatalkan")
  fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
  break
}

case 'metodeqris': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  let userfile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
  let statusDepo = false
  let Unique = require("crypto").randomBytes(5).toString("hex").toUpperCase()
  let jumlahandfee = ((Fee.qris/100)*Number(userfile.harga))+Number(userfile.harga)
await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
  merchantCode: duitku.merchantcode,
  paymentAmount: Math.round(jumlahandfee),
  merchantOrderId: Unique,
  productDetails: "Tes",
  email: duitku.email,
  paymentMethod: "SP",
  customerVaName: pushName,
  returnUrl: "https://google.com",
  callbackUrl: "https://google.com",
  signature: md5(duitku.merchantcode + Unique + Math.round(jumlahandfee) + duitku.apikey)
})
.then(async result => {
console.log(result)
  if (result.data.statusCode === "00") {
      await generateQR(result.data.qrString, "./qrdepo.png")
         
      let replyQr = `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐏𝐄𝐌𝐁𝐀𝐘𝐀𝐑𝐀𝐍 』
*------------------------------------------*
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Fee:* ${Fee.qris}%
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*------------------------------------------*
*Note:* Harap scan dan bayar sebelum waktu habis`

      await tehtarik.sendMessage(from, {image: fs.readFileSync("./qrdepo.png"), caption: replyQr}, {quoted: msg})

      let fet = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: duitku.merchantcode,
    merchantOrderId: Unique,
    signature: md5("D7182" + Unique + duitku.apikey)
  })
  console.log(fet.data)
  let status = fet.data.statusCode
  while (status !== "00") {
    await sleep(15000)
    let api = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: "D7182",
    merchantOrderId: Unique,
    signature: require("md5")("D7182" + Unique + duitku.apikey)
  })
  status = api.data.statusCode
  if (status === "00") {
    statusDepo = true
    break
  } if (status === "02") {
    break
  }
  }
  if (statusDepo) {
    await replyText("✅ Pembayaran Sudah Kami Terima, Transaksi sedang diproses!")
            var order_send = {
      username: digiflazz.username,
      buyer_sku_code: userfile.kodeproduk,
      customer_no: userfile.tujuan,
      ref_id: Unique,
      sign: md5(digiflazz.username + digiflazz.apikey + Unique)
    }
            try {
    const resp = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
    let stt = resp.data.data.status
    while (stt !== "Sukses") {
      await sleep(2000)
          const pres = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
          stt = pres.data.data.status
          console.log("Digiflazz Status: " + stt)
          if (stt === "Sukses") {
            let ps = null
            Object.keys(User).forEach((sr) => {
              if (User[sr].id === sender) ps = sr
            })
            User[ps].jumlahtransaksi += 1
            User[ps].pengeluaran += userfile.harga
            fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
            await replyText(`『 𝐒𝐓𝐑𝐔𝐊 𝐏𝐄𝐌𝐁𝐄𝐋𝐈𝐀𝐍 』
*------------------------------------------*
*- Status:* Sukses ✅
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Serial Number:* ${pres.data.data.sn}
*------------------------------------------*
Terimakasih sudah berbelanja di ${global.namabot}`)
let cek = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        }
        let rosp = await axios.post("https://api.digiflazz.com/v1/cek-saldo", cek)
let sendToOwner = `『 𝐋𝐎𝐆 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 』
*------------------------------------------*
╒- *INFORMASI TRANSAKSI* ->
├  *Buyer:* +${sender.split("@")[0]}
├  *Produk:* ${userfile.namaproduk}
├  *Harga:* ${formatrupiah(userfile.harga)}
├  *Tujuan:* ${userfile.tujuan}
├  *Trx ID:* ${Unique}
├  *Serial Number:* ${pres.data.data.sn}
╘-------------------->
╒- *INFORMASI BUYER* ->
├  *Sisa Saldo:* ${formatrupiah(cekSaldo(sender, User))}
├  *Role:* ${User[ps].role}
├  *Jumlah Transaksi:* +1
╘-------------------->
╒- *INFORMASI DIGIFLAZZ* ->
├  *Sisa Saldo:* ${formatrupiah(rosp.data.data.deposit)}
╘-------------------->
*------------------------------------------*`
await tehtarik.sendMessage(global.nomerowner, {text: sendToOwner})
let datatrx = {
  buyer: sender,
  trxid: Unique,
  tanggal: tanggal,
  produk: userfile.namaproduk,
  hargaasli: pres.data.data.price,
  hargaprofit: userfile.harga,
  tujuan: userfile.tujuan,
  sn: pres.data.data.sn
}
AllTrxDB.push(datatrx)
fs.writeFileSync("./database/alltrx.json", JSON.stringify(AllTrxDB, null, 3))
fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
          if (stt === "Gagal") {
            await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
          addSaldo(sender, Number(userfile.harga), User)
          fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
  }
  } catch (err) {
       await replyText(`!ERROR, Saldo Dikembalikan`)
            addSaldo(sender, Number(userfile.harga), User)
        }
}
      }
})

  break
}
case 'metodedana': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  let userfile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
  let statusDepo = false
  let Unique = require("crypto").randomBytes(5).toString("hex").toUpperCase()
  let jumlahandfee = ((Fee.dana/100)*Number(userfile.harga))+Number(userfile.harga)
await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
  merchantCode: duitku.merchantcode,
  paymentAmount: Math.round(jumlahandfee),
  merchantOrderId: Unique,
  productDetails: "Payment Goca Game",
  email: duitku.email,
  paymentMethod: "DA",
  customerVaName: pushName,
  returnUrl: "https://google.com",
  callbackUrl: "https://google.com",
  signature: md5(duitku.merchantcode + Unique + Math.round(jumlahandfee) + duitku.apikey)
})
.then(async result => {
console.log(result)
  if (result.data.statusCode === "00") {
      let replyQr = `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐏𝐄𝐌𝐁𝐀𝐘𝐀𝐑𝐀𝐍 』
*------------------------------------------*
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Fee:* ${Fee.dana}%
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Link Pembayaran:* ${result.data.paymentUrl}
*------------------------------------------*
*Note:* Harap bayar sebelum waktu habis`

      await replyText(replyQr)

      let fet = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: duitku.merchantcode,
    merchantOrderId: Unique,
    signature: md5("D7182" + Unique + duitku.apikey)
  })
  console.log(fet.data)
  let status = fet.data.statusCode
  while (status !== "00") {
    await sleep(15000)
    let api = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: "D7182",
    merchantOrderId: Unique,
    signature: require("md5")("D7182" + Unique + duitku.apikey)
  })
  status = api.data.statusCode
  if (status === "00") {
    statusDepo = true
    break
  } if (status === "02") {
    break
  }
  }
   if (statusDepo) {
    await replyText("✅ Pembayaran Sudah Kami Terima, Transaksi sedang diproses!")
            var order_send = {
      username: digiflazz.username,
      buyer_sku_code: userfile.kodeproduk,
      customer_no: userfile.tujuan,
      ref_id: Unique,
      sign: md5(digiflazz.username + digiflazz.apikey + Unique)
    }
            try {
    const resp = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
    
    let stt = resp.data.data.status
    while (stt !== "Sukses") {
      await sleep(2000)
          const pres = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
          stt = pres.data.data.status
          console.log("Digiflazz Status: " + stt)
          if (stt === "Sukses") {
            let ps = null
            Object.keys(User).forEach((sr) => {
              if (User[sr].id === sender) ps = sr
            })
            User[ps].jumlahtransaksi += 1
            User[ps].pengeluaran += userfile.harga
            fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
            await replyText(`『 𝐒𝐓𝐑𝐔𝐊 𝐏𝐄𝐌𝐁𝐄𝐋𝐈𝐀𝐍 』
*------------------------------------------*
*- Status:* Sukses ✅
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Serial Number:* ${pres.data.data.sn}
*------------------------------------------*
Terimakasih sudah berbelanja di ${global.namabot}`)
let cek = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        }
        let rosp = await axios.post("https://api.digiflazz.com/v1/cek-saldo", cek)
let sendToOwner = `『 𝐋𝐎𝐆 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 』
*------------------------------------------*
╒- *INFORMASI TRANSAKSI* ->
├  *Buyer:* +${sender.split("@")[0]}
├  *Produk:* ${userfile.namaproduk}
├  *Harga:* ${formatrupiah(userfile.harga)}
├  *Tujuan:* ${userfile.tujuan}
├  *Trx ID:* ${Unique}
├  *Serial Number:* ${pres.data.data.sn}
╘-------------------->
╒- *INFORMASI BUYER* ->
├  *Sisa Saldo:* ${formatrupiah(cekSaldo(sender, User))}
├  *Role:* ${User[ps].role}
├  *Jumlah Transaksi:* +1
╘-------------------->
╒- *INFORMASI DIGIFLAZZ* ->
├  *Sisa Saldo:* ${formatrupiah(rosp.data.data.deposit)}
╘-------------------->
*------------------------------------------*`
await tehtarik.sendMessage(global.nomerowner, {text: sendToOwner})
let datatrx = {
  buyer: sender,
  trxid: Unique,
  tanggal: tanggal,
  produk: userfile.namaproduk,
  hargaasli: pres.data.data.price,
  hargaprofit: userfile.harga,
  tujuan: userfile.tujuan,
  sn: pres.data.data.sn
}
AllTrxDB.push(datatrx)
fs.writeFileSync("./database/alltrx.json", JSON.stringify(AllTrxDB, null, 3))
fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
          if (stt === "Gagal") {
            await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
          addSaldo(sender, Number(userfile.harga), User)
          fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
  }
  } catch (err) {
       await replyText(`!ERROR, Saldo Dikembalikan`)
            addSaldo(sender, Number(userfile.harga), User)
        }
}
      }
})
    
  break
}

case 'metodeovo': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  let userfile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
  let statusDepo = false
  let Unique = require("crypto").randomBytes(5).toString("hex").toUpperCase()
  let jumlahandfee = ((Fee.ovo/100)*Number(userfile.harga))+Number(userfile.harga)
await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
  merchantCode: duitku.merchantcode,
  paymentAmount: Math.round(jumlahandfee),
  merchantOrderId: Unique,
  productDetails: "Payment Goca Game",
  email: duitku.email,
  paymentMethod: "OV",
  customerVaName: pushName,
  returnUrl: "https://google.com",
  callbackUrl: "https://google.com",
  signature: md5(duitku.merchantcode + Unique + Math.round(jumlahandfee) + duitku.apikey)
})
.then(async result => {
console.log(result)
  if (result.data.statusCode === "00") {
      let replyQr = `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐏𝐄𝐌𝐁𝐀𝐘𝐀𝐑𝐀𝐍 』
*------------------------------------------*
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Fee:* ${Fee.ovo}%
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Link Pembayaran:* ${result.data.paymentUrl}
*------------------------------------------*
*Note:* Harap bayar sebelum waktu habis`

      await replyText(replyQr)

      let fet = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: duitku.merchantcode,
    merchantOrderId: Unique,
    signature: md5("D7182" + Unique + duitku.apikey)
  })
  console.log(fet.data)
  let status = fet.data.statusCode
  while (status !== "00") {
    await sleep(15000)
    let api = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: "D7182",
    merchantOrderId: Unique,
    signature: require("md5")("D7182" + Unique + duitku.apikey)
  })
  status = api.data.statusCode
  if (status === "00") {
    statusDepo = true
    break
  } if (status === "02") {
    break
  }
  }
   if (statusDepo) {
    await replyText("✅ Pembayaran Sudah Kami Terima, Transaksi sedang diproses!")
            var order_send = {
      username: digiflazz.username,
      buyer_sku_code: userfile.kodeproduk,
      customer_no: userfile.tujuan,
      ref_id: Unique,
      sign: md5(digiflazz.username + digiflazz.apikey + Unique)
    }
            try {
    const resp = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
    let stt = resp.data.data.status
    while (stt !== "Sukses") {
      await sleep(2000)
          const pres = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
          stt = pres.data.data.status
          console.log("Digiflazz Status: " + stt)
          if (stt === "Sukses") {
            let ps = null
            Object.keys(User).forEach((sr) => {
              if (User[sr].id === sender) ps = sr
            })
            User[ps].jumlahtransaksi += 1
            User[ps].pengeluaran += userfile.harga
            fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
            await replyText(`『 𝐒𝐓𝐑𝐔𝐊 𝐏𝐄𝐌𝐁𝐄𝐋𝐈𝐀𝐍 』
*------------------------------------------*
*- Status:* Sukses ✅
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Serial Number:* ${pres.data.data.sn}
*------------------------------------------*
Terimakasih sudah berbelanja di ${global.namabot}`)
let cek = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        }
        let rosp = await axios.post("https://api.digiflazz.com/v1/cek-saldo", cek)
let sendToOwner = `『 𝐋𝐎𝐆 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 』
*------------------------------------------*
╒- *INFORMASI TRANSAKSI* ->
├  *Buyer:* +${sender.split("@")[0]}
├  *Produk:* ${userfile.namaproduk}
├  *Harga:* ${formatrupiah(userfile.harga)}
├  *Tujuan:* ${userfile.tujuan}
├  *Trx ID:* ${Unique}
├  *Serial Number:* ${pres.data.data.sn}
╘-------------------->
╒- *INFORMASI BUYER* ->
├  *Sisa Saldo:* ${formatrupiah(cekSaldo(sender, User))}
├  *Role:* ${User[ps].role}
├  *Jumlah Transaksi:* +1
╘-------------------->
╒- *INFORMASI DIGIFLAZZ* ->
├  *Sisa Saldo:* ${formatrupiah(rosp.data.data.deposit)}
╘-------------------->
*------------------------------------------*`
await tehtarik.sendMessage(global.nomerowner, {text: sendToOwner})
let datatrx = {
  buyer: sender,
  trxid: Unique,
  tanggal: tanggal,
  produk: userfile.namaproduk,
  hargaasli: pres.data.data.price,
  hargaprofit: userfile.harga,
  tujuan: userfile.tujuan,
  sn: pres.data.data.sn
}
AllTrxDB.push(datatrx)
fs.writeFileSync("./database/alltrx.json", JSON.stringify(AllTrxDB, null, 3))
fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
          if (stt === "Gagal") {
            await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
          addSaldo(sender, Number(userfile.harga), User)
          fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
  }
  } catch (err) {
       await replyText(`!ERROR, Saldo Dikembalikan`)
            addSaldo(sender, Number(userfile.harga), User)
        }
}
      }
})
    
  break
}
case 'metodelinkaja': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  let userfile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
  let statusDepo = false
  let Unique = require("crypto").randomBytes(5).toString("hex").toUpperCase()
  let jumlahandfee = ((Fee.linkaja/100)*Number(userfile.harga))+Number(userfile.harga)
await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
  merchantCode: duitku.merchantcode,
  paymentAmount: Math.round(jumlahandfee),
  merchantOrderId: Unique,
  productDetails: "Payment Goca Game",
  email: duitku.email,
  paymentMethod: "LA",
  customerVaName: pushName,
  returnUrl: "https://google.com",
  callbackUrl: "https://google.com",
  signature: md5(duitku.merchantcode + Unique + Math.round(jumlahandfee) + duitku.apikey)
})
.then(async result => {
console.log(result)
  if (result.data.statusCode === "00") {
      let replyQr = `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐏𝐄𝐌𝐁𝐀𝐘𝐀𝐑𝐀𝐍 』
*------------------------------------------*
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Fee:* ${Fee.linkaja}%
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Link Pembayaran:* ${result.data.paymentUrl}
*------------------------------------------*
*Note:* Harap bayar sebelum waktu habis`

      await replyText(replyQr)

      let fet = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: duitku.merchantcode,
    merchantOrderId: Unique,
    signature: md5("D7182" + Unique + duitku.apikey)
  })
  console.log(fet.data)
  let status = fet.data.statusCode
  while (status !== "00") {
    await sleep(15000)
    let api = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: "D7182",
    merchantOrderId: Unique,
    signature: require("md5")("D7182" + Unique + duitku.apikey)
  })
  status = api.data.statusCode
  if (status === "00") {
    statusDepo = true
    break
  } if (status === "02") {
    break
  }
  }
   if (statusDepo) {
    await replyText("✅ Pembayaran Sudah Kami Terima, Transaksi sedang diproses!")
            var order_send = {
      username: digiflazz.username,
      buyer_sku_code: userfile.kodeproduk,
      customer_no: userfile.tujuan,
      ref_id: Unique,
      sign: md5(digiflazz.username + digiflazz.apikey + Unique)
    }
            try {
    const resp = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
    let stt = resp.data.data.status
    while (stt !== "Sukses") {
      await sleep(2000)
          const pres = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
          stt = pres.data.data.status
          console.log("Digiflazz Status: " + stt)
          if (stt === "Sukses") {
            let ps = null
            Object.keys(User).forEach((sr) => {
              if (User[sr].id === sender) ps = sr
            })
            User[ps].jumlahtransaksi += 1
            User[ps].pengeluaran += userfile.harga
            fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
            await replyText(`『 𝐒𝐓𝐑𝐔𝐊 𝐏𝐄𝐌𝐁𝐄𝐋𝐈𝐀𝐍 』
*------------------------------------------*
*- Status:* Sukses ✅
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Serial Number:* ${pres.data.data.sn}
*------------------------------------------*
Terimakasih sudah berbelanja di ${global.namabot}`)
let cek = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        }
        let rosp = await axios.post("https://api.digiflazz.com/v1/cek-saldo", cek)
let sendToOwner = `『 𝐋𝐎𝐆 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 』
*------------------------------------------*
╒- *INFORMASI TRANSAKSI* ->
├  *Buyer:* +${sender.split("@")[0]}
├  *Produk:* ${userfile.namaproduk}
├  *Harga:* ${formatrupiah(userfile.harga)}
├  *Tujuan:* ${userfile.tujuan}
├  *Trx ID:* ${Unique}
├  *Serial Number:* ${pres.data.data.sn}
╘-------------------->
╒- *INFORMASI BUYER* ->
├  *Sisa Saldo:* ${formatrupiah(cekSaldo(sender, User))}
├  *Role:* ${User[ps].role}
├  *Jumlah Transaksi:* +1
╘-------------------->
╒- *INFORMASI DIGIFLAZZ* ->
├  *Sisa Saldo:* ${formatrupiah(rosp.data.data.deposit)}
╘-------------------->
*------------------------------------------*`
await tehtarik.sendMessage(global.nomerowner, {text: sendToOwner})
let datatrx = {
  buyer: sender,
  trxid: Unique,
  tanggal: tanggal,
  produk: userfile.namaproduk,
  hargaasli: pres.data.data.price,
  hargaprofit: userfile.harga,
  tujuan: userfile.tujuan,
  sn: pres.data.data.sn
}
AllTrxDB.push(datatrx)
fs.writeFileSync("./database/alltrx.json", JSON.stringify(AllTrxDB, null, 3))
fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
          if (stt === "Gagal") {
            await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
          addSaldo(sender, Number(userfile.harga), User)
          fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
  }
  } catch (err) {
       await replyText(`!ERROR, Saldo Dikembalikan`)
            addSaldo(sender, Number(userfile.harga), User)
        }
}
      }
})
    
  break
}
case 'metodeshopeepay': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  let userfile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
  let statusDepo = false
  let Unique = require("crypto").randomBytes(5).toString("hex").toUpperCase()
  let jumlahandfee = ((Fee.shopeepay/100)*Number(userfile.harga))+Number(userfile.harga)
await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
  merchantCode: duitku.merchantcode,
  paymentAmount: Math.round(jumlahandfee),
  merchantOrderId: Unique,
  productDetails: "Payment Goca Game",
  email: duitku.email,
  paymentMethod: "SA",
  customerVaName: pushName,
  returnUrl: "https://google.com",
  callbackUrl: "https://google.com",
  signature: md5(duitku.merchantcode + Unique + Math.round(jumlahandfee) + duitku.apikey)
})
.then(async result => {
console.log(result)
  if (result.data.statusCode === "00") {
      let replyQr = `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐏𝐄𝐌𝐁𝐀𝐘𝐀𝐑𝐀𝐍 』
*------------------------------------------*
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Fee:* ${Fee.shopeepay}%
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Link Pembayaran:* ${result.data.paymentUrl}
*------------------------------------------*
*Note:* Harap bayar sebelum waktu habis`

      await replyText(replyQr)

      let fet = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: duitku.merchantcode,
    merchantOrderId: Unique,
    signature: md5("D7182" + Unique + duitku.apikey)
  })
  console.log(fet.data)
  let status = fet.data.statusCode
  while (status !== "00") {
    await sleep(15000)
    let api = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
    merchantCode: "D7182",
    merchantOrderId: Unique,
    signature: require("md5")("D7182" + Unique + duitku.apikey)
  })
  status = api.data.statusCode
  if (status === "00") {
    statusDepo = true
    break
  } if (status === "02") {
    break
  }
  }
   if (statusDepo) {
    await replyText("✅ Pembayaran Sudah Kami Terima, Transaksi sedang diproses!")
            var order_send = {
      username: digiflazz.username,
      buyer_sku_code: userfile.kodeproduk,
      customer_no: userfile.tujuan,
      ref_id: Unique,
      sign: md5(digiflazz.username + digiflazz.apikey + Unique)
    }
            try {
     const resp = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
    let stt = resp.data.data.status
    while (stt !== "Sukses") {
      await sleep(2000)
          const pres = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
          stt = pres.data.data.status
          console.log("Digiflazz Status: " + stt)
          if (stt === "Sukses") {
            let ps = null
            Object.keys(User).forEach((sr) => {
              if (User[sr].id === sender) ps = sr
            })
            User[ps].jumlahtransaksi += 1
            User[ps].pengeluaran += userfile.harga
            fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
            await replyText(`『 𝐒𝐓𝐑𝐔𝐊 𝐏𝐄𝐌𝐁𝐄𝐋𝐈𝐀𝐍 』
*------------------------------------------*
*- Status:* Sukses ✅
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(jumlahandfee)}
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${Unique}
*- Serial Number:* ${pres.data.data.sn}
*------------------------------------------*
Terimakasih sudah berbelanja di ${global.namabot}`)
let cek = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        }
        let rosp = await axios.post("https://api.digiflazz.com/v1/cek-saldo", cek)
let sendToOwner = `『 𝐋𝐎𝐆 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 』
*------------------------------------------*
╒- *INFORMASI TRANSAKSI* ->
├  *Buyer:* +${sender.split("@")[0]}
├  *Produk:* ${userfile.namaproduk}
├  *Harga:* ${formatrupiah(userfile.harga)}
├  *Tujuan:* ${userfile.tujuan}
├  *Trx ID:* ${Unique}
├  *Serial Number:* ${pres.data.data.sn}
╘-------------------->
╒- *INFORMASI BUYER* ->
├  *Sisa Saldo:* ${formatrupiah(cekSaldo(sender, User))}
├  *Role:* ${User[ps].role}
├  *Jumlah Transaksi:* +1
╘-------------------->
╒- *INFORMASI DIGIFLAZZ* ->
├  *Sisa Saldo:* ${formatrupiah(rosp.data.data.deposit)}
╘-------------------->
*------------------------------------------*`
await tehtarik.sendMessage(global.nomerowner, {text: sendToOwner})
let datatrx = {
  buyer: sender,
  trxid: Unique,
  tanggal: tanggal,
  produk: userfile.namaproduk,
  hargaasli: pres.data.data.price,
  hargaprofit: userfile.harga,
  tujuan: userfile.tujuan,
  sn: pres.data.data.sn
}
AllTrxDB.push(datatrx)
fs.writeFileSync("./database/alltrx.json", JSON.stringify(AllTrxDB, null, 3))
fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
          if (stt === "Gagal") {
            await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
          addSaldo(sender, Number(userfile.harga), User)
          fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
  }
  } catch (err) {
       await replyText(`!ERROR, Saldo Dikembalikan`)
            addSaldo(sender, Number(userfile.harga), User)
        }
}
      }
})
    
  break
}
case 'metodeuser': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  if (!fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) return await replyText("Error File Not Found!")
  let userfile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
  if (cekSaldo(sender, User) < userfile.harga) return await replyText("Saldo kamu tidak mencukupi!")
  minSaldo(sender, Number(userfile.harga), User)
  await replyText("✅ Pembayaran Sudah Kami Terima, Transaksi sedang diproses!")
            var order_send = {
      username: digiflazz.username,
      buyer_sku_code: userfile.kodeproduk,
      customer_no: userfile.tujuan,
      ref_id: userfile.trxid,
      sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + userfile.trxid).digest('hex')
    }
    try {
      const resp = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
      let stt = resp.data.status
    while (stt !== "Sukses") {
      await sleep(2000)
          const pres = await axios.post("https://api.digiflazz.com/v1/transaction", order_send)
          stt = pres.data.data.status
          console.log("Digiflazz Status: " + stt)
          if (stt === "Sukses") {
              
            let ps = null
            Object.keys(User).forEach((sr) => {
              if (User[sr].id === sender) ps = sr
            })
            User[ps].jumlahtransaksi += 1
            User[ps].pengeluaran += userfile.harga
            fs.writeFileSync("./database/user.json", JSON.stringify(User, null, 3))
            await replyText(`『 𝐒𝐓𝐑𝐔𝐊 𝐏𝐄𝐌𝐁𝐄𝐋𝐈𝐀𝐍 』
*------------------------------------------*
*- Status:* Sukses ✅
*- Produk:* ${userfile.namaproduk}
*- Kode:* ${userfile.kodeproduk}
*- Harga:* ${formatrupiah(userfile.harga)}
*- Tujuan:* ${userfile.tujuan}
*- Trx ID:* ${userfile.trxid}
*- Serial Number:* ${pres.data.data.sn}
*------------------------------------------*
Terimakasih sudah berbelanja di ${global.namabot}`)
let cek = {
          cmd: 'deposit',
  username: digiflazz.username,
  sign: crypto.createHash('md5').update(digiflazz.username + digiflazz.apikey + 'depo').digest('hex')
        }
        let rosp = await axios.post("https://api.digiflazz.com/v1/cek-saldo", cek)
let sendToOwner = `『 𝐋𝐎𝐆 𝐓𝐑𝐀𝐍𝐒𝐀𝐊𝐒𝐈 』
*------------------------------------------*
╒- *INFORMASI TRANSAKSI* ->
├  *Buyer:* +${sender.split("@")[0]}
├  *Produk:* ${userfile.namaproduk}
├  *Harga:* ${formatrupiah(userfile.harga)}
├  *Tujuan:* ${userfile.tujuan}
├  *Trx ID:* ${userfile.trxid}
├  *Serial Number:* ${pres.data.data.sn}
╘-------------------->
╒- *INFORMASI BUYER* ->
├  *Sisa Saldo:* ${formatrupiah(cekSaldo(sender, User))}
├  *Role:* ${User[ps].role}
├  *Jumlah Transaksi:* +1
╘-------------------->
╒- *INFORMASI DIGIFLAZZ* ->
├  *Sisa Saldo:* ${formatrupiah(rosp.data.data.deposit)}
╘-------------------->
*------------------------------------------*`
await tehtarik.sendMessage(global.nomerowner, {text: sendToOwner})
let datatrx = {
  buyer: sender,
  trxid: userfile.trxid,
  tanggal: tanggal,
  produk: userfile.namaproduk,
  hargaasli: pres.data.data.price,
  hargaprofit: userfile.harga,
  tujuan: userfile.tujuan,
  sn: pres.data.data.sn
}
AllTrxDB.push(datatrx)
fs.writeFileSync("./database/alltrx.json", JSON.stringify(AllTrxDB, null, 3))
fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          } if (stt === "Gagal") {
            await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
          addSaldo(sender, Number(userfile.harga), User)
          fs.unlinkSync("./database/trx/" + sender.split("@")[0] + ".json")
            break
          }
    }
    } catch {
      await replyText("❌ Transaksi mu gagal, uang akan di konversikan ke saldo mu silahkan cek saldo kamu ketik chat saldo")
    }
  break
}
case 'leaderboard': {
  if (!isRegistered(sender)) return await replyText(alerts.daftar)
  let Text = "『 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 』\n*------------------------------------------*\n"
  let count = 1
  User.forEach(usr => {
    User.sort((a, b) => b.pengeluaran - a.pengeluaran)
    Text += `${count}. +${usr.id.split("@")[0]} - ${formatrupiah(usr.pengeluaran)}\n`
    count += 1
  })
  await replyText(Text + "*------------------------------------------*")
  break
}
}//switch cmd
    if (command === "beliteht") {
      if (!isRegistered(sender)) return await replyText(alerts.daftar)
      if (!text) return await replyText("No Item!")
      let senderId = sender.split("@")[0]
      if (fs.existsSync("./database/trx/" + senderId + ".json")) {
        fs.unlinkSync("./database/trx/" + senderId + ".json")
      }
      let trxid = crypto.randomBytes(6).toString("hex").toUpperCase()
  let pos = null
  let posuser = null
  Object.keys(DigiflazzDB).forEach((digi) => {
    if (DigiflazzDB[digi].buyer_sku_code === text) {
      pos = digi
    }
  })
  Object.keys(User).forEach((s) => {
    if (User[s].id === sender) posuser = s
  })
  if (pos === null) return await replyText("Error!")
  if (posuser === null) return await replyText("Error User!")
  let kategori = DigiflazzDB[pos].category.toLowerCase().replace(" ", "")
  if (kategori.toLowerCase() === "e-money") kategori = "ewallet"
          if (kategori.toLowerCase() === "paket sms & telpon") kategori = "paketsms"
          if (Mode[kategori.replace(" ", "").toLowerCase()].mode.toLowerCase() === "persen") {
            harga = ((Mode[kategori.replace(" ", "").toLowerCase()].profit/100)*DigiflazzDB[pos].price)+DigiflazzDB[pos].price
          } else {
            harga = DigiflazzDB[pos].price+Mode[kategori.replace(" ", "").toLowerCase()].profit
          }
  let dataTrx = {
    id: sender.split("@")[0],
    trxid: trxid,
    namaproduk: DigiflazzDB[pos].product_name,
    kodeproduk: text,
    harga: Math.round(harga),
    tujuan: "",
    sesi: "konfirmasitujuan"
  }
  fs.writeFileSync("./database/trx/" + sender.split("@")[0] + ".json", JSON.stringify(dataTrx, null, 2))
  let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐓𝐔𝐉𝐔𝐀𝐍 』
*------------------------------------------*
Harap masukkan nomor tujuan pengisian
*Contoh:* 123456789 / 08123456789

Jika memiliki Server / Zone ID
*Contoh:* 123456789 (ID), 1234 (Server) digabung menjadi 1234567891234
*------------------------------------------*
*Note:* Masukkan tujuan dengan benar`
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: []
 })
 })
 }
 }
}, {})

 await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
    }
    
    if (fs.existsSync("./database/trx/" + sender.split("@")[0] + ".json")) {
      let readUserFile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
      if (readUserFile.sesi === "konfirmasitujuan") {
       if (chats.includes("beliteht")) return
        readUserFile.tujuan = chats
        readUserFile.sesi = "completetujuan"
        fs.writeFileSync("./database/trx/" + sender.split("@")[0] + ".json", JSON.stringify(readUserFile, null, 2))
        readUserFile = JSON.parse(fs.readFileSync("./database/trx/" + sender.split("@")[0] + ".json"))
        let text = `『 𝐊𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐒𝐈 𝐏𝐄𝐒𝐀𝐍𝐀𝐍 』
*------------------------------------------*
*- Produk:* ${readUserFile.namaproduk}
*- Kode:* ${readUserFile.kodeproduk}
*- Harga:* ${formatrupiah(readUserFile.harga)}
*- Tujuan:* ${readUserFile.tujuan}
*- Trx ID:* ${readUserFile.trxid}
*------------------------------------------*`
let msg = generateWAMessageFromContent(from, {
 viewOnceMessage: {
 message: {
 "messageContextInfo": {
 "deviceListMetadata": {},
 "deviceListMetadataVersion": 2
 },
 interactiveMessage: proto.Message.InteractiveMessage.create({
 contextInfo: {
 mentionedJid: [sender], 
 isForwarded: false
 }, 
 body: proto.Message.InteractiveMessage.Body.create({
 text: text
 }),
footer: proto.Message.InteractiveMessage.Footer.create({
 text: `_*${global.footer.toUpperCase()}*_`
 }),
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
 buttons: [ 
 {
 "name": "quick_reply",
"buttonParamsJson": JSON.stringify({
  display_text: "Lanjutkan",
  id: "lanjutkanpesanan"
})
 },
 {
 "name": "quick_reply",
"buttonParamsJson": JSON.stringify({
  display_text: "Batalkan",
  id: "batalkanpesanan"
})
 }
 ]
 })
 })
 }
 }
}, {})

 await tehtarik.relayMessage(msg.key.remoteJid, msg.message, {
 messageId: msg.key.id
})
      }
} 
  })
}
startBot()
