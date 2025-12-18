import { FLAGS } from '../data/constants.js';

export default class DialogSystem {
  constructor(scene) {
    this.scene = scene;
    this.index = 0;
    this.lines = [];
    this.active = false;
    this.onComplete = null;
  }

  open(script, onComplete) {
    this.lines = script;
    this.index = 0;
    this.active = true;
    this.onComplete = onComplete || null;
    this.scene.events.emit('dialog-start', this.lines[this.index]);
  }

  advance() {
    if (!this.active) return;
    this.index += 1;
    if (this.index >= this.lines.length) {
      this.close();
    } else {
      this.scene.events.emit('dialog-update', this.lines[this.index]);
    }
  }

  close() {
    if (!this.active) return;
    this.active = false;
    this.scene.events.emit('dialog-end');
    if (this.onComplete) this.onComplete();
  }

  getNpcScript(id, save) {
    const scrollCount = save.getScrollCount();
    const phantomDefeated = save.getFlag(FLAGS.PHANTOM_DEFEATED);
    const challengeDone = save.getFlag(FLAGS.CHALLENGE_COMPLETED);

    const scripts = {
      sage: [
        'The island stirs when routine slips.',
        scrollCount < 1 ? 'Try the Focus Breath. Meet the rhythm.' : 'You found the rhythm. Your steps sound lighter.',
      ],
      archivist: [
        'Records flicker after dusk.',
        scrollCount >= 2 ? 'Bridge markers have shifted. A path awaits.' : 'Ink dries slow. Bring more balance scrolls.',
      ],
      groundskeeper: [
        scrollCount >= 3 ? 'The Deadline Phantom lingers. Face it with calm.' : 'Paths are swept, trials remain.',
        phantomDefeated ? 'Quiet returns. The gardens breathe again.' : 'Return when your pockets carry balance.',
      ],
    };

    if (id === 'sage' && !challengeDone) {
      scripts.sage.push('I can send you to the Focus Breath trial.');
    }
    if (id === 'groundskeeper' && scrollCount >= 3 && !phantomDefeated) {
      scripts.groundskeeper.push('Ready for the phantom?');
    }

    return scripts[id] || ['...'];
  }
}
