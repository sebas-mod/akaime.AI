const partidas6vs6 = {};

const handler = async (m, { conn, args, command }) => {
  const who = m.sender;
  const name = global.db.data.users[who]?.name || "Jugador";

  const sendPartidaMessage = (chatId, partidaId, partida, quotedMsg) => {
    const mensaje = generarMensaje6vs6(partida);
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

  // COMANDO: .anotar6 <id>
  if (command === "anotar6") {
    const partidaId = args[0];
    const partida = partidas6vs6[partidaId];

    if (!partida) {
      conn.reply(m.chat, "No hay una partida activa con ese ID.", m);
      return;
    }

    if (partida.jugadores.includes(name)) {
      partida.jugadores = partida.jugadores.filter(j => j !== name);
      conn.reply(m.chat, "Te has desanotado de la partida.", m);
      sendPartidaMessage(m.chat, partidaId, partida, m);
      return;
    }

    if (partida.suplentes.includes(name)) {
      partida.suplentes = partida.suplentes.filter(j => j !== name);
      conn.reply(m.chat, "Te has desanotado de la partida.", m);
      sendPartidaMessage(m.chat, partidaId, partida, m);
      return;
    }

    if (partida.jugadores.length < 6) {
      partida.jugadores.push(name);
    } else if (partida.suplentes.length < 2) {
      partida.suplentes.push(name);
    } else {
      conn.reply(m.chat, "¡La partida ya está llena (incluyendo suplentes)!", m);
      return;
    }

    if (partida.jugadores.length === 6 && partida.suplentes.length === 2) {
      conn.reply(m.chat, "¡Lista completa, suerte!", m);
    }

    sendPartidaMessage(m.chat, partidaId, partida, m);
    return;
  }

  // COMANDO: .eliminar6vs6 <id>
  if (command === "eliminar6vs6") {
    const partidaId = args[0];
    if (!partidas6vs6[partidaId]) {
      conn.reply(m.chat, "Esa partida no existe.", m);
      return;
    }
    delete partidas6vs6[partidaId];
    conn.reply(m.chat, `Partida ${partidaId} eliminada correctamente.`, m);
    return;
  }

  // COMANDO: .lista6vs6
  if (command === "lista6vs6") {
    const lista = Object.keys(partidas6vs6);
    if (lista.length === 0) {
      conn.reply(m.chat, "No hay partidas activas.", m);
    } else {
      const texto = lista.map((id, i) => `${i + 1}. ${id}`).join("\n");
      conn.reply(m.chat, `📋 Partidas activas 6vs6:\n${texto}`, m);
    }
    return;
  }

  // COMANDO: .6vs6 <región> <hora> <bandera>
  if (args.length < 3) {
    conn.reply(
      m.chat,
      `Debes proporcionar los siguientes datos:\n\n*.6vs6 <región> <hora> <bandera>*\n\n*Regiones:* SR, EU\n\n*Ejemplos:*\n.6vs6 SR 22:00 🇦🇷\n.6vs6 EU 20:00 🇲🇽`,
      m
    );
    return;
  }

  const region = args[0].toUpperCase();
  const hora = args[1];
  const bandera = args[2];

  if (!["SR", "EU"].includes(region)) {
    conn.reply(m.chat, "Región no válida. Usa SR o EU.", m);
    return;
  }

  const partidaId = `${m.chat}-${region}-${hora}`;

  const horariosSR = { BO: "21:00", PE: "20:00", AR: "22:00" };
  const horariosEU = { CO: "21:00", MX: hora };
  const horarios = region === "SR" ? horariosSR : horariosEU;

  partidas6vs6[partidaId] = {
    jugadores: [],
    suplentes: [],
    hora,
    horarios,
    bandera,
    creador: name,
    creado: Date.now(),
  };

  sendPartidaMessage(m.chat, partidaId, partidas6vs6[partidaId], m);
};

function generarMensaje6vs6(partida) {
  const horarios = Object.entries(partida.horarios)
    .map(([pais, hora]) => {
      const banderas = { BO: "🇧🇴", PE: "🇵🇪", AR: "🇦🇷", CO: "🇨🇴", MX: "🇲🇽" };
      return `*${banderas[pais] || ""} ${pais} :* ${hora}`;
    })
    .join("\n");

  const jugadores = Array(6)
    .fill(null)
    .map((_, i) => `🥷 ${partida.jugadores[i] || "—"}`)
    .join("\n");

  const suplentes = Array(2)
    .fill(null)
    .map((_, i) => `🥷 ${partida.suplentes[i] || "—"}`)
    .join("\n");

  return (
    `*6 VS 6*\n` +
    `📌 *Toca el botón para anotarte o desanotarte si ya estás inscrito.*\n\n` +
    `${horarios}\n` +
    `𝗝𝗨𝗚𝗔𝗗𝗢𝗥𝗘𝗦\n${jugadores}\n𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦\n${suplentes}`
  );
}

handler.help = ["6vs6", "anotar6", "eliminar6vs6", "lista6vs6"];
handler.tags = ["main"];
handler.command = /^(6vs6|anotar6|eliminar6vs6|lista6vs6)$/i;
handler.group = true;

export default handler;
