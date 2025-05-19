const partidas = {};

const handler = async (m, { conn, args, command }) => {

  const sendPartidaMessage = (chatId, partida, quotedMsg) => {
    const mensaje = generarMensaje(partida);
    conn.sendMessage(
      chatId,
      {
        text: mensaje,
        footer: "¡Anótate para el 4vs4!",
        buttons: [
          {
            buttonId: `.anotar`,
            buttonText: { displayText: "📌 Anotar" },
          },
          {
            buttonId: `.desanotar`,
            buttonText: { displayText: "❌ Desanotar" },
          },
        ],
        viewOnce: true,
        headerType: 1,
      },
      { quoted: quotedMsg }
    );
  };

  // Comando anotar
  if (command === "anotar") {
    const who = m.sender;
    const { name } = global.db.data.users[who];
    const partidaId = `${m.chat}-${name}`; // Generamos una ID única con el nombre y chat

    if (!partidas[partidaId]) {
      partidas[partidaId] = {
        jugadores: [],
        suplentes: [],
        hora: args[1],
        modalidad: args[3]?.toLowerCase() || "vivido", // Modalidad por defecto
      };
    }

    if (partidas[partidaId].jugadores.includes(name) || partidas[partidaId].suplentes.includes(name)) {
      conn.reply(m.chat, "¡Ya estás anotado en esta partida!", m);
      sendPartidaMessage(m.chat, partidas[partidaId], m);
      return;
    }

    if (partidas[partidaId].jugadores.length < 4) {
      partidas[partidaId].jugadores.push(name);
    } else if (partidas[partidaId].suplentes.length < 2) {
      partidas[partidaId].suplentes.push(name);
    } else {
      conn.reply(m.chat, "¡La escuadra y suplentes ya están llenos! Lista cerrada.", m);
      conn.sendMessage(m.chat, "Lista llena, suerte en el VS!", m);
      return;
    }

    sendPartidaMessage(m.chat, partidas[partidaId], m);
    return;
  }

  // Comando desanotar
  if (command === "desanotar") {
    const who = m.sender;
    const { name } = global.db.data.users[who];
    const partidaId = `${m.chat}-${name}`; // Generamos una ID única con el nombre y chat

    if (!partidas[partidaId]) {
      conn.reply(m.chat, "No hay una partida activa en este momento.", m);
      return;
    }

    const idxJug = partidas[partidaId].jugadores.indexOf(name);
    const idxSup = partidas[partidaId].suplentes.indexOf(name);

    if (idxJug === -1 && idxSup === -1) {
      conn.reply(m.chat, "¡No estás anotado en esta partida!", m);
      sendPartidaMessage(m.chat, partidas[partidaId], m);
      return;
    }

    if (idxJug !== -1) {
      partidas[partidaId].jugadores.splice(idxJug, 1);
    } else if (idxSup !== -1) {
      partidas[partidaId].suplentes.splice(idxSup, 1);
    }

    conn.reply(m.chat, "Te has desanotado de la partida.", m);
    sendPartidaMessage(m.chat, partidas[partidaId], m);
    return;
  }

  // Crear partida
  if (args.length < 4) {
    conn.reply(
      m.chat,
      `Debes proporcionar esto.
*.4vs4 <región> <hora> <Bandera> <modalidad>*

*Regiones*
SR (Sudamérica)
EU (Estados Unidos)

*Modalidades*
- vivido
- scrim
- apos

*Ejemplo:*
.4vs4 SR 22:00 🇦🇷 vivido
.4vs4 SR 22:00 🇦🇷 scrim
.4vs4 SR 22:00 🇦🇷 apos
.4vs4 EU 20:00 🇲🇽 vivido`,
      m
    );
    return;
  }

  const modalidad = args[3].toLowerCase();
  if (!["vivido", "scrim", "apos"].includes(modalidad)) {
    conn.reply(m.chat, 'Modalidad no válida. Escribe "vivido", "scrim" o "apos".', m);
    return;
  }

  const region = args[0].toUpperCase();
  if (region !== "SR" && region !== "EU") {
    conn.reply(m.chat, 'La región no es válida. Usa SR o EU.', m);
    return;
  }

  const partidaId = `${m.chat}-${region}-${args[1]}`; // Se crea una ID única con chat, región y hora

  const horariosSR = { BO: "21:00", PE: "20:00", AR: "22:00" };
  let horariosEU = { CO: "21:00", MX: args[1] };
  const horarios = region === "SR" ? horariosSR : horariosEU;

  if (!partidas[partidaId]) {
    partidas[partidaId] = {
      jugadores: [],
      suplentes: [],
      hora: args[1],
      modalidad: modalidad.toUpperCase(),
      reglas: obtenerReglas(modalidad),
      horarios: horarios,
    };
  } else {
    partidas[partidaId].modalidad = modalidad.toUpperCase();
    partidas[partidaId].reglas = obtenerReglas(modalidad);
  }

  sendPartidaMessage(m.chat, partidas[partidaId], m);
};

// Función para obtener las reglas según la modalidad
function obtenerReglas(modalidad) {
  switch (modalidad) {
    case "vivido":
      return ".reglasvivido"; // Aquí pondrías las reglas específicas para "vivido"
    case "scrim":
      return ".reglasscrim";  // Aquí pondrías las reglas específicas para "scrim"
    case "apos":
      return ".reglasapos";   // Aquí pondrías las reglas específicas para "apos"
    default:
      return ".reglasgenerales"; // Reglas por defecto
  }
}

// 🧠 Generador de mensaje de partida
function generarMensaje(partida) {
  const horarios = Object.entries(partida.horarios)
    .map(([pais, hora]) => {
      const bandera = { BO: "🇧🇴", PE: "🇵🇪", AR: "🇦🇷", CO: "🇨🇴", MX: "🇲🇽" }[pais];
      return `*${bandera} ${pais} :* ${hora}`;
    })
    .join("\n");

  const escuadra = [
    `🥷 ${partida.jugadores[0] || ""}`,
    `🥷 ${partida.jugadores[1] || ""}`,
    `🥷 ${partida.jugadores[2] || ""}`,
    `🥷 ${partida.jugadores[3] || ""}`,
  ].join("\n");

  const suplentes = [
    `🥷 ${partida.suplentes[0] || ""}`,
    `🥷 ${partida.suplentes[1] || ""}`,
  ].join("\n");

  return (
    `*4 VERSUS 4 ${partida.modalidad}*\n` +
    `${horarios}\n` +
    `*REGLAS:* ${partida.reglas}\n` +
    `𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\n${escuadra}\n𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦\n${suplentes}`.trim()
  );
}

handler.help = ["4vs4 <Reg|Hr|Bnd|Mod>"];
handler.tags = ["main"];
handler.command = /^(4vs4|anotar|desanotar)$/i;
handler.group = true;

export default handler;
