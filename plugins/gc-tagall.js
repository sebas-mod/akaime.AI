const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix.toLowerCase() === 'a') return;

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const mensaje = args.join(' ') || '¡Hola a todos! 🌟';
  const total = participants.length;

  // Emojis que se irán rotando
  const emojis = ['🎯', '🔥', '🌟', '🚀', '⚡', '💎', '🎉', '🧠', '🐱', '🐉', '🦾', '🎮', '👾', '🌈'];

  let teks = `
╭━━━〔 *👥 INVOCACIÓN DE GRUPO* 〕━━━╮
┃📢 *Mensaje:* ${mensaje}
┃👤 *Total de miembros:* ${total}
┃🔔 *Etiquetando a:*
`;

  participants.forEach((mem, i) => {
    const emoji = emojis[i % emojis.length]; // Rota los emojis
    teks += `┃${emoji} @${mem.id.split('@')[0]}\n`;
  });

  teks += '╰━━━━━━━━━━━━━━━━━━━━━━━╯\n';
  teks += '🤖 *Bot: Akame Ai*';

  await conn.sendMessage(m.chat, {
    text: teks,
    mentions: participants.map(p => p.id)
  });
};

handler.help = ['tagall <mensaje>', 'invocar <mensaje>'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|invocacion|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
