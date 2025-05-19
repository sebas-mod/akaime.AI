const partidas = {};

const handler = async (m, { conn, args, command }) => {
  const who = m.sender;
  const name = global.db.data.users[who]?.name || "Jugador";

  const sendPartidaMessage = (chatId, partidaId, partida, quotedMsg) => {
    const mensaje = generarMensaje(partida);
    conn.sendMessage(
      chatId,
      {
        text: mensaje,
        footer: "¡Anótate para el 4vs4!",
        buttons: [
          {
            buttonId: `.4vs4 ${partidaId}`,
            buttonText: { displayText: "📌 Anotar/Desanotar" },
          },
        ],
        viewOnce: true,
        headerType: 1,
      },
      { quoted: quotedMsg }
    );
  };

  // Si el comando tiene solo 1 argumento, asumimos que es para anotar/desanotar
  if (args.length === 1 && partidas[args[0]]) {
    const partidaId = args[0];
    const partida = partidas[partidaId];

    const idxJug = partida.jugadores.indexOf(name);
    const idxSup = partida.suplentes.indexOf(name);

    if (idxJug !== -1) {
      partida.jugadores.splice(idxJug, 1);
      conn.reply(m.chat, "Te has desanotado de la escuadra.", m);
    } else if (idxSup !== -1) {
      partida.suplentes.splice(idxSup, 1);
      conn.reply(m.chat, "Te has desanotado de los suplentes.", m);
    } else if (partida.jugadores.length < 4) {
      partida.jugadores.push(name);
    } else if (partida.suplentes.length < 2) {
      partida.suplentes.push(name);
    } else {
      conn.reply(m.chat, "¡La escuadra y suplentes ya están llenos!", m);
      return;
    }

    if (partida.jugadores.length === 4 && partida.suplentes.length === 2) {
      conn.reply(m.chat, "¡Lista completa, suerte!", m);
    }

    sendPartidaMessage(m.chat, partidaId, partida, m);
    return;
  }

  // CREAR PARTIDA: .4vs4 <región> <hora> <bandera> <modalidad>
  if (args.length < 4) {
    conn.reply(
      m.chat,
      `Debes proporcionar los siguientes datos:\n\n*.4vs4 <región> <hora> <bandera> <modalidad>*\n\n*Regiones:* SR, EU\n*Modalidades:* scrim, apos, vv2\n\n*Ejemplos:*\n.4vs4 SR 22:00 🇦🇷 scrim\n.4vs4 SR 21:30 🇵🇪 apos\n.4vs4 EU 20:00 🇲🇽 vv2`,
      m
    );
    return;
  }

  const regionInput = args[0].toUpperCase();
  const hora = args[1];
  const bandera = args[2];
  const modalidadInput = args[3].toLowerCase();

  if (!["SR", "EU"].includes(regionInput)) {
    conn.reply(m.chat, "Región no válida. Usa SR o EU.", m);
    return;
  }

  if (!["scrim", "apos", "vv2"].includes(modalidadInput)) {
    conn.reply(m.chat, 'Modalidad no válida. Usa "scrim", "apos" o "vv2".', m);
    return;
  }

  const reglasTexto = `reglas - ${modalidadInput}`;
  const partidaId = `${m.chat}-${regionInput}-${hora}`;

  if (partidas[partidaId]) {
    conn.reply(m.chat, `Ya existe una partida con ese horario y región. Usa otro horario.`, m);
    return;
  }

  const horariosSR = { BO: "21:00", PE: "20:00", AR: "22:00" };
  const horariosEU = { CO: "21:00", MX: hora };
  const horarios = regionInput === "SR" ? horariosSR : horariosEU;

  partidas[partidaId] = {
    jugadores: [],
    suplentes: [],
    hora,
    modalidad: modalidadInput,
    reglas: reglasTexto,
    horarios,
    bandera,
    creador: name,
    creado: Date.now(),
  };

  sendPartidaMessage(m.chat, partidaId, partidas[partidaId], m);
};

function generarMensaje(partida) {
  const horarios = Object.entries(partida.horarios)
    .map(([pais, hora]) => {
      const banderas = { BO: "🇧🇴", PE: "🇵🇪", AR: "🇦🇷", CO: "🇨🇴", MX: "🇲🇽" };
      return `*${banderas[pais] || ""} ${pais} :* ${hora}`;
    })
    .join("\n");

  const escuadra = Array(4)
    .fill(null)
    .map((_, i) => `🥷 ${partida.jugadores[i] || "—"}`)
    .join("\n");

  const suplentes = Array(2)
    .fill(null)
    .map((_, i) => `🥷 ${partida.suplentes[i] || "—"}`)
    .join("\n");

  return (
    `*4 VS 4 ${partida.modalidad}*\n` +
    `📌 *Toca el botón para anotarte o desanotarte si ya estás inscrito.*\n\n` +
    `${horarios}\n` +
    `*REGLAS:* ${partida.reglas}\n` +
    `𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\n${escuadra}\n𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦\n${suplentes}`
  );
}

handler.help = ["4vs4"];
handler.tags = ["main"];
handler.command = /^4vs4$/i;
handler.group = true;

export default handler;
