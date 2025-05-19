import axios from 'axios';
import sharp from 'sharp';

async function sticker(buffer, packname = '', author = '') {
  // Convierte imagen PNG a WebP para sticker de WhatsApp
  const webpBuffer = await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp()
    .toBuffer();

  return webpBuffer;
}

const handler = async (m, { conn, args }) => {
  try {
    let text;

    if (args.length) {
      text = args.join(' ');
    } else if (m.quoted && m.quoted.text) {
      text = m.quoted.text;
    } else {
      return await conn.sendMessage(m.chat, { text: '🚩 Te Faltó El Texto!' }, { quoted: m });
    }

    if (!text) {
      return await conn.sendMessage(m.chat, { text: '🚩 Te Faltó El Texto!' }, { quoted: m });
    }

    const who = (m.mentionedJid && m.mentionedJid[0])
      ? m.mentionedJid[0]
      : m.fromMe
        ? conn.user.id
        : m.sender;

    const mentionRegex = new RegExp(`@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
    const mishi = text.replace(mentionRegex, '');

    if (mishi.length > 30) {
      return await conn.sendMessage(m.chat, { text: '🚩 El texto no puede tener más de 30 caracteres' }, { quoted: m });
    }

    // Obtener foto de perfil o usar imagen por defecto
    let pp = null;
    try {
      pp = await conn.profilePictureUrl(who, 'image').catch(() => null);
    } catch {
      pp = null;
    }
    if (!pp) pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';

    // Obtener nombre del usuario
    const nombre = await conn.getName(who);

    const obj = {
      type: "quote",
      format: "png",
      backgroundColor: "#000000",
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: nombre,
          photo: { url: pp }
        },
        text: mishi,
        replyMessage: {}
      }]
    };

    const response = await axios.post('https://bot.lyo.su/quote/generate', obj, {
      headers: { 'Content-Type': 'application/json' }
    });

    const buffer = Buffer.from(response.data.result.image, 'base64');

    const stikerBuffer = await sticker(buffer);

    if (!stikerBuffer) {
      return await conn.sendMessage(m.chat, { text: '❌ No se pudo generar el sticker.' }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { sticker: stikerBuffer }, { quoted: m });

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al generar el sticker.' }, { quoted: m });
  }
};

handler.help = ['qc *<texto>*'];
handler.tags = ['sticker'];
handler.command = ['qc'];

export default handler;
