const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix.toLowerCase() === 'a') return;

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const mensaje = args.join(' ');
  const total = participants.length;
  const emojis = ['🔹', '🔸'];

  let teks = `
╭━━━〔 *🤖 akame-AI* 〕━━━╮
┃📢 *Mensaje:* ${mensaje || ''}
┃👥 *Total de miembros:* ${total}
┃🔔 *Etiquetando a:*
`;

  participants.forEach((mem, i) => {
    const emoji = emojis[i % emojis.length];
    teks += `┃${emoji} @${mem.id.split('@')[0]}\n`;
  });

  teks += '╰━━━━━━━━━━━━━━━━━━━━━━━╯\n';
  teks += '🤖 *Bot: akame-AI*';

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
