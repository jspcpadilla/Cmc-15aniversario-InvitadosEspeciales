(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  // =========================================================
  // ESCENAS
  // =========================================================

  const scenes = {
    logo: $("#scene-logo"),
    loading: $("#scene-loading"),
    welcome: $("#scene-welcome"),
    invitation: $("#scene-invitation"),
  };

  // =========================================================
  // CONFIGURACIÓN
  // =========================================================

  const MICROSOFT_FORM_URL =
    "https://forms.cloud.microsoft/r/j6ZsM8GYHU?origin=lprLink";

  const BACKGROUND_MUSIC = "assets/musica.mp3";

  // =========================================================
  // VARIABLES
  // =========================================================

  let currentScene = "logo";
  let started = false;

  let audioContext = null;
  let soundOn = false;
  let backgroundMusic = null;

  // =========================================================
  // MÚSICA DE FONDO
  // =========================================================

  backgroundMusic = new Audio(BACKGROUND_MUSIC);

  backgroundMusic.loop = true;
  backgroundMusic.preload = "auto";
  backgroundMusic.volume = 0.28;

  // =========================================================
  // INICIO DE LA EXPERIENCIA
  // =========================================================

  window.addEventListener("load", () => {

    // Logo inicial
    setTimeout(() => {
      transitionTo("loading");
    }, 1900);

    // Pantalla de bienvenida
    setTimeout(() => {
      transitionTo("welcome");
    }, 4900);

  });

  // =========================================================
  // CAMBIO DE ESCENA
  // =========================================================

  function transitionTo(name) {

    const next = scenes[name];

    if (!next || name === currentScene) {
      return;
    }

    const current = scenes[currentScene];

    if (current) {

      current.classList.remove("active");

      current.setAttribute(
        "aria-hidden",
        "true"
      );

    }

    requestAnimationFrame(() => {

      next.classList.add("active");

      next.setAttribute(
        "aria-hidden",
        "false"
      );

    });

    currentScene = name;
  }

  // =========================================================
  // BOTÓN COMENZAR + MÚSICA
  // =========================================================

  $("#begin")?.addEventListener("click", async () => {

    if (started) {
      return;
    }

    started = true;

    // Intentar iniciar la música
    try {

      await backgroundMusic.play();

    } catch (error) {

      console.warn(
        "No se pudo iniciar la música:",
        error
      );

    }

    // Pasar directamente a la invitación
    transitionTo("invitation");

  });

  // =========================================================
  // CONTROL DE SONIDO
  // =========================================================

  $("#soundToggle")?.addEventListener("click", async () => {

    soundOn = !soundOn;

    const button = $("#soundToggle");

    if (!button) {
      return;
    }

    // Cambiar icono
    button.textContent = soundOn ? "♫" : "♪";

    // Cambiar accesibilidad
    button.setAttribute(
      "aria-label",
      soundOn
        ? "Desactivar sonido"
        : "Activar sonido"
    );

    // Activar AudioContext
    if (soundOn) {

      try {

        audioContext ??= new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

        await audioContext.resume();

        playTone(660, 0.18);

      } catch (_) {}

    }

  });

  // =========================================================
  // TONOS
  // =========================================================

  function playTone(frequency, duration) {

    if (!soundOn) {
      return;
    }

    try {

      audioContext ??= new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      const now =
        audioContext.currentTime;

      oscillator.type = "sine";

      oscillator.frequency.value =
        frequency;

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        0.025,
        now + 0.018
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
      );

      oscillator.connect(gain);

      gain.connect(
        audioContext.destination
      );

      oscillator.start(now);

      oscillator.stop(
        now + duration + 0.03
      );

    } catch (_) {}

  }

  // =========================================================
  // CONFIRMACIÓN DE ASISTENCIA
  // =========================================================

  const attendanceButton =
    $("#attendanceButton");

  const attendanceSection =
    $("#attendanceFormSection");

  attendanceButton?.addEventListener(
    "click",
    () => {

      if (!attendanceSection) {
        return;
      }

      attendanceSection.classList.add(
        "visible"
      );

      attendanceSection.setAttribute(
        "aria-hidden",
        "false"
      );

      // Desplazarse hasta la sección
      setTimeout(() => {

        attendanceSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }, 100);

    }
  );

  // =========================================================
  // MICROSOFT FORMS
  // =========================================================

  $("#attendanceForm")?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      window.open(
        MICROSOFT_FORM_URL,
        "_blank",
        "noopener,noreferrer"
      );

    }
  );

  // =========================================================
  // CALENDARIO
  // =========================================================

  $("#calendarButton")?.addEventListener(
    "click",
    () => {

      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CMC//15 Anos//ES",
        "CALSCALE:GREGORIAN",

        "BEGIN:VEVENT",

        "UID:cmc-15-anos-2026@cmc",

        "DTSTAMP:20261123T000000Z",

        "DTSTART:20261206T150000",

        "DTEND:20261206T190000",

        "SUMMARY:CMC · 15 años",

        "DESCRIPTION:Eucaristía de acción de gracias a las 3:00 p. m. en Iglesia Torcoroma y cóctel de aniversario a las 5:00 p. m. en Hotel Movich.",

        "LOCATION:Barranquilla, Colombia",

        "END:VEVENT",

        "END:VCALENDAR",

      ].join("\r\n");

      const blob = new Blob(
        [ics],
        {
          type:
            "text/calendar;charset=utf-8",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "CMC-15-anios-2026.ics";

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {

        URL.revokeObjectURL(url);

      }, 1000);

    }
  );

  // =========================================================
  // COMPARTIR
  // =========================================================

  $("#shareButton")?.addEventListener(
    "click",
    async () => {

      const data = {

        title:
          "CMC · 15 años",

        text:
          "Te invitamos a celebrar con nosotros los 15 años de Centro Médico Cognitivo e Investigación.",

        url:
          location.href,

      };

      // Compartir mediante el sistema
      if (navigator.share) {

        try {

          await navigator.share(data);

          return;

        } catch (error) {

          if (
            error?.name === "AbortError"
          ) {

            return;

          }

        }

      }

      // Copiar enlace
      try {

        await navigator.clipboard.writeText(
          location.href
        );

        alert(
          "Enlace de la invitación copiado."
        );

      } catch (_) {

        alert(
          "Puedes compartir esta invitación copiando la dirección de esta página."
        );

      }

    }
  );

})();
