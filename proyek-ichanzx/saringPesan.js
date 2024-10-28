import fetch from 'node-fetch'
let handler = m => m;

handler.before = async function(m, { conn }) {
    let command = m.text
    try {
       if (command === "paysntk") {
           let [awuh, order, jumlah, target] = m.text.split(' ')
      if (!order) return await m.reply("No Item!")
      let senderId = m.sender.split("@")[0]
      if (fs.existsSync("./database/trx/" + senderId + ".json")) {
        fs.unlinkSync("./database/trx/" + senderId + ".json")
      }
      let trxid = crypto.randomBytes(6).toString("hex").toUpperCase()

                           let key = new URLSearchParams()
key.append("api_id", global.suntik.api)
key.append("api_key", global.suntik.key)
fetch("https://api.medanpedia.co.id/services", {
method: "POST",
body: key,
redirect: 'follow'
})
.then(response => response.json())
.then(async res => {
    for (let i of res.data) {
  if (i.id == order) {
      
     let chan = anunih(i.price, jumlah)
     let mikusayang = (suntikuntung / 100) * chan
     let njirenak = chan + mikusayang; // tambahkan keuntungan ke harga awal
     let crot = Math.round(njirenak);
   let dataTrx = {
    id: m.sender.split("@")[0],
    trxid: trxid,
    namaproduk: i.name,
    kodeproduk: i.id,
    harga: crot,
    tujuan: target,
    sesi: "konfirmasi"
  }
  }
  }

})
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
    } catch (e) {
        // Menangani error jika terjadi
        console.log(e)
       // await m.reply(e.toString());
    }
}

export default handler

function anunih(pricePerThousand, quantity) {
    const pricePerUnit = pricePerThousand / 1000;
    return Math.round(pricePerUnit * quantity);
}
