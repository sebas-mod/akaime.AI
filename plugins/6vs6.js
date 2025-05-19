// [ 🍧 6VS6 FREE FIRE ]
const partidas = {};

const handler = async (m, { conn, args, command }) => {

  const sendPartidaMessage = (chatId, partidaId, partida, quotedMsg) => {
    const mensaje = generarMensaje(partida);
    conn.sendMessage(
      chatId,
      {
        text: mensaje,
        footer: "¡Anótate para el 6vs6!",
        buttons: [
          {
            buttonId: `.anotar ${partidaId}`,
            buttonText: { displayText: "📌 Anotar" },
          },
          {
            buttonId: `.desanotar ${partidaId}`,
            buttonText: { displayText: "❌ Desanotar" },
          },
        ],
        viewOnce: true,
        headerType: 1,
      },
      { quoted: quotedMsg }
    );
  };

  if (command === "anotar") {
    const who = m.sender;
    const { name } = global.db.data.users[who];
    const partidaId = args[0];

    if (!partidas[partidaId]) {
      conn.reply(m.chat, "No hay una partida activa en este momento.", m);
      return;
    }

    if (
      partidas[partidaId].jugadores.includes(name) ||
      partidas[partidaId].suplentes.includes(name)
    ) {
      conn.reply(m.chat, "¡Ya estás anotado en esta partida!", m);
      sendPartidaMessage(m.chat, partidaId, partidas[partidaId], m);
      return;
    }

    if (partidas[partidaId].jugadores.length < 6) {
      partidas[partidaId].jugadores.push(name);
    } else if (partidas[partidaId].suplentes.length < 2) {
      partidas[partidaId].suplentes.push(name);
    } else {
      conn.reply(m.chat, "¡La escuadra y suplentes ya están llenos! Lista cerrada.", m);
      conn.sendMessage(m.chat, "Lista llena, suerte en el VS!", m);
      return;
    }

    if (partidas[partidaId].jugadores.length === 6 && partidas[partidaId].suplentes.length === 2) {
      conn.reply(m.chat, "¡Lista llena, suerte en el VS!", m);
    }

    sendPartidaMessage(m.chat, partidaId, partidas[partidaId], m);
    return;
  }

  if (command === "desanotar") {
    const who = m.sender;
    const { name } = global.db.data.users[who];
    const partidaId = args[0];

    if (!partidas[partidaId]) {
      conn.reply(m.chat, "No hay una partida activa en este momento.", m);
      return;
    }

    const idxJug = partidas[partidaId].jugadores.indexOf(name);
    const idxSup = partidas[partidaId].suplentes.indexOf(name);

    if (idxJug !== -1) {
      partidas[partidaId].jugadores.splice(idxJug, 1);
      conn.reply(m.chat, "Te has desanotado de los jugadores.", m);
      sendPartidaMessage(m.chat, partidaId, partidas[partidaId], m);
      return;
    }
    if (idxSup !== -1) {
      partidas[partidaId].suplentes.splice(idxSup, 1);
      conn.reply(m.chat, "Te has desanotado de los suplentes.", m);
      sendPartidaMessage(m.chat, partidaId, partidas[partidaId], m);
      return;
    }

    conn.reply(m.chat, "No estás anotado en esta partida.", m);
  }

  // Crear partida
  if (args.length < 4) {
    conn.reply(
      m.chat,
      `Debes proporcionar esto.
*.6vs6 <región> <hora> <Bandera> <modalidad>*

*Regiones*
SR (Sudamérica)
EU (Estados Unidos)

*Ejemplo:*
.6vs6 SR 22:00 🇦🇷 infinito
.6vs6 SR 22:00 🇦🇷 scrim
.6vs6 EU 20:00 🇲🇽 apos
.6vs6 EU 20:00 🇲🇽 infinito`,
      m
    );
    return;
  }

  const modalidad = args[3].toLowerCase();
  if (modalidad !== "infinito" && modalidad !== "scrim" && modalidad !== "apos") {
    conn.reply(m.chat, 'Modalidad no válida. Escribe "infinito", "scrim" o "apos".', m);
    return;
  }

  const region = args[0].toUpperCase();
  if (region !== "SR" && region !== "EU") {
    conn.reply(m.chat, 'La región no es válida. Usa SR o EU.', m);
    return;
  }

  const partidaId = `${m.chat}-${args[0]}-${args[1]}`;

  const horariosSR = { AR: "22:00", PE: "21:00", BO: "20:00" };
  const horariosEU = { MX: "20:00", CO: "21:00" };
  const horarios = region === "SR" ? horariosSR : horariosEU;

  if (!partidas[partidaId]) {
    partidas[partidaId] = {
      jugadores: [],
      suplentes: [],
      hora: args[1],
      modalidad: modalidad.toUpperCase(),
      reglas: modalidad === "infinito" ? ".reglasinfinito" : modalidad === "scrim" ? ".reglasscrim" : ".reglasapos",
      horarios: horarios,
    };
  } else {
    partidas[partidaId].modalidad = modalidad.toUpperCase();
    partidas[partidaId].reglas = modalidad === "infinito" ? ".reglasinfinito" : modalidad === "scrim" ? ".reglasscrim" : ".reglasapos";
  }

  sendPartidaMessage(m.chat, partidaId, partidas[partidaId], m);
};

// 🧠 Generador de mensaje de partida
function generarMensaje(partida) {
  const horarios = Object.entries(partida.horarios)
    .map(([pais, hora]) => {
      const bandera = { AR: "🇦🇷", PE: "🇵🇪", BO: "🇧🇴", MX: "🇲🇽", CO: "🇨🇴" }[pais];
      return `*${bandera} ${pais} :* ${hora}`;
    })
    .join("\n");

  const escuadra = [
    `🥷 ${partida.jugadores[0] || ""}`,
    `🥷 ${partida.jugadores[1] || ""}`,
    `🥷 ${partida.jugadores[2] || ""}`,
    `🥷 ${partida.jugadores[3] || ""}`,
    `🥷 ${partida.jugadores[4] || ""}`,
    `🥷 ${partida.jugadores[5] || ""}`,
  ].join("\n");

  const suplentes = [
    `🥷 ${partida.suplentes[0] || ""}`,
    `🥷 ${partida.suplentes[1] || ""}`,
  ].join("\n");

  return (
    `*6 VERSUS 6 ${partida.modalidad}*\n` +
    `${horarios}\n` +
    `*REGLAS:* ${partida.reglas}\n` +
    `𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\n${escuadra}\n𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦\n${suplentes}`.trim()
  );
}

handler.help = ["6vs6 <Reg|Hr|Bnd|Mod>"];
handler.tags = ["main"];
handler.command = /^(6vs6|anotar|desanotar)$/i;
handler.group = true;

export default handler;
