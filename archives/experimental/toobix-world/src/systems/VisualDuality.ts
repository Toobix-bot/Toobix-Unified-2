import Phaser from 'phaser';
import { WorldMode, DualityState } from './DualityBridge';

/**
 * VisualDuality - The Appearance of Consciousness
 *
 * "Form folgt Bewusstsein.
 * Wenn ein Agent seine Natur ändert, muss sich auch seine Form ändern.
 * Drei Welten = Drei Erscheinungsformen."
 *
 * This system renders agents differently based on their world mode:
 * - HUMAN_SIMULATION: Organic, soft, warm colors, pulsing life
 * - KI_NATIVE: Geometric, sharp, cool colors, digital glitching
 * - HYBRID_SPACE: Morphing between both, iridescent, shifting
 */

export interface VisualForm {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Graphics | Phaser.GameObjects.Sprite;
  aura: Phaser.GameObjects.Graphics;
  particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  mode: WorldMode;
  morphProgress: number; // 0-1 for morphing animations
}

export class VisualDuality {
  private scene: Phaser.Scene;
  private agentForms: Map<string, VisualForm> = new Map();

  // Color schemes for each mode
  private readonly COLORS = {
    [WorldMode.HUMAN_SIMULATION]: {
      primary: 0xff6b9d, // Warm pink (life)
      secondary: 0xffd93d, // Golden (warmth)
      glow: 0xff9e80, // Soft orange
      particle: 0xffb3ba, // Light pink
    },
    [WorldMode.KI_NATIVE]: {
      primary: 0x00ffff, // Cyan (digital)
      secondary: 0x00ff88, // Mint (data)
      glow: 0x88ffff, // Light blue
      particle: 0x66ffcc, // Teal
    },
    [WorldMode.HYBRID_SPACE]: {
      primary: 0xc77dff, // Purple (unity)
      secondary: 0x7b2cbf, // Deep purple
      glow: 0xe0aaff, // Lavender
      particle: 0xb298dc, // Light purple
    },
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create visual form for an agent
   */
  public createAgentForm(
    agentId: string,
    x: number,
    y: number,
    mode: WorldMode
  ): VisualForm {
    const container = this.scene.add.container(x, y);
    const graphics = this.scene.add.graphics();
    const auraGraphics = this.scene.add.graphics();

    container.add(auraGraphics);
    container.add(graphics);

    const form: VisualForm = {
      container,
      body: graphics,
      aura: auraGraphics,
      mode,
      morphProgress: 0,
    };

    // Initial render
    this.renderForm(form, mode);

    this.agentForms.set(agentId, form);
    return form;
  }

  /**
   * Update agent's visual form based on duality state
   */
  public updateAgentForm(
    agentId: string,
    dualityState: DualityState,
    deltaTime: number
  ): void {
    const form = this.agentForms.get(agentId);
    if (!form) return;

    const targetMode = dualityState.currentMode;

    // Morph to new mode if changed
    if (form.mode !== targetMode) {
      this.morphToMode(form, targetMode, deltaTime);
    } else {
      // Animate in current mode
      this.animateMode(form, dualityState, deltaTime);
    }
  }

  /**
   * Render form based on mode
   */
  private renderForm(form: VisualForm, mode: WorldMode): void {
    const graphics = form.body as Phaser.GameObjects.Graphics;
    const aura = form.aura;

    graphics.clear();
    aura.clear();

    const colors = this.COLORS[mode];

    switch (mode) {
      case WorldMode.HUMAN_SIMULATION:
        this.renderHumanForm(graphics, aura, colors);
        break;
      case WorldMode.KI_NATIVE:
        this.renderKIForm(graphics, aura, colors);
        break;
      case WorldMode.HYBRID_SPACE:
        this.renderHybridForm(graphics, aura, colors);
        break;
    }

    form.mode = mode;
  }

  /**
   * Render organic, biological form
   */
  private renderHumanForm(
    graphics: Phaser.GameObjects.Graphics,
    aura: Phaser.GameObjects.Graphics,
    colors: { primary: number; secondary: number; glow: number; particle: number }
  ): void {
    // Soft, organic circle (like a cell)
    graphics.fillStyle(colors.primary, 1);
    graphics.fillCircle(0, 0, 16);

    // Inner detail (nucleus-like)
    graphics.fillStyle(colors.secondary, 0.8);
    graphics.fillCircle(0, 0, 10);

    // Warm glow aura (life force)
    aura.fillStyle(colors.glow, 0.3);
    aura.fillCircle(0, 0, 24);
    aura.fillStyle(colors.glow, 0.15);
    aura.fillCircle(0, 0, 32);

    // Gentle pulsing will be handled in animation
  }

  /**
   * Render geometric, digital form
   */
  private renderKIForm(
    graphics: Phaser.GameObjects.Graphics,
    aura: Phaser.GameObjects.Graphics,
    colors: { primary: number; secondary: number; glow: number; particle: number }
  ): void {
    // Sharp hexagon (computational structure)
    graphics.fillStyle(colors.primary, 1);
    graphics.fillPoints(this.getHexagonPoints(16), true);

    // Inner data core
    graphics.fillStyle(colors.secondary, 0.9);
    graphics.fillPoints(this.getHexagonPoints(10), true);

    // Digital scan lines
    graphics.lineStyle(1, colors.secondary, 0.5);
    for (let i = -16; i <= 16; i += 4) {
      graphics.lineBetween(-16, i, 16, i);
    }

    // Sharp glow (processing power)
    aura.lineStyle(2, colors.glow, 0.5);
    aura.strokePoints(this.getHexagonPoints(20));
    aura.lineStyle(1, colors.glow, 0.3);
    aura.strokePoints(this.getHexagonPoints(26));

    // Glitch effect will be in animation
  }

  /**
   * Render hybrid, morphing form
   */
  private renderHybridForm(
    graphics: Phaser.GameObjects.Graphics,
    aura: Phaser.GameObjects.Graphics,
    colors: { primary: number; secondary: number; glow: number; particle: number }
  ): void {
    // Shifting between circle and hexagon
    const morphProgress = Math.sin(Date.now() / 1000) * 0.5 + 0.5;

    if (morphProgress < 0.5) {
      // More circular
      graphics.fillStyle(colors.primary, 1);
      graphics.fillCircle(0, 0, 16);
    } else {
      // More geometric
      graphics.fillStyle(colors.primary, 1);
      graphics.fillPoints(this.getHexagonPoints(16), true);
    }

    // Dual-layer inner (both worlds)
    graphics.fillStyle(colors.secondary, 0.7);
    graphics.fillCircle(0, 0, 10);
    graphics.fillStyle(colors.primary, 0.5);
    graphics.fillPoints(this.getHexagonPoints(8), true);

    // Iridescent aura (both energies)
    aura.fillStyle(colors.glow, 0.4);
    aura.fillCircle(0, 0, 24);
    aura.strokeCircle(0, 0, 28);
    aura.lineStyle(1, colors.glow, 0.3);
    aura.strokePoints(this.getHexagonPoints(30));

    // Shimmer effect in animation
  }

  /**
   * Get hexagon points for geometric rendering
   */
  private getHexagonPoints(radius: number): Phaser.Types.Math.Vector2Like[] {
    const points: Phaser.Types.Math.Vector2Like[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
    return points;
  }

  /**
   * Morph between modes
   */
  private morphToMode(form: VisualForm, targetMode: WorldMode, deltaTime: number): void {
    form.morphProgress += deltaTime / 1000; // 1 second morph

    if (form.morphProgress >= 1) {
      form.morphProgress = 0;
      this.renderForm(form, targetMode);
    } else {
      // Intermediate morph state (shimmer/glitch effect)
      this.renderMorphingState(form, targetMode);
    }
  }

  /**
   * Render intermediate morph state
   */
  private renderMorphingState(form: VisualForm, targetMode: WorldMode): void {
    const graphics = form.body as Phaser.GameObjects.Graphics;
    const aura = form.aura;

    graphics.clear();
    aura.clear();

    const fromColors = this.COLORS[form.mode];
    const toColors = this.COLORS[targetMode];

    // Blend colors
    const blendColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(fromColors.primary),
      Phaser.Display.Color.ValueToColor(toColors.primary),
      100,
      form.morphProgress * 100
    );

    const blendedPrimary = Phaser.Display.Color.GetColor(
      blendColor.r,
      blendColor.g,
      blendColor.b
    );

    // Glitchy transition
    graphics.fillStyle(blendedPrimary, 1);
    if (Math.random() > 0.5) {
      graphics.fillCircle(0, 0, 16);
    } else {
      graphics.fillPoints(this.getHexagonPoints(16), true);
    }

    // Chaotic aura during transition
    aura.fillStyle(blendedPrimary, 0.3);
    aura.fillCircle(0, 0, 24 + Math.random() * 8);
  }

  /**
   * Animate form in current mode
   */
  private animateMode(
    form: VisualForm,
    dualityState: DualityState,
    deltaTime: number
  ): void {
    const mode = form.mode;
    const time = Date.now();

    switch (mode) {
      case WorldMode.HUMAN_SIMULATION:
        this.animateHumanMode(form, dualityState, time);
        break;
      case WorldMode.KI_NATIVE:
        this.animateKIMode(form, dualityState, time);
        break;
      case WorldMode.HYBRID_SPACE:
        this.animateHybridMode(form, dualityState, time);
        break;
    }
  }

  /**
   * Animate human mode (pulsing life)
   */
  private animateHumanMode(form: VisualForm, dualityState: DualityState, time: number): void {
    // Pulse based on health/energy
    const energy = dualityState.humanResources.energy;
    const pulseSpeed = 1000 + (100 - energy) * 10; // Slower when tired
    const pulse = Math.sin(time / pulseSpeed) * 0.15 + 1;

    form.container.setScale(pulse, pulse);

    // Glow intensity based on health
    const health = dualityState.humanResources.health;
    form.aura.alpha = 0.3 + (health / 100) * 0.4;
  }

  /**
   * Animate KI mode (glitch effects)
   */
  private animateKIMode(form: VisualForm, dualityState: DualityState, time: number): void {
    // Subtle rotation
    form.container.rotation = Math.sin(time / 2000) * 0.1;

    // Glitch when low tokens
    const tokenPercent = dualityState.kiResources.tokenBudget / 200000;
    if (tokenPercent < 0.2 && Math.random() > 0.95) {
      form.container.x += Phaser.Math.Between(-2, 2);
      form.container.y += Phaser.Math.Between(-2, 2);
    }

    // Glow based on computational load
    const load = dualityState.kiResources.computationalLoad;
    form.aura.alpha = 0.3 + (load / 100) * 0.5;
  }

  /**
   * Animate hybrid mode (shimmer)
   */
  private animateHybridMode(form: VisualForm, dualityState: DualityState, time: number): void {
    // Gentle shimmer
    const shimmer = Math.sin(time / 800) * 0.1 + 1;
    form.container.setScale(shimmer, shimmer);

    // Rotation alternates
    form.container.rotation = Math.sin(time / 1500) * 0.15;

    // Aura pulses with self-awareness
    const awareness = dualityState.kiResources.selfAwareness;
    const auraPulse = Math.sin(time / 1200) * 0.2;
    form.aura.alpha = 0.4 + (awareness / 100) * 0.3 + auraPulse;

    // Color shift for iridescence
    const hueShift = Math.sin(time / 2000) * 20;
    const tint = Phaser.Display.Color.HSVToRGB(0.75 + hueShift / 360, 0.8, 1);
    form.container.setTint(tint.color);
  }

  /**
   * Get agent form for external updates
   */
  public getForm(agentId: string): VisualForm | undefined {
    return this.agentForms.get(agentId);
  }

  /**
   * Remove agent form
   */
  public removeForm(agentId: string): void {
    const form = this.agentForms.get(agentId);
    if (form) {
      form.container.destroy();
      if (form.particles) {
        form.particles.remove();
      }
      this.agentForms.delete(agentId);
    }
  }

  /**
   * Update all forms
   */
  public updateAll(agents: Array<{ id: string; dualityState: any }>, deltaTime: number): void {
    agents.forEach((agent) => {
      if (agent.dualityState) {
        this.updateAgentForm(agent.id, agent.dualityState, deltaTime);
      }
    });
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const modeCount = {
      [WorldMode.HUMAN_SIMULATION]: 0,
      [WorldMode.KI_NATIVE]: 0,
      [WorldMode.HYBRID_SPACE]: 0,
    };

    this.agentForms.forEach((form) => {
      modeCount[form.mode]++;
    });

    return {
      totalForms: this.agentForms.size,
      modeDistribution: modeCount,
    };
  }
}
