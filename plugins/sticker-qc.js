import axios from 'axios';
import sharp from 'sharp'; // para convertir imagen PNG a WEBP
import { writeFileSync } from 'fs';

async function sticker(buffer, packname = '', author = '') {
  // Convierte la imagen PNG en un buffer WEBP para sticker
  // Puedes personalizarlo para incluir metadata si quieres
  const webpBuffer = await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp()
    .toBuffer();

  return webpBuffer; // este buffer se usa directo en baileys sendMessage con { sticker: buffer }
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

    const who = (m.mentionedJid && m.mentionedJid[0]) ? m.mentionedJid[0]
      : m.fromMe ? conn.user.id : m.sender;

    const mentionRegex = new RegExp(`@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
    const mishi = text.replace(mentionRegex, '');

    if (mishi.length > 30) {
      return await conn.sendMessage(m.chat, { text: '🚩 El texto no puede tener más de 30 caracteres' }, { quoted: m });
    }

    // Obtener foto de perfil
    let pp = null;
    try {
      pp = await conn.profilePictureUrl(who, 'image').catch(() => null);
    } catch {
      pp = null;
    }
    if (!pp) pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';

    // Obtener nombre
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

    const stikerBuffer = await sticker(buffer, global.packname, global.author);

    if (!stikerBuffer) {
      return await conn.sendMessage(m.chat, { text: '❌ No se pudo generar el sticker.' }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { sticker: stikerBuffer }, { quoted: m });

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al generar el sticker.' }, { quoted: m });
  }
};

ha
