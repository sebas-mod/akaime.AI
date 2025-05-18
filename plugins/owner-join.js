let handler = async (m, { conn, text, usedPrefix, command, args, isOwner }) => {
  let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
  let delay = time => new Promise(res => setTimeout(res, time))

  let [_, code] = text.match(linkRegex) || []
  if (!args[0]) throw `✳️ Envia el link del grupo.\n\n📌 Ejemplo:\n *${usedPrefix + command}* <linkwa> <días | permanente>`
  if (!code) throw `✳️ El enlace no es válido.`
  if (!args[1]) throw `📌 Faltan los días de estadía o escribe "permanente".\n\nEjemplo:\n *${usedPrefix + command}* <linkwa> 2`
  if (isNaN(args[1]) && args[1].toLowerCase() !== 'permanente' && args[1].toLowerCase() !== 'perm') throw `✳️ El segundo argumento debe ser un número (días) o la palabra "permanente"`

  let owbot = global.owner[1]
  let inviter = await conn.getName(m.sender)

  m.reply('😎 Espere 3 segundos, me uniré al grupo...')
  await delay(3000)

  try {
    let res = await conn.groupAcceptInvite(code)
    global.db.data.chats[res] = global.db.data.chats[res] || {}

    let metadata = await conn.groupMetadata(res)
    let participants = metadata.participants.map(v => v.id)
    let now = new Date() * 1
    let expirationText = ''

    // Modo permanente
    if (['permanente', 'perm'].includes(args[1].toLowerCase())) {
      global.db.data.chats[res].expired = 0 // 0 significa permanente
      expirationText = '🔒 *Permanente* (el bot no saldrá automáticamente)'
    } else {
      let nDays = 86400000 * parseInt(args[1])
      global.db.data.chats[res].expired = (global.db.data.chats[res].expired > now)
        ? global.db.data.chats[res].expired + nDays
        : now + nDays
      expirationText = `⏳ *${msToDate(global.db.data.chats[res].expired - now)}*`
    }

    await conn.reply(res, `✅ Me uní correctamente al grupo *${metadata.subject}*\n\n📅 Tiempo de estadía del bot:\n${expirationText}`, m)

    await conn.reply(res, `🏮 ¡Hola a todos!\n\nFui invitado por *${inviter}*\n\n@${owbot} es mi creador.`, m, {
      mentions: participants
    })

    await conn.reply(owbot + '@s.whatsapp.net',
      `≡ *INVITACIÓN A GRUPO*\n\n@${m.sender.split('@')[0]} ha invitado al bot al grupo:\n\n📌 *${metadata.subject}*\n🆔 *${res}*\n🔗 Link: ${args[0]}\n📅 Tiempo de estadía: ${expirationText}`,
      null, { mentions: [m.sender] }
    )

  } catch (e) {
    conn.reply(owbot + '@s.whatsapp.net', e.toString())
    throw `✳️ Lo siento, el bot no puede unirse al grupo.`
  }
}

handler.help = ['join <chat.whatsapp.com> <días | permanente>']
handler.tags = ['owner']
handler.command = ['join', 'invite']
handler.owner = true

export default handler

function msToDate(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}
