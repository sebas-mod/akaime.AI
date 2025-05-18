// [ 🍧 4VS4 FREE FIRE ]
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
            buttonId: `.anotar ${partidaId}`,
            buttonText: { displayText: "📌 Anotar" },
          },
        ],
        viewOnce: true,
        headerType: 1,
      },
      { quoted: quotedMsg }
    );
  };

  // COMANDO: .anotar <id>
  if (command === "anotar") {
    const partidaId = args[0];
    if (!partidas[partidaId]) {
      conn.reply(m.chat, "No hay una partida activa con ese ID.", m);
      return;
    }

    const partida = partidas[partidaId];
    if (partida.jugadores.includes(name) || partida.suplentes.includes(name)) {
      conn.reply(m.chat, "¡Ya estás anotado en esta partida!", m);
      sendPartidaMessage(m.chat, partidaId, partida, m);
      return;
    }

    if (partida.jugadores.length < 4) {
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

  // COMANDO: .eliminarpartida <id>
  if (command === "eliminarpartida") {
    const partidaId = args[0];
    if (!partidas[partidaId]) {
      conn.reply(m.chat, "Esa partida no existe.", m);
      return;
    }
    delete partidas[partidaId];
    conn.reply(m.chat, `Partida ${partidaId} eliminada correctamente.`, m);
    return;
  }

  // COMANDO: .listapartidas
  if (command === "listapartidas") {
    const lista = Object.keys(partidas);
    if (lista.length === 0) {
      conn.reply(m.chat, "No hay partidas activas.", m);
    } else {
      const texto = lista.map((id, i) => `${i + 1}. ${id}`).join("\n");
      conn.reply(m.chat, `📋 Partidas activas:\n${texto}`, m);
    }
    return;
  }

  // CREAR PARTIDA: .4vs4 <región> <hora> <bandera> <modalidad>
  if (args.length < 4) {
    conn.reply(
      m.chat,
      `Debes proporcionar los siguientes datos:\n\n*.4vs4 <región> <hora> <bandera> <modalidad>*\n\n*Regiones:* SR, EU\n*Modalidades:* scrim, apostado, vivid2\n\n*Ejemplos:*\n.4vs4 SR 22:00 🇦🇷 scrim\n.4vs4 SR 21:30 🇵🇪 apostado\n.4vs4 EU 20:00 🇲🇽 vivid2`,
      m
    );
    return;
  }

  const region = args[0].toUpperCase();
  const hora = args[1];
  const bandera = args[2];
  const modalidad = args[3].toLowerCase();

  if (!["SR", "EU"].includes(region)) {
    conn.reply(m.chat, "Región no válida. Usa SR o EU.", m);
    return;
  }

  if (!["scrim", "apostado", "vivid2"].includes(modalidad)) {
    conn.reply(m.chat, 'Modalidad no válida. Usa "scrim", "apostado" o "vivid2".', m);
    return;
  }

  // Reglas según modalidad
  let reglasCmd = ".reglasscrim";
  if (modalidad === "apostado") reglasCmd = ".reglasapost";
  else if (modalidad === "vivid2") reglasCmd = ".reglasvv2";

  const partidaId = `${m.chat}-${region}-${hora}`;
  const horariosSR = { BO: "21:00", PE: "20:00", AR: "22:00" };
  const horariosEU = { CO: "21:00", MX: hora };
  const horarios = region === "SR" ? horariosSR : horariosEU;

  partidas[partidaId] = {
    jugadores: [],
    suplentes: [],
    hora,
    modalidad: modalidad.toUpperCase(),
    reglas: reglasCmd,
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
    `${horarios}\n` +
    `*REGLAS:* ${partida.reglas}\n` +
    `𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\n${escuadra}\n𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦\n${suplentes}`
  );
}

handler.help = ["4vs4", "anotar", "eliminarpartida", "listapartidas"];
handler.tags = ["main"];
handler.command = /^(4vs4|anotar|eliminarpartida|listapartidas)$/i;
handler.group = true;

export default handler;
