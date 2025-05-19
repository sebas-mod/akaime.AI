const partidas6vs6 = {};

const handler = async (m, { conn, args, command }) => {
  const who = m.sender;
  const name = global.db.data.users[who]?.name || "Jugador";

  const sendPartidaMessage = (chatId, partidaId, partida, quotedMsg) => {
    const mensaje = generarMensaje6(partidaId, partida);
    conn.sendMessage(
      chatId,
      {
        text: mensaje,
        footer: "¡Anótate para el 6vs6!",
        buttons: [
          {
            buttonId: `.anotar6 ${partidaId}`,
            buttonText: { displayText: "📌 Anotar/Desanotar" },
          },
        ],
        viewOnce: true,
        headerType: 1,
      },
      { quoted: quotedMsg }
    );
  };

  // Comando: .anotar6 <id>
  if (command === "anotar6") {
    const partidaId = args[0];
    const partida = partidas6vs6[partidaId];

    if (!partida) {
      conn.reply(m.chat, "No hay una partida activa con ese ID.", m);
      return;
    }

    const idx = partida.jugadores.indexOf(name);
    if (idx !== -1) {
      partida.jugadores.splice(idx, 1);
      conn.reply(m.chat, "Te has desanotado de la partida.", m);
    } else {
      if (partida.jugadores.length >= 6) {
        conn.reply(m.chat, "¡La partida ya tiene 6 jugadores!", m);
        return;
      }
      partida.jugadores.push(name);
    }

    sendPartidaMessage(m.chat, partidaId, partida, m);
    return;
  }

  // Comando: .eliminar6 <id>
  if (command === "eliminar6") {
    const partidaId = args[0];
    if (!partidas6vs6[partidaId]) {
      conn.reply(m.chat, "Esa partida no existe.", m);
      return;
    }
    delete partidas6vs6[partidaId];
    conn.reply(m.chat, `Partida ${partidaId} eliminada correctamente.`, m);
    return;
  }

  // Comando: .lista6
  if (command === "lista6") {
    const lista = Object.keys(partidas6vs6);
    if (lista.length === 0) {
      conn.reply(m.chat, "No hay partidas activas.", m);
    } else {
      const texto = lista.map((id, i) => `${i + 1}. ${id}`).join("\n");
      conn.reply(m.chat, `📋 Partidas 6vs6 activas:\n${texto}`, m);
    }
    return;
  }

  // Comando: .6vs6 <hora> <región> <bandera>
  if (command === "6vs6") {
    if (args.length < 3) {
      conn.reply(
        m.chat,
        `Usa el comando así:\n\n*.6vs6 <hora> <región> <bandera>*\n\n*Ejemplo:* .6vs6 20:00 SR 🇦🇷`,
        m
      );
      return;
    }

    const [hora, region, bandera] = args;
    const partidaId = Math.random().toString(36).slice(2, 6).toUpperCase();
    partidas6vs6[partidaId] = {
      creador: name,
      hora,
      region,
      bandera,
      jugadores: [],
    };

    conn.reply(m.chat, `✅ Partida 6vs6 creada con ID: *${partidaId}*`, m);
    sendPartidaMessage(m.chat, partidaId, partidas6vs6[partidaId], m);
    return;
  }
};

// Función para generar el mensaje de la partida
const generarMensaje6 = (id, partida) => {
  return `⚔️ *Partida 6vs6* [ID: ${id}]
🕒 Hora: ${partida.hora}
📍 Región: ${partida.region}
${partida.bandera}
👑 Creador: ${partida.creador}

✅ Jugadores (${partida.jugadores.length}/6):
${partida.jugadores.map((j, i) => `${i + 1}. ${j}`).join("\n") || "Ninguno aún"}
`;
};

handler.help = ['6vs6', 'anotar6', 'eliminar6', 'lista6'];
handler.tags = ['main']; // Categoría 'main'
handler.command = /^(6vs6|anotar6|eliminar6|lista6)$/i;

export default handler;
