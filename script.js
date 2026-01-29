document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('text-input');
  const voiceSelect = document.getElementById('voice-select');
  const emotionSelect = document.getElementById('emotion-select');
  const typeSelect = document.getElementById('type-select');
  const speakBtn = document.getElementById('speak-btn');
  const stopBtn = document.getElementById('stop-btn');
  const skinSelect = document.getElementById('skin');

  let synth = window.speechSynthesis;
  let allVoices = [];
  let enhancedVoices = [];

  // Cargar voces
  function loadVoices() {
    allVoices = synth.getVoices().filter(v => v.lang.includes('es'));

    // Creamos 10 perfiles de voz con diferentes combinaciones de pitch/rate
    enhancedVoices = [
      { name: 'Carlos (Profundo)', pitch: 0.8, rate: 0.85 },
      { name: 'Roberto (Claro)', pitch: 1.1, rate: 1.0 },
      { name: 'Andrés (Rápido)', pitch: 1.0, rate: 1.2 },
      { name: 'Miguel (Lento)', pitch: 0.9, rate: 0.75 },
      { name: 'David (Suave)', pitch: 1.05, rate: 0.95 },
      { name: 'María (Clara)', pitch: 1.25, rate: 1.0 },
      { name: 'Laura (Alta)', pitch: 1.35, rate: 1.05 },
      { name: 'Ana (Rápida)', pitch: 1.3, rate: 1.2 },
      { name: 'Carmen (Baja)', pitch: 1.15, rate: 0.9 },
      { name: 'Lucía (Dulce)', pitch: 1.3, rate: 0.95 },
    ];

    voiceSelect.innerHTML = '';
    enhancedVoices.forEach((ev, i) => {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = ev.name;
      voiceSelect.appendChild(option);
    });
  }

  loadVoices();
  if (allVoices.length === 0) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Cambiar skin
  skinSelect.addEventListener('change', () => {
    document.body.className = `skin-${skinSelect.value}`;
  });

  // Nombres comunes para detectar género
  const maleNames = ['carlos', 'juan', 'pedro', 'luis', 'pablo', 'miguel', 'diego', 'andres', 'felipe', 'raul'];
  const femaleNames = ['maria', 'ana', 'laura', 'lucia', 'carmen', 'sofia', 'valentina', 'isabella', 'clara', 'elena'];

  function getVoiceByGender(gender) {
    if (gender === 'male') {
      return enhancedVoices.slice(0, 5)[Math.floor(Math.random() * 5)];
    } else if (gender === 'female') {
      return enhancedVoices.slice(5, 10)[Math.floor(Math.random() * 5)];
    } else {
      return enhancedVoices[Math.floor(Math.random() * 10)];
    }
  }

  function applyEmotionToUtterance(utterance, emotion) {
    switch(emotion) {
      case 'happy':
        utterance.rate = utterance.rate * 1.25;
        utterance.pitch = utterance.pitch * 1.2;
        break;
      case 'sad':
        utterance.rate = utterance.rate * 0.7;
        utterance.pitch = utterance.pitch * 0.8;
        break;
      case 'angry':
        utterance.rate = utterance.rate * 1.3;
        utterance.pitch = utterance.pitch * 1.15;
        break;
      case 'excited':
        utterance.rate = utterance.rate * 1.35;
        utterance.pitch = utterance.pitch * 1.3;
        break;
      case 'fearful':
        utterance.rate = utterance.rate * 0.8;
        utterance.pitch = utterance.pitch * 1.1;
        break;
      default:
        break;
    }
  }

  function speakPhrases(phrases, voiceProfile, emotion) {
    let index = 0;

    function nextPhrase() {
      if (index < phrases.length) {
        const phrase = phrases[index].trim();
        if (phrase) {
          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.pitch = voiceProfile.pitch;
          utterance.rate = voiceProfile.rate;
          applyEmotionToUtterance(utterance, emotion);

          if (allVoices.length > 0) {
            utterance.voice = allVoices[0];
          }

          utterance.onend = () => {
            setTimeout(() => {
              index++;
              nextPhrase();
            }, 200); // Pausa ligera entre frases
          };

          synth.speak(utterance);
        } else {
          index++;
          nextPhrase();
        }
      }
    }

    nextPhrase();
  }

  function speakDialog(dialogText) {
    const regex = /([A-Za-z]+(?:\s[A-Za-z]+)*)\s+dijo(?:\:|\:)\s+(.*)/g;
    const matches = [...dialogText.matchAll(regex)];

    if (matches.length > 0) {
      matches.forEach(match => {
        const character = match[1].trim();
        const sentence = match[2].trim();
        const nameLower = character.toLowerCase();

        let gender = 'neutral';
        if (maleNames.includes(nameLower)) gender = 'male';
        else if (femaleNames.includes(nameLower)) gender = 'female';

        const voiceProfile = getVoiceByGender(gender);
        const selectedEmotion = emotionSelect.value;

        // Dividir la oración en frases
        const phrases = sentence.split(/(?<=[.!?;])\s+/);
        speakPhrases(phrases, voiceProfile, selectedEmotion);
      });
    } else {
      const selectedVoiceIndex = voiceSelect.value;
      const selectedEmotion = emotionSelect.value;
      const voiceProfile = enhancedVoices[selectedVoiceIndex];

      const phrases = dialogText.split(/(?<=[.!?;])\s+/);
      speakPhrases(phrases, voiceProfile, selectedEmotion);
    }
  }

  // Leer texto
  speakBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) return;

    const selectedType = typeSelect.value;

    if (selectedType === 'dialogue') {
      speakDialog(text);
    } else {
      const selectedVoiceIndex = voiceSelect.value;
      const selectedEmotion = emotionSelect.value;
      const voiceProfile = enhancedVoices[selectedVoiceIndex];

      const phrases = text.split(/(?<=[.!?;])\s+/);
      speakPhrases(phrases, voiceProfile, selectedEmotion);
    }
  });

  // Detener lectura
  stopBtn.addEventListener('click', () => {
    synth.cancel();
  });
});