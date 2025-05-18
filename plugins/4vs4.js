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
            buttonText: { displayText: "📌 Anotar/Desanotar" },
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
    const partida = partidas[partidaId];

    if (!partida) {
      conn.reply(m.chat, "No hay una partida activa con ese ID.", m);
      return;
    }

    const idxJug = partida.jugadores.indexOf(name);
    const idxSup = partida.suplentes.indexOf(name);
    if (idxJug !== -1) {
      partida.jugadores.splice(idxJug, 1);
      conn.reply(m.chat, "Te has desanotado de la escuadra.", m);
      sendPartidaMessage(m.chat, partidaId, partida, m);
      return;
    }
    if (idxSup !== -1) {
      partida.suplentes.splice(idxSup, 1);
      conn.reply(m.chat, "Te has desanotado de los suplentes.", m);
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
      `Debes proporcionar los siguientes datos:\n\n*.4vs4 <región> <hora> <bandera> <modalidad>*\n\n*Regiones:* SR, EU\n*Modalidades:* scrim, apos, vv2\n\n*Ej*
